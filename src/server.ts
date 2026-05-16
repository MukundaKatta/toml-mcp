#!/usr/bin/env node
/**
 * toml MCP server. Two tools: `to_json` and `to_toml`.
 *
 * Backed by `smol-toml` — a fast TOML 1.0 parser/serializer. Dates/times
 * round-trip as ISO 8601 strings on the JSON side.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { parse as tomlParse, stringify as tomlStringify } from 'smol-toml';

const VERSION = '0.1.0';

export function tomlToJson(text: string): unknown {
  return tomlParse(text);
}

export function jsonToToml(value: unknown): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('TOML top-level must be a table (object).');
  }
  return tomlStringify(value as Record<string, unknown>);
}

const server = new Server({ name: 'toml', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'to_json',
    description: 'Parse TOML and return the JSON-compatible value.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
  },
  {
    name: 'to_toml',
    description:
      'Serialize a JSON object (top-level table) to TOML. Arrays-of-objects become `[[table]]` arrays.',
    inputSchema: {
      type: 'object',
      properties: { value: { type: 'object' } },
      required: ['value'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name === 'to_json') {
      const a = args as unknown as { text: string };
      return jsonResult({ value: tomlToJson(a.text) });
    }
    if (name === 'to_toml') {
      const a = args as unknown as { value: unknown };
      return textResult(jsonToToml(a.value));
    }
    return errorResult('unknown tool: ' + name);
  } catch (err) {
    return errorResult('toml failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function textResult(text: string) {
  return { content: [{ type: 'text', text }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`toml MCP server v${VERSION} ready on stdio\n`);
}

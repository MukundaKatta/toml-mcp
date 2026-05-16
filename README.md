# toml-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/toml-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/toml-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

MCP server: convert between TOML and JSON. Backed by `smol-toml` — a fast,
spec-compliant TOML 1.0 implementation.

## Tools

### `to_json`

```toml
[server]
port = 8080
host = "localhost"

[[items]]
name = "first"
```

→ `{ "value": { "server": { "port": 8080, "host": "localhost" }, "items": [ { "name": "first" } ] } }`

### `to_toml`

```json
{ "value": { "server": { "port": 8080 } } }
```

→

```toml
[server]
port = 8080
```

Top-level value must be a JSON object.

## Configure

```json
{ "mcpServers": { "toml": { "command": "npx", "args": ["-y", "@mukundakatta/toml-mcp"] } } }
```

## License

MIT.

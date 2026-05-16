import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { tomlToJson, jsonToToml } from '../src/server.js';

test('parses key/value', () => {
  const v = tomlToJson('name = "Mukunda"\nage = 30');
  assert.deepEqual(v, { name: 'Mukunda', age: 30 });
});

test('parses tables', () => {
  const v = tomlToJson('[server]\nport = 8080\nhost = "localhost"');
  assert.deepEqual(v, { server: { port: 8080, host: 'localhost' } });
});

test('parses arrays', () => {
  const v = tomlToJson('tags = ["a", "b", "c"]');
  assert.deepEqual(v, { tags: ['a', 'b', 'c'] });
});

test('parses arrays of tables', () => {
  const t = '[[items]]\nname = "x"\n[[items]]\nname = "y"';
  const v = tomlToJson(t) as { items: { name: string }[] };
  assert.equal(v.items.length, 2);
  assert.equal(v.items[0].name, 'x');
});

test('serializes a flat object', () => {
  const t = jsonToToml({ name: 'x', age: 30 });
  assert.match(t, /name\s*=\s*"x"/);
  assert.match(t, /age\s*=\s*30/);
});

test('serializes a nested table', () => {
  const t = jsonToToml({ server: { port: 8080 } });
  assert.match(t, /\[server\]/);
  assert.match(t, /port\s*=\s*8080/);
});

test('rejects non-object top-level', () => {
  assert.throws(() => jsonToToml([1, 2, 3]));
  assert.throws(() => jsonToToml('string'));
  assert.throws(() => jsonToToml(null));
});

test('rejects malformed TOML', () => {
  assert.throws(() => tomlToJson('key = unquoted-string-no-leading-letter ='));
});

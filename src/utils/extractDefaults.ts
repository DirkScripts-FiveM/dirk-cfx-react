type SchemaNode = {
  type?: string;
  default?: unknown;
  properties?: Record<string, SchemaNode>;
};

/**
 * Mirrors the Lua `extractDefaults()` in dirk_lib/modules/scriptSettings/server.lua.
 * Walks a JSON Schema tree and collects every `"default"` value into a plain object.
 */
export function extractDefaults(schema: SchemaNode): Record<string, unknown> | undefined {
  if (!schema || typeof schema !== 'object') return undefined;
  if (schema.default !== undefined) return schema.default as Record<string, unknown>;

  if (schema.type === 'object' && schema.properties) {
    const result: Record<string, unknown> = {};
    let hasValue = false;
    for (const [key, child] of Object.entries(schema.properties)) {
      const val = extractDefaults(child);
      if (val !== undefined) {
        result[key] = val;
        hasValue = true;
      }
    }
    return hasValue ? result : undefined;
  }

  return undefined;
}

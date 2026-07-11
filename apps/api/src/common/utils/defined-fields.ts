type DefinedFields<T extends Record<string, unknown>> = {
  [
    K in keyof T as undefined extends T[K] ? (T[K] extends undefined ? never : K) : K
  ]: Exclude<T[K], undefined>;
};

/** Omits undefined values — required when exactOptionalPropertyTypes is enabled */
export function definedFields<T extends Record<string, unknown>>(
  fields: T,
): DefinedFields<T> {
  const result = {} as DefinedFields<T>;
  for (const key of Object.keys(fields) as (keyof T)[]) {
    const value = fields[key];
    if (value !== undefined) {
      (result as Record<string, unknown>)[key as string] = value;
    }
  }
  return result;
}

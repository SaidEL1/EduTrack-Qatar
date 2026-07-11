/** Branded type helper for domain-safe identifiers */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type TenantId = Brand<string, 'TenantId'>;
export type UserId = Brand<string, 'UserId'>;
export type CorrelationId = Brand<string, 'CorrelationId'>;
export type LocaleCode = Brand<string, 'LocaleCode'>;

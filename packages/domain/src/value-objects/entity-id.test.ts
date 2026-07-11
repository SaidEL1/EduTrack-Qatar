import { isErr, isOk } from '@edutrack/shared';

import { EntityId } from './entity-id.js';

describe('EntityId', () => {
  it('accepts valid UUID v4', () => {
    const result = EntityId.create('550e8400-e29b-41d4-a716-446655440000');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.toString()).toBe('550e8400-e29b-41d4-a716-446655440000');
    }
  });

  it('rejects invalid identifiers', () => {
    const result = EntityId.create('not-a-uuid');
    expect(isErr(result)).toBe(true);
  });
});

import { createCorrelationId, parseCorrelationId } from '@edutrack/shared';

describe('correlation id utilities', () => {
  it('creates valid correlation ids', () => {
    const id = createCorrelationId();
    expect(parseCorrelationId(id)).toBe(id);
  });

  it('rejects invalid correlation ids', () => {
    expect(parseCorrelationId('not-valid')).toBeUndefined();
  });
});

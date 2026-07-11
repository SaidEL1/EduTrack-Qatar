import { ConsoleEmailProvider } from '../../src/modules/notification/infrastructure/console-email.provider.js';

describe('ConsoleEmailProvider', () => {
  it('returns success for console delivery', async () => {
    const provider = new ConsoleEmailProvider();
    const result = await provider.send({
      to: 'user@test.qa',
      subject: 'Test',
      bodyText: 'Hello',
    });
    expect(result.success).toBe(true);
  });
});

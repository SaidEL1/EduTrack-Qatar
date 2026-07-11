import { ApiClientError } from './errors/api-client-error.js';
import { HttpClient } from './http-client.js';

describe('HttpClient', () => {
  it('performs JSON GET requests', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    });

    const client = new HttpClient({
      baseUrl: 'https://api.example.com',
      fetchImpl,
    });

    const result = await client.request<{ ok: boolean }>({ path: '/health' });
    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.example.com/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('throws ApiClientError on non-2xx responses', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });

    const client = new HttpClient({
      baseUrl: 'https://api.example.com',
      fetchImpl,
    });

    await expect(client.request({ path: '/health' })).rejects.toBeInstanceOf(
      ApiClientError,
    );
  });
});

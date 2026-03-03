import { describe, expect, it, vi } from 'vitest';

import { client } from '../generated/client.gen';

describe('client', () => {
  describe('request headers', () => {
    it('sends an Accept header of application/json', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(new Response('{}'));

      client.setConfig({ fetch: fetchSpy });

      await client.get({ url: '/test' });

      const [, requestInit] = fetchSpy.mock.calls[0]!;
      const headers = new Headers(requestInit.headers);

      expect(headers.get('Accept')).toBe('application/json');
    });

    it('sends a TWN-Source header of Catalyst', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(new Response('{}'));

      client.setConfig({ fetch: fetchSpy });

      await client.get({ url: '/test' });

      const [, requestInit] = fetchSpy.mock.calls[0]!;
      const headers = new Headers(requestInit.headers);

      expect(headers.get('TWN-Source')).toBe('Catalyst');
    });
  });
});

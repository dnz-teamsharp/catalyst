import { type CreateClientConfig } from '../generated/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  headers: {
    Accept: 'application/json',
    'TWN-Source': 'Catalyst',
  },
  parseAs: 'json',
});

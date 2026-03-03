import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://gateway.tweakwisenavigator.com/content/swagger/swagger-prod.yaml',
  output: {
    path: 'generated',
    preferExportAll: true,
  },
  plugins: [
    { name: '@hey-api/client-next', runtimeConfigPath: '../src/runtime-config.ts' },
    {
      name: '@hey-api/sdk',
    },
  ],
});

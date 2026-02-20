import { describe, expect, test } from 'vitest';

import { rootCommand } from './commands/root';

describe('CLI program', () => {
  test('root command is defined', () => {
    expect(rootCommand).toBeDefined();
  });
});

import type { Config } from 'tailwindcss';
import preset from '@chamapp/config/tailwind';

export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/*/src/**/*.{ts,tsx}',
  ],
} satisfies Config;

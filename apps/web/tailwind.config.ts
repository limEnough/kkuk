import type { Config } from 'tailwindcss';
import preset from '@chamapp/config/tailwind';

export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/*/src/**/*.{ts,tsx}',
  ],
  // 인라인 style의 animation으로만 참조되는 키프레임들 —
  // 클래스로 안 쓰여 Tailwind가 @keyframes를 생성하지 않으므로 강제 포함
  safelist: [
    'animate-hammer-tap',
    'animate-shake-soft',
    'animate-firework',
    'animate-rainbow-shift',
  ],
} satisfies Config;

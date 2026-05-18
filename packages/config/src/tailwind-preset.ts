import type { Config } from 'tailwindcss';

/**
 * chamapp 디자인 시스템
 * 컨셉: Toss-inspired — 정제된 단순함, 절제된 색감, 명료한 타이포그래피
 */
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // 그레이 스케일 (Toss 컬러 시스템 참고)
        gray: {
          50: '#F9FAFB',
          100: '#F2F4F6',
          200: '#E5E8EB',
          300: '#D1D6DB',
          400: '#B0B8C1',
          500: '#8B95A1',
          600: '#6B7684',
          700: '#4E5968',
          800: '#333D4B',
          900: '#191F28',
        },
        // 메인 블루 (포인트 컬러)
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3182F6', // 메인
          600: '#1B64DA',
          700: '#1E40AF',
        },
        // 시맨틱 컬러
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        // Toss 타이포그래피 위계
        'display-1': ['32px', { lineHeight: '42px', fontWeight: '700', letterSpacing: '-0.03em' }],
        'display-2': ['28px', { lineHeight: '38px', fontWeight: '700', letterSpacing: '-0.03em' }],
        'title-1': ['24px', { lineHeight: '32px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'title-2': ['20px', { lineHeight: '28px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'subtitle': ['17px', { lineHeight: '24px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'body-1': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-2': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'caption-1': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-2': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        // Toss는 라운드를 비교적 절제 (큰 라운드는 카드/버튼 정도)
        sm: '6px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        // 그림자 절제 — 거의 평면, 필요한 곳만 미세하게
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        modal: '0 4px 24px -2px rgba(0, 0, 0, 0.08), 0 2px 8px -1px rgba(0, 0, 0, 0.04)',
        floating: '0 8px 32px -4px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'shake-soft': 'shake-soft 0.12s ease-in-out infinite',
        'hammer-tap': 'hammer-tap 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        'firework': 'firework 0.9s ease-out forwards',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shake-soft': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-1.5px, 0.5px)' },
          '50%': { transform: 'translate(1.5px, -0.5px)' },
          '75%': { transform: 'translate(-0.5px, 1px)' },
        },
        'hammer-tap': {
          '0%': { transform: 'translateY(-40%) rotate(-30deg)' },
          '50%': { transform: 'translateY(0) rotate(0)' },
          '100%': { transform: 'translateY(-25%) rotate(-20deg)' },
        },
        'firework': {
          '0%': { transform: 'scale(0) translate(0, 0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': {
            transform: 'scale(1) translate(var(--tx, 0), var(--ty, 0))',
            opacity: '0',
          },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      transitionTimingFunction: {
        // Toss가 즐겨 쓰는 ease-out spring 느낌
        'toss': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
};

export default preset;

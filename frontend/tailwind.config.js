/**
 * Tailwind ↔ E-UM 디자인 토큰 매핑.
 * 색/반경/그림자/폰트는 모두 CSS 변수(`var(--token)`)를 참조하므로,
 * 토큰의 단일 출처는 항상 `src/styles/tokens/*.css` 이다.
 * (Wanted DS 기반, --primary-* 만 E-UM Navy 로 override)
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-normal)',
          normal: 'var(--primary-normal)',
          strong: 'var(--primary-strong)',
          heavy: 'var(--primary-heavy)',
          tint: 'var(--primary-tint)',
        },
        accent: {
          DEFAULT: 'var(--accent-warm)',
          warm: 'var(--accent-warm)',
          'warm-strong': 'var(--accent-warm-strong)',
          'warm-tint': 'var(--accent-warm-tint)',
        },
        label: {
          strong: 'var(--label-strong)',
          normal: 'var(--label-normal)',
          neutral: 'var(--label-neutral)',
          alternative: 'var(--label-alternative)',
          assistive: 'var(--label-assistive)',
          disable: 'var(--label-disable)',
        },
        bg: {
          normal: 'var(--background-normal)',
          alt: 'var(--background-normal-alternative)',
          elevated: 'var(--background-elevated)',
          dimmer: 'var(--background-dimmer)',
        },
        line: {
          normal: 'var(--line-normal)',
          neutral: 'var(--line-neutral)',
          alternative: 'var(--line-alternative)',
          strong: 'var(--line-strong)',
          solid: 'var(--line-solid)',
        },
        fill: {
          normal: 'var(--fill-normal)',
          strong: 'var(--fill-strong)',
          alternative: 'var(--fill-alternative)',
        },
        status: {
          positive: 'var(--status-positive)',
          negative: 'var(--status-negative)',
          cautionary: 'var(--status-cautionary)',
          'positive-bg': 'var(--status-positive-bg)',
          'negative-bg': 'var(--status-negative-bg)',
          'cautionary-bg': 'var(--status-cautionary-bg)',
        },
        inverse: {
          bg: 'var(--inverse-background)',
          label: 'var(--inverse-label)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      borderRadius: {
        4: 'var(--radius-4)',
        6: 'var(--radius-6)',
        8: 'var(--radius-8)',
        10: 'var(--radius-10)',
        12: 'var(--radius-12)',
        14: 'var(--radius-14)',
        16: 'var(--radius-16)',
        20: 'var(--radius-20)',
        24: 'var(--radius-24)',
        control: 'var(--radius-control)',
        card: 'var(--radius-card)',
        sheet: 'var(--radius-sheet)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
        popover: 'var(--shadow-popover)',
        modal: 'var(--shadow-modal)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        emphasized: 'var(--ease-emphasized)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      maxWidth: {
        content: 'var(--layout-width-max)',
        app: '480px',
      },
    },
  },
  plugins: [],
}

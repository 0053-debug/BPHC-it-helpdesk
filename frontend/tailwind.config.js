/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        panel: 'var(--color-paper-2)',
        inset: 'var(--color-paper-3)',
        ink: 'var(--color-ink)',
        secondary: 'var(--color-ink-2)',
        muted: 'var(--color-muted)',
        rule: 'var(--color-rule)',
        'rule-strong': 'var(--color-rule-2)',
        person: 'var(--color-accent)',
        'person-ink': 'var(--color-accent-ink)',
        'person-soft': 'var(--color-accent-soft)',
        instrument: 'var(--color-cool)',
        'instrument-soft': 'var(--color-cool-soft)',
        success: 'var(--color-success)',
        'success-soft': 'var(--color-success-soft)',
        danger: 'var(--color-error)',
        'danger-soft': 'var(--color-error-soft)',
        focus: 'var(--color-focus)',
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        outlier: ['var(--font-outlier)'],
        mono: ['var(--font-outlier)'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '500',
        bold: '500',
        extrabold: '500',
        black: '500',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
        chip: 'var(--radius-chip)',
      },
    },
  },
  plugins: [],
};

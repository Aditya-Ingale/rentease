/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // toggled via <html class="dark">
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        success: 'var(--success)',
        'success-bg': 'var(--success-bg)',
        info: 'var(--info)',
        'info-bg': 'var(--info-bg)',
        warning: 'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
        danger: 'var(--danger)',
        'danger-bg': 'var(--danger-bg)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        button: '10px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(43, 45, 42, 0.06)',
        'soft-hover': '0 8px 24px rgba(43, 45, 42, 0.10)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '220ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
}
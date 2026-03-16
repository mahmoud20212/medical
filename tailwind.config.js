/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a3a6e',
          foreground: '#ffffff',
          50: '#eef2fb',
          100: '#d5e0f5',
          200: '#abc1eb',
          900: '#0f2244',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#1e293b',
        },
        muted: {
          DEFAULT: '#f8fafc',
          foreground: '#64748b',
        },
        border: '#e2e8f0',
        background: '#f8fafc',
        foreground: '#0f172a',
        card: '#ffffff',
        accent: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

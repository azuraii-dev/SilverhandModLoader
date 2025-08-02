/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          yellow: '#fcff00',
          blue: '#00d9ff',
          pink: '#ff006e',
          dark: '#0a0a0a',
          darker: '#050505',
          gray: '#1a1a1a',
        },
        'cyber-dark': '#10141f',
        'cyber-darker': '#0a0d14',
        'cyber-blue': '#00e6ff',
        'cyber-pink': '#ff006e',
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'mono': ['Fira Code', 'Monaco', 'Consolas', 'monospace']
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d9ff, 0 0 10px #00d9ff, 0 0 15px #00d9ff' },
          '100%': { boxShadow: '0 0 10px #00d9ff, 0 0 20px #00d9ff, 0 0 30px #00d9ff' }
        }
      }
    },
  },
  plugins: [],
}
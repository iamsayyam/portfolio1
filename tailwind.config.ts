import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0E1230',
        dusk: '#2A2F66',
        street: '#161B42',
        lamp: '#FFB547',
        chalk: '#EEEAF7',
        mist: '#9AA0C8',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        body: ['"Literata Variable"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;

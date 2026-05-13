import { type Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Arbitrary color values used in components
    'bg-[#f2f6fd]',
    'bg-[#f3f6fb]',
    'bg-[#08325b]',
    'bg-[#0a3c70]',
    'bg-[#042645]',
    'bg-[#175cc5]',
    'from-[#08325b]',
    'via-[#0a3c70]',
    'to-[#042645]',
    'text-[#08325b]',
    'text-[#175cc5]',
    'text-[#114ca5]',
    'text-[#0b3a66]',
    'bg-[#eff5ff]',
    'border-[#cfe0ff]',
    'border-blue-300/20',
    'bg-white/10',
    'bg-white/90',
    'bg-blue-300/20',
    'text-blue-200',
    'text-blue-100',
    'bg-blue-50',
    'hover:bg-[#114ca5]',
    'hover:bg-slate-50',
    'hover:text-[#114ca5]',
    'bg-slate-50',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5a4',
        accent: '#7c3aed',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}

export default config

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Control-room palette — graphite panels, not pure black,
        // so bezels and shadows still read under harsh plant lighting.
        panel: {
          bg: '#101317',
          surface: '#1B1F24',
          raised: '#242A31',
          border: '#3A424C',
          borderLit: '#4C5560'
        },
        ink: {
          primary: '#EDEFF2',
          muted: '#9AA4B1',
          dim: '#5D6673'
        },
        signal: {
          amber: '#F5A623',
          amberDim: '#8A5F17',
          red: '#E5484D',
          redDim: '#7A2528',
          blue: '#3B82F6',
          blueDim: '#1E3A6B',
          green: '#22C55E',
          greenDim: '#15532D'
        }
      },
      fontFamily: {
        display: ['"Oswald"', '"Arial Narrow"', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      spacing: {
        touch: '5.5rem'
      },
      boxShadow: {
        bezel: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 20px rgba(0,0,0,0.45)',
        pressed: 'inset 0 3px 8px rgba(0,0,0,0.55)'
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(245,166,35,0.55)' },
          '100%': { boxShadow: '0 0 0 18px rgba(245,166,35,0)' }
        }
      },
      animation: {
        pulseRing: 'pulseRing 1.4s cubic-bezier(0.4,0,0.6,1) infinite'
      }
    }
  },
  plugins: []
}

import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			pretendard: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
  		},
  		fontSize: {
  			'11': '11px',
  			'12': '12px',
  			'14': '14px',
  			'16': '16px',
  			'18': '18px',
  			'20': '20px',
  			'24': '24px',
  			'30': '30px',
  			'36': '36px',
  		},
  		lineHeight: {
  			'tight-heading': '1.2',
  			'normal-heading': '1.3',
  			'relaxed-body': '1.6',
  			'snug-label': '1.4',
  			'normal-caption': '1.5',
  		},
  		colors: {
  			background: 'rgb(var(--background) / <alpha-value>)',
  			foreground: 'rgb(var(--foreground) / <alpha-value>)',
  			card: {
  				DEFAULT: 'rgb(var(--card) / <alpha-value>)',
  				foreground: 'rgb(var(--card-foreground) / <alpha-value>)'
  			},
  			popover: {
  				DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
  				foreground: 'rgb(var(--popover-foreground) / <alpha-value>)'
  			},
  			primary: {
  				DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
  				foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
  				active: 'rgb(var(--primary-active) / <alpha-value>)',
  				light: 'rgb(var(--primary-light) / <alpha-value>)',
  			},
  			secondary: {
  				DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
  				foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)'
  			},
  			accent: {
  				DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
  				foreground: 'rgb(var(--accent-foreground) / <alpha-value>)'
  			},
  			muted: {
  				DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
  				foreground: 'rgb(var(--muted-foreground) / <alpha-value>)'
  			},
  			destructive: {
  				DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
  				foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)'
  			},
  			border: 'rgb(var(--border) / <alpha-value>)',
  			input: 'rgb(var(--input) / <alpha-value>)',
  			ring: 'rgb(var(--ring) / <alpha-value>)',
  			chart: {
  				'1': 'rgb(var(--chart-1) / <alpha-value>)',
  				'2': 'rgb(var(--chart-2) / <alpha-value>)',
  				'3': 'rgb(var(--chart-3) / <alpha-value>)',
  				'4': 'rgb(var(--chart-4) / <alpha-value>)',
  				'5': 'rgb(var(--chart-5) / <alpha-value>)'
  			},
  			sidebar: {
  				DEFAULT: 'rgb(var(--sidebar-background) / <alpha-value>)',
  				foreground: 'rgb(var(--sidebar-foreground) / <alpha-value>)',
  				primary: 'rgb(var(--sidebar-primary) / <alpha-value>)',
  				'primary-foreground': 'rgb(var(--sidebar-primary-foreground) / <alpha-value>)',
  				accent: 'rgb(var(--sidebar-accent) / <alpha-value>)',
  				'accent-foreground': 'rgb(var(--sidebar-accent-foreground) / <alpha-value>)',
  				border: 'rgb(var(--sidebar-border) / <alpha-value>)',
  				ring: 'rgb(var(--sidebar-ring) / <alpha-value>)'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'elev-sm': 'var(--shadow-sm)',
  			'elev-md': 'var(--shadow-md)',
  			'elev-lg': 'var(--shadow-lg)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

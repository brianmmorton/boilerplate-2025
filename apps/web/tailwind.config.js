/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			// Add your custom pink palette
  			pink: {
  				1: 'var(--pink-1)',
  				2: 'var(--pink-2)',
  				3: 'var(--pink-3)',
  				4: 'var(--pink-4)',
  				5: 'var(--pink-5)',
  				6: 'var(--pink-6)',
  				7: 'var(--pink-7)',
  				8: 'var(--pink-8)',
  				9: 'var(--pink-9)',
  				10: 'var(--pink-10)',
  				11: 'var(--pink-11)',
  				12: 'var(--pink-12)',
  				DEFAULT: 'var(--pink-9)', // Use scale 9 as default for most prominent use
  				subtle: 'var(--pink-3)',   // For subtle backgrounds
  				ui: 'var(--pink-6)',       // For UI elements like borders
  				solid: 'var(--pink-9)',    // For solid colors like buttons
  				text: 'var(--pink-11)',    // For text
  			},
  			// Semantic brand colors for easier theming
  			brand: {
  				subtle: 'var(--brand-subtle)',
  				ui: 'var(--brand-ui)', 
  				solid: 'var(--brand-solid)',
  				text: 'var(--brand-text)',
  				contrast: 'var(--brand-contrast)',
			},
			// Status colors
			status: {
				active: 'hsl(var(--status-active))',
				'active-bg': 'hsl(var(--status-active-bg))',
				investigating: 'hsl(var(--status-investigating))',
				'investigating-bg': 'hsl(var(--status-investigating-bg))',
				resolved: 'hsl(var(--status-resolved))',
				'resolved-bg': 'hsl(var(--status-resolved-bg))',
				dismissed: 'hsl(var(--status-dismissed))',
				'dismissed-bg': 'hsl(var(--status-dismissed-bg))',
			},
			// Severity levels
			severity: {
				low: 'hsl(var(--severity-low))',
				'low-bg': 'hsl(var(--severity-low-bg))',
				medium: 'hsl(var(--severity-medium))',
				'medium-bg': 'hsl(var(--severity-medium-bg))',
				high: 'hsl(var(--severity-high))',
				'high-bg': 'hsl(var(--severity-high-bg))',
				critical: 'hsl(var(--severity-critical))',
				'critical-bg': 'hsl(var(--severity-critical-bg))',
			},
			// Info colors
			info: {
				DEFAULT: 'hsl(var(--info))',
				bg: 'hsl(var(--info-bg))',
			},
			warning: {
				DEFAULT: 'hsl(var(--warning))',
				bg: 'hsl(var(--warning-bg))',
			},
			success: {
				DEFAULT: 'hsl(var(--success))',
				bg: 'hsl(var(--success-bg))',
			},
			// Semantic neutral grays
			neutral: {
				50: 'hsl(var(--neutral-50))',
				100: 'hsl(var(--neutral-100))',
				200: 'hsl(var(--neutral-200))',
				300: 'hsl(var(--neutral-300))',
				400: 'hsl(var(--neutral-400))',
				500: 'hsl(var(--neutral-500))',
				600: 'hsl(var(--neutral-600))',
				700: 'hsl(var(--neutral-700))',
				800: 'hsl(var(--neutral-800))',
				900: 'hsl(var(--neutral-900))',
			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
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
  					height: 0
  				}
  			},
				spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
				spin: 'spin 1s linear infinite',
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					h1: {
  						color: 'var(--tw-prose-headings)',
  					},
  					h2: {
  						color: 'var(--tw-prose-headings)',
  					},
  					h3: {
  						color: 'var(--tw-prose-headings)',
  					},
  					h4: {
  						color: 'var(--tw-prose-headings)',
  					},
  					h5: {
  						color: 'var(--tw-prose-headings)',
  					},
  					h6: {
  						color: 'var(--tw-prose-headings)',
  					},
  				},
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

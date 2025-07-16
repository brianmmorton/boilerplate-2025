import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				primary: '#283149',
				secondary: '#404B69',
				tertiary: '#5B6B94',
				accent: '#8B9BB4',
				background: '#F5F7FA',
				neutral: {
					50: '#FFFFFF',
					100: '#F8FAFC',
					200: '#F1F5F9',
					300: '#E2E8F0',
					400: '#CBD5E1',
					500: '#94A3B8',
					600: '#64748B',
					700: '#475569',
					800: '#27334D',
					900: '#1E293B',
				},
				success: '#4CAF50',
				warning: '#FF9800',
				error: '#EF5350',
				info: '#42A5F5',
				'blue-gray': {
					10: '#F8FAFC',
					50: '#F1F5F9',
				},
			},
		},
	},
	plugins: [],
} satisfies Config;

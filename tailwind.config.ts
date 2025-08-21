
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				xl: '1280px',
				'2xl': '1440px'
			}
		},
	fontFamily: {
		sans: ['Inter', 'system-ui', 'sans-serif'],
		mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
		script: ['Dancing Script', 'cursive'],
		playfair: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'],
	},
		fontSize: {
			'xs': ['11px', { lineHeight: '16px', fontWeight: '400' }],
			'sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
			'base': ['14px', { lineHeight: '22px', fontWeight: '400' }],
			'lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
			'xl': ['18px', { lineHeight: '28px', fontWeight: '500' }],
			'2xl': ['20px', { lineHeight: '30px', fontWeight: '600' }],
			'3xl': ['24px', { lineHeight: '32px', fontWeight: '700' }],
			'4xl': ['28px', { lineHeight: '36px', fontWeight: '700' }],
			'5xl': ['32px', { lineHeight: '40px', fontWeight: '800' }],
			
			// Professional UI component sizes
			'h1': ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.02em' }],
			'h2': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.01em' }],
			'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
			'h4': ['18px', { lineHeight: '26px', fontWeight: '600' }],
			'section-title': ['20px', { lineHeight: '28px', fontWeight: '600' }],
			'card-title': ['16px', { lineHeight: '24px', fontWeight: '600' }],
			'card-label': ['12px', { lineHeight: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }],
			'body': ['14px', { lineHeight: '22px', fontWeight: '400' }],
			'body-sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
			'caption': ['11px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.05em' }],
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				surface: 'hsl(var(--surface))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					light: 'hsl(var(--success-light))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					light: 'hsl(var(--warning-light))'
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
				chart: {
					revenue: '#0D5CF2',      // Blue - colorblind safe
					cost: '#FF9C07',         // Orange - colorblind safe
					profit: '#A259FF',       // Purple - colorblind safe
					baseline: 'hsl(var(--muted-foreground))'
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'112': '28rem',
				'128': '32rem',
			},
			boxShadow: {
				'elevation-1': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'elevation-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'elevation-4': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
				'elevation-modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
				'glow': '0 0 20px rgba(var(--primary), 0.15)',
				'glow-lg': '0 0 40px rgba(var(--primary), 0.2)',
				'soft': 'var(--shadow-soft)',
				'medium': 'var(--shadow-medium)',
				'strong': 'var(--shadow-strong)',
				'shadow-header': 'var(--shadow-header)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'gradient-x': {
					'0%, 100%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'gradient-x': 'gradient-x 3s ease infinite',
				'shimmer': 'shimmer 2s infinite',
				'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
		extend: {
			animation: {
				"slide-up": "slide-up 0.6s ease-out",
				"shirt-swing": "shirt-swing 4s ease-in-out infinite",
				"shirt-glow-pulse": "shirt-glow-pulse 3s ease-in-out infinite alternate",
				"float-slow": "float-slow 8s ease-in-out infinite",
				"fade-in": "fade-in 0.4s ease-out",
			},
			keyframes: {
				"slide-up": {
					"0%": { transform: "translateY(20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				"shirt-swing": {
					"0%, 100%": { transform: "rotate(-2deg) translateY(0)" },
					"50%": { transform: "rotate(2deg) translateY(-3px)" },
				},
				"shirt-glow-pulse": {
					"0%": { boxShadow: "0 4px 20px rgba(139,92,246,0.15)" },
					"100%": { boxShadow: "0 8px 40px rgba(139,92,246,0.4)" },
				},
				"float-slow": {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-10px)" },
				},
				"fade-in": {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			borderRadius: {
				lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				// Premium dark palette
				bg: { base: "#08090D", secondary: "#0D1017", card: "#121620", elevated: "#181D27" },
				surface: { DEFAULT: "#121620", elevated: "#181D27" },
				border: { DEFAULT: "hsl(var(--border))", subtle: "#252B38", accent: "#8B5CF6" },
				foreground: { DEFAULT: "#F5F7FA", secondary: "#8B93A3", muted: "#5F6878" },
				accent: { DEFAULT: "#8B5CF6", light: "#A78BFA", cyan: "#22D3EE" },
				// Shadcn/ui preserved
				background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
				card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
				popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
				primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
				secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
				muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
				accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
				destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
				border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
				chart: { 1: "hsl(var(--chart-1))", 2: "hsl(var(--chart-2))", 3: "hsl(var(--chart-3))", 4: "hsl(var(--chart-4))", 5: "hsl(var(--chart-5))" },
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))", foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))", "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))", "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))", ring: "hsl(var(--sidebar-ring))",
				},
			},
			fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], display: ["Space Grotesk", "Inter", "sans-serif"] },
			backgroundImage: {
				"premium-radial": "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(34,211,238,0.04) 0%, transparent 40%)",
				"glow-purple-sm": "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
				"glow-purple-lg": "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 60%)",
			},
			boxShadow: {
				"glow-sm": "0 0 20px rgba(139,92,246,0.2)",
				"glow-md": "0 0 40px rgba(139,92,246,0.3)",
				"glow-lg": "0 0 60px rgba(139,92,246,0.4)",
				"shirt": "0 8px 32px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.5)",
				"shirt-active": "0 16px 48px rgba(0,0,0,0.75), 0 0 50px rgba(139,92,246,0.25)",
				"card-dark": "0 4px 24px rgba(0,0,0,0.5)",
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
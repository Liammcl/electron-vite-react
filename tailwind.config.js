import {
  color
} from './src/utils/color'
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{jsx,tsx,html}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/utils/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          ...color.primary,
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        dark: color.dark,
        light: color.light,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        'initial-scale': {
          '0%': {
            transform: 'scale(1)'
          },
          '20%': {
            transform: 'scale(0.9)'
          },
          '80%': {
            transform: 'scale(1.03)'
          },
          '100%': {
            transform: 'scale(1)'
          },
        },
        'hover-scale': {
          'to': {
            transform: 'scale(0.9)'
          },
        },
        'leave-scale': {
          '0%': {
            transform: 'scale(0.9)'
          },
          '50%': {
            transform: 'scale(1.02)'
          },
          '100%': {
            transform: 'scale(1)'
          },
        },
        hide: {
          from: {
            opacity: "1"
          },
          to: {
            opacity: "0"
          }
        },
        slideDownAndFade: {
          from: {
            opacity: "0",
            transform: "translateY(-6px)"
          },
          to: {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        slideLeftAndFade: {
          from: {
            opacity: "0",
            transform: "translateX(6px)"
          },
          to: {
            opacity: "1",
            transform: "translateX(0)"
          }
        },
        slideUpAndFade: {
          from: {
            opacity: "0",
            transform: "translateY(6px)"
          },
          to: {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        slideRightAndFade: {
          from: {
            opacity: "0",
            transform: "translateX(-6px)"
          },
          to: {
            opacity: "1",
            transform: "translateX(0)"
          }
        },
        accordionOpen: {
          from: {
            height: "0px"
          },
          to: {
            height: "var(--radix-accordion-content-height)"
          }
        },
        accordionClose: {
          from: {
            height: "var(--radix-accordion-content-height)"
          },
          to: {
            height: "0px"
          }
        },
        dialogOverlayShow: {
          from: {
            opacity: "0"
          },
          to: {
            opacity: "1"
          }
        },
        dialogContentShow: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -45%) scale(0.95)"
          },
          to: {
            opacity: "1",
            transform: "translate(-50%, -50%) scale(1)"
          }
        },
        drawerSlideLeftAndFade: {
          from: {
            opacity: "0",
            transform: "translateX(100%)"
          },
          to: {
            opacity: "1",
            transform: "translateX(0)"
          }
        },
        drawerSlideRightAndFade: {
          from: {
            opacity: "1",
            transform: "translateX(0)"
          },
          to: {
            opacity: "0",
            transform: "translateX(100%)"
          }
        }
      },
      animation: {
        hide: "hide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: 'shimmer 2s infinite linear',
        slideDownAndFade: "slideDownAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideLeftAndFade: "slideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideUpAndFade: "slideUpAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideRightAndFade: "slideRightAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        // Accordion
        accordionOpen: "accordionOpen 150ms cubic-bezier(0.87, 0, 0.13, 1)",
        accordionClose: "accordionClose 150ms cubic-bezier(0.87, 0, 0.13, 1)",
        // Dialog
        dialogOverlayShow: "dialogOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        dialogContentShow: "dialogContentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        // Drawer
        drawerSlideLeftAndFade: "drawerSlideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        drawerSlideRightAndFade: "drawerSlideRightAndFade 150ms ease-in",
        'initial-scale': 'initial-scale 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'hover-scale': 'hover-scale 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'leave-scale': 'leave-scale 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
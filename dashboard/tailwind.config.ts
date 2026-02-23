import type { Config } from "tailwindcss"

export default {
  darkMode: "selector",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: { 925: "#050814" },
      },
      keyframes: {
        hide: {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.95)" },
        },
        dialogOverlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        dialogContentShow: {
          from: { opacity: "0", transform: "translate(-50%, -45%) scale(0.95)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        drawerSlideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(-100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        drawerSlideRightAndFade: {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0", transform: "translateX(-100%)" },
        },
        slideDownAndFade: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideUpAndFade: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideRightAndFade: {
          from: { opacity: "0", transform: "translateX(-6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        accordionOpen: {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        accordionClose: {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: { height: "0px" },
        },
      },
      animation: {
        hide: "hide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        dialogOverlayShow: "dialogOverlayShow 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        dialogContentShow: "dialogContentShow 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
        slideDownAndFade:
          "slideDownAndFade 400ms cubic-bezier(0.175, 0.885, 0.32, 1.2)",
        slideLeftAndFade:
          "slideLeftAndFade 400ms cubic-bezier(0.175, 0.885, 0.32, 1.2)",
        slideUpAndFade: "slideUpAndFade 400ms cubic-bezier(0.175, 0.885, 0.32, 1.2)",
        slideRightAndFade:
          "slideRightAndFade 400ms cubic-bezier(0.175, 0.885, 0.32, 1.2)",
        accordionOpen: "accordionOpen 150ms cubic-bezier(0.87, 0, 0.13, 1)",
        accordionClose: "accordionClose 150ms cubic-bezier(0.87, 0, 0.13, 1)",
        drawerSlideLeftAndFade:
          "drawerSlideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        drawerSlideRightAndFade: "drawerSlideRightAndFade 150ms ease-in",
      },
    },
  },
  plugins: [],
} satisfies Config

// tailwind.config.cjs
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // extra small (very small phones like older iPhones)
        xs: "360px",         // e.g. Galaxy S8, small phones

        // default tailwind ones (you can keep them)
        sm: "640px",         // normal phones (iPhone 11+, Pixel etc.)
        md: "768px",         // tablets (iPad portrait)
        lg: "1024px",        // tablets landscape / small laptop
        xl: "1280px",        // desktop
        "2xl": "1536px",     // big desktop

        // OPTIONAL: orientation-based for testing folded / landscape
        "md-landscape": { raw: "(min-width: 768px) and (orientation: landscape)" },
        "md-portrait": { raw: "(min-width: 768px) and (orientation: portrait)" },
      },
    },
  },
  plugins: [],
};

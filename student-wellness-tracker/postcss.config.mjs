/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 bundles its own CSS transforms (incl. vendor prefixing via
    // Lightning CSS) — no separate `autoprefixer` needed anymore.
    "@tailwindcss/postcss": {},
  },
};

export default config;

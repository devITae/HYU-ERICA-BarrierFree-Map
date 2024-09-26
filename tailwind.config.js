// eslint-disable-next-line no-undef
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      height: {
        'screen-vh': 'calc(100 * var(--vh))',
      },
    },
  },
  plugins: [],
}
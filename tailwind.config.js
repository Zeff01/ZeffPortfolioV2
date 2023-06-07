/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      tech: ["var(--font-tech)"],
    },
    extend: {
      colors: {
        textColor: "#F6AE2A",
        buttonColor: "#AA0505",
        linkColor: "#FBCA03",
        backgroundColor: "#4B0908",
        backgroundColor2: "#5B0000",
      },
    },
  },
  plugins: [],
};

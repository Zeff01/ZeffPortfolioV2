/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite-react/**/*.js",
    "./node_modules/flowbite/**/*.js",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      tech: ["var(--font-tech)"],
    },
    extend: {
      screens: {
        xs: { max: "475px" },
      },
      colors: {
        textColor: "#F6AE2A",
        buttonColor: "#AA0505",
        linkColor: "#FBCA03",
        backgroundColor: "#4B0908",
        backgroundColor2: "#5B0000",
        blackBackground: "#0c0a0a",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};

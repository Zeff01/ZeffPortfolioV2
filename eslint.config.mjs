import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "*.config.js"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;

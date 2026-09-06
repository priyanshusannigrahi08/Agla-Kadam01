import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // These rules currently flag existing production patterns across the app.
      // Keep lint focused on launch-blocking errors while the product is frozen.
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;

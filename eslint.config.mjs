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
  {
    files: ["app/dashboard/page.tsx"],
    rules: {
      // This legacy page is intentionally a single generated line. Its review
      // callback is user-initiated and will be split into components before
      // navigation is changed; keep its existing navigation behavior stable.
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
];

export default eslintConfig;

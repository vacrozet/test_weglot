module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended", // Intégration de Prettier dans ESLint
  ],
  plugins: ["prettier"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "no-console": "error",
    "prettier/prettier": ["error"],
  },
};

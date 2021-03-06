module.exports = {
    // ...
    parser: '@typescript-eslint/parser',
    plugins: ["@typescript-eslint"],
    extends: ['marine/node'],
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
  
        extends: [
          'plugin:@typescript-eslint/recommended',
          'plugin:@typescript-eslint/recommended-requiring-type-checking',
        ],
  
        parserOptions: {
          project: ['./tsconfig.json'],
        },
      },
    ],
    rules: {
      "@typescript-eslint/comma-dangle": "off",
      "@typescript-eslint/quotes": "off"
    }
}
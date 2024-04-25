module.exports = {
  trailingComma: "all",
  singleQuote: false,
  printWidth: 120,
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss", "@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "react", // React
    "^react-.*$", // React-related imports
    "^next", // Next-related imports
    "^next-.*$", // Next-related imports
    "^next/.*$", // Next-related imports
    "^.*/hooks/.*$", // Hooks
    "^.*/services/.*$", // Services
    "^.*/utils/.*$", // Utils
    "^.*/types/.*$", // Types
    "^.*/app/.*$", // Components
    "^.*/pages/.*$", // Components
    "^.*/components/.*$", // Components
    "^[./]", // Other imports
    ".*", // Any uncaught imports
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
    ...nextCoreWebVitals,
    ...nextTypeScript,
    globalIgnores([
        ".next/**",
        ".convex-tmp/**",
        "convex/_generated/**",
        "node_modules/**",
    ]),
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "prefer-const": "warn",
            "react/no-unescaped-entities": "warn",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/static-components": "off",
        },
    },
]);

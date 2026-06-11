import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import pluginReact from 'eslint-plugin-react'

export default tseslint.config(
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Vue rules
      'vue/no-unused-components': 'warn',
      'vue/no-mutating-props': 'error',
      'vue/require-default-prop': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/attribute-hyphenation': ['error', 'never'],
      'vue/attributes-order': 'warn',
      'vue/no-multiple-template-root': 'off',
      'vue/no-template-shadow': 'off',

      // General rules matching facturador
      'no-tabs': 'error',
      'array-callback-return': 'error',
      'no-await-in-loop': 'error',
      'no-constant-binary-expression': 'error',
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
)

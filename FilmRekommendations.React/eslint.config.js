import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // TypeScript strict rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      
      // React best practices
      'react-hooks/exhaustive-deps': 'warn',
      
      // General code quality  
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Import organization
      'sort-imports': ['error', {
        'ignoreCase': true,
        'ignoreDeclarationSort': true,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single']
      }],

      // Architectural boundaries (manual enforcement)
      'no-restricted-imports': ['error', {
        'patterns': [
          {
            'group': ['../../../*'],
            'message': 'Relative imports should not go up more than 2 levels. Use absolute imports with @/ instead.'
          }
        ]
      }],
    },
  },
)

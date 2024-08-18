import { configs, env } from '@chronocide/eslint-config';

export default [
  configs.base,
  configs.typescript,
  {
    languageOptions: {
      globals: {
        ...env.node
      }
    }
  }
]
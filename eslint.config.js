import config from '@chronocide/eslint-config';

export default [...config({
  ts: true,
  node: true
}), {
  rules: {
    '@stylistic/lines-between-class-members': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'warn'
  }
}];

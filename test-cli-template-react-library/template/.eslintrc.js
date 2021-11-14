module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  globals: {
    isProdSite: true,
  },
  rules: {
    'no-debugger': 0,
    'no-console': 0,
    'react/react-in-jsx-scope': 0,
  },
};
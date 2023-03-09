module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-env',
    '@babel/preset-typescript',
  ],
  // only want to apply rewire-exports plugin during testing as it can slow the prod build down
  plugins: process.env.NODE_ENV === 'test' ? ['rewire-exports'] : [],
};

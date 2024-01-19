// eslint-disable-next-line arrow-parens
module.exports = api => {
  let plugins = ['@babel/plugin-transform-runtime'];

  if (api.env() !== 'production') {
    plugins = [...plugins];
  }

  return {
    sourceMaps: false,
    presets: ['@babel/preset-env', '@babel/preset-typescript'],
    plugins,
  };
};

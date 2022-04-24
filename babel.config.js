module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript',
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      regenerator: true
    }],
    ['@babel/plugin-proposal-decorators', {
      legacy: true,
    }],
    ['@babel/plugin-proposal-class-properties', {
      loose: false,
    }],
    'react-css-modules',
  ]
}

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
    ['module-resolver', {
      root: ['./'],
      alias: {
        '@app': './src',
        '@components': './src/components',
        '@stores': './src/stores',
        '@utils': './src/utils',
      }
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

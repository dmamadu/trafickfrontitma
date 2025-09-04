

const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(baseConfig, {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true // Supprime les console.log en production
          }
        }
      })
    ]
  }
});


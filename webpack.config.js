

const { merge } = require('webpack-merge');
const path = require('path');
const { AngularWebpackPlugin } = require('@ngtools/webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

// Configuration de base qui sera fusionnée avec la config Angular
const customConfig = (env = {}) => ({
  resolve: {
    alias: {
      // Alias pour les imports fréquents
      '@app': path.resolve(__dirname, 'src/app'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@env': path.resolve(__dirname, 'src/environments')
    },
    extensions: ['.ts', '.js', '.scss', '.json']
  },

  module: {
    rules: [
      // Règle pour les fichiers SVG (ex: conversion en composants)
      {
        test: /\.svg$/,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack']
      },

      // Règle pour les polices
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      },

      // Règle pour les images
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 10KB
          }
        },
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      }
    ]
  },

  plugins: [
    // Plugin pour extraire le CSS dans des fichiers séparés
    new MiniCssExtractPlugin({
      filename: env.production ? '[name].[contenthash].css' : '[name].css',
      chunkFilename: env.production ? '[id].[contenthash].css' : '[id].css'
    }),

    // Compression Gzip pour la production
    ...(env.production
      ? [
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8
          })
        ]
      : [])
  ],

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
});

// Export principal qui merge avec la config Angular
module.exports = (config, options) => {
  // Configuration spécifique pour AOT
  const angularConfig = {
    plugins: [
      new AngularWebpackPlugin({
        tsconfig: options.tsConfig,
        jitMode: false,
        directTemplateLoading: false
      })
    ]
  };

  return merge(
    config,
    angularConfig,
    customConfig({ production: options.configuration === 'production' })
  );
};


// // webpack.config.js
// const { merge } = require('webpack-merge');
// const { AngularWebpackPlugin } = require('@ngtools/webpack');

// module.exports = (config, options) => {
//   // Configuration de base à étendre
//   const customConfig = {
//     module: {
//       rules: [
//         // Ajoutez vos règles personnalisées ici
//       ]
//     },
//     plugins: [
//       // Ajoutez vos plugins ici
//     ]
//   };

//   return merge(config, customConfig);
// };
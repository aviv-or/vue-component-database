'use strict'

require(`dotenv`).config()
const path = require(`path`)
const ExtractTextPlugin = require(`extract-text-webpack-plugin`)
const webpack = require(`webpack`)
const OptimizeCssAssetsPlugin = require(`optimize-css-assets-webpack-plugin`)
const BundleAnalyzerPlugin = require(`webpack-bundle-analyzer`).BundleAnalyzerPlugin

const IS_PRODUCTION = process.env.NODE_ENV === `production`

const extractStyles = new ExtractTextPlugin({
  disable: !IS_PRODUCTION,
  filename: `main.css`,
})

const definePlugin = new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: IS_PRODUCTION ? `'production'` : `'development'`,
  },
})

const BASE_CONFIG = {
  entry: {
    main: path.join(__dirname, `src`, `client`, `main.js`),
  },
  output: {
    path: path.resolve(__dirname, `./build`),
    filename: `[name].bundle.js`,
    publicPath: `/build/`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: `babel-loader`,
      },
      {
        test: /\.vue$/,
        loader: `vue-loader`,
        options: {
          extractCSS: IS_PRODUCTION,
        },
      },
      {
        test: /\.css$/,
        use: extractStyles.extract({
          fallback: [ `style-loader` ],
          use: `css-loader`,
        }),
      },
      {
        test: /\.less$/,
        use: extractStyles.extract({
          fallback: [ `style-loader` ],
          use: [ `css-loader`, `less-loader` ],
        }),
      },
    ],
  },
  resolve: {
    alias: {
      babel: `Babel`,
    },
    extensions: [
      `.webpack.js`,
      `.web.js`,
      `.js`,
      `.json`,
      `.vue`,
    ],
  },
  plugins: [
    extractStyles,
    definePlugin,
  ],
  devServer: {
    port: process.env.WEBPACK_DEV_PORT,
  },
}

if (IS_PRODUCTION) {
  const optimizeCssAssetsPlugin = new OptimizeCssAssetsPlugin()
  const uglifyJsPlugin = new webpack.optimize.UglifyJsPlugin()
  const bundleAnalyzerPlugin = new BundleAnalyzerPlugin({
    analyzerMode: `static`,
    reportFilename: `bundle.info.html`,
  })
  BASE_CONFIG.plugins.push(
    optimizeCssAssetsPlugin,
    uglifyJsPlugin,
    bundleAnalyzerPlugin
  )
} else {
  BASE_CONFIG.devtool = `#cheap-module-eval-source-map`
  BASE_CONFIG.resolve.alias.vue = `vue/dist/vue.js`

  const hotModuleReplacementPlugin = new webpack.HotModuleReplacementPlugin()
  BASE_CONFIG.plugins.push(hotModuleReplacementPlugin)
}

exports.default = BASE_CONFIG

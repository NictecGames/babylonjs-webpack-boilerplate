const path = require('path')
const Uglify = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const dev = process.env.NODE_ENV === 'dev'

let cssLoaders = [{
  loader: 'css-loader',
  options: {
    importLoaders: 1,
    minimize: true
  }
}]

/**
 * In production mode
 */
if (!dev) {
  cssLoaders.push({
    loader: 'postcss-loader',
    options: {
      plugins: (loader) => [
        require('autoprefixer')({
          browsers: ['last 2 versions', 'safari >= 7', 'ie >= 8']
        })
      ]
    }
  })
}

let config = {
  entry: {
    app: ['./assets/css/app.scss', './assets/js/app.ts']
  },
  watch: dev,
  output: {
    path: path.resolve(__dirname, 'public/assets'),
    filename: dev ? '[name].js' : '[name].[chunkhash:8].js',
    publicPath: (dev ? 'http://localhost:8080' : '') + '/assets/'
  },
  resolve: {
    alias: {
      '@css': path.resolve('./assets/css/'),
      '@': path.resolve('./assets/js/')
    },
    extensions: ['.tsx', '.ts', '.js']
  },
  devtool: dev ? 'cheap-module-eval-source-map' : false,
  devServer: {
    overlay: true,
    proxy: {
      '/web': {
        target: 'http://localhost:8000',
        pathRewrite: {'^/web': ''}
      }
    },
    contentBase: path.resolve('./public'),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type'
    }
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [{
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['babel-loader']
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          configFile: 'tslint.json',
          emitErrors: true,
          typeCheck: false,
          tsConfigFile: 'tsconfig.json'
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [...cssLoaders]
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [...cssLoaders, 'sass-loader']
        })
      },
      {
        test: /\.(svg|woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[hash:7].[ext]'
            }
          },
          {
            loader: 'img-loader',
            options: {
              enabled: !dev
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: dev ? '[name].css' : '[name].[contenthash:8].css',
      disable: dev
    })
  ]
}

/**
 * In production mode
 */
if (!dev) {
  config.plugins.push(new Uglify({
    sourceMap: false
  }))

  config.plugins.push(new ManifestPlugin())

  config.plugins.push(new CleanWebpackPlugin(
    ['public/assets'],
    {
      root: path.resolve('./'),
      verbose: true
    }
  ))
}

module.exports = config

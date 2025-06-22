const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
        'theme-color': '#000000'
      }
    }),
    new CopyPlugin({
      patterns: [
        { 
          from: 'src/service-worker.js', 
          to: 'service-worker.js',
          transform(content) {
            return content.toString().replace(
              /\/\* BUILD_TIME \*\//g,
              `/* BUILD_TIME: ${Date.now()} */`
            );
          }
        },
        { 
          from: 'src/manifest.json', 
          to: 'manifest.json',
          noErrorOnMissing: true
        },
        {
          from: 'src',
          to: '',
          globOptions: {
            ignore: [
              '**/*.js', 
              '**/*.css', 
              '**/index.html',
              '**/service-worker.js',
              '**/manifest.json'
            ]
          },
          noErrorOnMissing: true
        }
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    open: true,
    port: 9008,
    historyApiFallback: false,
    headers: {
      'Service-Worker-Allowed': '/',
      'Access-Control-Allow-Origin': '*'
    },
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get('/service-worker.js', (req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Service-Worker-Allowed', '/');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(path.join(__dirname, 'dist', 'service-worker.js'));
      });
      return middlewares;
    }
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};
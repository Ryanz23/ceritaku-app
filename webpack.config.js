const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkBoxPlugin = require('workbox-webpack-plugin');

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
    new WorkBoxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'document' || request.destination === 'script' || request.destination === 'style',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'dynamic-cache',
            expiration: {
              maxEntries: 50,
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 60,
            },
          },
        },
        {
          urlPattern: /manifest\.json$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'manifest-cache',
            expiration: {
              maxEntries: 10,
            },
          },
        },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    open: true,
    port: 9007,
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
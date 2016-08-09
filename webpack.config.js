var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
module.exports = {
  entry: [
    __dirname + '/index.js'
  ],
  devtool: debug ? "inline-sourcemap" : null,
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      include: 'index.js',
      query: {
        presets: ['react', 'es2015']
      }
    }]
  },
  resolve: {
    modulesDirectories: ['node_modules', 'components'],
    extensions: ['', '.js', '.jsx']
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ]
};

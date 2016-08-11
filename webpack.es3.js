var config = require('./package.json');
var webpack = require('webpack');

var output = {
    path: __dirname + '/lib/',
    filename: `[name].${config.version}.es3.js`
};
var plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
];

module.exports = {
  entry: {
    'velocity-lite': __dirname + '/src/main.js'
  },
  output: output,
  module: {
    loaders: [
      {test: /main\.js$/, loader: 'expose?Velocity'},
      {test: /\.js$/, exclude: /node_modules/, loader: 'es3ify-loader'},
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  },
  plugins: plugins
};

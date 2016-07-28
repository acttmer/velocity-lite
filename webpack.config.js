var config = require('./package.json');
var webpack = require('webpack');


var packageType = 'dev';

process.argv.forEach(function(value, index) {
  if (value.indexOf('type') >= 0) {
    packageType = process.argv[index + 1];
  }
});

var output = {};
var plugins = [];
if (packageType === 'dev') {
  output = {
    path: __dirname + '/lib/',
    filename: `[name].${config.version}.js`,
    publicPath: '/assets/'
  };
} else if (packageType === 'build') {
  output = {
    path: __dirname + '/lib/',
    filename: `[name].${config.version}.min.js`
  };
  plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ];
} else if (packageType === 'speed') {
  output = {
    path: __dirname + '/tests/speed/js/',
    filename: `[name].${config.version}.js`
  };
}

module.exports = {
  entry: {
    'velocity-lite': __dirname + '/src/main.js'
  },
  output: output,
  module: {
    loaders: [
      {test: /main\.js$/, loader: 'expose?Velocity'},
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  },
  plugins: plugins
};

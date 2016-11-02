'use strict';
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  target: "node",

  externals: nodeModules,

  devtool: 'sourcemap',

  context: __dirname + "/../src",

  entry: './server',
  
  output: {
    path: __dirname + '/../dist/',
    filename: 'server.js'
  },

  alias:{
    root: __dirname+"/../"
  },
  
  resolve: {
    extensions: ['', '.js', '.json', '.scss']
  },
  
  module: {
    //https://github.com/webpack/webpack/issues/138#issuecomment-160638284
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,

    preLoaders: [
      { test: /\.js$/, loader: "transform?envify" },
    ],

    loaders: [
      { test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.json?$/,
        loader: 'json'
      },
      {
        test: /\.scss$/,
        loader: "style!css!sass"
      }
    ]
  },
  
  plugins: [
    new webpack.EnvironmentPlugin([
      "NODE_ENV",
      "SIGNALHUB_HOST",
    ]),

    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false }),
  ],  

  node: {
    __dirname: true,
    __filename: true,
  }
  
};

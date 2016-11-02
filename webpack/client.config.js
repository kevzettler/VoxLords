'use strict';
var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: __dirname + "/../src",

  entry: './client',
  
  output: {
    path: __dirname + '/../dist/',
    filename: 'client.js'
  },

  alias:{
    root: __dirname + '/../',
  },
  
  resolve: {
    extensions: ['', '.js', '.node', '.jsx', '.json', '.scss'],
  },
  
  module: {
    loaders: [
      { test: /\.jsx?$/,
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
      },
      {
        test: /\.node$/,
        loader: path.join(__dirname, "node-loader.js")
      }
    ]
  },
  
  node: {
    fs: "empty",
    __dirname: true,
    __filename: true
  },

  plugins: [
    new webpack.EnvironmentPlugin([
      "NODE_ENV",
      "SIGNALHUB_HOST",
    ])
  ]

};

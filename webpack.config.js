'use strict';
var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/app',
  
  output: {
    path: __dirname + '/dist/',
    filename: 'client.js'
  },

  alias:{
    root: __dirname
  },
  
  resolve: {
    extensions: ['', '.js', '.jsx', '.json', '.scss']
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
      }
    ]
  },
  
  node: {
    fs: "empty"
  }
};

module.exports = {
  entry: [ './src/index.jsx' ],
  devtool: 'inline-source-map',
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
      { test: /\.jsx$/, exclude: /node_modules/, use: { loader: 'babel-loader' } }
    ]
  }
};

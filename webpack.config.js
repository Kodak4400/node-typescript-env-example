const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  entry: {
    main: path.resolve(__dirname, './src/main.ts'),
  },

  externals: [
    nodeExternals({
      modulesFromFile: {
        includeInBundle: ['dependencies'],
        excludeFromBundle: ['devDependencies'],
      },
    }),
  ],

  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, './dist/'),
    libraryTarget: 'commonjs2',
  },

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: path.resolve(__dirname, './node_modules'),
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },
}

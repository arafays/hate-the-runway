const path = require('path')

module.exports = {
  entry: {
    content: './src/content.js'
  },
  output: {
    path: path.resolve('./public'),
    filename: '[name].js'
  }
}

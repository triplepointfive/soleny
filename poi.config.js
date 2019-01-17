module.exports = {
  entry: 'src/index',
  plugins: [{
    resolve: '@poi/plugin-typescript',
    options: {}
  }],
  chainWebpack(config, context) {
    config.output.publicPath("/soleny/");
  }
}

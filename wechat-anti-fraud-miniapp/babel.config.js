module.exports = {
  plugins: [],
  presets: [
    ['@babel/preset-env', {
      modules: false
    }]
  ],
  env: {
    development: {
      plugins: []
    },
    production: {
      plugins: [
        'transform-remove-console'
      ]
    }
  }
};

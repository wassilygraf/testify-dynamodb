// eslint-disable-next-line import/no-extraneous-dependencies
const chai = require('chai');

module.exports = function wallaby() {
  return {
    files: [
      'src/**/*.js',
      'stacks/**/*.yml',
      '!src/**/*.spec.js',
    ],

    tests: ['test/**/*.js'],

    setup: () => {
      global.expect = chai.expect;
    },

    testFramework: 'mocha',

    env: {
      type: 'node',
      runner: 'node',
    },

    workers: { recycle: true },
  };
};

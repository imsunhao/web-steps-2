process.env.TEST_ENV = 'jest'

module.exports = {
  preset: 'ts-jest',
  globals: {
    __DEV__: false,
    __PRODUCTION__: true,
    __TEST__: true,

    __NODE_ENV__: process.env.NODE_ENV,
    __WEB_STEPS__: process.env.WEB_STEPS,

    __DEBUG_PORT__: process.env.DEBUG_PORT || false,

    __VERSION__: require('./package.json').version,

    __FEATURE_OPTIONS__: true,
    __FEATURE_SUSPENSE__: true,

    __IS_SERVER__: true
  },
  watchPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^packages/(.*?)$': '<rootDir>/packages/$1',
    '^shared/(.*?)$': '<rootDir>/packages/shared/src/utils/$1',
    '^@web-steps-2/(.*?)$': '<rootDir>/packages/$1/src'
  },
  rootDir: __dirname,
  testMatch: ['<rootDir>/**/__tests__/**/*spec.ts'],
  testPathIgnorePatterns: process.env.SKIP_E2E
    ? // ignore example tests on netlify builds since they don't contribute
      // to coverage and can cause netlify builds to fail
      ['/node_modules/', '/examples/__tests__']
    : ['/node_modules/']
}

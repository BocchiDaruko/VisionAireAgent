module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70
    }
  },
  clearMocks: true,
  resetModules: false
};

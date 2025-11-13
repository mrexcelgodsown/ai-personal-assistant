module.exports = {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverage: true,
  collectCoverageFrom: ['pages/**/*.js', 'lib/**/*.js', 'pages/api/**/*.js'],
  coverageDirectory: 'coverage'
}

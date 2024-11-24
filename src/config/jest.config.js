/**
 * Jest configuration for TypeScript project testing.
 * @type {import('@jest/types').Config.InitialOptions}
 *
 * @property {string[]} moduleFileExtensions - List of file extensions Jest will look for
 * @property {string} rootDir - Root directory for Jest to find tests
 * @property {string} testRegex - Pattern to match test files
 * @property {Object.<string, string>} transform - Configuration for transforming source files
 * @property {boolean} collectCoverage - Whether to collect code coverage
 * @property {string} coverageDirectory - Output directory for coverage reports
 * @property {string} testEnvironment - Environment for running tests
 * @property {string[]} moduleDirectories - Directories to search for modules
 */
module.exports = {
    // Supported file extensions (TypeScript and JavaScript)
    moduleFileExtensions: ['js', 'json', 'ts'],

    // Base directory for test discovery
    rootDir: '.',

    // Pattern to identify test files
    testRegex: '.*\\.spec\\.ts$',

    // Configure TypeScript compilation
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },

    // Code coverage configuration
    collectCoverage: true,
    coverageDirectory: 'coverage',

    // Test environment configuration
    testEnvironment: 'node',

    // Module resolution paths
    moduleDirectories: ['node_modules', 'src'],
};
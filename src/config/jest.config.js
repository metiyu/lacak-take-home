module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$', // Look for files with .spec.ts extension
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest', // Use ts-jest to transpile TypeScript files
    },
    collectCoverage: true, // Optional: Collect coverage information
    coverageDirectory: 'coverage', // Optional: Directory to output coverage information
    testEnvironment: 'node', // Use Node.js environment for testing
    moduleDirectories: ['node_modules', 'src'], // Add this line
};

module.exports = {
  roots: ['<rootDir>/dk'],
  preset: 'ts-jest/presets/default-esm',
  testMatch: ['<rootDir>/dk/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['/dist/'],
  setupFiles: [],
  moduleNameMapper: {
    '^@dk/(.*)$': '<rootDir>/packages/$1/$1.ts'
  },
  rootDir: __dirname,
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
}

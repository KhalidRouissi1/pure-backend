module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/*?(.)spec.[jt]s?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

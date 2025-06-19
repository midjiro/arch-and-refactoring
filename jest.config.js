module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^./src/adapters/notifier$': '<rootDir>/tests/__mocks__/notifier.ts',
  },
};

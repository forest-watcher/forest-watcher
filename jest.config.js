module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/app'],
  testMatch: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^helpers/(.*)$': '<rootDir>/app/helpers/$1',
    '^components/(.*)$': '<rootDir>/app/components/$1',
    '^containers/(.*)$': '<rootDir>/app/containers/$1',
    '^screens/(.*)$': '<rootDir>/app/screens/$1',
    '^config/(.*)$': '<rootDir>/app/config/$1',
    '^types/(.*)$': '<rootDir>/app/types/$1',
    '^redux-modules/(.*)$': '<rootDir>/app/redux-modules/$1',
    '^assets/(.*)$': '<rootDir>/app/assets/$1',
    '^offline/(.*)$': '<rootDir>/app/offline/$1',
    '^locales/(.*)$': '<rootDir>/app/locales/$1',
    '^store$': '<rootDir>/app/store'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-native',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        }
      }
    ],
    '^.+\\.jsx?$': ['babel-jest', { presets: ['module:@react-native/babel-preset'] }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-native-firebase|@react-native-mapbox-gl|@tmcw/togeojson|@xmldom/xmldom|rn-fetch-blob|react-native-fs|react-native-zip-archive)/)'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', '!app/**/*.d.ts', '!app/**/__tests__/**'],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};

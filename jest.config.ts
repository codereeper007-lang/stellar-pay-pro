import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@creit-tech|@stellar|@noble|@preact|preact|uuid|htm|uint8array-extras)/)'
  ],
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx' }
    }]
  }
}
export default config

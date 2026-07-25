module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },

  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.js",
  ],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$":
      "<rootDir>/src/styleMock.js",
  },

  moduleFileExtensions: [
    "js",
    "jsx",
    "json",
  ],
};
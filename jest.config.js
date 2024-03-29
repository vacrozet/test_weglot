module.exports = {
  testMatch: ["<rootDir>/test/**/*.spec.js"],
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageReporters: ["json", "lcov", "text", "clover"],
};

/*
 * Production-mode configuration for running browser tests with Karma.
 */
const shared = require("./karma.shared.js");

module.exports = (config) => shared("./dist/lispx-vm.umd.js", config);

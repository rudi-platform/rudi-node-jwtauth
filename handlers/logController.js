'use strict'

const mod = 'logCtrl'

// -----------------------------------------------------------------------------
// External dependencies
// -----------------------------------------------------------------------------
const { readFileSync } = require('fs')

// -----------------------------------------------------------------------------
// Internal dependencies
// -----------------------------------------------------------------------------
const log = require('../utils/logging')
const { LOG_DIR, SYMLINK_NAME } = require('../config/confSystem')

// -----------------------------------------------------------------------------
// Controllers
// -----------------------------------------------------------------------------
exports.getLogs = (req, reply) => {
  const fun = 'getLogs'
  try {
    const logFile = `${LOG_DIR}/${SYMLINK_NAME}`
    const logs = readFileSync(logFile)
    return logs
  } catch (err) {
    log.w(mod, fun, err)
    throw err
  }
}

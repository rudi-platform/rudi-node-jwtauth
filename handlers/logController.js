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
const { OUT_LOG } = require('../config/confSystem')

// -----------------------------------------------------------------------------
// Controllers
// -----------------------------------------------------------------------------
exports.getLogs = (req, reply) => {
  const fun = 'getLogs'
  try {
    const logFile = OUT_LOG
    const logs = readFileSync(OUT_LOG)
    return logs
  } catch (err) {
    log.w(mod, fun, err)
    throw err
  }
}

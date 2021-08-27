'use strict'

const mod = 'sysConf'
// -----------------------------------------------------------------------------
// External dependecies
// -----------------------------------------------------------------------------
require('winston')
const { format } = require('date-and-time')

// -----------------------------------------------------------------------------
// Internal dependecies
// -----------------------------------------------------------------------------
const fa = require('../utils/fileActions')
const utils = require('../utils/jsUtils')

utils.separateLogs()

// -----------------------------------------------------------------------------
// Constants: local ini file configuration settings
// -----------------------------------------------------------------------------

// Conf files name
const iniDir = '.ini'
// - user conf
const userConfFile = `./${iniDir}/custom.ini`
// - default conf
const defConfFile = `./${iniDir}/default.ini`

// Node Server section
const SERVER_SECTION = 'server'
const _serverAddress = 'listening_address'
const _serverPort = 'listening_port'

// DB section
const DB_SECTION = 'database'

const _dbUrl = 'db_url'
const _dbName = 'db_name'
const _dbPort = 'db_port'

// Logs section
const LOG_SECTION = 'logging'

const _appName = 'app_name'
const _logDir = 'log_dir'
const _logFileName = 'log_file'
const _logLevel = 'log_level'
const _expires = 'expires'

// Security section
const SECURITY_SECTION = 'security'
const _publicKey = 'public_key'
const _privateKey = 'private_key'

// -----------------------------------------------------------------------------
// Constants: default configuration
// -----------------------------------------------------------------------------
const DEFAULT_CONF = {
  // Node.js server
  [SERVER_SECTION]: {
    [_serverAddress]: '0.0.0.0',
    [_serverPort]: 3003,
  },
  // DB
  [DB_SECTION]: {
    [_dbUrl]: 'mongodb://127.0.0.1/',
    [_dbName]: 'rudi_prod',
    [_dbPort]: 27017,
  },
  // Logs
  [LOG_SECTION]: {
    [_appName]: 'rudiProxy',
    [_logDir]: './logs',
    [_logFileName]: 'rudiProxy.log',
    [_logLevel]: 'debug',
    [_expires]: '1d',
  },
}

// -----------------------------------------------------------------------------
// Constants: user and local configuration
// -----------------------------------------------------------------------------
// Getting user conf file value
// if null, local conf file value
// if null , default value
const USER_CONF = fa.readIniFile(userConfFile)
const LOCAL_CONF = fa.readIniFile(defConfFile)

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

// Get values from global constants
// -> gets user conf file value
//    if null get local conf file value
//    if null get default value
function getIniValue(section, field) {
  const userValue = utils.quietAccess(USER_CONF[section], field)
  const localValue = utils.quietAccess(LOCAL_CONF[section], field)

  return userValue || localValue || DEFAULT_CONF[section][field]
}

// -----------------------------------------------------------------------------
// Extracting and exporting sys configuration
// -----------------------------------------------------------------------------

// Server
exports.LISTENING_ADDR = getIniValue(SERVER_SECTION, _serverAddress)
exports.LISTENING_PORT = getIniValue(SERVER_SECTION, _serverPort)

// DB
exports.DB_NAME = getIniValue(DB_SECTION, _dbName)
const DB_URL_PREFIX = getIniValue(DB_SECTION, _dbUrl)
exports.DB_URL = `${DB_URL_PREFIX}${this.DB_NAME}`

// Logs
exports.APP_NAME = getIniValue(LOG_SECTION, _appName)
exports.LOG_DIR = getIniValue(LOG_SECTION, _logDir)
exports.LOG_FILE = getIniValue(LOG_SECTION, _logFileName)
exports.OUT_LOG = `${this.LOG_DIR}/${this.LOG_FILE}`
exports.SYMLINK_NAME = `${this.APP_NAME}-current.log`
exports.LOG_LVL = getIniValue(LOG_SECTION, _logLevel)
exports.LOG_EXP = getIniValue(LOG_SECTION, _expires)

// Security
exports.PUB_KEY = getIniValue(SECURITY_SECTION, _publicKey)
exports.PRIV_KEY = getIniValue(SECURITY_SECTION, _privateKey)

const fun = 'export'
// const now = utils.nowLocaleFormatted()

utils.consoleLog(mod, fun, `APP_NAME: ${this.APP_NAME}`)
utils.consoleLog(mod, fun, `LISTENING_ADDR: ${this.LISTENING_ADDR}`)
utils.consoleLog(mod, fun, `LISTENING_PORT: ${this.LISTENING_PORT}`)
// utils.consoleLog(mod, fun, `OUT_LOG: ${this.OUT_LOG}`)
// utils.consoleLog(mod, fun, `LOG_LVL: ${this.LOG_LVL}`)
// utils.consoleLog(mod, fun, `LOG_EXP: ${this.LOG_EXP}`)
// utils.consoleLog(mod, fun, `DB_NAME: ${this.DB_NAME}`)
// utils.consoleLog(mod, fun, `DB_URL: ${this.DB_URL}`)

exports.getHost = () => {
  return `http://${this.LISTENING_ADDR}:${this.LISTENING_PORT}`
}

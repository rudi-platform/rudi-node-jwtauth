/* eslint-disable no-console */
'use strict'

const mod = 'sysConf'
// -----------------------------------------------------------------------------
// External dependecies
// -----------------------------------------------------------------------------
import 'winston'

// -----------------------------------------------------------------------------
// Internal dependecies
// -----------------------------------------------------------------------------
import _ from 'lodash'
const { omit } = _

import minimist from 'minimist'
import { join } from 'path'
import { readIniFile } from '../utils/fileActions.js'
import { NOT_FOUND, quietAccess, separateLogs } from '../utils/jsUtils.js'

separateLogs()

// -----------------------------------------------------------------------------
// Constants: local ini file configuration settings
// -----------------------------------------------------------------------------
const argv = omit(minimist(process.argv, { string: 'hash' }), '_')
if (argv.length > 0) console.log('CLI options:', argv)
else console.log('No CLI options')

// Conf files
// - user conf path
const userConfFile = argv.conf || `./0-ini/conf_custom.ini`
// - default conf path
const defConfFile = `./0-ini/conf_default.ini`

// Node Server section
const SERVER_SECTION = 'server'

// RUDI producer API module section
const CATALOG_SECTION = 'rudi_catalog'
const STORAGE_SECTION = 'rudi_storage'

// Logs section
const LOG_SECTION = 'logging'

// Security section
const SECURITY_SECTION = 'security'

export const DEFAULT_EXP = 6000

// -----------------------------------------------------------------------------
// Constants: user and local configuration
// -----------------------------------------------------------------------------
// Getting user conf file value
// if null, local conf file value
// if null , default value
const USER_CONF = readIniFile(userConfFile)
const LOCAL_CONF = readIniFile(defConfFile)

// consoleLog(mod, 'user conf', USER_CONF)

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

// Get values from global constants
// -> gets user conf file value
//    if null get local conf file value
//    if null get default value
function getIniValue(section, field) {
  const userValue = quietAccess(USER_CONF[section], field)
  const localValue = quietAccess(LOCAL_CONF[section], field)

  if (userValue != NOT_FOUND) return userValue
  if (localValue != NOT_FOUND) return localValue
  return NOT_FOUND
}

export const LISTENING_ADDR = getIniValue(SERVER_SECTION, 'listening_address')
export const LISTENING_PORT = getIniValue(SERVER_SECTION, 'listening_port')

// RUDI Catalog server info
const CATALOG_KEY_ID = getIniValue(CATALOG_SECTION, 'key_id')
export const getKeyIdForCatalog = () => CATALOG_KEY_ID

let CATALOG_URL = join(getIniValue(CATALOG_SECTION, 'catalog_url'), '/')
if (CATALOG_URL) {
  if (!CATALOG_URL?.endsWith('/api/') && !CATALOG_URL?.endsWith('/catalog/') && !CATALOG_URL?.endsWith('/admin/'))
    CATALOG_URL = join(CATALOG_URL, 'api')
  if (!CATALOG_URL?.endsWith('/admin/')) CATALOG_URL = join(CATALOG_URL, 'admin')
}
export const getCatalogPrivateUrl = (...url) => join(CATALOG_URL, ...url)

// RUDI Storage server info
const STORAGE_KEY_ID = getIniValue(STORAGE_SECTION, 'key_id')
const STORAGE_USR_ID = getIniValue(STORAGE_SECTION, 'usr_id')
export const getKeyIdForStorage = () => STORAGE_KEY_ID
export const getUsrIdForStorage = () => STORAGE_USR_ID

// const STORAGE_ADDR = getIniValue(STORAGE_SECTION, 'address')
// const STORAGE_PORT = getIniValue(STORAGE_SECTION, 'port')
// export const STORAGE_PREFIX = getIniValue(STORAGE_SECTION, 'prefix')
const STORAGE_URL = getIniValue(STORAGE_SECTION, 'storage_url')
export const getStorageUrl = (...url) => join(STORAGE_URL, ...url)

// Logs
export const APP_NAME = getIniValue(LOG_SECTION, 'app_name')
export const LOG_DIR = getIniValue(LOG_SECTION, 'log_dir')
export const LOG_FILE = getIniValue(LOG_SECTION, 'log_file')
export const OUT_LOG = join(LOG_DIR, LOG_FILE)
export const SYMLINK_NAME = `${APP_NAME}-current.log`
export const LOG_LVL = getIniValue(LOG_SECTION, 'log_level')
export const LOG_EXP = getIniValue(LOG_SECTION, 'expires')

// Security
const profileFile = argv.profiles || getIniValue(SECURITY_SECTION, 'profiles')
export const PROFILES = readIniFile(profileFile)
export const EXP_TIME = getIniValue(SECURITY_SECTION, 'exp_time') || DEFAULT_EXP

export const PUB_KEY = 'pub_key'
export const PRV_KEY = 'prv_key'

const fun = 'export'

export const getHost = () => `http://${LISTENING_ADDR}:${LISTENING_PORT}`

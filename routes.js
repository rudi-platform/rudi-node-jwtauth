'use strict'

// const mod = 'routes'

// -----------------------------------------------------------------------------
// External dependencies
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Internal dependencies
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Swagger documentation
// -----------------------------------------------------------------------------
// const documentation = require('./documentation/metadataApi')

// -----------------------------------------------------------------------------
// API request constants
// -----------------------------------------------------------------------------
const {
  URL_PREFIX_PUBLIC,
  URL_PUB_METADATA,
  URL_PREFIX_PRIVATE,
  URL_PV_DB_ACCESS,
  URL_PV_LOGS_ACCESS,
  URL_PV_GIT_HASH_ACCESS,
  URL_PV_APP_HASH_ACCESS,
  URL_PV_THESAURUS_ACCESS,
  URL_PV_NODE_VERSION_ACCESS,
  URL_PV_LICENCE_ACCESS,
  URL_PV_LICENCE_CODES_ACCESS,
  URL_PV_PORTAL_PREFIX,
  URL_PV_OBJECT_GENERIC,
  URL_SUFFIX_TOKEN_GET,
  URL_SUFFIX_TOKEN_CHECK,
  PARAM_ID,
  PARAM_REPORT_ID,
  PARAM_LOGS_LINES,
  PARAM_THESAURUS_CODE,
  PARAM_OBJECT_METADATA,
  PARAM_ACTION_INIT,
  PARAM_ACTION_REPORT,
  PARAM_ACTION_DELETION,
  PARAM_ACTION_UUID_GEN,
  PARAM_ACTION_UNLINKED,
  PARAM_ACTION_SIGN,
} = require('../config/confApi')

// -----------------------------------------------------------------------------
// Controllers
// -----------------------------------------------------------------------------
const genericController = require('../controllers/genericController')
const metadataController = require('../controllers/metadataController')
const reportController = require('../controllers/reportController')

const dbController = require('../controllers/dbController')
const sysController = require('../controllers/sysController')
const { getLastLogLines, getLogs } = require('../controllers/logController')
const skosController = require('../controllers/skosController')
const licenceController = require('../controllers/licenceController')

const devController = require('../controllers/testController')
const portalController = require('../controllers/portalController')
const { forgeToken } = require('../controllers/tokenController')

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------
/* function logRequest(req, res) {
  const fun = 'logRequest'
  utils.consoleLog('', fun, `${req.ip}: ${req.method} ${req.url} `)
}
 */
// -----------------------------------------------------------------------------
// Public routes
// -----------------------------------------------------------------------------
exports.publicRoutes = [
  // Routes accessed by RUDI Portal:
  // /resources POST/PUT/GET
  // /resources/{id} GET/DELETE
  // /resources/{id}/report PUT

  // -----------------------------------------------------------------------------
  // Generic routes for accessing any object
  // ('Metadata', 'Organizations' and 'Contacts')
  // -----------------------------------------------------------------------------
  // Get all
  {
    method: 'GET',
    url: URL_PUB_METADATA,
    // preHandler: logRequest,
    handler: metadataController.getMetadataList,
  },
  // Get 1
  {
    method: 'GET',
    url: `${URL_PUB_METADATA}/:${PARAM_ID}`,
    // preHandler: logRequest,
    handler: metadataController.getSingleMetadata,
  },

  // -----------------------------------------------------------------------------
  // Integration reports for one particular object
  // -----------------------------------------------------------------------------

  // Add/edit 1 report for one object integration
  {
    method: 'PUT',
    url: `${URL_PUB_METADATA}/:${PARAM_ID}/${PARAM_ACTION_REPORT}`,
    // preHandler: logRequest,
    handler: reportController.addOrEditSingleReportForMetadata,
  },

  // Get all reports for one object integration
  {
    method: 'GET',
    url: `${URL_PUB_METADATA}/:${PARAM_ID}/${PARAM_ACTION_REPORT}`,
    // preHandler: logRequest,
    handler: reportController.getReportListForMetadata,
  },
  // Get 1 report for one object integration
  {
    method: 'GET',
    url: `${URL_PUB_METADATA}/:${PARAM_ID}/${PARAM_ACTION_REPORT}/:${PARAM_REPORT_ID}`,
    // preHandler: logRequest,
    handler: reportController.getSingleReportForMetadata,
  },
]

// -----------------------------------------------------------------------------
// Private routes
// -----------------------------------------------------------------------------
exports.backOfficeRoutes = [
  // -----------------------------------------------------------------------------
  // Generic routes for accessing any object
  // ('Metadata', 'Organizations' and 'Contacts')
  // -----------------------------------------------------------------------------

  // Add 1
  {
    method: 'POST',
    url: URL_PV_OBJECT_GENERIC,
    // preHandler: logRequest,
    handler: genericController.addSingleObject,
    // schema: documentation.addMetadataSchema
  },
  // Edit 1
  {
    method: 'PUT',
    url: URL_PV_OBJECT_GENERIC,
    // preHandler: logRequest,
    handler: genericController.upsertSingleObject,
  },
  // Get all
  {
    method: 'GET',
    url: URL_PV_OBJECT_GENERIC,
    // preHandler: logRequest,
    handler: genericController.getObjectList,
  },
  // Get 1
  {
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}`,
    // preHandler: logRequest,
    handler: genericController.getSingleObject,
  },

  // Delete 1
  {
    method: 'DELETE',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}`,
    // preHandler: logRequest,
    handler: genericController.deleteSingleObject,
  },
  // Delete all
  {
    method: 'DELETE',
    url: URL_PV_OBJECT_GENERIC,
    // preHandler: logRequest,
    handler: genericController.deleteManyObjects,
  },
  // Delete many
  {
    method: 'POST',
    url: `${URL_PV_OBJECT_GENERIC}/${PARAM_ACTION_DELETION}`,
    // preHandler: logRequest,
    handler: genericController.deleteObjectList,
  },

  // Access unlinked data
  {
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/${PARAM_ACTION_UNLINKED}`,
    // preHandler: logRequest,
    handler: genericController.getOrphans,
  },

  // -----------------------------------------------------------------------------
  // Integration reports
  // -----------------------------------------------------------------------------

  // Add 1 integration report for an identified object
  {
    method: 'POST',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${PARAM_ACTION_REPORT}`,
    // preHandler: logRequest,
    handler: reportController.addSingleReportForObject,
  },

  // Add/edit 1 integration report for an identified object
  {
    method: 'PUT',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${PARAM_ACTION_REPORT}`,
    // preHandler: logRequest,
    handler: reportController.addOrEditSingleReportForObject,
  },

  // Get all integration reports for an identified object
  {
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${PARAM_ACTION_REPORT}`,
    // preHandler: logRequest,
    handler: reportController.getReportListForObject,
  },
  // Get 1 report for one object integration
  {
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${PARAM_ACTION_REPORT}/:${PARAM_REPORT_ID}`,
    // preHandler: logRequest,
    handler: reportController.getSingleReportForObject,
  },
  // Get all integration reports for one object type
  {
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/${PARAM_ACTION_REPORT}`,
    // preHandler: logRequest,
    handler: reportController.getReportListForObjectType,
  },

  // Delete 1 identified integration report for one object
  {
    method: 'DELETE',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${PARAM_ACTION_REPORT}/:${PARAM_REPORT_ID}`,
    // preHandler: logRequest,
    handler: reportController.deleteSingleReportForObject,
  },
  // Delete all integration reports for one object
  {
    method: 'DELETE',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${PARAM_ACTION_REPORT}`,
    // preHandler: logRequest,
    handler: reportController.deleteEveryReportForObject,
  },
  // Delete many integration reports for an identified object
  {
    method: 'POST',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${PARAM_ACTION_REPORT}/${PARAM_ACTION_DELETION}`,
    // preHandler: logRequest,
    handler: reportController.deleteManyReportForObject,
  },
]
exports.devRoutes = [
  // -----------------------------------------------------------------------------
  // Accessing thesaurus
  // -----------------------------------------------------------------------------
  {
    method: 'GET',
    url: `${URL_PV_THESAURUS_ACCESS}`,
    // preHandler: logRequest,
    handler: skosController.getEveryThesaurus,
  },
  {
    method: 'GET',
    url: `${URL_PV_THESAURUS_ACCESS}/:${PARAM_THESAURUS_CODE}`,
    // preHandler: logRequest,
    handler: skosController.getSingleThesaurus,
  },
  {
    method: 'GET',
    url: `${URL_PV_LICENCE_ACCESS}`,
    // preHandler: logRequest,
    handler: licenceController.getAllLicences,
  },
  {
    method: 'GET',
    url: `${URL_PV_LICENCE_CODES_ACCESS}`,
    // preHandler: logRequest,
    handler: licenceController.getAllLicenceCodes,
  },
  {
    method: 'POST',
    url: `${URL_PV_LICENCE_ACCESS}/init`,
    // preHandler: logRequest,
    handler: licenceController.init,
  },

  // -----------------------------------------------------------------------------
  // Init Open Data Rennes
  // -----------------------------------------------------------------------------
  // Mass init with ODS data
  {
    method: 'POST',
    url: `${URL_PREFIX_PRIVATE}/${PARAM_OBJECT_METADATA}/${PARAM_ACTION_INIT}`,
    // preHandler: logRequest,
    handler: metadataController.massInit,
  },

  // -----------------------------------------------------------------------------
  // UUID v4 generation
  // -----------------------------------------------------------------------------
  {
    method: 'GET',
    url: `${URL_PREFIX_PRIVATE}/${PARAM_ACTION_UUID_GEN}`,
    // preHandler: logRequest,
    handler: genericController.generateUUID,
  },
  // -----------------------------------------------------------------------------
  // Local token generation
  // -----------------------------------------------------------------------------
  {
    method: 'POST',
    url: `${URL_PREFIX_PRIVATE}/${PARAM_ACTION_SIGN}`,
    // preHandler: logRequest,
    handler: forgeToken,
  },
  // -----------------------------------------------------------------------------
  // Portal token
  // -----------------------------------------------------------------------------
  // Get a new token from the Portal
  {
    method: 'GET',
    url: `${URL_PV_PORTAL_PREFIX}/${URL_SUFFIX_TOKEN_GET}`,
    // preHandler: logRequest,
    handler: portalController.exposedGetPortalToken,
  },
  // Get a token checked by the Portal
  {
    method: 'GET',
    url: `${URL_PV_PORTAL_PREFIX}/${URL_SUFFIX_TOKEN_GET}/${URL_SUFFIX_TOKEN_CHECK}`,
    // preHandler: logRequest,
    handler: portalController.checkStoredToken,
  },

  // -----------------------------------------------------------------------------
  // Get/post resources from/to Portal
  // -----------------------------------------------------------------------------
  {
    method: 'GET',
    url: `${URL_PV_PORTAL_PREFIX}/${PARAM_OBJECT_METADATA}/:${PARAM_ID}`,
    // preHandler: logRequest,
    handler: portalController.getMetadata,
  },
  {
    method: 'POST',
    url: `${URL_PV_PORTAL_PREFIX}/${PARAM_OBJECT_METADATA}/:${PARAM_ID}`,
    // preHandler: logRequest,
    handler: portalController.sendMetadata,
  },

  // -----------------------------------------------------------------------------
  // Accessing app info (git hash)
  // -----------------------------------------------------------------------------
  /**
   * Get current git hash
   */
  {
    method: 'GET',
    url: `${URL_PV_GIT_HASH_ACCESS}`,
    // preHandler: logRequest,
    handler: sysController.getGitHash,
  },
  /**
   * Get current git hash from the running application
   */
  {
    method: 'GET',
    url: `${URL_PV_APP_HASH_ACCESS}`,
    // preHandler: logRequest,
    handler: sysController.getAppHash,
  },
  /**
   * Get node and npm versions
   */
  {
    method: 'GET',
    url: `${URL_PV_NODE_VERSION_ACCESS}`,
    // preHandler: logRequest,
    handler: sysController.getNodeVersion,
  },

  // -----------------------------------------------------------------------------
  // Accessing logs
  // -----------------------------------------------------------------------------
  {
    method: 'GET',
    url: `${URL_PV_LOGS_ACCESS}`,
    // preHandler: logRequest,
    handler: getLogs,
  },
  {
    method: 'GET',
    url: `${URL_PV_LOGS_ACCESS}/:${PARAM_LOGS_LINES}`,
    // preHandler: logRequest,
    handler: getLastLogLines,
  },

  // -----------------------------------------------------------------------------
  // Actions on DB
  // -----------------------------------------------------------------------------
  // Get all collections
  {
    method: 'GET',
    url: `${URL_PV_DB_ACCESS}`,
    // preHandler: logRequest,
    handler: dbController.getCollections,
  },
  // Drop DB
  {
    method: 'DELETE',
    url: `${URL_PV_DB_ACCESS}`,
    // preHandler: logRequest,
    handler: dbController.dropDB,
  },
  // -----------------------------------------------------------------------------
  // Tests entry
  // -----------------------------------------------------------------------------
  {
    method: 'GET',
    url: `${URL_PREFIX_PRIVATE}/test`,
    // preHandler: logRequest,
    handler: devController.test,
  },
]

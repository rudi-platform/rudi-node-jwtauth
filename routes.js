'use strict'

const { URL_JWT, URL_SUFFIX_FORGE, URL_SUFFIX_CHECK } = require('./config/confApi')
const { forgeToken, checkToken } = require('./handlers/jwtController')

const mod = 'routes'

// -----------------------------------------------------------------------------
// JWT routes
// -----------------------------------------------------------------------------
exports.jwtRoutes = [
  /**
   * Ask for a JWT to access RUDI proxy API module with a given request
   */
  {
    method: 'POST',
    url: `${URL_JWT}/${URL_SUFFIX_FORGE}`,
    // preHandler: logRequest,
    handler: forgeToken,
  },
  /**
   * Simply test the JWT in the header
   */
  {
    method: 'GET',
    url: `${URL_JWT}/${URL_SUFFIX_CHECK}`,
    // preHandler: logRequest,
    handler: checkToken,
  },
]

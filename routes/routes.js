'use strict'

const { URL_JWT, URL_SUFFIX_REQUEST } = require("../config/confApi")
const { forgeToken } = require("../handlers/jwtController")

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
    url: `${URL_JWT}/${URL_SUFFIX_REQUEST}`,
    // preHandler: logRequest,
    handler: forgeToken,
  },
]

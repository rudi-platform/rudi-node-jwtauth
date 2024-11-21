'use strict'

import { hashPassword } from '@aqmo.org/jwt-lib'
import {
  SUFFIX_REDIRECT,
  URL_JWT,
  URL_LOGS,
  URL_REDIRECT,
  URL_SUFFIX_CHECK,
  URL_SUFFIX_FORGE,
} from '../config/confApi.js'
import { checkJwt, forgeJwt } from '../handlers/jwtController.js'
// import { checkToken, forgeToken } from '../handlers/jwtController'
import { clearLogs, getLogs } from '../handlers/logController.js'
import { redirectReq } from '../handlers/redirectController.js'
import { BadRequestError } from '../utils/errors.js'
import { decodeBase64, decodeBase64url } from '../utils/jsUtils.js'

const mod = 'routes'

export const privateRoutes = [
  // -----------------------------------------------------------------------------
  // PWD routes
  // -----------------------------------------------------------------------------
  /**
   * Hash a password
   * The password is submitted as a string, either directly or
   * - Base64Url encoded (?encoding=base64url)
   * - Base64 encoded (?encoding=base64)
   */
  {
    method: 'POST',
    url: '/pwd/hash',
    handler: (req) => {
      const encoding = `${req.query?.encoding}`.toLowerCase()
      let pwd = req.body
      if (encoding === 'base64url') pwd = decodeBase64url(req.body)
      else if (encoding === 'base64') pwd = decodeBase64(req.body)
      else if (encoding) throw new BadRequestError(`Encoding was not recognized: '${encoding}'`)
      return hashPassword(pwd)
    },
  },

  // -----------------------------------------------------------------------------
  // JWT routes
  // -----------------------------------------------------------------------------
  /**
   * Ask for a JWT to access RUDI proxy API module with a given request
   */
  {
    method: 'POST',
    url: `${URL_JWT}/${URL_SUFFIX_FORGE}`,
    // preHandler: logRequest,
    handler: forgeJwt,
  },
  /**
   * Simply test the JWT in the header
   */
  {
    method: 'GET',
    url: `${URL_JWT}/${URL_SUFFIX_CHECK}`,
    // preHandler: logRequest,
    handler: checkJwt,
  },
  {
    method: 'POST',
    url: `${URL_JWT}/${URL_SUFFIX_CHECK}`,
    // preHandler: logRequest,
    handler: checkJwt,
  },
  // -----------------------------------------------------------------------------
  // Redirections
  // -----------------------------------------------------------------------------
  /**
   * Re-route the GET request
   */
  {
    method: 'GET',
    url: `${URL_REDIRECT}/${SUFFIX_REDIRECT}`,
    // preHandler: logRequest,
    handler: redirectReq,
  },
  {
    method: 'POST',
    url: `${URL_REDIRECT}/${SUFFIX_REDIRECT}`,
    // preHandler: logRequest,
    handler: redirectReq,
  },
  {
    method: 'PUT',
    url: `${URL_REDIRECT}/${SUFFIX_REDIRECT}`,
    // preHandler: logRequest,
    handler: redirectReq,
  },
  {
    method: 'DELETE',
    url: `${URL_REDIRECT}/${SUFFIX_REDIRECT}`,
    // preHandler: logRequest,
    handler: redirectReq,
  },

  // -----------------------------------------------------------------------------
  // Logs
  // -----------------------------------------------------------------------------
  {
    method: 'GET',
    url: URL_LOGS,
    handler: getLogs,
  },
  {
    method: 'DELETE',
    url: URL_LOGS,
    handler: clearLogs,
  },
]

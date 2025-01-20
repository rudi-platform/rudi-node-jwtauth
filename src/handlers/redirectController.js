'use strict'

const mod = 'redirect'

// -----------------------------------------------------------------------------
// External dependancies
// -----------------------------------------------------------------------------

import axios from 'axios'
const { delete: del, get, post, put } = axios

import { v4 as uuid4 } from 'uuid'

// -----------------------------------------------------------------------------
// Internal dependancies
// -----------------------------------------------------------------------------
import { SUFFIX_REDIRECT, URL_REDIRECT } from '../config/confApi.js'
import { APP_NAME, getCatalogPrivateUrl } from '../config/confSystem.js'
import { beautify } from '../utils/jsUtils.js'
import { logD, logV, logW } from '../utils/logging.js'

import { AUTH, HEADERS } from '../config/headers.js'
import { BadRequestError, createRudiHttpError } from '../utils/errors.js'
import { JWT_CLIENT, JWT_SUB, createRudiJwt } from './jwtController.js'

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Redirection controllers
// -----------------------------------------------------------------------------
// eslint-disable-next-line complexity
export async function redirectReq(req) {
  const fun = 'redirectReq'
  try {
    logV(mod, fun, `< ${URL_REDIRECT}/:${SUFFIX_REDIRECT}`)

    // Extracting the parameters
    const method = req.context?.config?.method
    const redirectedUrlSuffix = req.raw?.url?.substring(URL_REDIRECT.length)
    const body = req.body
    logD(mod, fun, beautify(req.raw?.url))
    logD(mod, fun, beautify(redirectedUrlSuffix))

    const redirectUrl = getCatalogPrivateUrl(redirectedUrlSuffix)
    logD(mod, fun, `redirected request: ${method} ${redirectUrl}`)

    // log.d(mod, fun, `body: ${body}`)

    const subject = req[HEADERS][JWT_SUB] || APP_NAME
    const clientId = req[HEADERS][JWT_CLIENT] || uuid4()

    // Forging the token with the final request
    const jwtPayload = {
      [JWT_SUB]: subject,
      [JWT_CLIENT]: clientId,
    }

    // Creating the header
    const reqOpts = {
      [HEADERS]: {
        'User-Agent': 'Rudi-Producer',
        'Content-Type': 'application/json',
        [AUTH]: `Bearer ${createRudiJwt(jwtPayload)}`,
      },
    }

    try {
      switch (`${method}`.toUpperCase()) {
        case 'GET':
          return (await get(redirectUrl, reqOpts))?.data
        case 'DELETE':
        case 'DEL':
          return (await del(redirectUrl, reqOpts))?.data
        case 'POST':
          return (await post(redirectUrl, body, reqOpts))?.data
        case 'PUT':
          return (await put(redirectUrl, body, reqOpts))?.data
        default:
          throw new BadRequestError(`Method unkown: ${method}`)
      }
    } catch (err) {
      if (err.response?.data) {
        const errData = err.response.data || err
        logW(mod, fun, `Error sending request ${method} ${redirectedUrlSuffix}: ${beautify(errData)}`)
        throw createRudiHttpError(errData.statusCode, errData.message)
      } else {
        logW(mod, fun, `Error sending request ${method} ${redirectedUrlSuffix}: ${err}`)
        throw err
      }
    }
  } catch (err) {
    logW(mod, fun, err)
    throw err
  }
}

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

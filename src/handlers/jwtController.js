'use strict'

const mod = 'jwtCtrl'

// -----------------------------------------------------------------------------
// External dependancies
// -----------------------------------------------------------------------------
import { v4 as uuidv4 } from 'uuid'

import {
  extractJwt,
  forgeToken,
  readPrivateKeyFile,
  readPublicKeyFile,
  tokenStringToJwtObject,
  verifyToken,
} from '@aqmo.org/jwt-lib'
// -----------------------------------------------------------------------------
// Internal dependancies
// -----------------------------------------------------------------------------
import { logD, logW } from '../utils/logging.js'

import axios from 'axios'
import {
  DEFAULT_EXP,
  getKeyIdForCatalog,
  getKeyIdForStorage,
  getStorageUrl,
  getUsrIdForStorage,
  PROFILES,
  PRV_KEY,
  PUB_KEY,
} from '../config/confSystem.js'
import { BadRequestError, createRudiHttpError, NotFoundError, UnauthorizedError } from '../utils/errors.js'
import { beautify, isEmptyObject, timeEpochS } from '../utils/jsUtils.js'

// -----------------------------------------------------------------------------
// JWT Constants
// -----------------------------------------------------------------------------
export const JWT_ID = 'jti' // https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.7
export const JWT_EXP = 'exp' // Expiration Time https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.4
export const JWT_SUB = 'sub' // Subject https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.2
export const JWT_IAT = 'iat' // Issued At https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.6
export const JWT_CLIENT = 'client_id' // https://www.rfc-editor.org/rfc/rfc6749.html#section-2.2

export const REQ_MTD = 'req_mtd'
export const REQ_URL = 'req_url'

export const JWT_KEY = 'key' // Used when 'sub' is needed in the JWT and does not correspond to the key in profiles

// -----------------------------------------------------------------------------
// Local Constants
// -----------------------------------------------------------------------------
const KEYS = {}
const PRVK = 'prvk'
const PUBK = 'pubk'

const STORAGE = 'RUDI Storage'
// -----------------------------------------------------------------------------
// Controllers
// -----------------------------------------------------------------------------

/**
 * Retrieve the string that states which algorithm was used for the
 * private/public key pair.
 * see https://datatracker.ietf.org/doc/html/rfc7518#section-3.1
 * @param {String} algo
 * @returns
 */
export function getJwtAlgo(algo) {
  const fun = 'getJwtAlgo'
  try {
    switch (algo) {
      case 'ed25519':
      case 'EdDSA':
        return 'EdDSA'
      case 'HS256':
      case 'ES256':
      case 'RS256':
      case 'PS256':
      case 'HS512':
      case 'ES512':
      case 'RS512':
      case 'PS512':
        return algo
      default:
        throw new BadRequestError(`Algo not recognized: '${algo}'`)
    }
  } catch (err) {
    logW(mod, fun, err)
    throw err
  }
}

/**
 * Hash algo to be used to sign the JWT
 * @param {String} algo
 * @returns
 */
export function getHashAlgo(algo) {
  const fun = 'getHashAlgo'
  // Complete list of hash algos :
  // require('crypto').getHashes()
  try {
    switch (algo) {
      case 'HS256':
      case 'RS256':
      case 'ES256':
      case 'PS256':
        return 'sha256'
      case 'ES512':
      case 'HS512':
      case 'RS512':
      case 'PS512':
      case 'ed25519':
      case 'EdDSA':
        return 'sha512'
      default:
        throw new BadRequestError(`Algo not recognized: '${algo}'`)
    }
  } catch (err) {
    logW(mod, fun, err)
    throw err
  }
}

/**
 * Creates a JWT with incoming JSON as a payload
 * If 'iat' (issued at) property is not found, it is automatically added to the payload
 * with current Epoch time in seconds
 * If 'exp' (expiration time) property is not found, it is automatically added to the
 * payload with default value 600
 * @param {*} req
 * @param {*} reply
 * @returns
 */
export const forgeJwt = (req, reply) => createRudiJwt(req.body)

const checkPayload = (jwtPayload) => {
  if (!jwtPayload || isEmptyObject(jwtPayload)) throw new BadRequestError(`Incoming JSON should not be null`)

  // Identifying the requester asking for a token
  const subject = jwtPayload[JWT_KEY] || jwtPayload[JWT_SUB]
  if (!subject) throw new BadRequestError(`No ID was found for the requester (property '${JWT_KEY} or ${JWT_SUB}')`)
  return subject
}

function isJwtValid(jwt) {
  if (!jwt) return false
  const jwtParts = tokenStringToJwtObject(jwt)
  return jwtParts?.payload?.exp > timeEpochS()
}

export async function createRudiJwt(jwtPayload) {
  const fun = 'createRudiJwt'
  logD(mod, fun, ``)
  try {
    if (!jwtPayload?.target || jwtPayload.target == 'catalog') return getCatalogJwt()
    return getStorageJwt(jwtPayload)
  } catch (err) {
    logW(mod, fun, err)
    throw err
  }
}
const _cached_jwts = { catalog: {}, storage: {} }

const getCatalogJwt = (jwtPayload) => {
  const sub = checkPayload(jwtPayload)
  const cachedJwt = _cached_jwts.catalog[sub]
  if (isJwtValid(cachedJwt)) return cachedJwt
  const prvKey = getKeyInfo(sub, PRVK)

  const body = {
    jti: jwtPayload?.jti || uuidv4(),
    iat: timeEpochS(),
    exp: jwtPayload?.exp || timeEpochS(jwtPayload?.exp_time || DEFAULT_EXP),
    sub,
    client_id: jwtPayload?.client_id || getKeyIdForCatalog(),
    req_mtd: 'all',
    req_url: 'all',
  }
  const newJwt = forgeToken(prvKey, {}, body)
  _cached_jwts.catalog[sub] = newJwt
  return newJwt
}

const getStorageHeaders = () => {
  const fun = 'getStorageHeaders'
  logD(mod, fun, ``)
  const keyId = getKeyIdForStorage()
  const usrId = getUsrIdForStorage()

  let reqJwt = _cached_jwts.storage[keyId]
  if (!isJwtValid(reqJwt)) {
    const prvKey = getKeyInfo(keyId, PRVK)

    const body = {
      jti: uuidv4(),
      iat: timeEpochS(),
      exp: timeEpochS(DEFAULT_EXP),
      sub: 'auth',
      client_id: keyId,
    }
    // logD(mod, fun, `body: ${beautify(body, 2)}`)

    reqJwt = forgeToken(prvKey, {}, body)
    _cached_jwts.storage[keyId] = reqJwt
  }
  const headers = { headers: { Authorization: `Bearer ${reqJwt}`, 'Content-Type': 'application/json' } }
  return headers
}

const getStorageJwt = async (jwtPayload) => {
  const fun = 'getStorageJwt'
  logD(mod, fun, ``)
  const storageHeaders = getStorageHeaders()
  const delegationBody = {
    user_id: jwtPayload?.user_id ?? getUsrIdForStorage(),
    user_name: jwtPayload?.user_name ?? getKeyIdForStorage(),
    group_name: jwtPayload?.group_name ?? 'producer',
  }
  const storageForgeJwtUrl = getStorageUrl('jwt/forge')

  let mediaRes
  try {
    mediaRes = await axios.post(storageForgeJwtUrl, delegationBody, storageHeaders)
  } catch (err) {
    logW(mod, fun, beautify(err, 2))
    if (err.code === 'ECONNREFUSED')
      throw createRudiHttpError(
        500,
        `Connection to “${STORAGE}” module on ${storageForgeJwtUrl} failed: “${STORAGE}” module is apparently down, contact the RUDI node admin`
      )
    throw createRudiHttpError(err.status || 500, err.message || err)
  }
  if (!mediaRes) throw Error(`No answer received from ${STORAGE} module`)
  if (!mediaRes?.data?.token)
    throw new Error(`Unexpected response from ${STORAGE} while forging a token: ${mediaRes.data}`)

  // logD(mod, fun, `storageJwt: ${mediaRes.data.token}`)

  return mediaRes.data.token
}
/**
 * Returns both the private key and the algo
 * @param {string} subject
 */
function getKeyInfo(subject, keyType = PUBK) {
  const fun = 'getKeyInfo'
  try {
    // Retrieving stored info
    if (KEYS[subject]?.[keyType]) return KEYS[subject][keyType]

    // Extracting info
    const subjectInfo = PROFILES[subject]
    if (!subjectInfo) throw new NotFoundError(`Subject '${subject}' not found in profiles`)
    if (!KEYS[subject]) KEYS[subject] = {}
    if (keyType == PRVK) {
      const prvKeyPath = subjectInfo[PRV_KEY]
      if (!prvKeyPath) throw new NotFoundError(`Property ${PRV_KEY} not found in profiles for subject: '${subject}'`)
      const prvKeyPem = readPrivateKeyFile(prvKeyPath)
      KEYS[subject][PRVK] = prvKeyPem
      return prvKeyPem
    } else {
      const pubKeyPath = subjectInfo[PUB_KEY]
      if (!pubKeyPath) throw new NotFoundError(`Property ${PUB_KEY} not found in profiles for subject: '${subject}'`)
      const pubKeyPem = readPublicKeyFile(pubKeyPath)
      KEYS[subject][PUBK] = pubKeyPem
      return pubKeyPem
    }
  } catch (err) {
    logW(mod, fun, err)
    throw err
  }
}

export function checkJwt(req, reply) {
  const fun = 'checkToken'
  logD(mod, fun, ``)
  try {
    const method = req.routeOptions?.config?.method
    logD(mod, fun, method)
    const token = method.toUpperCase() == 'POST' ? req.body : extractJwt(req)

    // Identify the subject
    const jwtPayload = tokenStringToJwtObject(token)?.payload
    const subject = jwtPayload[JWT_KEY] || jwtPayload[JWT_SUB]
    if (!subject) throw new UnauthorizedError(`No ID was found for the requester (property '${JWT_SUB}')`)

    // Retrieve the public key
    const pubKey = getKeyInfo(subject, PUBK)
    const signIsValid = verifyToken(pubKey, token)
    const returnMsg = {
      status: signIsValid ? 'OK' : 'KO',
      message: `JWT is ${signIsValid ? '' : 'in'}valid`,
    }
    reply.status(signIsValid ? 200 : 400).send(returnMsg)
  } catch (err) {
    logW(mod, fun, err)
    throw err
  }
}

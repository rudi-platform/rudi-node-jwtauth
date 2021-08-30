'use strict'

const mod = 'jwtCtrl'

// -----------------------------------------------------------------------------
// External dependancies
// -----------------------------------------------------------------------------
const { readFileSync } = require('fs')
const { v4: uuidv4 } = require('uuid')
const { parseKey, parsePrivateKey } = require('sshpk')

// -----------------------------------------------------------------------------
// Internal dependancies
// -----------------------------------------------------------------------------
const log = require('../utils/logging')

const { PRIV_KEY, PUB_KEY } = require('../config/confSystem')
const {
  beautify,
  isEmptyObject,
  toBase64url,
  decodeBase64url,
  convertEncoding,
  nowEpochS,
} = require('../utils/jsUtils')

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

// norm : https://www.iana.org/assignments/jwt/jwt.xhtml
const JWT_ID = 'jti' // https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.7
const JWT_EXP = 'exp' // Expiration Time https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.4
const JWT_IAT = 'iat' // Issued At https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.6
const JWT_APP = 'client_id' // https://www.rfc-editor.org/rfc/rfc6749.html#section-2.2
const JWT_USR = 'sub' // Subject https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.2

const DEFAULT_EXP = 600
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
exports.getJwtAlgo = (algo) => {
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
        throw Error(`Algo not recognized: '${algo}'`)
    }
  } catch (err) {
    log.w(mod, fun, err)
    throw err
  }
}

/**
 * Hash algo to be used to sign the JWT
 * @param {String} algo
 * @returns
 */
exports.getHashAlgo = (algo) => {
  const fun = 'getHashAlgo'
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
        throw Error(`Algo not recognized: '${algo}'`)
    }
  } catch (err) {
    log.w(mod, fun, err)
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
exports.forgeToken = async (req, reply) => {
  const fun = 'forgeToken'
  log.d(mod, fun, ``)
  try {
    const jwtPayload = req.body

    if (!jwtPayload || isEmptyObject(jwtPayload))
      throw new Error(`Incoming JSON should not be null`)

    // Identifying the client / app
    const moduleId = jwtPayload[JWT_APP]
    if (!moduleId) throw new Error(`No ID was found for the app (property ${JWT_APP})`)

    // Identifying the (public) key type
    const pubKeyPem = readFileSync(PUB_KEY, 'ascii')
    const sslKey = parseKey(pubKeyPem)
    const keyType = sslKey.type
    log.d(mod, fun, `pub: ${keyType}`)

    // Extracting the private key type
    const prvKeyPem = readFileSync(PRIV_KEY, 'ascii')
    const prvKey = parsePrivateKey(prvKeyPem)
    log.d(mod, fun, `prv: ${prvKey.comment}`)

    // Building the JWT header
    const jwtAlgo = this.getJwtAlgo(keyType)
    const jwtHeader = {
      typ: 'JWT', // (optional)
      alg: jwtAlgo,
    }

    // Adjusting the JWT payload
    if (!jwtPayload[JWT_IAT]) jwtPayload[JWT_IAT] = nowEpochS()
    if (!jwtPayload[JWT_EXP]) jwtPayload[JWT_EXP] = DEFAULT_EXP

    // Setting an ID to the JWT, if needed
    if (!jwtPayload.JWT_ID) jwtPayload.JWT_ID = uuidv4()

    // Building the data to sign
    const headerBase64url = toBase64url(JSON.stringify(jwtHeader))
    const payloadBase64url = toBase64url(JSON.stringify(jwtPayload))
    const data = headerBase64url + '.' + payloadBase64url

    // Building the JWT signature
    const hashAlgo = this.getHashAlgo(keyType)
    log.d(mod, fun, `hash algo: ${hashAlgo}`)
    const sign_buffer = prvKey.createSign(hashAlgo)
    sign_buffer.update(data)
    const signatureBase64 = sign_buffer.sign()
    const signatureBase64url = convertEncoding(signatureBase64.toString(), 'base64', 'base64url')
    log.d(mod, fun, `base64url signature: ${signatureBase64url}`)

    // Building the final JWT
    const jwt = data + '.' + signatureBase64url
    return jwt
  } catch (err) {
    log.w(mod, fun, err)
    throw err
  }
}

exports.checkToken = async (req, reply) => {
  const fun = 'checkToken'
  log.d(mod, fun, ``)
  try {
    const header = req.headers
    // log.d(mod, fun, `${beautify(header)}`)
    const auth = header.authorization
    if (!auth)
      throw new Error('Headers should include a JWT in the form "Authorization": Bearer <JWT>"')
    const token = auth.substring(7)
    // log.d(mod, fun, token)
    const signIsValid = await this.verifyToken(token)
    return `JWT is ${signIsValid ? '' : 'in'}valid`
    // return 'ok'
  } catch (err) {
    log.w(mod, fun, err)
    throw err
  }
}

exports.verifyToken = async (token) => {
  const fun = 'checkToken'
  log.d(mod, fun, `token: ${token}`)

  try {
    const [jwtHeaderBase64url, jwtPayloadBase64url, jwtSignatureBase64url] = token.split('.')

    // Retrieve the public key
    const pubKeyPem = readFileSync(PUB_KEY, 'ascii')
    const sslKey = parseKey(pubKeyPem)

    // Identify the signature hash algorithm from the JWT header alg property
    const jwtHeader = JSON.parse(decodeBase64url(jwtHeaderBase64url))
    log.d(mod, fun, `JWT algo: ${jwtHeader.alg}`)
    const hashAlgo = this.getHashAlgo(jwtHeader.alg)
    log.d(mod, fun, `hash algo: ${hashAlgo}`)

    // Check if the token is still valid
    const jwtPayload = JSON.parse(decodeBase64url(jwtPayloadBase64url))
    const jwtIat = jwtPayload[JWT_IAT]
    if (!jwtIat) throw new Error(`JWT payload requires the property '${JWT_IAT}'`)
    const jwtExp = jwtPayload[JWT_EXP]
    if (!jwtExp) throw new Error(`JWT payload requires the property '${JWT_EXP}'`)
    if (nowEpochS() > jwtIat + jwtExp)
      throw new Error(
        `JWT expired: JWT issued at ${jwtIat}, expires after ${jwtExp}s, now is ${nowEpochS()}`
      )

    // Check the signature
    const verifier = sslKey.createVerify(hashAlgo)
    verifier.update(`${jwtHeaderBase64url}.${jwtPayloadBase64url}`)
    const signatureIsValid = verifier.verify(jwtSignatureBase64url, 'base64url')
    return signatureIsValid
  } catch (err) {
    log.w(mod, fun, err)
    throw err
  }
}

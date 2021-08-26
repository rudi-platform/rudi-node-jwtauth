'use strict'

const mod = 'jwtCtrl'

// -----------------------------------------------------------------------------
// External dependancies
// -----------------------------------------------------------------------------
const { boomify } = require('@hapi/boom')
const { readFileSync } = require('fs')
const { v4: uuidv4 } = require('uuid')
const { parseKey, parsePrivateKey } = require('sshpk')

// -----------------------------------------------------------------------------
// Internal dependancies
// -----------------------------------------------------------------------------
const log = require('../utils/logging')

const { PUB_KEYS, PRIV_KEY } = require('../config/confSystem')
const { toBase64, isEmptyObject, beautify } = require('../utils/jsUtils')

// -----------------------------------------------------------------------------
// Controllers
// -----------------------------------------------------------------------------

// norm : https://www.iana.org/assignments/jwt/jwt.xhtml
const JWT_ID = 'jti' // https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.7
const JWT_EXP = 'exp' // Expiration Time https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.4
const JWT_IAT = 'iat' // Issued At https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.6
const JWT_APP = 'client_id' // https://www.rfc-editor.org/rfc/rfc6749.html#section-2.2
const JWT_USR = 'sub' // Subject https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.2

const ALGOS = {
  ed25519: {
    jwt: 'EdDSA',
    hash: 'sha512',
  },
}

exports.forgeToken = async (req, reply) => {
  const fun = 'getToken'
  log.d(mod, fun, ``)
  try {
    const jwtPayload = req.body

    if (!jwtPayload || isEmptyObject(jwtPayload))
      throw new Error(`Incoming JSON should not be null`)

    // Identifying the client / app
    const moduleId = jwtPayload[JWT_APP]
    if (!moduleId) throw new Error(`No ID was found for the app (property ${JWT_APP})`)

    // Identifying the (public) key type
    const pubKeyPem = readFileSync(PUB_KEYS, 'ascii')
    const sslKey = parseKey(pubKeyPem)
    const keyType = sslKey.type
    const algos = ALGOS[keyType]
    log.d(mod, fun, `pub: ${keyType}`)

    // Extracting the private key type
    const prvKeyPem = readFileSync(PRIV_KEY, 'ascii')
    const prvKey = parsePrivateKey(prvKeyPem)
    log.d(mod, fun, `prv: ${prvKey.comment}`)

    // Building the JWT header
    const jwtHeader = {
      typ: 'JWT', // (optional)
      alg: algos.jwt,
    }

    // Setting an ID to the JWT, if needed
    if (!jwtPayload.JWT_ID) jwtPayload.JWT_ID = uuidv4()

    // Building the JWT signature
    const data = toBase64(jwtHeader) + '.' + toBase64(jwtPayload)
    const sign_buffer = prvKey.createSign(algos.sgn)
    sign_buffer.update(data)
    const signature = sign_buffer.sign()

    // Building the final JWT 
    const jwt = data + '.' + toBase64(signature)
    return jwt
  } catch (err) {
    log.w(mod, fun, err)
    throw boomify(err)
  }
}

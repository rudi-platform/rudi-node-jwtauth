'use strict'

const mod = 'main'

// -----------------------------------------------------------------------------
// Internal dependancies
// -----------------------------------------------------------------------------
import { URL_JWT, URL_PREFIX } from './config/confApi.js'
import { beautify, separateLogs } from './utils/jsUtils.js'

import { APP_NAME, getHost, LISTENING_ADDR, LISTENING_PORT } from './config/confSystem.js'

import { initFFLogger } from './config/confLogs.js'
import { logD, logE, logI, logRequest, logW } from './utils/logging.js'

import { getAppHash, getGitHash } from './handlers/sysController.js'
import { privateRoutes } from './routes/routes.js'
import { createRudiHttpError } from './utils/errors.js'

// -----------------------------------------------------------------------------
// External dependancies / init
// -----------------------------------------------------------------------------

// Require the fastify framework and instantiate it
import fastify from 'fastify'
export const fastifyConf = fastify({
  logger: {
    level: 'warn',
    logger: initFFLogger(APP_NAME),
    // file: sys.OUT_LOG
  },
  ignoreTrailingSlash: true,
})

fastifyConf.setErrorHandler((error, request, reply) => {
  const fun = 'finalErrorHandler'
  try {
    logE(mod, fun, error)
    const rudiHttpError = createRudiHttpError(error.statusCode, error.message)
    reply.code(rudiHttpError.statusCode).send(rudiHttpError)
  } catch (uncaughtErr) {
    logW(mod, fun, uncaughtErr)
    const rudiHttpError = createRudiHttpError(0, uncaughtErr.message)
    reply.code(rudiHttpError.statusCode).send(rudiHttpError)
  }
  logD(mod, fun, 'done')
})

fastifyConf.addHook('onRequest', (req, res, next) => {
  logRequest(req)
  next()
})
fastifyConf.addHook('onRequest', (req, res, next) => {
  logRequest(req)
  next()
})

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

// Declare a default route
fastifyConf.get('/', () => {
  logI(mod, 'routes', 'GET /')
  return {
    server: 'RUDI',
  }
})

// Declare a default route
fastifyConf.get(URL_PREFIX, () => {
  // request.log.info(`GET /api`)
  logI(mod, 'routes', `GET ${URL_PREFIX}`)
  return {
    RUDI: 'jwtauth',
  }
})

// Declare a default route
fastifyConf.get(URL_JWT, () => {
  logI(mod, 'routes', `GET ${URL_JWT}`)
  return {
    RUDI: 'JWT',
  }
})

// Loop over each public route
privateRoutes.forEach((route) => fastifyConf.route(route))

// -----------------------------------------------------------------------------
// SERVER
// -----------------------------------------------------------------------------
const start = async () => {
  try {
    process.on('uncaughtException', (err) => {
      logE(mod, 'process', `Uncaught error: ${err}`)
      // console.error('There was an uncaught error', err)
      // process.exit(1) //mandatory (as per the Node.js docs)
    })

    process.on('unhandledRejection', (error, promise) => {
      const fun = 'catching promise rejection'
      logE(mod, fun, 'DAMN!!! Promise rejection not handled here: ' + beautify(promise))
      logE(mod, fun, 'The error was: ' + beautify(error))
    })

    await fastifyConf
      .listen({ port: LISTENING_PORT, host: LISTENING_ADDR })
      .catch((err) => logE(mod, 'Fastify listen', `${err}`))
  } catch (err) {
    // fastify.log.error(err)
    logE(mod, 'exitServer', err)
    process.exit(1)
  }
}

export const runRudiJwtAuth = () =>
  start()
    .then(() => {
      logD(mod, '', 'Ready')
      const appHash = getAppHash()
      const gitHash = getGitHash()
      if (appHash === gitHash) logI(mod, '', `App '${APP_NAME}' version '${appHash}' listening on ${getHost()}`)
      else logW(`App version '${appHash}' ≠ Git version: '${gitHash}'`)
      separateLogs('Init OK')
    })
    .catch((err) => logE(mod, 'server', `Crashed: ${err}`))

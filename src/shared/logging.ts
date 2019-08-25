
const logger = (req: Express.Request, res: Express.Response, next: Function) => {
  /*
  console.info('logger', {
    url: `//${req.headers.host}${req.originalUrl}`,
    query: req.query })
  */
  next()
}

const jsonPrettyPrint = (query: {}) => {
  const queryJson = JSON.stringify(query, undefined, 2)
  return `<pre id="json">${queryJson}</pre>`
}

const jsonToConsole = (query: {}) => {
  const queryJson = JSON.stringify(query, undefined, 2)
  return `<script>console.info("api-apiP2p query", ${queryJson})</script>`
}

const logErrors = (err: Error, req: Express.Request, res: Express.Response, next: Function) => {
  console.error(err.stack)
  next(err)
}

const clientErrorHandler = (err: Error, req: Express.Request, res: Express.Response, next: Function) => {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

const errorHandler = (err: Error, req: Express.Request, res: Express.Response, next: Function) => {
  res.status(500)
  res.render('error', { error: err })
}

module.exports = {
  logger,
  jsonPrettyPrint,
  jsonToConsole,
  logErrors,
  clientErrorHandler,
  errorHandler,
}

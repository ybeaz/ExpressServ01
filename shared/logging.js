
const logger = (req, res, next) => {
  /*
  console.info('logger', {
    url: `//${req.headers.host}${req.originalUrl}`,
    query: req.query })
  */
  next()
}

const jsonPrettyPrint = query => {
  const queryJson = JSON.stringify(query, undefined, 2)
  return `<pre id="json">${queryJson}</pre>`
}

const jsonToConsole = query => {
  const queryJson = JSON.stringify(query, undefined, 2)
  return `<script>console.info("api-apiP2p query", ${queryJson})</script>`
}

const logErrors = (err, req, res, next) => {
  console.error(err.stack)
  next(err)
}

const clientErrorHandler = (err, req, res, next) => {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

const errorHandler = (err, req, res, next) => {
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

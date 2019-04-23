const logging = require('../shared/logging')

const startUserSession = (req, res, MongoClient, dbName, DB_CONNECTION_STRING) => {

  res.send(`startUserSession<br/>`
    + logging.jsonPrettyPrint(req.query) + ' '
    + logging.jsonToConsole(req.query)
  )
}

module.exports = startUserSession

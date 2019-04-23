const logging = require('../shared/logging')

const saveUserVisitActions = (req, res, MongoClient, dbName, DB_CONNECTION_STRING) => {

  res.send(`saveUserVisitActions<br/>`
    + logging.jsonPrettyPrint(req.query) + ' '
    + logging.jsonToConsole(req.query)
  )
}

module.exports = saveUserVisitActions

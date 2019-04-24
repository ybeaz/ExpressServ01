const session = require('express-session')
const moment = require('moment')
const logging = require('../shared/logging')

const startUserSession = (req, res, MongoClient, dbName, DB_CONNECTION_STRING) => {

  //console.log('find:', { resultJson, sessionId: req.session.id, start: moment().format('YYYY-MM-DD HH:mm') })

  MongoClient.connect(DB_CONNECTION_STRING, { useNewUrlParser: true }, async (err, client) => {
    if (err) throw err
    const db = client.db(dbName)
 
    const findPromise = () => {
      return new Promise((resolve, reject) => {

        db.collection('webAnalytics')
          .find({ 'PHPSESSID': req.session.id }, { _id: 0 })
          // .sort({ _id: -1 })
          .toArray((err, data) => {
            err
              ? reject(err)
              : resolve(data)
          })
      })
    }

    const result = await findPromise()
    const resultJson = JSON.stringify(result)

    //continue execution
    client.close();
    res.setHeader('Content-Type', 'application/x-www-form-urlencoded')
    return res.end(resultJson)



  })

  /*

  res.send(`startUserSession<br/>`
    + logging.jsonPrettyPrint(req.query) + ' '
    + logging.jsonToConsole(req.query)
  )
  */
}

module.exports = startUserSession

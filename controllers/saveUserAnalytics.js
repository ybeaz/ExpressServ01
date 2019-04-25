const session = require('express-session')
const moment = require('moment')
const logging = require('../shared/logging')

const saveUserAnalytics = (req, res, MongoClient, dbName, DB_CONNECTION_STRING) => {

  let stage = 'inception'
  MongoClient.connect(DB_CONNECTION_STRING, { useNewUrlParser: true }, async (err, client) => {
    if (err) throw err
    const db = client.db(dbName)
 
    const findPromise = () => {
      return new Promise((resolve, reject) => {

        db.collection('webAnalytics')
          .find({ 'PHPSESSID': req.session.id }, { _id: 0 })
          // .sort({ _id: -1 })
          .toArray((errFind, data) => {
            err
              ? reject(errFind)
              : resolve(data)
          })
      })
    }

    const insertPromise = query => {
      return db.collection('webAnalytics')
        .insertOne({ ...query }, (errInsert, response) => {
          if (err) {
            console.error(errInsert.message)
            return errInsert.message
          }
          // console.log('inserted record', response.ops[0])
          return response.ops[0]
        })
    }

    const updatePromise = query => {
      db.collection('webAnalytics')
        .updateMany(
          { 'PHPSESSID': req.session.id }, 
          { $set: { ...query }}, 
          { upsert: true },
          (errUpdate, response) => {
            if (errUpdate) {
              console.error(errUpdate.message)
              return errUpdate.message
            }
            // console.log('inserted record', response.ops[0])
            return response.ops[0]
          },
        )
    }

    const record = await findPromise()

    // Transform data to array
    if (record.length > 0) {



    }

    // First time startSession
    let result
    const target = JSON.parse(req.query.target)
    const { query: insertQuery } = req
    const dataNext = {
      ...insertQuery,
      PHPSESSID: req.session.id,
      start: moment().format('YYYY-MM-DD HH:mm'),
      finish: moment().format('YYYY-MM-DD HH:mm'),
    }
    if (req.session.id !== undefined
      && record.length === 0
      && target[0] === 'startSession'
      && target.length === 1
    ) {
      // console.info('startUserSession [7]', { query: req.query })
      result = await insertPromise(dataNext)
      stage = 'First time startSession'
      console.info('startUserSession [8]', { result })
    }
    //Update user analytics
    else if (
      req.session.id !== undefined
      && record.length > 0
      && target.length === 1
      && target[0] !== 'startSession'
    ) {
      stage = 'Update user analytics'
      result = await updatePromise(dataNext)
    }

    const recordJson = JSON.stringify({ stage, record, dataNext, result })

    //continue execution
    
    console.info('startUserSession [10]', { recordJson })
    res.setHeader('Content-Type', 'application/x-www-form-urlencoded')
    return res.end(recordJson)
    client.close()
  })

  /*

  res.send(`startUserSession<br/>`
    + logging.jsonPrettyPrint(req.query) + ' '
    + logging.jsonToConsole(req.query)
  )
  */
}

module.exports = saveUserAnalytics

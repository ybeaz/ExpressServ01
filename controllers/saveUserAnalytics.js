const moment = require('moment')
const serviceFunc = require('../shared/serviceFunc')

const saveUserAnalytics = (req, res, MongoClient, dbName, DB_CONNECTION_STRING) => {

  let stage = 'inception'
  let result

  MongoClient.connect(DB_CONNECTION_STRING, { useNewUrlParser: true }, async (err, client) => {
    if (err) throw err
    const db = client.db(dbName)

    const findPromise = sid => {
      return new Promise((resolve, reject) => {

        db.collection('webAnalytics')
          .find({ 'PHPSESSID': sid }, { _id: 0 })
          // .sort({ _id: -1 })
          .toArray((errFind, resFind) => {
            errFind
              ? reject(errFind)
              : resolve(resFind)
          })
      })
    }

    const insertPromise = query => {
      return new Promise((resolve, reject) => {
        db.collection('webAnalytics')
          .insertOne(
            { ...query },
            (errInsert, resInsert) => {
              if (err) {
                console.error(errInsert.message)
                reject(errInsert.message)
              }
              // console.log('inserted record', resInsert.ops[0])
              resolve(resInsert.ops[0])
            })
      })
    }

    const updatePromise = query => {
      return new Promise((resolve, reject) => {
        try {
          db.collection('webAnalytics')
            .updateOne(
              { 'PHPSESSID': query.PHPSESSID }, 
              { $set: { ...query } },
              { upsert: true },
              (errUpdate, resUpdate) => {
                if (errUpdate) {
                  console.error(errUpdate.message)
                  reject(errUpdate.message)
                }
                // console.log('saveUserAnalytics (updatePromise) [3]', resUpdate)
                resolve(resUpdate)
              },
            )} catch (errUpdatePromise) {
          console.info('errUpdatePromise: ', errUpdatePromise)
        }
      })
    }

    const { query: queryToProcess, body: bodyToProcess } = req

    let data
    let target
    let utAnltSid
    let record0 = []
    if (queryToProcess && JSON.stringify(queryToProcess) !== '{}') {
      data = queryToProcess
      utAnltSid = data.utAnltSid
      target = JSON.parse(data.target)
    }
    else if (bodyToProcess && bodyToProcess !== '{}') {
      data = JSON.parse(bodyToProcess)
      utAnltSid = data.utAnltSid
      const { target: targetArr } = data
      target = targetArr
    }
    else {
      console.info('saveUserAnalytics strange req', { queryToProcess, bodyToProcess })
    }

    // Make request to the COllection from MongoDB about existing of the Domenentr
    // console.info('saveUserAnalytics [4]', { utAnltSid, queryToProcess, bodyToProcess })
    const record = await findPromise(utAnltSid)

    // console.info('saveUserAnalytics [5]', { target, data })

    let dataNext = {
      PHPSESSID: utAnltSid,
    }

    // Case sessionStart
    if (record.length === 0) {

      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      dataNext = {
        start: moment().format('YYYY/MM/DD HH:mm:ss'),
        ip,
        ...dataNext,
        ...data,
        finish: moment().format('YYYY/MM/DD HH:mm:ss'),
      }
    }
    // Case sessionUpdate
    else if (record.length > 0) {
      // DataNext from record, start with previous version.
      record0 = record[0]
      delete record0['_id']

      dataNext = {
        ...dataNext,
        ...record0,
        finish: moment().format('YYYY/MM/DD HH:mm:ss'),
      }

    }

    // console.info('saveUserAnalytics [6]', { record, data, dataNext })

    // Transform data to array
    // Target, max [].
    dataNext.target = serviceFunc.getArrToSave(record0.target, data.target, 'max', data.target)

    // ActionLog, new [].
    dataNext.actionLog = serviceFunc.getArrToSave(record0.actionLog, data.actionLog, 'new', data.target)

    // Topic, add [].
    dataNext.topic = serviceFunc.getArrToSave(record0.topic, data.topic, 'add', data.target)

    // Msg, add [].
    dataNext.msg = serviceFunc.getArrToSave(record0.msg, data.msg, 'add', data.target)
    // Role, add [].
    dataNext.role = serviceFunc.getArrToSave(record0.role, data.role, 'add', data.target)
    // Inception, add [].
    dataNext.inception = serviceFunc.getArrToSave(record0.inception, data.inception, 'add', data.target)
    // SearchPhrase, add [].
    dataNext.searchPhrase = serviceFunc.getArrToSave(record0.searchPhrase, data.searchPhrase, 'add', data.target)
    // SearchCategory, add [].
    dataNext.searchCategory = serviceFunc.getArrToSave(record0.searchCategory, data.searchCategory, 'add', data.target)
    // SearchMedia, add [].
    dataNext.searchMedia = serviceFunc.getArrToSave(record0.searchMedia, data.searchMedia, 'add', data.target)
    // CatalogCategory, add [].
    dataNext.catalogCategory = serviceFunc.getArrToSave(record0.catalogCategory, data.catalogCategory, 'add', data.target)
    // UserPrifile, add [].
    dataNext.userPrifile = serviceFunc.getArrToSave(record0.userPrifile, data.userPrifile, 'add', data.target)
    // Email, add [].
    dataNext.email = serviceFunc.getArrToSave(record0.email, data.email, 'add', data.target)

    // console.info('saveUserAnalytics [7]', { 'dataNext': dataNext, 'data': data, 'record0': record0 })

    // First time startSession
    if (record.length === 0
      && target[0] === 'startSession'
      && target.length === 1
    ) {
      // console.info('startUserSession [7]', { query: req.query })
      result = await updatePromise(dataNext)
      stage = 'First time startSession'
      // console.info('startUserSession [8]', { result })
    }
    // Update user analytics
    else if (record.length > 0
      && target.length === 1
      && target[0] !== 'startSession'
    ) {
      stage = 'Update user analytics'
      // console.info('Update user analytics [8]', { dataNext })
      result = await updatePromise(dataNext)
      // console.info('Update user analytics [9]', { result })
      result = result || 'Ok'
    }

    client.close()

    // application/x-www-form-urlencoded
    const recordJson = JSON.stringify({ stage }) // , result, dataNext, record
    
    // console.info('saveUserAnalytics [10]', { recordJson, data, record })
    res.setHeader('Content-Type', 'text/plain')
    // const { hostname } = data
    // res.setHeader('Access-Control-Allow-Origin', hostname)
    res.setHeader('Access-Control-Allow-Credentials', true)
    return res.send(recordJson)
  })

  /*

  res.send(`startUserSession<br/>`
    + logging.jsonPrettyPrint(req.query) + ' '
    + logging.jsonToConsole(req.query)
  )
  */
}

module.exports = saveUserAnalytics

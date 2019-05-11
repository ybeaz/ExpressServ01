const moment = require('moment')
const serviceFunc = require('../shared/serviceFunc')

const saveUserAnalytics2 = (req, res, MongoClient, dbName, DB_CONNECTION_STRING) => {

  let stage = 'inception'
  let result

  MongoClient.connect(DB_CONNECTION_STRING, { useNewUrlParser: true }, async (err, client) => {
    if (err) throw err
    const db = client.db(dbName)

    const findPromise = sid => {
      return new Promise((resolve, reject) => {

        db.collection('webAnalytics')
          .find({ utAnltSid: sid }, { _id: 0 })
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
              { utAnltSid: query.utAnltSid },
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
    let record0 = {}
    if (queryToProcess && JSON.stringify(queryToProcess) !== '{}') {
      data = queryToProcess
      // console.info('saveUserAnalytics get [2]', data)
      utAnltSid = data.utAnltSid
      target = data.target
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

    let dataNext = {}

    // Case sessionStart
    if (record.length === 0) {

      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      // dataNext = { initData: [{ ip }] }

      dataNext = {
        start: moment().format('YYYY/MM/DD HH:mm:ss'),
        ...dataNext,
        ...data,
        finish: moment().format('YYYY/MM/DD HH:mm:ss'),
      }
      dataNext.initData[0].ip = ip
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

    delete dataNext.optGet
    delete dataNext.jsonp

    console.info('saveUserAnalytics [6]', { record, data, dataNext })

    // Transform data to array
    // Target, max [].
    // dataNext.target = serviceFunc.getArrToSave2(record0.target, data.target, 'max', data.target)

    // Topic, add [].
    dataNext.topics = serviceFunc.getArrToSave2(record0.topics, data.topics, 'add', data.target)

    // Actions, add [].
    dataNext.actions = serviceFunc.getArrToSave2(record0.actions, data.actions, 'add', data.target)


    // console.info('saveUserAnalytics [7]', { 'dataNext.target': dataNext.target, 'dataNext': dataNext, 'data': data, 'record': record })

    // First time startSession
    if (record.length === 0
      && dataNext.target[0].name === 'start'
    ) {
      // console.info('startUserSession [8]', { dataNext, query: req.query })
      result = await updatePromise(dataNext)
      stage = 'First time startSession'
      // console.info('startUserSession [9]', { result })
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

module.exports = saveUserAnalytics2

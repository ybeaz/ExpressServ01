const moment = require('moment')
const serviceFunc = require('../shared/serviceFunc')
const uuidv4 = require('uuid/v4')

const saveUserAnalytics = (req, res, MongoClient, dbName, DB_CONNECTION_STRING) => {

  let stage = 'inception'
  let result
  let webAnalyticsSid = req.cookies.webAnalyticsSid || ''

  MongoClient.connect(DB_CONNECTION_STRING, { useNewUrlParser: true }, async (err, client) => {
    if (err) throw err
    const db = client.db(dbName)

    const findPromise = webAnalyticsSid => {
      return new Promise((resolve, reject) => {

        db.collection('webAnalytics')
          .find({ 'PHPSESSID': webAnalyticsSid }, { _id: 0 })
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
        db.collection('webAnalytics')
          .updateOne(
            { 'PHPSESSID': req.session.id }, 
            { $set: { ...query } },
            { upsert: true },
            (errUpdate, resUpdate) => {
              if (errUpdate) {
                console.error(errUpdate.message)
                reject(errUpdate.message)
              }
              // console.log('updated record', resUpdate.result)
              resolve(resUpdate.result)
            },
          )
      })
    }

    const record = await findPromise(webAnalyticsSid)

    const { query: queryToProcess, body: bodyToProcess } = req
    console.info('saveUserAnalytics [4]', { 'webAnalyticsSid': webAnalyticsSid, record, queryToProcess, bodyToProcess })


    let data
    let target
    if (queryToProcess && JSON.stringify(queryToProcess) !== '{}') {
      data = queryToProcess
      target = JSON.parse(data.target)
    }
    else if (bodyToProcess && bodyToProcess !== '{}') {
      data = JSON.parse(bodyToProcess)
      const { target: targetArr } = data
      target = targetArr
    }
    else {
      console.info('saveUserAnalytics strange req', { queryToProcess, bodyToProcess })
    }

    // console.info('saveUserAnalytics [5]', { target, data })

    let dataNext = {
      finish: moment().format('YYYY/MM/DD HH:mm:ss'),
    }

    // Case sessionStart
    if (record.length === 0) {
      webAnalyticsSid = uuidv4()
      const domain = `.${data.hostname}`
      console.info('saveUserAnalytics [6]', { webAnalyticsSid, domain, queryToProcess, data })
      res.cookie('analyticsSid', webAnalyticsSid, { domain: 'userto.com', secure: false, maxAge: 21600000 })
      dataNext = {
        PHPSESSID: webAnalyticsSid,
        start: moment().format('YYYY/MM/DD HH:mm:ss'),
        ...dataNext,
        ...data,
      }
    }
    // Case sessionUpdate
    else if (record.length > 0) {
      // DataNext from record, start with previous version.
      const [record0] = record
      dataNext = { ...dataNext, ...record0 }
    }

    // Transform data to array
    // Target, max [].
    dataNext.target = serviceFunc.getArrToSave(data.target, dataNext.target, 'max', data.target)

    // ActionLog, new [].
    dataNext.actionLog = serviceFunc.getArrToSave(data.actionLog, dataNext.actionLog, 'new', data.target)

    // Topic, add [].
    dataNext.topic = serviceFunc.getArrToSave(data.topic, dataNext.topic, 'add', data.target)

    // Msg, add [].
    dataNext.msg = serviceFunc.getArrToSave(data.msg, dataNext.msg, 'add', data.target)
    // Role, add [].
    dataNext.role = serviceFunc.getArrToSave(data.role, dataNext.role, 'add', data.target)
    // Inception, add [].
    dataNext.inception = serviceFunc.getArrToSave(data.inception, dataNext.inception, 'add', data.target)
    // SearchPhrase, add [].
    dataNext.searchPhrase = serviceFunc.getArrToSave(data.searchPhrase, dataNext.searchPhrase, 'add', data.target)
    // SearchCategory, add [].
    dataNext.searchCategory = serviceFunc.getArrToSave(data.searchCategory, dataNext.searchCategory, 'add', data.target)
    // SearchMedia, add [].
    dataNext.searchMedia = serviceFunc.getArrToSave(data.searchMedia, dataNext.searchMedia, 'add', data.target)
    // CatalogCategory, add [].
    dataNext.catalogCategory = serviceFunc.getArrToSave(data.catalogCategory, dataNext.catalogCategory, 'add', data.target)
    // UserPrifile, add [].
    dataNext.userPrifile = serviceFunc.getArrToSave(data.userPrifile, dataNext.userPrifile, 'add', data.target)
    // Email, add [].
    dataNext.email = serviceFunc.getArrToSave(data.email, dataNext.email, 'add', data.target)


    // console.info('saveUserAnalytics [7]', { 'req.session.id': req.session.id, record, 'record.length': record.length, target, dataNext })

    // First time startSession
    if (req.session.id !== undefined
      && record.length === 0
      && target[0] === 'startSession'
      && target.length === 1
    ) {
      // console.info('startUserSession [7]', { query: req.query })
      result = await insertPromise(dataNext)
      stage = 'First time startSession'
      // console.info('startUserSession [8]', { result })
    }
    // Update user analytics
    else if (
      req.session.id !== undefined
      && record.length > 0
      && target.length === 1
      && target[0] !== 'startSession'
    ) {
      stage = 'Update user analytics'
      result = await updatePromise(dataNext)
      console.info('Update user analytics [9]', { result })
      result = result || 'Ok'
    }

    client.close()

    // application/x-www-form-urlencoded
    const recordJson = JSON.stringify({ stage, record, dataNext, result })
    // console.info('saveUserAnalytics [10]', { recordJson })
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Access-Control-Allow-Origin', '*')
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

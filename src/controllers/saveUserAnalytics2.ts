const moment = require('moment')
const serviceFunc = require('../shared/serviceFunc')
import * as Interfaces from '../shared/interfaces'

const saveUserAnalytics2 = async (
  req: Interfaces.ExpressRequestCustom, res: Interfaces.ExpressResponseCustom,
  dbAccessData: Interfaces.DbAccessData) => {

  const { MongoClient, dbName, DB_CONNECTION_STRING, collection } = dbAccessData
  let stage = 'inception'
  let result

  MongoClient.connect(DB_CONNECTION_STRING, async (err, client) => {
    if (err) throw err
    const db = client.db(dbName)

    const findPromise = (sid: string): any => {
      return new Promise((resolve, reject) => {

        db.collection(collection)
          .find({ utAnltSid: sid }, { projection: { _id: 0 }})
          // .sort({ _id: -1 })
          .toArray((errFind: any, resFind: any[]): any => {
            errFind
              ? reject(errFind)
              : resolve(resFind)
          })
      })
    }

    const insertPromise = (query: any) => {
      return new Promise((resolve, reject) => {
        db.collection(collection)
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

    const updatePromise = (query: any) => {
      return new Promise((resolve, reject) => {
        try {
          db.collection(collection)
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

    let data: any
    let target: any[] = []
    let utAnltSid: string = ''
    let record0: any = {}
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

    let dataNext: Interfaces.DataAnalytics = {
      initData: [{ ip: '' }],
      topics: [],
      target: [],
    }

    // Case sessionStart
    if (record.length === 0) {

      let ip: string = ''
      if (req && req.headers !== undefined
        && req.headers['x-forwarded-for'] !== undefined) {
        ip = req.headers['x-forwarded-for']
      }
      else if (req !== undefined  && req.connection !== undefined
        && req.connection.remoteAddress !== undefined) {
        ip = req.connection.remoteAddress
      }

      dataNext = {
        start: moment().format('YYYY/MM/DD HH:mm:ss'),
        ...dataNext,
        ...data,
        finish: moment().format('YYYY/MM/DD HH:mm:ss'),
      }
      // console.info('saveUserAnalytics [5]', { target, data })
      if (dataNext.initData) {
        dataNext.initData[0].ip = ip
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

    delete dataNext.optGet
    delete dataNext.jsonp

    // console.info('saveUserAnalytics [6]', { record, data, dataNext })

    // Block to process fields
    const fieldsToSave = [
      { name: 'topics', mode: 'add', prop: '' },
      { name: 'eventData', mode: 'add', prop: 'name' },
      { name: 'target', mode: 'max', prop: '' },
    ]
    fieldsToSave.forEach(item => {
      const { name, mode, prop } = item
      dataNext[name] = serviceFunc.getArrToSave2(record0[name], data[name], mode, prop)
    })

    // console.info('saveUserAnalytics [7]', { 'dataNext.target': dataNext.target, 'dataNext': dataNext, 'data': data, 'record': record })

    // First time startSession
    if (record.length === 0
      && dataNext.target
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
    res.set('Content-Type', 'text/plain')
    // const { hostname } = data
    // res.setHeader('Access-Control-Allow-Origin', hostname)
    res.set('Access-Control-Allow-Credentials', true)
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

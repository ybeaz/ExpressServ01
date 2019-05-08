const express = require('express')
const uuidv4 = require('uuid/v4')
const { MongoClient } = require('mongodb')

const router = express.Router()
const getUserAnalytics = require('../controllers/getUserAnalytics')
const saveUserAnalytics = require('../controllers/saveUserAnalytics')

const { APP_PORT, APP_IP, APP_PATH } = process.env
let DB_CONNECTION_STRING
let dbName

// Setting variables for dev mode
if (APP_PORT === undefined) {
  DB_CONNECTION_STRING = 'mongodb://127.0.0.1:27017/db?gssapiServiceName=mongodb'
  dbName = 'db'
}
// Setting variables for prod mode
else {
  DB_CONNECTION_STRING = 'mongodb://c3550_mdb_sitewindows_com:YeMmoDacnibex39@mongo1.c3550.h2,mongo2.c3550.h2,mongo3.c3550.h2/c3550_mdb_sitewindows_com?replicaSet=MongoReplica'
  dbName = 'c3550_mdb_sitewindows_com'
}


// Api url to get all rows for analytics
router.post('/api/apiP2p', (req, res) => {

  const bodyJson = JSON.parse(req.body)
  // console.log('app.post [0]', { bodyJson, 'req.body.optPost': req.body.optPost, 'req.body': req.body })

  switch (bodyJson.optPost)
  {
    // Save user visit actions 'SAVE_USER_VISIT_ACTIONS' saveUserVisitActions
    case 'suva':
      {
        saveUserAnalytics(req, res, MongoClient, dbName, DB_CONNECTION_STRING)
      }
      break

    default: {
      console.info('app.post unexpected optPost', req.body.optPost, ' ', req.body)
    }
  }
})

// Api url to get all rows for analytics
router.get('/api/apiP2p', (req, res) => {
  // console.log('app.get [0]', JSON.stringify(req.query))

  switch (req.query.optGet) {

    // Return report to developers and market analytics GET_USER_ANALYTICS_DATA -> getUserAnalytics
    case 'guad':
      {
        getUserAnalytics(req, res, MongoClient, dbName, DB_CONNECTION_STRING)
      }
      break

    // Save user visit actions START_USER_SESSION -> startUserSession
    case 'sus':
      {
        saveUserAnalytics(req, res, MongoClient, dbName, DB_CONNECTION_STRING)
      }
      break

    default: {
      console.info('app.get unexpected optGet', req.query.optGet)
    }
  }

  //res.render('Dev mode')
})

// Test URL for Hello World
router.get('/hello_world/user/:first?/:second?', (req, res) => {

  //db.webAnalytics.find({'PHPSESSID' : '4855b16f7fff75719d32b52e0ae7a097'}, { _id: 0 }).pretty()

  const first = req.params.first ? req.params.first : ''
  const second = req.params.second ? req.params.second : ''

  const queryJson = JSON.stringify(req.query)
  const paramsJson = JSON.stringify(req.params)

  if (req.cookies.anltSidRender === undefined) {
    res.cookie('anltSidRender', uuidv4(), { httpOnly: false, domain: '', maxAge: 21600000 })
  }
  // res.cookie( 'key', 'value', { maxAge: 1000 * 60 * 10, httpOnly: false })

  // console.info('app.get', first, ' ', second, ' [params]', paramsJson, ' [query]', queryJson, ' [ip]', req.ip)
  const h1 = 'Hi ' + first + ' ' + second + '!'
  const p1 = 'This server uses a <a href="https://pugjs.org/api/getting-started.html" target="_blank">pug template</a> for the html output'
  const p2 = 'This sever supports API get requests with query parameters ' + queryJson
  const f1 = 'For support, please, call +1 650 7 410014'
  res.render('hello_world', { title: 'Hey', h1, p1, p2, f1 })
  // res.send('Hello World')
})

module.exports = router

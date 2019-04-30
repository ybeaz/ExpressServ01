// http://localhost:8081/hello_world/user/Roman/Cheskidov
// http://localhost:8081/api/apiP2p?optGet=sus
// http://nd.userto.com/hello_world/user/Roman/Cheskidov
// http://nd.userto.com/api/apiP2p?optGet=sus


const express = require('express')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const favicon = require('favicon')
const session = require('express-session')
const uuidv4 = require('uuid/v4')

const nocache = require('nocache')
const path = require('path')
// const http = require('http')
// const https = require('https')

const { MongoClient } = require('mongodb')

const logging = require('./shared/logging')

const getUserAnalytics = require('./controllers/getUserAnalytics')
const saveUserAnalytics = require('./controllers/saveUserAnalytics')

const environment = 'prod' //prod
const { APP_PORT, APP_IP, APP_PATH } = process.env
let appPort
let DB_CONNECTION_STRING
let dbName

// Setting variables for dev mode
if (APP_PORT === undefined) {
  appPort = 8081
  DB_CONNECTION_STRING = 'mongodb://127.0.0.1:27017/db?gssapiServiceName=mongodb'
  dbName = 'db'
}
// Setting variables for prod mode
else {
  appPort = APP_PORT
  DB_CONNECTION_STRING = 'mongodb://c3550_mdb_sitewindows_com:YeMmoDacnibex39@mongo1.c3550.h2,mongo2.c3550.h2,mongo3.c3550.h2/c3550_mdb_sitewindows_com?replicaSet=MongoReplica'
  dbName = 'c3550_mdb_sitewindows_com'
}

const app = express()

// all environments
// app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logging.logger)
app.use(logging.logErrors)
app.use(logging.clientErrorHandler)
app.use(logging.errorHandler)
app.use(methodOverride())
app.use(cookieParser())
app.use(session({
  secret: 'keyboard abc',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 21600000 },
}))
app.use(express.static(path.join(__dirname, 'www')))
app.use(nocache())
// parse various different urlencoded
app.use(bodyParser.urlencoded({ type: 'application/x-www-form-urlencoded', extended: true }))
// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/json' }))
// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
// parse an HTML body as a string
app.use(bodyParser.text({ type: 'text/*' }))
/*
// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler())
}
*/

// Enable CORS for ExpressJS
// https://stackoverflow.com/questions/11181546/how-to-enable-cross-origin-resource-sharing-cors-in-the-express-js-framework-o
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Methods, Credentials')
  next()
})

/*
app.all('*', (req, res, next) => {
  const query = req.query
  const queryJson = JSON.stringify(req.query)
  next()
})
*/


// Api url to get all rows for analytics
app.post('/api/apiP2p', (req, res) => {

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
app.get('/api/apiP2p', (req, res) => {
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
app.get('/hello_world/user/:first?/:second?', (req, res) => {

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

console.log('index.js [10]', JSON.stringify({ appPort, APP_PORT, APP_IP, APP_PATH }))
// const server = app.listen(APP_PORT, 57926, () => {
// http.createServer(app).listen(appPort, () => { console.info('http') })
// const options = {}
// https.createServer(options, app).listen(appPort, () => { console.info('https') })

const server = app.listen(appPort, () => {
  const { address: host, port } = server.address()
})

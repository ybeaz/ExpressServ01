// http://localhost:8081/hello_world/user/Roman/Cheskidov
// http://localhost:8081/api/apiP2p?optGet=sus
// http://nd.userto.com/hello_world/user/Roman/Cheskidov
// http://nd.userto.com/api/apiP2p?optGet=sus


const express = require('express')
const cors = require('cors')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const favicon = require('favicon')
const session = require('express-session')
const nocache = require('nocache')
const path = require('path')
// const http = require('http')
// const https = require('https')

const logging = require('./shared/logging')

const router = require('./routes/index')

const { APP_PORT, APP_IP, APP_PATH } = process.env
let appPort

// Setting variables for dev mode
if (APP_PORT === undefined) {
  appPort = 8081
}
// Setting variables for prod mode
else {
  appPort = APP_PORT
}

const app = express()

// all environments
// app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

/**
 * @description Enable CORS for ExpressJS
 * @link https://stackoverflow.com/a/38500226/4791116
 */
//
app.use(cors({ origin: true }))
app.options('*', cors())
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
app.use(router)
/*
// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler())
}
*/

console.log('index.js [10]', JSON.stringify({ appPort, APP_PORT, APP_IP, APP_PATH }))
// const server = app.listen(APP_PORT, 57926, () => {
// http.createServer(app).listen(appPort, () => { console.info('http') })
// const options = {}
// https.createServer(options, app).listen(appPort, () => { console.info('https') })

const server = app.listen(appPort, () => {
  const { address: host, port } = server.address()
})

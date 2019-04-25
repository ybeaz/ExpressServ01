const session = require('express-session')
const moment = require('moment')
const logging = require('../shared/logging')

const startUserSession = (req, res, MongoClient, dbName, DB_CONNECTION_STRING) => {

  let stage
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

    const updatePromise = () => {
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

    const record = await findPromise()

    // Transform data to array
    if (record.length > 0) {



    }

    // First time startSession
    let insertResult
    const target = JSON.parse(req.query.target)
    const { query: insertQuery } = req
    const insertData = {
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
      insertResult = await insertPromise(insertData)
      stage = 'First time startSession'
      console.info('startUserSession [8]', { insertResult })
    }
    else if (
      req.session.id !== undefined
      && record.length > 0
      && target.length === 1
      && target[0] !== 'startSession'
    ) {


    }


    /*
    else if (empty($data->PHPSESSID) === false
    ) {
      try {
        $bulkWrite = new MongoDB\Driver\BulkWrite;
        $filter    = ['PHPSESSID' => $dataNext->PHPSESSID];
        $update    = ['$set' => $dataNext];
        $options   = ['multi' => false, 'upsert' => true];
        $bulkWrite->update($filter, $update, $options);
        $this->manager->executeBulkWrite($this->db02.'.webAnalytics', $bulkWrite);
        $status['step03'] = 'updated Ok';
      } catch (MongoDB\Driver\Exception\Exception $e) {
        // print_r(['$dataNext' => $dataNext, '$record' => $record, '$data' => $data, '$status' => $status]);
        $filename = basename(__FILE__); 
        echo "The $filename script has experienced an error.\n";
        echo "insertUpdateDocWithPermissionMdb->step 3 case 1 update:\n";
        echo "It failed with the following exception:\n"; 
        echo "Exception:", $e->getMessage(), "\n";
        $status['step03'] = 'Update. Exception: '.$e->getMessage().'\n';
      }
    }
    */
    const recordJson = JSON.stringify({ record, insertData, insertResult })

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

module.exports = startUserSession

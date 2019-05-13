
// eslint-disable-next-line import/prefer-default-export
const getUserAnalytics = (req, res, dbAccessData) => {

  const { MongoClient, dbName, DB_CONNECTION_STRING, collection } = dbAccessData

  MongoClient.connect(DB_CONNECTION_STRING, { useNewUrlParser: true }, (err, db) => {
    if (err) throw err
    const dbo = db.db(dbName)
    dbo.collection(collection)
      .find({}, { _id: 0 })
      // .sort({ _id: -1 })
      .toArray(
        (errFind, result) => {
          if (errFind) throw errFind
          const resultNext = []
          result.forEach(item => {
            const itemNext = item
            delete itemNext['_id']
            resultNext.push(itemNext)
          })
          const resultJson = JSON.stringify(resultNext)
          // https://stackoverflow.com/questions/19696240/proper-way-to-return-json-using-node-or-express
          console.log('find:', result[0])
          db.close()
          res.setHeader('Content-Type', 'application/x-www-form-urlencoded')
          return res.end(resultJson)
        },
      )
  })
}

module.exports = getUserAnalytics

import * as Interfaces from '../shared/interfaces'

// eslint-disable-next-line import/prefer-default-export
const getUserAnalytics = async (
  req: Express.Request, res: Interfaces.ExpressResponseCustom,
  dbAccessData: Interfaces.DbAccessData) => {

  const { MongoClient, dbName, DB_CONNECTION_STRING, collection } = dbAccessData

  MongoClient.connect(DB_CONNECTION_STRING, (err, client) => {
    if (err) throw err
    const dbo = client.db(dbName)
    dbo.collection(collection)
      .find({}, { projection: { _id: 0 }})
      // .sort({ _id: -1 })
      .toArray(
        (errFind, result) => {
          if (errFind) throw errFind
          const resultNext: any[] = []
          result.forEach((item: any) => {
            const itemNext = item
            resultNext.push(itemNext)
          })
          const resultJson = JSON.stringify(resultNext)
          // https://stackoverflow.com/questions/19696240/proper-way-to-return-json-using-node-or-express
          console.log('getUserAnalytics->find:', result[0])
          client.close()
          res.set('Content-Type', 'application/x-www-form-urlencoded')
          return res.end(resultJson)
        },
      )
  })
}

module.exports = getUserAnalytics

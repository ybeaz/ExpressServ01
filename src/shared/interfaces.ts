import { MongoClient } from 'mongodb'
import { Express } from 'express'

export interface ExpressResponseCustom extends Express.Request{
  end: Function,
  set: Function,
  send: Function,
  cookie: Function,
  render: Function,
}

interface paramsObj {
  first?: string | undefined,
  second?: string | undefined,
}

export interface ExpressRequestCustom extends Express.Request {
  query?: any,
  body?: any,
  params?: any,
  headers?: { 'x-forwarded-for'?: string },
  connection?: { remoteAddress?: string },
  cookies?: any,
}

export interface DataAnalytics {
  start?: string,
  finish?: string,
  initData?: {
    ip?: string
  }[] | [],
  topics?: {}[] | [],
  eventData?: {}[] | [],
  target?: {
    name: string,
  }[] | [],
  optGet?: string,
  jsonp?: string,
  [propName: string]: any,
}

export interface DbAccessData {
  MongoClient: MongoClient,
  dbName: string,
  DB_CONNECTION_STRING: string,
  collection: string
}

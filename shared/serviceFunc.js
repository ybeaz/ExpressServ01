
const empty = mixedVar => {
  // console.info('empty', { mixedVar })
  if (!mixedVar || mixedVar === '0') {
    return true
  }

  if (typeof mixedVar === 'object') {
    for (var k in mixedVar) {
      return false
    }
    return true
  }

  if (toString.call(mixedVar) === '[object Array]'
    && mixedVar.length === 0
  ) {
    return true
  }
  else if (toString.call(mixedVar) === '[object Array]'
    && mixedVar.length > 0
  ) {
    return false
  }
  return false
}

const mixedVarToArray = mixedVar => {
  let output
  if (mixedVar === undefined) {
    output = []
  }
  else if (typeof mixedVar === 'string') {
    output = [mixedVar]
  }
  else {
    output = mixedVar
  }
  return output
}

const array_merge = (dataNext, data) => {
  const dataNext1 = mixedVarToArray(dataNext)
  const data1 = mixedVarToArray(data)
  // console.info('array_merge', { dataNext1, data1, dataNext, data })
  return [...data1, ...dataNext1]
}

const array_unique = data => {
  // console.info('array_unique', data)
  return [...new Set(data)]
}

const array_filter = (data, param) => {
  return data.filter(item => item.length > 0)
}

const getArrToSave = (record, dataInp, caseOption, target) => {

  const record0 = record && record[0] ? record[0] : ''
  const dataInp0 = dataInp && dataInp[0] ? dataInp[0] : ''
  const target0 = target && target[0] ? target[0] : ''
  let dataNext

  if (caseOption === 'add') {
    if (empty(record0) === true && empty(dataInp0) === true) {
      dataNext = []
    }
    else if (empty(record0) === false && empty(dataInp0) === true) {
      dataNext = record
    }
    else if (empty(record0) === true && empty(dataInp0) === false) {
      dataNext = dataInp
    }
    else if (empty(record0) === false && empty(dataInp0) === false) {
      dataNext = array_merge(record, dataInp)
      // console.info('getArrToSave [5]', { dataNext, dataInp, record })
      dataNext = array_unique(dataNext)
      // console.info('getArrToSave [7]', { dataNext })
      dataNext = array_filter(dataNext, 'strlen')
      // console.info('getArrToSave [9]', { dataNext })
    }
  }

  if (caseOption === 'addAll') {
    if (empty(record0) === true && empty(dataInp0) === true) {
      dataNext = []
    }
    else if (empty(record0) === false && empty(dataInp0) === true) {
      dataNext = record
    }
    else if (empty(record0) === true && empty(dataInp0) === false) {
      dataNext = dataInp
    }
    else if (empty(record0) === false && empty(dataInp0) === false) {
      dataNext = array_merge(record, dataInp)
      dataNext = array_filter(dataNext, 'strlen')
    }
  }

  else if (caseOption === 'new') {
    // console.info('getArrToSave', { record0, 'empty(record0)': empty(record0), dataInp0, 'empty(dataInp0)': empty(dataInp0), dataInp, record })

    if (empty(record0) === true && empty(dataInp0) === true) {
      dataNext = []
    }
    else if (empty(record0) === false && empty(dataInp0) === true) {
      dataNext = record
    }
    else if (empty(record0) === true && empty(dataInp0) === false) {
      dataNext = dataInp
    }
    else if (empty(record0) === false && empty(dataInp0) === false
        && target0 === 'startSession'
    ) {
      dataNext = array_merge(dataInp, record)
    }
    else if (empty(record0) === false && empty(dataInp0) === false
        && target0 !== 'startSession'
    ) {
      dataNext = dataInp
    }
  }

  else if (caseOption === 'max') {

    if (dataInp0 === 'registration02'
    ) {
      dataNext = dataInp
    }
    else if (dataInp0 === 'registration01'
        && record0 !== 'registration02'
    ) {
      dataNext = dataInp
    }
    else if (record0 === 'registration02'
    ) {
      dataNext = record
    }
    else if (empty(record0) === true && empty(dataInp0) === true) {
      dataNext = []
    }
    else if (empty(record0) === true && empty(dataInp0) === false) {
      dataNext = dataInp
    }
    else if (empty(record0) === false && empty(dataInp0) === true) {
      dataNext = record0
    }
    else if (empty(record0) === false && empty(dataInp0) === false) {
      dataNext = dataInp
    }
  }

  return dataNext
}

module.exports = {
  getArrToSave,
}
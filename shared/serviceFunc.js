
const empty = mixedVar => {
  if (!mixedVar || mixedVar === '0') {
    return true
  }
  if (typeof mixedVar === 'object') {
    for (var k in mixedVar) {
      return false
    }
    return true
  }
  return false
}

const array_merge = (dataNext, data) => {
  let dataNext1
  let data1
  if (typeof dataNext === 'string') {
    dataNext1 = [dataNext]
  }
  else if (dataNext === undefined) {
    dataNext1 = []
  }
  if (typeof data === 'string') {
    data1 = [data]
  }
  else if (data === undefined) {
    data1 = []
  }
  // console.info('array_merge', dataNext, data)
  return [...data1, ...dataNext1]
}

const array_unique = data => {
  // console.info('array_unique', data)
  return [...new Set(data)]
}

const array_filter = (data, param) => {
  return data.filter(item => item.length > 0)
}

const getArrToSave = (data, dataNextInp, caseOption, target) => {

  const data0 = data && data[0] ? data[0] : ''
  const dataNext0 = dataNextInp && dataNextInp[0] ? dataNextInp[0] : ''
  const target0 = target && target[0] ? target[0] : ''
  let dataNext

  if (caseOption === 'add') {
    // prev = preg_replace('/^([\s\S]*)(,\s)([\S]*)/imxuU', '3', dataNext->searchMedia)
    if (empty(data0) === true && empty(dataNext0) === true) {
      dataNext = []
    }
    else if (empty(data0) === false && empty(dataNext0) === true) {
      dataNext = data
      // print_r(['getArrToSave__data 1' => data, 'dataNext' => dataNext])
    }
    else if (empty(data0) === true && empty(dataNext0) === false) {
      dataNext = dataNext
      // print_r(['getArrToSave__data 2' => data, 'dataNext' => dataNext])
    }
    else if (empty(data0) === false && empty(dataNext0) === false) {
      dataNext = array_merge(dataNext, data)
      dataNext = array_unique(dataNext)
      dataNext = array_filter(dataNext, 'strlen')
      // print_r(['getArrToSave__data 3' => data, 'dataNext' => dataNext])
    }
  }

  if (caseOption === 'addAll') {
    // prev = preg_replace('/^([\s\S]*)(,\s)([\S]*)/imxuU', '3', dataNext->searchMedia)
    if (empty(data0) === true && empty(dataNext0) === true) {
      dataNext = []
    }
    else if (empty(data0) === false && empty(dataNext0) === true) {
      dataNext = data
      // print_r(['getArrToSave__data 1' => data, 'dataNext' => dataNext])
    }
    else if (empty(data0) === true && empty(dataNext0) === false) {
      dataNext = dataNext
      // print_r(['getArrToSave__data 2' => data, 'dataNext' => dataNext])
    }
    else if (empty(data0) === false && empty(dataNext0) === false) {
      dataNext = array_merge(dataNext, data)
      //dataNext = array_unique(dataNext)
      dataNext = array_filter(dataNext, 'strlen')
      // print_r(['getArrToSave__data 3' => data, 'dataNext' => dataNext])
    }
  }

  else if (caseOption === 'new') {
    if (empty(data0) === true && empty(dataNext0) === true) {
      dataNext = []
    }
    else if (empty(data0) === false && empty(dataNext0) === true) {
      dataNext = data
      // print_r(['getArrToSave__data 1' => data, 'dataNext' => dataNext])
    }
    else if (empty(data0) === true && empty(dataNext0) === false) {
      dataNext = dataNext
    }
    else if (empty(data0) === false
        && empty(data0) === false
        && target0 === 'startSession'
    ) {
      dataNext = array_merge(dataNext, data)
      // print_r(['getArrToSave__data 2' => data, 'dataNext' => dataNext])
    }
    else if (empty(data0) === false
        && empty(dataNext) === false
        && target0 !== 'startSession'
    ) {
      dataNext = data
      // print_r(['getArrToSave__data 3' => data, 'dataNext' => dataNext])
    }
  }

  else if (caseOption === 'max') {
    if (empty(data0) === true && empty(dataNext0) === true) {
      dataNext = []
    }
    else if (empty(data0) === false && empty(dataNext0) === true) {
      dataNext = data
      // print_r(['getArrToSave__data 1' => data, 'dataNext' => dataNext])
    }
    else if (empty(data0) === true && empty(dataNext0) === false) {
      dataNext = dataNext
      // print_r(['getArrToSave__data 2' => data, 'dataNext' => dataNext])
    }

    else if (dataNext0 === 'registration02'
    ) {
      dataNext = dataNext
      // print_r(['getArrToSave__data 3' => data, 'dataNext' => dataNext])
    }
    else if (dataNext0 === 'registration01'
        && data0 !== 'registration02'
    ) {
      dataNext = dataNext
      // print_r(['getArrToSave__data 4' => data, 'dataNext' => dataNext])
    }
    else if (data0 === 'registration02'
    ) {
      dataNext = data
      // print_r(['getArrToSave__data 5' => data, 'dataNext' => dataNext])
    }
    else if (dataNext0 !== 'registration02'
        && dataNext0 !== 'registration01'
        && empty(data0) === false
    ) {
      dataNext = data
      // print_r(['getArrToSave__data 6' => data, 'dataNext' => dataNext])
    }
  }

  return dataNext
}

module.exports = {
  getArrToSave,
}
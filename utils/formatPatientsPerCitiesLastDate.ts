interface Summary {
  日付: string
  小計: number
}

type DataType = {
  date: string
  data: Summary[]
}

export default (data: DataType) => {
  const length = data.data.length
  const latest = data.data[length - 1]
  return latest
}

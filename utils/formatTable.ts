import dayjs from 'dayjs'

const headers = [
  { text: '日付', value: '日付' },
  { text: '国籍', value: '国籍' },
  { text: '居住地', value: '居住地' },
  { text: '年代・性別', value: '年代・性別' },
  { text: '備考', value: '備考' }
]

type DataType = {
  リリース日: Date
  国籍: string | null
  居住地: string | null
  '年代・性別': string | null
  備考: string | null
  [key: string]: any
}

type TableDataType = {
  日付: string
  居住地: DataType['居住地']
  国籍: DataType['国籍']
  '年代・性別': DataType['年代・性別']
  備考: DataType['備考']
}

type TableDateType = {
  headers: typeof headers
  datasets: TableDataType[]
}

export default (data: DataType[]) => {
  const tableDate: TableDateType = {
    headers,
    datasets: []
  }
  data.forEach(d => {
    const TableRow: TableDataType = {
      日付: dayjs(d['発表日']).format('MM/DD') ?? '不明',
      国籍: d['国籍'] ?? '不明',
      居住地: d['住居地'] ?? '不明',
      '年代・性別': d['年代・性別'] ?? '不明',
      備考: d['備考'] ?? '不明'
    }
    tableDate.datasets.push(TableRow)
  })
  tableDate.datasets.sort((a, b) => (a === b ? 0 : a < b ? 1 : -1))
  return tableDate
}

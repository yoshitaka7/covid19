import { convertDateToShortFormat } from './formatDate'

type DataType = {
  日付: Date
  小計: number
  合算: string
}

export default (data: DataType[]) => {
  const today = new Date()
  const joined = data
    .filter(d => new Date(d['日付']) < today)
    .filter(d => d['合算'])
    .map(d => convertDateToShortFormat(new Date(d['日付']).toISOString()))
    .join(', ')
  return joined !== '' ? `※青色＜${joined}＞は合算値(出典参照)` : ''
}

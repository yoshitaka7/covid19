import dayjs, { Dayjs } from 'dayjs'
import * as Enumerable from 'linq'
import { PatientsSummaryDaily, MainSummaryDataType } from './types'

// data.json の補正を行う
// 補正の必要がなくなったら削除する
export default (Data: any): void => {
  // 陽性患者数の終了日の補正
  normalizePatientsSummaryEndDate(Data)

  // 陽性患者数の移動平均を算出
  makeAveragePatients(Data)

  // 状況別の移動平均を算出（現在は 入院中 のみ）
  makeAverageMainSummaryHistory(Data)

  // 状況別のデータ無し日を補間（数値は undefined）
  // 平均の算出は補間前に行うこと（データ無し日を飛ばして移動平均を計算させるため）
  paddingMainSummaryHistoryDays(Data)
}

const paddingMainSummaryHistoryDays = (Data: any) => {
  const arr = Data.main_summary_history.data as MainSummaryDataType[]
  const source = Enumerable.from(arr)

  const start = makeDateOnly(dayjs(source.first()['更新日時']))
  const end = makeDateOnly(dayjs(source.last()['更新日時']))
  let expectDate = start
  let i = 0

  const paddedItems: MainSummaryDataType[] = []

  console.debug('start', start)
  console.debug('end', end)
  while (expectDate <= end) {
    const row = arr[i]
    const actualDate = makeDateOnly(dayjs(row['更新日時']))

    while (expectDate < actualDate) {
      paddedItems.push({
        更新日時: expectDate.format('YYYY/MM/DD 00:00:00')
      } as MainSummaryDataType)
      expectDate = expectDate.add(1, 'day')
    }

    paddedItems.push(row)
    expectDate = expectDate.add(1, 'day')
    i++
  }

  Data.main_summary_history.data = paddedItems
}

const makeDateOnly = (date: Dayjs): Dayjs => {
  return date
    .set('hour', 0) // 時刻が入ってるので消す
    .set('minute', 0)
    .set('second', 0)
}

const normalizePatientsSummaryEndDate = (Data: any) => {
  try {
    // とりあえず落ちないように

    // 陽性患者数の最終日が、検査陽性者状況の最終日よりも過去ならば、
    // 検査陽性者状況の最終日を陽性患者数の時点情報として使い、
    // 検査陽性者状況の最終日までを 小計:0 で埋める
    const lastPatientsDate = dayjs(
      Data.patients_summary.data.slice(-1)[0]['日付']
    )
    const lastMainSummaryDate = makeDateOnly(
      dayjs(Data.main_summary_history.data.slice(-1)[0]['更新日時'])
    ).add(1, 'day')

    let dt = lastPatientsDate.add(1, 'day')
    while (dt < lastMainSummaryDate) {
      Data.patients_summary.data.push({
        日付: dt.format('YYYY-MM-DD'),
        小計: 0
      })
      dt = dt.add(1, 'day')
    }
  } finally {
  }
}

const makeAveragePatients = (Data: any) => {
  const source = Enumerable.from(
    Data.patients_summary.data as PatientsSummaryDaily[]
  ).reverse()
  const list = source
    .select(d => d['日付'])
    .select((_, index) => source.skip(index).take(7))
    .select(d => {
      const first = d.first()
      return {
        日付: first['日付'],
        小計: first['小計'],
        合算: first['合算'],
        平均: d.count() === 7 ? d.average(d => Number(d['小計'])) : undefined
      }
    })
    .reverse()
    .toArray()

  Data.patients_summary.data = list
}

const makeAverageMainSummaryHistory = (Data: any) => {
  const source = Enumerable.from(
    Data.main_summary_history.data as MainSummaryDataType[]
  )
    .where(d => !!d['入院中'])
    .reverse()
  const list = source
    .select(d => d['更新日時'])
    .select((_, index) => source.skip(index).take(7))
    .select(d => {
      const cloned = Object.assign({}, d.first())
      cloned['入院中平均'] =
        d.count() === 7 ? d.average(d => Number(d['入院中'])) : undefined
      return cloned
    })
    .reverse()
    .toArray()

  Data.main_summary_history.data = list
}

import dayjs, { Dayjs } from 'dayjs'
import * as Enumerable from 'linq'
import { MainSummaryDataType } from './types'

// data.json の補正を行う
// 補正の必要がなくなったら削除する
export default (Data: any): void => {
  // 状況別のデータ無し日を補間（数値は undefined）
  paddingMainSummaryHistoryDays(Data)

  // 陽性患者数の終了日の補正
  normalizePatientsSummaryEndDate(Data)
}

const paddingMainSummaryHistoryDays = (Data: any) => {
  const arr = Data.main_summary_history.data as MainSummaryDataType[]
  const source = Enumerable.from(arr)

  const start = makeDateOnly(dayjs(source.first()['更新日時']))
  const end = makeDateOnly(dayjs(source.last()['更新日時']))
  let expectDate = start
  let i = 0

  const paddedItems: MainSummaryDataType[] = []

  // console.debug('start', start)
  // console.debug('end', end)
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

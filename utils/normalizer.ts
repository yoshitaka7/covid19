import dayjs, { Dayjs } from 'dayjs'
import * as Enumerable from 'linq'
import {
  MainSummaryDataType,
  DataDaily,
  InspectionPersonsSummaryDaily
} from './types'

// data.json の補正を行う
// 補正の必要がなくなったら削除する
export default (Data: DataDaily): void => {
  // 状況別のデータ無し日を補間（数値は undefined）
  paddingMainSummaryHistoryDays(Data)

  // 陽性患者数の終了日の補正
  normalizePatientsSummaryEndDate(Data)

  const data = Enumerable.from(Data.main_summary_history.data)
    .scan([] as MainSummaryDataType[], (pre, cur) => {
      pre.push(cur)
      if (pre.length > 2) {
        pre.shift()
      }
      return pre
    })
    .where(arr => arr.length > 1)
    .select(arr => {
      const persons = arr[1]['検査実施人数'] - arr[0]['検査実施人数']
      const positives = arr[1]['陽性患者数'] - arr[0]['陽性患者数']
      return {
        日付: dayjs(arr[1]['更新日時']).format('YYYY-MM-DD'), // 時刻を切り落とす
        検査人数: isNaN(persons)
          ? undefined
          : persons <= 0
          ? undefined
          : persons,
        陽性者数: isNaN(positives)
          ? undefined
          : persons <= 0
          ? undefined
          : positives
      } as InspectionPersonsSummaryDaily
    })

  Data.inspection_persons_summary = {
    date: Data.main_summary_history.date,
    data: data.toArray()
  }
}

const paddingMainSummaryHistoryDays = (Data: DataDaily) => {
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

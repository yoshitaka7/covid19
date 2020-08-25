import dayjs, { Dayjs } from 'dayjs'
import * as Enumerable from 'linq'
import {
  MainSummaryDataType,
  DataDaily,
  InspectionPersonsSummaryDaily,
  PatientsSummaryDaily
} from './types'

// data.json の補正を行う
// 補正の必要がなくなったら削除する
export default (Data: DataDaily): void => {
  // 状況別のデータ無し日を補間（数値は undefined）
  paddingMainSummaryHistoryDays(Data)

  // 数値項目に文字が入っている場合は undefined にする
  normalizeMainSummaryHistoryNumbers(Data)

  // 陽性患者数の終了日の補正
  normalizePatientsSummaryEndDate(Data)

  // 検査陽性者数の補間
  paddingInspectionPersonsSummaryDays(Data)
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

const normalizeMainSummaryHistoryNumbers = (Data: DataDaily) => {
  const numOrUndefined = (x: any): any => {
    if (x === '' || x == null || Number.isNaN(Number(x))) {
      return undefined
    }
    return Number(x)
  }

  const flds = [
    '検査実施人数',
    '陽性患者数',
    '入院中',
    '軽症中等症',
    '軽症無症状',
    '中等症',
    '重症',
    '転院',
    '施設入所',
    '入院',
    '入院調整',
    '自宅療養',
    '調整',
    '死亡',
    '退院'
  ]

  for (const row of Data.main_summary_history.data) {
    const rowAny = row as any
    for (const fld of flds) {
      rowAny[fld] = numOrUndefined(rowAny[fld])
    }
  }
}

const paddingInspectionPersonsSummaryDays = (Data: DataDaily) => {
  const arr = Data.inspection_persons_summary
    .data as InspectionPersonsSummaryDaily[]
  const source = Enumerable.from(arr)

  const start = makeDateOnly(dayjs(source.first()['日付']))
  const end = makeDateOnly(dayjs(source.last()['日付']))
  let expectDate = start
  let i = 0

  const paddedItems: InspectionPersonsSummaryDaily[] = []

  // console.debug('start', start)
  // console.debug('end', end)
  while (expectDate <= end) {
    const row = arr[i]
    const actualDate = makeDateOnly(dayjs(row['日付']))

    while (expectDate < actualDate) {
      paddedItems.push({
        日付: expectDate.format('YYYY/MM/DD 00:00:00')
      } as InspectionPersonsSummaryDaily)
      expectDate = expectDate.add(1, 'day')
    }

    paddedItems.push(row)
    expectDate = expectDate.add(1, 'day')
    i++
  }

  // inspection_persons_summary の陽性者数が未入力ならば、
  // patients_summary の同日の陽性者数（小計）を使用する
  // NOTE find が linear-search なので件数増えると遅さが際立つ恐れ
  const ptArr = Data.patients_summary.data as PatientsSummaryDaily[]
  for (const item of paddedItems) {
    if (Number.isInteger(item['陽性者数'] as number)) {
      continue
    }

    const hit = ptArr.find(
      d => makeDateOnlyStr(d['日付']) === makeDateOnlyStr(item['日付'])
    )
    if (hit) {
      item['陽性者数'] = hit['小計']
    }
  }

  Data.inspection_persons_summary.data = paddedItems
}

const makeDateOnly = (date: Dayjs | string): Dayjs => {
  let dt = date
  if (typeof dt === 'string') {
    dt = dayjs(dt)
  }

  return dt
    .set('hour', 0) // 時刻が入ってるので消す
    .set('minute', 0)
    .set('second', 0)
}

const makeDateOnlyStr = (date: Dayjs | string): string => {
  return makeDateOnly(date).format('YYYY-MM-DD')
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

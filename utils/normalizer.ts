import dayjs from 'dayjs'
import * as Enumerable from 'linq'
import { PatientsSummaryDaily } from './types'

// data.json の補正を行う
// 補正の必要がなくなったら削除する
export default (Data: any): void => {
  normalizePatientsSummary(Data)

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

  // console.debug(list)

  Data.patients_summary.data = list
}

const normalizePatientsSummary = (Data: any) => {
  try {
    // とりあえず落ちないように

    // 陽性患者数の最終日が、検査陽性者状況の最終日よりも過去ならば、
    // 検査陽性者状況の最終日を陽性患者数の時点情報として使い、
    // 検査陽性者状況の最終日までを 小計:0 で埋める
    const lastPatientsDate = dayjs(
      Data.patients_summary.data.slice(-1)[0]['日付']
    )
    const lastMainSummaryDate = dayjs(
      Data.main_summary_history.data.slice(-1)[0]['更新日時']
    )
      .set('hour', 0) // 時刻が入ってるので消す
      .set('minute', 0)
      .set('second', 0)
      .add(1, 'day')

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

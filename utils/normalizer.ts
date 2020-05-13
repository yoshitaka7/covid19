import dayjs from 'dayjs'

// data.json の補正を行う
// 補正の必要がなくなったら削除する
export default (Data: any): void => {
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

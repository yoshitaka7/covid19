import dayjs, { Dayjs } from 'dayjs'

type MainSummaryDataType = {
  更新日時: Date
  検査実施人数: number
  陽性患者数: number
  入院中: number
  軽症中等症: number
  重症: number
  転院: number
  施設入所: number
  死亡: number
  退院: number
}

type SingleColumnGraphDataType = {
  date: Date
  label: string
  transition: number
  novalue: boolean
}

export default (mainSummaries: MainSummaryDataType[]) => {
  // Date や日付文字列をYYYY/MM/DD文字列に整形
  const formatDt = (dtText: string | Date | Dayjs) =>
    dayjs(dtText).format('YYYY/MM/DD')

  const graphData: SingleColumnGraphDataType[] = []
  const today = formatDt(new Date())
  const startDate = formatDt(mainSummaries[0]['更新日時'])

  // mainSummaries を Map 化
  const mainSummaryMap = mainSummaries.reduce((pre, d) => {
    const label = formatDt(d['更新日時'])
    pre.set(label, d)
    return pre
  }, new Map<string, MainSummaryDataType>())

  // 終了日は mainSummaries の後端
  const endDate = formatDt(mainSummaries.slice(-1)[0]?.更新日時 ?? '1900/01/01')

  // 開始日から終了日までループ
  let dt = startDate
  while (dt <= endDate) {
    if (dt > today) {
      break
    }

    const dayjsDt = dayjs(dt)
    const date = dayjsDt.toDate()
    const label = dayjsDt.format('M/D')

    const m = mainSummaryMap.get(dt)
    if (m != null) {
      graphData.push({
        date,
        label,
        transition: Number(m['重症']),
        novalue: false
      })
    } else {
      // 値なし
      graphData.push({
        date,
        label,
        transition: 0,
        novalue: true
      })
    }

    // 次の日へ
    dt = formatDt(dayjsDt.add(1, 'day'))
  }

  return graphData
}

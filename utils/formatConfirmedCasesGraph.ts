import dayjs, { Dayjs } from 'dayjs'

type PatientsSummaryDataType = {
  日付: Date
  小計: number
}

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

type ConfirmedCasesGraphDataType = {
  label: string
  milds?: number // 軽症中等症
  severes?: number // 重症
  isolated?: number // 施設入所
  transfered?: number // 転院
  deaths?: number // 死亡
  discharged?: number // 退院
  unknown?: number // 不定（状況データ無し）
}

export default (
  patientSummaries: PatientsSummaryDataType[],
  mainSummaries: MainSummaryDataType[]
) => {
  // Date や日付文字列をYYYY/MM/DD文字列に整形
  const formatDt = (dtText: string | Date | Dayjs) =>
    dayjs(dtText).format('YYYY/MM/DD')

  const graphData: ConfirmedCasesGraphDataType[] = []
  const today = formatDt(new Date())
  const startDate = formatDt(mainSummaries[0]['更新日時'])

  // 開始日までの累計を算出
  let patSum = patientSummaries
    .filter(d => formatDt(d['日付']) < startDate)
    .reduce((pre, d) => pre + d['小計'], 0)

  // patientSummaries と mainSummaries を Map 化
  const patientSummaryMap = patientSummaries.reduce((pre, d) => {
    const label = formatDt(d['日付'])
    pre.set(label, d)
    return pre
  }, new Map<string, PatientsSummaryDataType>())
  const mainSummaryMap = mainSummaries.reduce((pre, d) => {
    const label = formatDt(d['更新日時'])
    pre.set(label, d)
    return pre
  }, new Map<string, MainSummaryDataType>())

  // 修了日は patientSummaries と mainSummaries の後端の大きい(未来の)方
  const maxPatient =
    formatDt(patientSummaries.slice(-1)[0]?.日付) ?? '1900/01/01'
  const maxSummary = formatDt(
    mainSummaries.slice(-1)[0]?.更新日時 ?? '1900/01/01'
  )
  const endDate = maxPatient < maxSummary ? maxSummary : maxPatient

  // 開始日から修了日までループ
  let dt = startDate
  while (dt <= endDate) {
    if (dt > today) {
      break
    }

    const label = dayjs(dt).format('M/D')

    const d = patientSummaryMap.get(dt)
    if (d != null) {
      patSum += Number(d['小計'])
    }

    const m = mainSummaryMap.get(dt)
    if (m != null) {
      graphData.push({
        label,
        milds: Number(m['軽症中等症']),
        severes: Number(m['重症']),
        isolated: Number(m['施設入所']),
        transfered: Number(m['転院']),
        deaths: Number(m['死亡']),
        discharged: Number(m['退院']),
        unknown: 0
      })
    } else {
      // 不定
      graphData.push({
        label,
        unknown: patSum
      })
    }

    // 次の日へ
    dt = formatDt(dayjs(dt).add(1, 'day'))
  }

  return graphData
}

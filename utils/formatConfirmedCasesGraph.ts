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
  const graphData: ConfirmedCasesGraphDataType[] = []
  const today = new Date()
  const startDate = new Date(mainSummaries[0]['更新日時']) // new Date('2020/03/15');
  startDate.setHours(0)
  startDate.setMinutes(0)
  startDate.setSeconds(0)
  startDate.setMilliseconds(0)
  let patSum = patientSummaries
    .filter(d => new Date(d['日付']) < startDate)
    .reduce((pre, d) => pre + d['小計'], 0)

  const mainSummaryMap = mainSummaries.reduce((pre, d) => {
    const date = new Date(d['更新日時'])
    const label = `${date.getMonth() + 1}/${date.getDate()}`
    pre.set(label, d)
    return pre
  }, new Map<string, MainSummaryDataType>())

  patientSummaries
    .filter(d => new Date(d['日付']) >= startDate)
    .filter(d => new Date(d['日付']) < today)
    .filter(
      d =>
        new Date(d['日付']) < new Date(mainSummaries.slice(-1)[0]['更新日時'])
    )
    .forEach(d => {
      const date = new Date(d['日付'])
      const label = `${date.getMonth() + 1}/${date.getDate()}`
      patSum += Number(d['小計'])

      const m = mainSummaryMap.get(label)
      if (m) {
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
        graphData.push({
          label,
          unknown: patSum
        })
      }
    })
  return graphData
}

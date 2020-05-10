import dayjs from 'dayjs'
import {
  GraphDataType,
  PatientsSummaryDaily,
  PatientsSummaryWeekly
} from '@/utils/types'

export default (data: PatientsSummaryDaily[]): GraphDataType[] => {
  const graphData: GraphDataType[] = []
  const today = new Date()
  let patSum = 0
  data
    .filter(d => new Date(d['日付']) < today)
    .forEach(d => {
      const date = new Date(d['日付'])
      const subTotal = d['小計']
      if (!isNaN(subTotal)) {
        patSum += subTotal * 1
        graphData.push({
          date,
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          transition: subTotal,
          cumulative: patSum,
          summarized: !!d['合算']
        })
      }
    })
  return graphData
}

export const formatGraphWeekly = (
  data: PatientsSummaryWeekly[]
): GraphDataType[] => {
  const graphData: GraphDataType[] = []
  const today = dayjs()
  let patSum = 0
  data
    .filter(d => dayjs(d['終了日']) < today)
    .forEach(d => {
      const startDt = dayjs(d['開始日'])
      const endDt = dayjs(d['終了日'])
      const subTotal = d['小計']
      if (!isNaN(subTotal)) {
        patSum += subTotal * 1
        graphData.push({
          date: new Date(startDt.format('YYYY-MM-DD')),
          label: `${startDt.format('M/D')}～${endDt.format('M/D')}`, // `${date.getMonth() + 1}/${date.getDate()}`,
          transition: subTotal,
          cumulative: patSum,
          summarized: !!d['合算']
        })
      }
    })
  return graphData
}

// /**
//  * グラフデータを週単位でチャンクする（月曜日始まり）
//  * @param graphs グラフデータ
//  * @param startDayOfWeek 週の開始日（日=0, 月=1 ... 土=6）
//  */
// export const chunkByWeek = (
//   graphs: GraphDataType[] | any[],
//   startDayOfWeek: number
// ): GraphDataType[][] => {
//   if (!graphs || graphs.length === 0) return []

//   const result: GraphDataType[][] = []
//   let chunk: GraphDataType[] = []
//   graphs.forEach(graph => {
//     const dj = dayjs(graph.date)
//     // 週の開始日の場合
//     if (dj.day() === startDayOfWeek) {
//       // 先週のデータを入れる
//       if (chunk && chunk.length > 0) {
//         result.push(chunk)
//         chunk = []
//       }
//     }

//     chunk.push(graph)
//   })

//   if (chunk.length !== 0) result.push(chunk)

//   return result
// }

// /**
//  * グラフデータを畳み込み
//  */
// export const reduceGraph = (
//   graphs: GraphDataType[],
//   summarized: boolean
// ): null | GraphDataType => {
//   if (!graphs || graphs.length === 0) return null

//   const filteredGraphs = graphs.filter(graph => {
//     const s = Boolean(graph.summarized)
//     return s === summarized
//   })
//   if (!filteredGraphs || filteredGraphs.length === 0) return null

//   const last = filteredGraphs[filteredGraphs.length - 1]
//   const reduced: GraphDataType = {
//     date: last.date,
//     label: last.label,
//     transition: 0,
//     cumulative: 0,
//     summarized
//   }

//   filteredGraphs.forEach(graph => {
//     reduced.transition += graph.transition
//     reduced.cumulative += graph.cumulative
//   })

//   return reduced
// }

import formatGraph, { formatGraphWeekly } from './formatGraph'
import {
  GraphDataType,
  InspectionsSummaryDaily,
  InspectionsSummaryWeekly
} from '@/utils/types'

type ChartData = {
  titlePostfix: string // グラフタイトルの接尾辞
  data: GraphDataType[]
  valueField: string // 'transition'
  valueUnit: string // '人'
  latestLabel: string // '実績値'
  diffLabel: string // '前日比',
  sliderLabelFormatter: (d: any, isFrom: boolean) => string
}

export const buildInspectionsChartSet = (
  dataDaily: InspectionsSummaryDaily[],
  dataWeekly: InspectionsSummaryWeekly[]
): Map<string, ChartData> => {
  // 日次グラフでは、元から週次に合算されたデータは表示しない
  const inspectionssGraphDaily = formatGraph(dataDaily).filter(
    d => !d.summarized
  )

  // 週次グラフでは、3/2以降のデータのみ表示（3/1以前は1週間より長い期間が合算されているため)
  const inspectionssGraphWeekly = formatGraphWeekly(dataWeekly).filter(
    d => d.date >= new Date('2020-03-02')
  )

  const chartDataSet = new Map<string, ChartData>()

  chartDataSet.set('daily-transition', {
    titlePostfix: '',
    data: inspectionssGraphDaily,
    valueField: 'transition',
    valueUnit: '件',
    latestLabel: '実績値',
    diffLabel: '前日比',
    sliderLabelFormatter: (x, _) => x.label
  })

  chartDataSet.set('weekly-transition', {
    titlePostfix: '(週別)',
    data: inspectionssGraphWeekly,
    latestLabel: '実績値',
    diffLabel: '前週比',
    valueField: 'transition',
    valueUnit: '件',
    sliderLabelFormatter: (x, isFrom) => {
      const index = x.label.indexOf('～')
      return isFrom ? x.label.substring(0, index) : x.label.substring(index + 1)
    }
  })

  chartDataSet.set('daily-cumulative', {
    titlePostfix: '',
    data: inspectionssGraphDaily,
    valueField: 'cumulative',
    valueUnit: '件',
    latestLabel: '累計値',
    diffLabel: '前日比',
    sliderLabelFormatter: (x, _) => x.label
  })

  return chartDataSet
}

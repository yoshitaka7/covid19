import formatGraph, { formatGraphWeekly } from './formatGraph'
import formatInHospitalGraph from './formatInHospitalGraph'
import formatSevereGraph from './formatSevereGraph'
import {
  GraphDataType,
  PatientsSummaryDaily,
  PatientsSummaryWeekly,
  MainSummaryDataType,
  InspectionsSummaryDaily,
  InspectionsSummaryWeekly
} from '@/utils/types'

type ChartData = {
  data: GraphDataType[]
  valueField: string // 'transition'
  valueUnit: string // '人'
  latestLabel: string // '実績値'
  diffLabel: string // '前日比',
  sliderLabelFormatter: (d: any, isFrom: boolean) => string
}

export const buildPatientChartSet = (
  dataDaily: PatientsSummaryDaily[],
  dataWeekly: PatientsSummaryWeekly[]
): Map<string, ChartData> => {
  const patientsGraphDaily = formatGraph(dataDaily)
  const patientsGraphWeekly = formatGraphWeekly(dataWeekly)

  const chartDataSet = new Map<string, ChartData>()

  chartDataSet.set('daily-transition', {
    data: patientsGraphDaily,
    valueField: 'transition',
    valueUnit: '人',
    latestLabel: '実績値',
    diffLabel: '前日比',
    sliderLabelFormatter: (x, _) => x.label
  })

  chartDataSet.set('weekly-transition', {
    data: patientsGraphWeekly,
    latestLabel: '実績値',
    diffLabel: '前週比',
    valueField: 'transition',
    valueUnit: '人',
    sliderLabelFormatter: (x, isFrom) => {
      const index = x.label.indexOf('～')
      return isFrom ? x.label.substring(0, index) : x.label.substring(index + 1)
    }
  })

  chartDataSet.set('daily-cumulative', {
    data: patientsGraphDaily,
    valueField: 'cumulative',
    valueUnit: '人',
    latestLabel: '累計値',
    diffLabel: '前日比',
    sliderLabelFormatter: (x, _) => x.label
  })

  return chartDataSet
}

export const buildInspectionsChartSet = (
  dataDaily: InspectionsSummaryDaily[],
  dataWeekly: InspectionsSummaryWeekly[]
): Map<string, ChartData> => {
  const inspectionssGraphDaily = formatGraph(dataDaily).filter(
    d => !d.summarized
  )
  const inspectionssGraphWeekly = formatGraphWeekly(dataWeekly).splice(1)

  const chartDataSet = new Map<string, ChartData>()

  chartDataSet.set('daily-transition', {
    data: inspectionssGraphDaily,
    valueField: 'transition',
    valueUnit: '件',
    latestLabel: '実績値',
    diffLabel: '前日比',
    sliderLabelFormatter: (x, _) => x.label
  })

  chartDataSet.set('weekly-transition', {
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
    data: inspectionssGraphDaily,
    valueField: 'cumulative',
    valueUnit: '件',
    latestLabel: '累計値',
    diffLabel: '前日比',
    sliderLabelFormatter: (x, _) => x.label
  })

  return chartDataSet
}

export const buildInHospitalChartSet = (
  dataDaily: MainSummaryDataType[]
): Map<string, ChartData> => {
  // 入院中数グラフ
  const graphDataDaily = formatInHospitalGraph(dataDaily)

  const chartDataSet = new Map<string, ChartData>()

  chartDataSet.set('daily-transition', {
    data: graphDataDaily,
    valueField: 'transition',
    valueUnit: '人',
    latestLabel: '時点',
    diffLabel: '前日比',
    sliderLabelFormatter: (x, _) => x.label
  })

  return chartDataSet
}

export const buildSevereChartSet = (
  dataDaily: MainSummaryDataType[]
): Map<string, ChartData> => {
  // 重症者数グラフ
  const graphDataDaily = formatSevereGraph(dataDaily)

  const chartDataSet = new Map<string, ChartData>()

  chartDataSet.set('daily-transition', {
    data: graphDataDaily,
    valueField: 'transition',
    valueUnit: '人',
    latestLabel: '時点',
    diffLabel: '前日比',
    sliderLabelFormatter: (x, _) => x.label
  })

  return chartDataSet
}

<template>
  <data-view
    :title="displayTitle"
    title-id="new-patients-chart"
    :date="date"
    url="https://www.pref.aichi.jp/site/covid19-aichi/kansensya-kensa.html"
    :remarks="remarks"
  >
    <template v-if="showSelector" v-slot:button>
      <data-selector v-model="dataKind" :items="dataKinds" />
    </template>

    <time-bar-line-chart
      chart-id="new-patients-chart"
      :chart-data="chartData"
      :y-axis-left-setting="yAxisLeftSetting"
      legend-order-kind="asc"
    />

    <div>
      <ul class="remarks">
        <!-- eslint-disable vue/no-v-html -->
        <li
          v-for="remarks_text in remarks"
          :key="remarks_text"
          v-sanitaize
          v-html="remarks_text"
        />
        <!-- eslint-disable vue/no-v-html -->
      </ul>
    </div>

    <template v-slot:infoPanel>
      <data-view-basic-info-panel
        :l-text="displayInfo.lText"
        :s-text="displayInfo.sText"
        :unit="displayInfo.unit"
      />
    </template>
  </data-view>
</template>

<style lang="scss" scoped>
ul.remarks {
  font-size: 0.75rem;
  list-style-type: '※ ';
}
</style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import dayjs from 'dayjs'
import * as Enumerable from 'linq'
import NewPatientsChart from './NewPatientsChart.vue'
import InspectionPersonsChart from './InspectionPersonsChart.vue'
import HospitalizedChart from './HospitalizedChart.vue'
import DataView from '@/components/DataView.vue'
import DataSelector, { SelectorItem } from '@/components/DataSelector.vue'
import DataViewBasicInfoPanel from '@/components/DataViewBasicInfoPanel.vue'
import DateSelectSlider from '@/components/DateSelectSlider.vue'
import TimeBarLineChart, {
  GraphData,
  YAxisSetting
} from '@/components/TimeBarLineChart.vue'
import {
  PatientsSummaryDaily,
  InspectionPersonsSummaryDaily,
  MainSummaryDataType
} from '~/utils/types'

type DataKind = 'daily-transition' | 'weekly-transition' | 'daily-cumulative'

type DisplayInfo = {
  lText: string
  sText: string
  unit: string
}

@Component({
  components: {
    DataView,
    DataSelector,
    DataViewBasicInfoPanel,
    DateSelectSlider,
    TimeBarLineChart
  }
})
export default class MonitoringChart extends Vue {
  @Prop()
  public date?: string

  @Prop()
  public parientsDate!: string

  @Prop()
  public parientsData!: PatientsSummaryDaily[]

  @Prop()
  public inspectionPersonsDate!: string

  @Prop()
  public inspectionPersonsData!: InspectionPersonsSummaryDaily[]

  @Prop()
  public mainSummaryDate!: string

  @Prop()
  public mainSummaryData!: MainSummaryDataType[]

  private readonly yAxisLeftSetting: YAxisSetting = {
    min: 0,
    suggestedMax: 110,
    unit: '%',
    visible: true,
    stacked: false,
    visibleAxisValue: false
  } as YAxisSetting

  private readonly remarks = [
    '「新規感染者数」とは、愛知県が発表する「<a class=RemarksLink target=_blank href=https://www.pref.aichi.jp/site/covid19-aichi/kansensya-kensa.html>愛知県内発生事例</a>」を日別または週別に集計した人数です。(参考:<a class=RemarksLink target=_blank href=https://github.com/code4nagoya/covid19/blob/development/data/patients.csv>当サイトでCSV形式に加工したデータ</a>)。',
    '過去7日間の平均は、新規感染者数の後方7日移動平均値です'
  ]

  private readonly showSelector = false
  private dataKind: DataKind = 'daily-transition'
  private readonly dataKinds = [
    // { key: 'weekly-transition', label: '週別' } as SelectorItem,
    { key: 'daily-transition', label: '日別' } as SelectorItem
    // { key: 'daily-cumulative', label: '累計' } as SelectorItem
  ]

  private readonly chartDataSet = new Map<DataKind, GraphData>()

  private get displayTitle(): string {
    return `達成状況の推移`
  }

  private formatDayBeforeRatio = (dayBeforeRatio: any) => {
    const dayBeforeRatioLocaleString = dayBeforeRatio.toLocaleString()
    const prefix = Math.sign(dayBeforeRatio) === 1 ? '+' : ''
    return `${prefix}${dayBeforeRatioLocaleString}`
  }

  private get displayDiffValue(): string {
    if (this.chartData.datasets[0].values.slice(-2)[0] === undefined) {
      return '-'
    }
    const lastDay = this.chartData.datasets[0].values.slice(-1)[0]
    const lastDayBefore = this.chartData.datasets[0].values.slice(-2)[0]
    return this.formatDayBeforeRatio(lastDay - lastDayBefore)
  }

  private get displayInfo(): DisplayInfo {
    if ((this.chartData?.datasets?.length ?? 0) <= 0) {
      return {
        lText: '-',
        sText: '-',
        unit: ''
      } as DisplayInfo
    }

    const dataset = this.chartData.datasets[0]
    const latestValueText = dataset.values.slice(-1)[0].toLocaleString()
    const latestDate = this.formatDateLabel(this.chartData.dates.slice(-1)[0])
    return {
      lText: latestValueText,
      sText: `${latestDate} 時点`,
      unit: ''
    }
  }

  private formatDateLabel = (date: string | string[]): string => {
    return (typeof date === 'string' ? [date] : date)
      .map(d => dayjs(d).format('M/D'))
      .join('～')
  }

  constructor() {
    super()

    this.chartDataSet.set(
      'daily-transition',
      this.buildDailyTransitionGraphData()
    )
  }

  private get chartData(): GraphData {
    const data = this.chartDataSet.get(this.dataKind)
    if (data) {
      return data
    } else {
      return {
        dates: [],
        datasets: []
      } as GraphData
    }
  }

  private buildDailyTransitionGraphData = (): GraphData => {
    const patients = NewPatientsChart.makeAveragePatients(
      this.parientsData ?? []
    )
    const inspections = InspectionPersonsChart.makeAveragePositivePerPatients(
      this.inspectionPersonsData ?? []
    )
    const summaries = HospitalizedChart.makeAverageHospitalized(
      this.mainSummaryData ?? []
    )

    // 3つのデータそれぞれの最古日付の中で、最も新しい日をグラフの開始日とする
    const startDate = Enumerable.from([
      dayjs(patients.first().date),
      dayjs(inspections.first().date),
      dayjs(summaries.first().date)
    ]).maxBy(x => x)

    // 3つのデータそれぞれの最新日付の中で、最も古い日をグラフの終了日とする
    const endDate = Enumerable.from([
      dayjs(patients.last().date),
      dayjs(inspections.last().date),
      dayjs(summaries.last().date)
    ]).minBy(x => x)

    const zipped = patients
      .where(d => startDate <= d.date && d.date <= endDate)
      .zip(
        inspections.where(d => startDate <= d.date && d.date <= endDate),
        (p, i) => {
          return {
            date: p.date,
            patientsAverage: p.average,
            inspectionsAverage: i.average
          }
        }
      )
      .zip(
        summaries.where(d => startDate <= d.date && d.date <= endDate),
        (pi, s) => {
          return {
            date: pi.date,
            patientsAverage: pi.patientsAverage,
            inspectionsAverage: pi.inspectionsAverage,
            summariesAverage: s.average
          }
        }
      )
    //       .toArray()
    // console.debug(`${this.constructor.name}::buildDailyTransitionGraphData`, zipped)

    const now = dayjs()
    const rows = zipped // NewPatientsChart.makeAveragePatients(this.parientsData ?? [])
      .where(d => d.date < now)
      .select(d => {
        return {
          date: d.date.format('YYYY-MM-DD'),
          patientsAverage: d.patientsAverage,
          patientsRate: ((d.patientsAverage ?? 0) / 20) * 100,
          inspectionsAverage: d.inspectionsAverage,
          inspectionsRate: ((d.inspectionsAverage ?? 0) / 10) * 100,
          summariesAverage: d.summariesAverage,
          // summariesRate: (d.summariesAverage ?? 0) / 250 * 100,
          summariesRate:
            (d.summariesAverage ?? 0) <= 150
              ? ((d.summariesAverage ?? 0) / 150) * 50
              : (((d.summariesAverage ?? 0) - 150) / 100) * 50 + 50
        }
      })

    return {
      dates: rows.select(d => d.date).toArray(),
      datasets: [
        {
          type: 'line',
          title: '新規感染者数',
          unit: '人',
          values: rows.select(d => d.patientsRate).toArray(),
          tooltipValues: rows.select(d => d.patientsAverage).toArray(),
          order: 1,
          color: '#bd3f4c'
        },
        {
          type: 'line',
          title: '陽性率',
          unit: '%',
          values: rows.select(d => d.inspectionsRate).toArray(),
          tooltipValues: rows.select(d => d.inspectionsAverage).toArray(),
          order: 2,
          color: '#0070C0'
        },
        {
          type: 'line',
          title: '入院患者数',
          unit: '人',
          values: rows.select(d => d.summariesRate).toArray(),
          tooltipValues: rows.select(d => d.summariesAverage).toArray(),
          order: 3,
          color: '#92D050'
        },
        {
          type: 'line',
          title: '注意領域',
          unit: '%',
          values: rows.select(_ => 50).toArray(),
          tooltipVisible: false,
          order: 4,
          color: '#f0e68c',
          lineStyle: 'dashed'
        },
        {
          type: 'line',
          title: '危険領域',
          unit: '%',
          values: rows.select(_ => 100).toArray(),
          tooltipVisible: false,
          order: 5,
          color: '#ff6347',
          lineStyle: 'dashed'
        }
      ]
    } as GraphData
  }
}
</script>

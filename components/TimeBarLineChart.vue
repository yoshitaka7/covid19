<template>
  <data-view
    :title="displayTitle"
    :title-id="titleId"
    :date="date"
    :url="url"
    :remarks="remarks"
  >
    <template v-if="show" v-slot:button>
      <data-selector v-model="dataKind" :items="dataKinds" />
    </template>

    <bar
      :chart-id="chartId"
      :chart-data="displayData"
      :options="displayOption"
      :height="240"
    />

    <date-select-slider
      :chart-data="chartData.rows"
      :value="displaySpan"
      :min="spanMin"
      :max="spanMax"
      :label-formatter="sliderLabelFormatter"
      @sliderInput="sliderUpdate"
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
  list-style-type: '※ ';
}
</style>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import DataView from '@/components/DataView.vue'
import DataSelector, { SelectorItem } from '@/components/DataSelector.vue'
import DataViewBasicInfoPanel from '@/components/DataViewBasicInfoPanel.vue'
import DateSelectSlider from '@/components/DateSelectSlider.vue'
import { PatientsSummaryDaily, PatientsSummaryWeekly } from '~/utils/types'

type DataKind = 'daily-transition' | 'weekly-transition' | 'daily-cumulative'

type ChartData = {
  patientsLegendTitle: string
  patientsUnit: string
  averageLegendTitle: string
  averageUnit: string
  averageVisible: boolean
  rows: GraphDataType[]
}

type GraphDataType = {
  date: string | string[]
  numberOfPatients: number
  average7days?: number
}

@Component({
  components: {
    DataView,
    DataSelector,
    DataViewBasicInfoPanel,
    DateSelectSlider
  }
})
export default class TimeBarLineChart extends Vue {
  @Prop()
  public chartId?: string

  @Prop()
  public title?: string

  @Prop()
  public date?: string

  @Prop()
  public dailyData?: PatientsSummaryDaily[]

  @Prop()
  public weeklyData?: PatientsSummaryWeekly[]

  @Prop()
  public titleId?: string

  @Prop()
  public url?: string

  @Prop()
  public remarks?: string[]

  private get displayTitle(): string {
    return `${this.title}${
      this.dataKind === 'weekly-transition' ? '(週別)' : ''
    }`
  }

  private show = true
  private dataKind: DataKind = 'daily-transition'
  private readonly dataKinds = [
    { key: 'weekly-transition', label: '週別' } as SelectorItem,
    { key: 'daily-transition', label: '日別' } as SelectorItem,
    { key: 'daily-cumulative', label: '累計' } as SelectorItem
  ]

  private formatDayBeforeRatio = (dayBeforeRatio: any) => {
    const dayBeforeRatioLocaleString = dayBeforeRatio.toLocaleString()
    const prefix = Math.sign(dayBeforeRatio) === 1 ? '+' : ''
    return `${prefix}${dayBeforeRatioLocaleString}`
  }

  private get displayDiffValue(): string {
    if (this.chartData.rows.slice(-2)[0] === undefined) {
      return '-'
    }
    const lastDay = this.chartData.rows.slice(-1)[0].numberOfPatients
    const lastDayBefore = this.chartData.rows.slice(-2)[0].numberOfPatients
    return this.formatDayBeforeRatio(lastDay - lastDayBefore)
  }

  private get displayInfo(): any {
    const latestData = this.chartData.rows.slice(-1)[0]
    const latestValueText = latestData.numberOfPatients.toLocaleString()
    const diffValueText = this.displayDiffValue
    const diffLabel =
      this.dataKind === 'weekly-transition' ? '前週比' : '前日比'
    const latestDate = this.formatDateLabel(latestData.date)
    return {
      lText: latestValueText,
      sText: `${latestDate} 時点（${diffLabel}：${diffValueText} ${this.chartData.patientsUnit}）`,
      unit: this.chartData.patientsUnit
    }
  }

  get displayData(): Chart.ChartData {
    const datasets: Chart.ChartDataSets[] = [
      {
        type: 'bar',
        yAxisID: 'y-axis-1',
        label: this.chartData.patientsLegendTitle, // 凡例名
        data: this.displayGraphData.map(d => d.numberOfPatients),
        backgroundColor: '#bd3f4c',
        order: 2,
        lineTension: 0
      } as Chart.ChartDataSets
    ]

    if (this.chartData.averageVisible) {
      datasets.push({
        type: 'line',
        yAxisID: 'y-axis-1',
        label: this.chartData.averageLegendTitle, // 凡例名
        data: this.displayGraphData.map(d => d.average7days),
        borderColor: '#0070C0',
        borderWidth: 3,
        pointRadius: 1,
        fill: false,
        order: 1,
        lineTension: 0
      })
    }

    return {
      labels: this.displayGraphData.map(d => this.formatDateLabel(d.date)),
      datasets
    }
  }

  private get displayOption(): Chart.ChartOptions {
    return {
      tooltips: {
        displayColors: false,
        callbacks: {
          label: (
            tooltipItem: Chart.ChartTooltipItem,
            chartData: Chart.ChartData
          ) => {
            if (
              tooltipItem.index === undefined ||
              tooltipItem.datasetIndex === undefined
            ) {
              return ''
            }

            const ds = chartData.datasets!
            const units = []

            const value1 = (ds[0].data as number[])[tooltipItem.index]
            const label1 = this.chartData.patientsLegendTitle
            const unit1 = this.chartData.patientsUnit
            units.push(`${label1}: ${value1} ${unit1}`)

            if (ds.length > 1 && (ds[1].data as number[])[tooltipItem.index]) {
              const val2 = (ds[1].data as number[])[tooltipItem.index]
              const value2: number = Math.round(val2 * 10) / 10
              const label2 = this.chartData.averageLegendTitle
              const unit2 = this.chartData.averageUnit
              units.push(`${label2}: ${value2} ${unit2}`)
            }
            return units
          },
          title: (tooltipItems: Chart.ChartTooltipItem[]) => {
            try {
              const date = this.chartData.rows[tooltipItems[0].index!].date

              return (typeof date === 'string' ? [date] : date)
                .map(d => dayjs(d).format('M月D日'))
                .join('～')
            } catch (_) {
              return 'error'
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: this.chartData.averageVisible,
        reverse: true
      },
      scales: {
        xAxes: [
          {
            id: 'day',
            stacked: true,
            gridLines: {
              display: false
            },
            ticks: {
              fontSize: 9,
              maxTicksLimit: 20,
              fontColor: '#808080'
            }
          }
        ],
        yAxes: [
          {
            id: 'y-axis-1',
            stacked: true,
            gridLines: {
              display: true,
              color: '#E5E5E5'
            },
            ticks: {
              suggestedMin: 0,
              maxTicksLimit: 8,
              fontColor: '#808080'
            }
          }
        ]
      }
    }
  }

  private readonly defaultSpan: number = 60

  private displaySpan: number[] = [0, 0]

  private spanMin: number = 0

  private get spanMax(): number {
    return this.chartData.rows.length - 1
  }

  private readonly sliderLabelFormatter = (
    d: GraphDataType,
    isFrom: boolean
  ) => {
    if (typeof d.date === 'string') {
      return dayjs(d.date).format('M/D')
    } else {
      return d.date.map(date => dayjs(date).format('M/D'))[isFrom ? 0 : 1]
    }
  }

  private formatDateLabel = (date: string | string[]): string => {
    return (typeof date === 'string' ? [date] : date)
      .map(d => dayjs(d).format('M/D'))
      .join('～')
  }

  constructor() {
    super()

    const dailyData = this.buildChartData('daily-transition')
    if (dailyData) {
      this.chartDataSet.set('daily-transition', dailyData)
    }
    const weeklyData = this.buildChartData('weekly-transition')
    if (weeklyData) {
      this.chartDataSet.set('weekly-transition', weeklyData)
    }
    const dailyCumulative = this.buildChartData('daily-cumulative')
    if (dailyCumulative) {
      this.chartDataSet.set('daily-cumulative', dailyCumulative)
    }

    this.displaySpan = [
      this.chartData.rows.length - this.defaultSpan,
      this.chartData.rows.length - 1
    ]
  }

  private get displayGraphData(): GraphDataType[] {
    const chartData = this.chartData.rows
    const lowerIndex = this.displaySpan[0]
    const lower = lowerIndex < chartData.length ? lowerIndex : 0
    const upperIndex = this.displaySpan[1]
    const upper =
      upperIndex < chartData.length ? upperIndex : chartData.length - 1
    return chartData.slice(lower, upper + 1)
  }

  public sliderUpdate(sliderValue: number[]) {
    console.debug(`${this.constructor.name}:sliderUpdate.`, sliderValue)
    this.displaySpan = sliderValue
  }

  private readonly chartDataSet = new Map<string, ChartData>()
  private get chartData(): ChartData {
    const data = this.chartDataSet.get(this.dataKind)
    if (data) {
      return data
    } else {
      return {
        patientsLegendTitle: '',
        patientsUnit: '',
        averageLegendTitle: '',
        averageUnit: '',
        averageVisible: false,
        rows: [],
        sliderLabelFormatter: (_: GraphDataType, __: boolean) => ''
      } as ChartData
    }
  }

  @Watch('dataKind')
  onDataKindChanged(newValue: string, oldValue: string) {
    console.debug(
      `${this.constructor.name}:onDataKindChanged. new, old`,
      newValue,
      oldValue
    )

    this.displaySpan = [
      this.chartData.rows.length - this.defaultSpan,
      this.chartData.rows.length - 1
    ]
  }

  private buildChartData = (dataKind: DataKind): ChartData | null => {
    if (dataKind === 'daily-transition') {
      const today = dayjs()
      const rows = (this.dailyData ?? [])
        .filter(d => dayjs(d['日付']) < today)
        .map(d => {
          return {
            date: dayjs(d['日付']).format('YYYY-MM-DD'),
            numberOfPatients: Number(d['小計']),
            average7days: Number(d['平均'])
          } as GraphDataType
        })

      return {
        patientsLegendTitle: '陽性者数',
        patientsUnit: '人',
        averageLegendTitle: '7日間平均',
        averageUnit: '人',
        averageVisible: true,
        rows
      } as ChartData
    } else if (dataKind === 'daily-cumulative') {
      let subTotal = 0
      const today = dayjs()
      const rows = (this.dailyData ?? [])
        .filter(d => dayjs(d['日付']) < today)
        .map(d => {
          subTotal += Number(d['小計'])
          return {
            date: dayjs(d['日付']).format('YYYY-MM-DD'),
            numberOfPatients: subTotal,
            average7days: undefined
          } as GraphDataType
        })

      return {
        patientsLegendTitle: '陽性者累計数',
        patientsUnit: '人',
        averageLegendTitle: '',
        averageUnit: '',
        averageVisible: false,
        rows
      } as ChartData
    } else if (dataKind === 'weekly-transition') {
      const today = dayjs()
      const rows = (this.weeklyData ?? [])
        .filter(d => dayjs(d['開始日']) < today)
        .map(d => {
          return {
            date: [
              dayjs(d['開始日']).format('YYYY-MM-DD'),
              dayjs(d['終了日']).format('YYYY-MM-DD')
            ],
            numberOfPatients: Number(d['小計'])
          } as GraphDataType
        })

      return {
        patientsLegendTitle: '陽性者数',
        patientsUnit: '人',
        averageLegendTitle: '7日間平均',
        averageVisible: false,
        averageUnit: '',
        rows
      } as ChartData
    } else {
      return {
        patientsLegendTitle: '',
        patientsUnit: '',
        averageLegendTitle: '',
        averageUnit: '',
        rows: [],
        averageVisible: false
      } as ChartData
    }
  }
}
</script>

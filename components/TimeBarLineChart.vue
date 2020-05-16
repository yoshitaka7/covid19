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
      :label-formatter="chartData.sliderLabelFormatter"
      @sliderInput="sliderUpdate"
    />

    <template v-slot:infoPanel>
      <data-view-basic-info-panel
        :l-text="displayInfo.lText"
        :s-text="displayInfo.sText"
        :unit="displayInfo.unit"
      />
    </template>
  </data-view>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import DataView from '@/components/DataView.vue'
import DataSelector, { SelectorItem } from '@/components/DataSelector.vue'
import DataViewBasicInfoPanel from '@/components/DataViewBasicInfoPanel.vue'
import DateSelectSlider from '@/components/DateSelectSlider.vue'
import { PatientsSummaryDaily, PatientsSummaryWeekly } from '~/utils/types'

type DataKind = 'daily-transition' | 'weekly-transition'

type ChartData2 = {
  legendBarTitle: string
  legendLineTitle: string
  rows: GraphDataType2[]
  visibleAverage7days: boolean
  sliderLabelFormatter: (d: GraphDataType2, isFrom: boolean) => string
}

type GraphDataType2 = {
  date: string
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
export default class MyButton extends Vue {
  @Prop()
  public greet?: string

  @Prop()
  public date?: string

  @Prop()
  public dailyData?: PatientsSummaryDaily[]

  @Prop()
  public weeklyData?: PatientsSummaryWeekly[]

  private displayTitle = 'dispTitle'
  private titleId = 'title-idid'
  private url = 'urlurl'
  private remarks = ['dispTitle']
  private show = true
  private dataKind: DataKind = 'daily-transition'
  private readonly dataKinds = [
    { key: 'weekly-transition', label: '週別1' } as SelectorItem,
    { key: 'daily-transition', label: '日別2' } as SelectorItem
  ]

  private displayInfo = {
    lText: 'あ',
    sText: 'い',
    unit: 'う'
  }

  private chartId = 'id'
  get displayData(): Chart.ChartData {
    const datasets: Chart.ChartDataSets[] = [
      {
        type: 'bar',
        yAxisID: 'y-axis-1',
        label: this.chartData.legendBarTitle, // 凡例名
        data: this.displayGraphData.map(d => d.numberOfPatients),
        backgroundColor: '#bd3f4c',
        order: 2,
        lineTension: 0
      } as Chart.ChartDataSets
    ]

    if (this.chartData.visibleAverage7days) {
      datasets.push({
        type: 'line',
        yAxisID: 'y-axis-2',
        label: this.chartData.legendLineTitle, // 凡例名
        data: this.displayGraphData.map(d => d.average7days),
        borderColor: '#CC7004',
        borderWidth: 3,
        fill: false,
        order: 1,
        lineTension: 0
      })
    }

    return {
      labels: this.displayGraphData.map(d => dayjs(d.date).format('M/D')),
      datasets
    }
  }

  private get displayOption(): Chart.ChartOptions {
    return {
      tooltips: {
        displayColors: false,
        callbacks: {
          label(tooltipItem: any) {
            const labelText =
              parseInt(tooltipItem.value).toLocaleString() + 'unit'
            return labelText
          },
          title(tooltipItem: any, data: any) {
            return data.labels[tooltipItem[0].index].replace(
              /(\w+)\/(\w+)/g,
              '$1月$2日'
            )
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: true,
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
          },
          {
            id: 'y-axis-2',
            display: 'auto',
            position: 'right',
            gridLines: {
              display: true,
              drawOnChartArea: false,
              color: '#E5E5E5' // #E5E5E5
            },
            ticks: {
              suggestedMin: 0,
              maxTicksLimit: 8,
              fontColor: '#808080', // #808080
              // suggestedMax: this.scaledTicksYAxisMaxRight,
              callback(value: number) {
                return value + '%'
              }
            }
          }
        ]
      }
    }
  }

  private defaultSpan: number = 60
  private displaySpan: number[] = [0, 0]
  private spanMin: number = 0
  get spanMax(): number {
    return this.chartData.rows.length - 1
  }

  private sliderLabelFormatter = (d: any, _: any) => d.label

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

    this.displaySpan = [
      this.chartData.rows.length - this.defaultSpan,
      this.chartData.rows.length - 1
    ]
  }

  private get displayGraphData(): GraphDataType2[] {
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

  private readonly chartDataSet = new Map<string, ChartData2>()
  private get chartData(): ChartData2 {
    const data = this.chartDataSet.get(this.dataKind)
    if (data) {
      return data
    } else {
      return {
        legendBarTitle: '',
        legendLineTitle: '',
        rows: [],
        visibleAverage7days: false,
        sliderLabelFormatter: (_: GraphDataType2, __: boolean) => ''
      } as ChartData2
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

  private buildChartData(dataKind: DataKind): ChartData2 | null {
    if (dataKind === 'daily-transition') {
      const today = dayjs()
      const rows = (this.dailyData ?? [])
        .filter(d => dayjs(d['日付']) < today)
        .map(d => {
          return {
            date: dayjs(d['日付']).format('YYYY-MM-DD'),
            numberOfPatients: Number(d['小計']),
            average7days: Number(d['小計'])
          } as GraphDataType2
        })

      return {
        legendBarTitle: '陽性者数',
        legendLineTitle: '7日間平均',
        rows,
        visibleAverage7days: true,
        sliderLabelFormatter: (d: GraphDataType2, _: boolean) =>
          dayjs(d.date).format('M/D')
      } as ChartData2
    } else if (dataKind === 'weekly-transition') {
      const today = dayjs()
      const rows = (this.weeklyData ?? [])
        .filter(d => dayjs(d['開始日']) < today)
        .map(d => {
          return {
            date: dayjs(d['開始日']).format('YYYY-MM-DD'),
            numberOfPatients: Number(d['小計'])
          } as GraphDataType2
        })

      return {
        legendBarTitle: '陽性者数',
        legendLineTitle: '7日間平均',
        rows,
        visibleAverage7days: false,
        sliderLabelFormatter: (d: GraphDataType2, _: boolean) =>
          dayjs(d.date).format('M/D')
      } as ChartData2
    } else {
      return {
        legendBarTitle: '',
        legendLineTitle: '',
        rows: [],
        visibleAverage7days: false,
        sliderLabelFormatter: (_: GraphDataType2, __: boolean) => ''
      } as ChartData2
    }
  }

  public onClick() {
    alert(this.greet)
  }
}
</script>

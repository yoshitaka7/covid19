<template>
  <div>
    <bar
      :chart-id="chartId"
      :chart-data="displayData"
      :options="displayOption"
      :height="240"
    />

    <date-select-slider
      :chart-data="chartData.dates"
      :value="displaySpan"
      :min="spanMin"
      :max="spanMax"
      :label-formatter="sliderLabelFormatter"
      @sliderInput="sliderUpdate"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import DateSelectSlider from '@/components/DateSelectSlider.vue'

export type GraphKind = 'bar' | 'line'

export type YAxisKind = 'y-axis-left' | 'y-axis-right'

export type DateRange = string | string[]

export type GraphDataSet = {
  title: string
  type: GraphKind
  values: number[]
  unit: string
  color?: string
  yAxisKind?: YAxisKind
  visible?: boolean
  order?: number
}

export type GraphData = {
  dates: DateRange[]
  datasets: GraphDataSet[]
}

@Component({
  components: {
    DateSelectSlider
  }
})
export default class TimeBarLineChart extends Vue {
  @Prop()
  public chartId?: string

  @Prop()
  public chartData!: GraphData

  @Prop()
  public legendOrderDesc?: boolean

  private buildBarDataSets = (dataset: GraphDataSet): Chart.ChartDataSets => {
    return {
      type: 'bar',
      yAxisID: dataset.yAxisKind ?? 'y-axis-left',
      label: dataset.title, // 凡例名
      data: dataset.values,
      backgroundColor: dataset.color ?? '#bd3f4c',
      order: dataset.order ?? 0,
      lineTension: 0
    }
  }

  private buildLineDataSets = (dataset: GraphDataSet): Chart.ChartDataSets => {
    return {
      type: 'line',
      yAxisID: dataset.yAxisKind ?? 'y-axis-left',
      label: dataset.title, // 凡例名
      data: dataset.values,
      borderColor: dataset.color ?? '#0070C0',
      borderWidth: 3,
      pointRadius: 0,
      pointHitRadius: 1,
      fill: false,
      order: dataset.order ?? 0,
      lineTension: 0
    }
  }

  get displayData(): Chart.ChartData {
    const datasets = this.displayGraphValues.map(dataset => {
      if (dataset.type === 'bar') {
        return this.buildBarDataSets(dataset)
      } else {
        return this.buildLineDataSets(dataset)
      }
    })

    return {
      labels: this.displayGraphLabels,
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
            if (tooltipItem.index === undefined) {
              return ''
            }

            return this.chartData.datasets
              .map((dataset, index) => {
                const value = (chartData.datasets![index].data as number[])[
                  tooltipItem.index!
                ]
                const label = dataset.title
                const unit = dataset.unit

                const formatValue = (x => {
                  if (x === Math.floor(x)) {
                    return x
                  } else {
                    return Math.round(x * 10) / 10
                  }
                })(value)

                return {
                  label: `${label}: ${formatValue} ${unit}`,
                  visible: dataset.visible ?? true
                }
              })
              .filter(d => d.visible)
              .map(d => d.label)
          },
          title: (tooltipItems: Chart.ChartTooltipItem[]) => {
            try {
              const date = this.chartData.dates[tooltipItems[0].index!]

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
        display:
          this.chartData.datasets.filter(d => d.visible ?? true).length > 1,
        reverse: this.legendOrderDesc ?? true
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
            id: 'y-axis-left',
            stacked: true,
            gridLines: {
              display: true,
              color: '#E5E5E5'
            },
            ticks: {
              suggestedMin: 0,
              maxTicksLimit: 8,
              fontColor: '#808080',
              callback: (value: any) => {
                // console.debug('value: any, index: any, values: any', value, index, values)
                return value
              }
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
    return this.chartData.dates.length - 1
  }

  private readonly sliderLabelFormatter = (
    date: DateRange,
    isFrom: boolean
  ) => {
    if (!date) {
      return ''
    } else if (typeof date === 'string') {
      return dayjs(date).format('M/D')
    } else {
      return date.map(date => dayjs(date).format('M/D'))[isFrom ? 0 : 1]
    }
  }

  private formatDateLabel = (date: string | string[]): string => {
    return (typeof date === 'string' ? [date] : date)
      .map(d => dayjs(d).format('M/D'))
      .join('～')
  }

  constructor() {
    super()

    this.displaySpan = [
      this.chartData.dates.length - this.defaultSpan,
      this.chartData.dates.length - 1
    ]
  }

  private get displayGraphLabels(): string[] {
    const chartData = this.chartData.dates
    const lowerIndex = this.displaySpan[0]
    const lower = lowerIndex < chartData.length ? lowerIndex : 0
    const upperIndex = this.displaySpan[1]
    const upper =
      upperIndex < chartData.length ? upperIndex : chartData.length - 1

    const spanedDates = this.chartData.dates.slice(lower, upper + 1)

    return spanedDates.map(date => this.formatDateLabel(date))
  }

  private get displayGraphValues(): GraphDataSet[] {
    const chartData = this.chartData.dates
    const lowerIndex = this.displaySpan[0]
    const lower = lowerIndex < chartData.length ? lowerIndex : 0
    const upperIndex = this.displaySpan[1]
    const upper =
      upperIndex < chartData.length ? upperIndex : chartData.length - 1

    return this.chartData.datasets
      .filter(d => d.visible ?? true)
      .map(dataset => {
        const cloned = Object.assign({}, dataset)
        cloned.values = dataset.values.slice(lower, upper + 1)
        return cloned
      })
  }

  public sliderUpdate(sliderValue: number[]) {
    // console.debug(`${this.constructor.name}:sliderUpdate.`, sliderValue)
    this.displaySpan = sliderValue
  }

  @Watch('chartData')
  onChartDataChanged(newValue: GraphData, _: GraphData) {
    // console.debug(
    //   `${this.constructor.name}:onDataKindChanged. new, old`,
    //   newValue,
    //   oldValue
    // )

    this.displaySpan = [
      newValue.dates.length - this.defaultSpan,
      newValue.dates.length - 1
    ]
  }
}
</script>

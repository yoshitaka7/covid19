<template>
  <data-view
    :title="title"
    :title-id="titleId"
    :date="date"
    :url="url"
    :remarks="remarks"
  >
    <template v-if="show" v-slot:button>
      <data-selector v-model="dataKind" />
    </template>
    <bar
      :chart-id="chartId"
      :chart-data="displayData"
      :options="displayOption"
      :height="240"
    />
    <date-select-slider
      :chart-data="chartData2"
      :value="displaySpan"
      :min="spanMin"
      :max="spanMax"
      :labeler="sliderLabeler"
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

<style></style>

<script>
import DataView from '@/components/DataView.vue'
import DataSelector from '@/components/DataSelector.vue'
import DataViewBasicInfoPanel from '@/components/DataViewBasicInfoPanel.vue'
import DateSelectSlider from '@/components/DateSelectSlider.vue'
// import { chunkByWeek, reduceGraph } from '@/utils/formatGraph'

export default {
  components: {
    DataView,
    DataSelector,
    DataViewBasicInfoPanel,
    DateSelectSlider
  },
  props: {
    title: {
      type: String,
      required: false,
      default: ''
    },
    titleId: {
      type: String,
      required: false,
      default: ''
    },
    chartId: {
      type: String,
      required: false,
      default: 'time-bar-chart'
    },
    chartData: {
      type: Array,
      required: false,
      default: () => []
    },
    chartDataWeekly: {
      type: Array,
      required: false,
      default: () => []
    },
    date: {
      type: String,
      required: true,
      default: ''
    },
    defaultDataKind: {
      type: String,
      required: false,
      default: 'daily-transition'
    },
    defaultSpan: {
      type: Number,
      required: false,
      default: 60
    },
    unit: {
      type: String,
      required: false,
      default: ''
    },
    url: {
      type: String,
      required: false,
      default: ''
    },
    remarks: {
      type: Array,
      required: false,
      default: () => []
    },
    show: {
      type: Boolean,
      required: false,
      default: true
    },
    transitionLabel: {
      type: String,
      required: false,
      default: '実績値'
    },
    cumulativeLabel: {
      type: String,
      required: false,
      default: '累計値'
    }
  },
  data() {
    const chartData = this.chartDataWeekly
    const displaySpanLower = !chartData
      ? 0
      : chartData.length - this.defaultSpan
    const displaySpanUpper = !chartData ? 0 : this.chartData.length - 1
    console.debug('[displaySpanLower, displaySpanUpper]', [
      displaySpanLower,
      displaySpanUpper
    ])
    return {
      dataKind: this.defaultDataKind,
      displaySpanInner: [displaySpanLower, displaySpanUpper]
    }
  },
  computed: {
    displaySpan: {
      get() {
        return this.displaySpanInner
      },
      set(value) {
        this.displaySpanInner = value
      }
    },
    spanKind() {
      // daily or weekly
      return this.dataKind.substring(0, this.dataKind.indexOf('-'))
    },
    valueKind() {
      // transition or cumulative
      return this.dataKind.substring(this.dataKind.indexOf('-') + 1)
    },
    chartDataSet() {
      const chartDataSet = {
        daily: {
          data: this.chartData,
          diffLabel: '前日比',
          sliderLabeler: (x, _) => x.label
        },
        weekly: {
          data: this.chartDataWeekly,
          diffLabel: '前週比',
          sliderLabeler: (x, isFrom) => {
            const index = x.label.indexOf('～')
            return isFrom
              ? x.label.substring(0, index)
              : x.label.substring(index + 1)
          }
        }
        // 'cumulative': {
        //   data: this.chartDataWeekly
        // },
      }

      return chartDataSet
    },
    spanMin() {
      return 0
    },
    spanMax() {
      return this.chartData2.length - 1
    },
    chartData2() {
      return this.chartDataSet[this.spanKind].data
    },
    sliderLabeler() {
      return this.chartDataSet[this.spanKind].sliderLabeler
    },
    displayChartData() {
      const chartData = this.chartData2
      if (!chartData) return this.chartData

      const lowerIndex = this.displaySpan[0]
      const lower = lowerIndex < chartData.length ? lowerIndex : 0
      const upperIndex = this.displaySpan[1]
      const upper =
        upperIndex < chartData.length ? upperIndex : chartData.length - 1
      return chartData.slice(lower, upper + 1)
    },
    displayCumulativeRatio() {
      const chartData = this.chartData2
      console.debug('chartData1', chartData)
      const lastDay = chartData.slice(-1)[0].cumulative
      const lastDayBefore = chartData.slice(-2)[0].cumulative
      return this.formatDayBeforeRatio(lastDay - lastDayBefore)
    },
    displayTransitionRatio() {
      const chartData = this.chartData2
      console.debug('displayTransitionRatio chartData2', chartData)
      if (chartData.slice(-2)[0].novalue) {
        return '-'
      }
      const lastDay = chartData.slice(-1)[0].transition
      const lastDayBefore = chartData.slice(-2)[0].transition
      return this.formatDayBeforeRatio(lastDay - lastDayBefore)
    },
    displayInfo() {
      const chart = this.chartDataSet[this.spanKind]
      const latestData = chart.data[chart.data.length - 1]
      const diffValueText =
        this.valueKind === 'transition'
          ? this.displayTransitionRatio
          : this.displayCumulativeRatio
      const valueLabel =
        this.valueKind === 'transition'
          ? this.transitionLabel
          : this.cumulativeLabel

      return {
        lText: `${latestData.transition.toLocaleString()}`,
        sText: `${latestData.label} ${valueLabel}（${chart.diffLabel}：${diffValueText} ${this.unit}）`,
        unit: this.unit
      }
    },
    displayData() {
      // if (this.dataKind === 'weekly-transition') {
      //   // const summarized = this.displayChartData.filter(d => d.summarized)
      //   // const noneSummarized = this.displayChartData.filter(d => !d.summarized)
      //   // const noneSummarizedChunks = chunkByWeek(noneSummarized, 1)
      //   // const noneSummarizedReducedChunks = noneSummarizedChunks.map(chunk =>
      //   //   reduceGraph(chunk, false)
      //   // )
      //   // const chartData = summarized.concat(noneSummarizedReducedChunks)
      //   const chartData = this.chartDataWeekly
      //   return {
      //     labels: chartData.map(d => {
      //       return d.label
      //     }),
      //     datasets: [
      //       {
      //         label: this.dataKind,
      //         data: chartData.map(d => {
      //           return d.transition
      //         }),
      //         backgroundColor: chartData.map(d => {
      //           return d.summarized ? '#1976d2' : '#bd3f4c'
      //         }),
      //         borderWidth: 0
      //       }
      //     ]
      //   }
      // }
      // if (this.dataKind === 'daily-transition') {
      //   return {
      //     labels: this.displayChartData.map(d => {
      //       return d.label
      //     }),
      //     datasets: [
      //       {
      //         label: this.dataKind,
      //         data: this.displayChartData.map(d => {
      //           return d.transition
      //         }),
      //         backgroundColor: this.displayChartData.map(d => {
      //           return d.summarized ? '#1976d2' : '#bd3f4c'
      //         }),
      //         borderWidth: 0
      //       }
      //     ]
      //   }
      // }

      const valueF =
        this.valueKind === 'transition' ? d => d.transition : d => d.cumulative

      return {
        labels: this.displayChartData.map(d => {
          return d.label
        }),
        datasets: [
          {
            label: this.dataKind,
            data: this.displayChartData.map(d => {
              return valueF(d)
            }),
            backgroundColor: '#bd3f4c',
            borderWidth: 0
          }
        ]
      }
    },
    displayOption() {
      const unit = this.unit
      return {
        tooltips: {
          displayColors: false,
          callbacks: {
            label(tooltipItem) {
              const labelText =
                parseInt(tooltipItem.value).toLocaleString() + unit
              return labelText
            },
            title(tooltipItem, data) {
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
          display: false
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
                // maxRotation: 0,
                // minRotation: 0,
                // callback: label => {
                //   return label.split('/')[1]
                // }
              }
            }
            // {
            //   id: 'month',
            //   stacked: true,
            //   gridLines: {
            //     drawOnChartArea: false,
            //     drawTicks: true,
            //     drawBorder: false,
            //     tickMarkLength: 10
            //   },
            //   ticks: {
            //     fontSize: 11,
            //     fontColor: '#808080',
            //     padding: 3,
            //     fontStyle: 'bold',
            //     gridLines: {
            //       display: true
            //     },
            //     callback: label => {
            //       const monthStringArry = [
            //         'Jan',
            //         'Feb',
            //         'Mar',
            //         'Apr',
            //         'May',
            //         'Jun',
            //         'Jul',
            //         'Aug',
            //         'Sep',
            //         'Oct',
            //         'Nov',
            //         'Dec'
            //       ]
            //       const month = monthStringArry.indexOf(label.split(' ')[0]) + 1
            //       return month + '月'
            //     }
            //   },
            //   type: 'time',
            //   time: {
            //     parser: 'M/D',
            //     unit: 'month'
            //   }
            // }
          ],
          yAxes: [
            {
              location: 'bottom',
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
  },
  watch: {
    dataKind(newVal) {
      console.debug('watch dataKind', newVal)

      const chartData = this.chartData2
      const displaySpanLower = !chartData
        ? 0
        : chartData.length - this.defaultSpan
      const displaySpanUpper = !chartData ? 0 : this.chartData.length - 1
      console.debug('[displaySpanLower, displaySpanUpper]', [
        displaySpanLower,
        displaySpanUpper
      ])
      this.sliderUpdate([displaySpanLower, displaySpanUpper])
    }
  },
  methods: {
    sliderUpdate(sliderValue) {
      console.debug(
        'sliderUpdate [displaySpanLower, displaySpanUpper]',
        sliderValue
      )
      this.displaySpan = sliderValue
    },
    formatDayBeforeRatio(dayBeforeRatio) {
      const dayBeforeRatioLocaleString = dayBeforeRatio.toLocaleString()
      switch (Math.sign(dayBeforeRatio)) {
        case 1:
          return `+${dayBeforeRatioLocaleString}`
        case -1:
          return `${dayBeforeRatioLocaleString}`
        default:
          return `${dayBeforeRatioLocaleString}`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
ul.remarks {
  list-style-type: '※ ';
}
</style>

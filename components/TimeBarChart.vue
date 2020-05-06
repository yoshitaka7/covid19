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
      :chart-data="chartData"
      :value="defaultDisplaySpan"
      :min="spanMin"
      :max="spanMax"
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
import { chunkByWeek, reduceGraph } from '@/utils/formatGraph'

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
    }
  },
  data() {
    const displaySpanLower = !this.chartData
      ? 0
      : this.chartData.length - this.defaultSpan
    const displaySpanUpper = !this.chartData ? 0 : this.chartData.length - 1
    return {
      dataKind: this.defaultDataKind,
      defaultDisplaySpan: [displaySpanLower, displaySpanUpper],
      displaySpan: [displaySpanLower, displaySpanUpper]
    }
  },
  computed: {
    spanMin() {
      return 0
    },
    spanMax() {
      return this.chartData.length - 1
    },
    displayChartData() {
      if (!this.chartData) return this.chartData

      const lowerIndex = this.displaySpan[0]
      const lower = lowerIndex < this.chartData.length ? lowerIndex : 0
      const upperIndex = this.displaySpan[1]
      const upper =
        upperIndex < this.chartData.length
          ? upperIndex
          : this.chartData.length - 1
      return this.chartData.slice(lower, upper + 1)
    },
    displayCumulativeRatio() {
      const lastDay = this.chartData.slice(-1)[0].cumulative
      const lastDayBefore = this.chartData.slice(-2)[0].cumulative
      return this.formatDayBeforeRatio(lastDay - lastDayBefore)
    },
    displayTransitionRatio() {
      if (this.chartData.slice(-2)[0].novalue) {
        return '-'
      }
      const lastDay = this.chartData.slice(-1)[0].transition
      const lastDayBefore = this.chartData.slice(-2)[0].transition
      return this.formatDayBeforeRatio(lastDay - lastDayBefore)
    },
    displayInfo() {
      if (this.dataKind === 'weekly-transition') {
        const summarized = this.chartData.filter(d => d.summarized)
        const noneSummarized = this.chartData.filter(d => !d.summarized)
        const noneSummarizedChunks = chunkByWeek(noneSummarized, 1)
        const noneSummarizedReducedChunks = noneSummarizedChunks.map(chunk =>
          reduceGraph(chunk, false)
        )
        const chartData = summarized.concat(noneSummarizedReducedChunks)
        return {
          lText: `${chartData.slice(-1)[0].transition.toLocaleString()}`,
          sText: `${chartData.slice(-1)[0].label} ${
            this.transitionLabel
          }（前週比：${this.displayTransitionRatio} ${this.unit}）`,
          unit: this.unit
        }
      }
      if (this.dataKind === 'daily-transition') {
        return {
          lText: `${this.chartData.slice(-1)[0].transition.toLocaleString()}`,
          sText: `${this.chartData.slice(-1)[0].label} ${
            this.transitionLabel
          }（前日比：${this.displayTransitionRatio} ${this.unit}）`,
          unit: this.unit
        }
      }
      return {
        lText: this.chartData[
          this.chartData.length - 1
        ].cumulative.toLocaleString(),
        sText: `${this.chartData.slice(-1)[0].label} 累計値（前日比：${
          this.displayCumulativeRatio
        } ${this.unit}）`,
        unit: this.unit
      }
    },
    displayData() {
      if (this.dataKind === 'weekly-transition') {
        const summarized = this.displayChartData.filter(d => d.summarized)
        const noneSummarized = this.displayChartData.filter(d => !d.summarized)
        const noneSummarizedChunks = chunkByWeek(noneSummarized, 1)
        const noneSummarizedReducedChunks = noneSummarizedChunks.map(chunk =>
          reduceGraph(chunk, false)
        )
        const chartData = summarized.concat(noneSummarizedReducedChunks)
        return {
          labels: chartData.map(d => {
            return d.label
          }),
          datasets: [
            {
              label: this.dataKind,
              data: chartData.map(d => {
                return d.transition
              }),
              backgroundColor: chartData.map(d => {
                return d.summarized ? '#1976d2' : '#bd3f4c'
              }),
              borderWidth: 0
            }
          ]
        }
      }
      if (this.dataKind === 'daily-transition') {
        return {
          labels: this.displayChartData.map(d => {
            return d.label
          }),
          datasets: [
            {
              label: this.dataKind,
              data: this.displayChartData.map(d => {
                return d.transition
              }),
              backgroundColor: this.displayChartData.map(d => {
                return d.summarized ? '#1976d2' : '#bd3f4c'
              }),
              borderWidth: 0
            }
          ]
        }
      }
      return {
        labels: this.displayChartData.map(d => {
          return d.label
        }),
        datasets: [
          {
            label: this.dataKind,
            data: this.displayChartData.map(d => {
              return d.cumulative
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
                /(\w+)\/(\w+)/,
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
                fontColor: '#808080',
                maxRotation: 0,
                minRotation: 0,
                callback: label => {
                  return label.split('/')[1]
                }
              }
            },
            {
              id: 'month',
              stacked: true,
              gridLines: {
                drawOnChartArea: false,
                drawTicks: true,
                drawBorder: false,
                tickMarkLength: 10
              },
              ticks: {
                fontSize: 11,
                fontColor: '#808080',
                padding: 3,
                fontStyle: 'bold',
                gridLines: {
                  display: true
                },
                callback: label => {
                  const monthStringArry = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec'
                  ]
                  const month = monthStringArry.indexOf(label.split(' ')[0]) + 1
                  return month + '月'
                }
              },
              type: 'time',
              time: {
                parser: 'M/D',
                unit: 'month'
              }
            }
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
  methods: {
    sliderUpdate(sliderValue) {
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

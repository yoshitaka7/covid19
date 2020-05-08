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
      :chart-data="activeChartSet.data"
      :value="displaySpan"
      :min="spanMin"
      :max="spanMax"
      :label-formatter="activeChartSet.sliderLabelFormatter"
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
    chartDataSet: {
      type: Object,
      required: true,
      default: () => {}
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
    }
  },
  data() {
    const update = this.getSliderUpdate(
      this.chartDataSet[this.defaultDataKind]?.data
    )
    return {
      dataKind: this.defaultDataKind,
      displaySpanInner: update
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
    spanMin() {
      return 0
    },
    spanMax() {
      return this.activeChartSet?.data ? this.activeChartSet.data.length - 1 : 0
    },
    activeChartSet() {
      return this.chartDataSet[this.dataKind]
    },
    displayChartData() {
      const chartData = this.activeChartSet.data
      const lowerIndex = this.displaySpan[0]
      const lower = lowerIndex < chartData.length ? lowerIndex : 0
      const upperIndex = this.displaySpan[1]
      const upper =
        upperIndex < chartData.length ? upperIndex : chartData.length - 1
      return chartData.slice(lower, upper + 1)
    },
    displayDiffValue() {
      const chart = this.activeChartSet
      const chartData = chart.data
      if (chartData.slice(-2)[0].novalue) {
        return '-'
      }
      const lastDay = chartData.slice(-1)[0][chart.valueField]
      const lastDayBefore = chartData.slice(-2)[0][chart.valueField]
      return this.formatDayBeforeRatio(lastDay - lastDayBefore)
    },
    displayInfo() {
      const chartSet = this.activeChartSet
      const latestData = chartSet.data.slice(-1)[0]
      const latestValueText = latestData[chartSet.valueField].toLocaleString()
      const diffValueText = this.displayDiffValue
      return {
        lText: latestValueText,
        sText: `${latestData.label} ${chartSet.latestLabel}（${chartSet.diffLabel}：${diffValueText} ${chartSet.valueUnit}）`,
        unit: chartSet.valueUnit
      }
    },
    displayData() {
      const valueField = this.activeChartSet.valueField
      const getValue = d => d[valueField]

      return {
        labels: this.displayChartData.map(d => {
          return d.label
        }),
        datasets: [
          {
            label: this.dataKind,
            data: this.displayChartData.map(d => {
              return getValue(d)
            }),
            backgroundColor: '#bd3f4c',
            borderWidth: 0
          }
        ]
      }
    },
    displayOption() {
      const unit = this.activeChartSet.valueUnit
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
  watch: {
    dataKind(_) {
      const update = this.getSliderUpdate(this.activeChartSet.data)
      this.sliderUpdate(update)
    }
  },
  methods: {
    sliderUpdate(sliderValue) {
      this.displaySpan = sliderValue
    },
    formatDayBeforeRatio(dayBeforeRatio) {
      const dayBeforeRatioLocaleString = dayBeforeRatio.toLocaleString()
      const prefix = Math.sign(dayBeforeRatio) === 1 ? '+' : ''
      return `${prefix}${dayBeforeRatioLocaleString}`
    },
    getSliderUpdate(chartData) {
      if (!chartData) {
        return [0, 0]
      }

      return [chartData.length - this.defaultSpan, chartData.length - 1]
    }
  }
}
</script>

<style lang="scss" scoped>
ul.remarks {
  list-style-type: '※ ';
}
</style>

<template>
  <data-view
    :title="displayTitle"
    title-id="inspection-count-chart"
    :date="date"
    url="https://www.pref.aichi.jp/site/covid19-aichi/kansensya-kensa.html"
    :remarks="remarks"
  >
    <template v-if="showSelector" v-slot:button>
      <data-selector v-model="dataKind" :items="dataKinds" />
    </template>

    <time-bar-line-chart
      chart-id="inspection-count-chart"
      :chart-data="chartData"
      :legend-order-desc="true"
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
import { Component, Vue, Prop } from 'vue-property-decorator'
import dayjs from 'dayjs'
import * as Enumerable from 'linq'
import DataView from '@/components/DataView.vue'
import DataSelector, { SelectorItem } from '@/components/DataSelector.vue'
import DataViewBasicInfoPanel from '@/components/DataViewBasicInfoPanel.vue'
import DateSelectSlider from '@/components/DateSelectSlider.vue'
import TimeBarLineChart, { GraphData } from '@/components/TimeBarLineChart.vue'
import {
  InspectionsSummaryWeekly,
  InspectionPersonsSummaryDaily
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
export default class InspectionPersonsChart extends Vue {
  @Prop()
  public date?: string

  @Prop()
  public dailyData?: InspectionPersonsSummaryDaily[]

  @Prop()
  public weeklyData?: InspectionsSummaryWeekly[]

  private readonly remarks = [
    '日別と累計では、日別データが公開されている期間のみ表示',
    '愛知県分（愛知県衛生研究所等）及び保健所設置市分（名古屋市衛生研究所等）の合計',
    '民間施設等の検査件数及び陽性者数を含んでいます（発表時点での把握数）'
  ]

  private readonly showSelector = true
  private dataKind: DataKind = 'daily-transition'
  private readonly dataKinds = [
    { key: 'weekly-transition', label: '週別' } as SelectorItem,
    { key: 'daily-transition', label: '日別' } as SelectorItem
  ]

  private readonly chartDataSet = new Map<DataKind, GraphData>()

  private get displayTitle(): string {
    return `検査実施人数${
      this.dataKind === 'weekly-transition' ? '(週別)' : ''
    }`
  }

  private formatDayBeforeRatio = (dayBeforeRatio: any) => {
    const dayBeforeRatioLocaleString = dayBeforeRatio?.toLocaleString() ?? '-'
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
    const latestValueText = dataset.values.slice(-1)[0]?.toLocaleString() ?? '-'
    const diffLabel =
      this.dataKind === 'weekly-transition' ? '前週比' : '前日比'
    const latestDate = this.formatDateLabel(this.chartData.dates.slice(-1)[0])
    return {
      lText: latestValueText,
      sText: `${latestDate} 時点（${diffLabel}：${this.displayDiffValue} ${dataset.unit}）`,
      unit: dataset.unit
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
    this.chartDataSet.set(
      'weekly-transition',
      this.buildWeeklyTransitionGraphData()
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
    const now = dayjs()
    const rows = Enumerable.from(this.dailyData ?? [])
      .where(d => dayjs(d['日付']) < now)
      .select(d => {
        let negatives: number | undefined
        if (d['検査人数'] !== undefined && d['陽性者数'] !== undefined) {
          negatives = d['検査人数'] - d['陽性者数']
        }

        return {
          date: dayjs(d['日付']).format('YYYY-MM-DD'),
          persons: d['検査人数'],
          positives: d['陽性者数'],
          negatives
        }
      })

    return {
      dates: rows.select(d => d.date).toArray(),
      datasets: [
        {
          type: 'bar',
          title: '陽性者数',
          unit: '人',
          values: rows.select(d => d.positives).toArray(),
          order: 1
        },
        {
          type: 'bar',
          title: '検査人数',
          unit: '人',
          values: rows.select(d => d.negatives).toArray(),
          tooltipValues: rows.select(d => d.persons).toArray(),
          color: '#D99694',
          order: 2
        }
      ]
    } as GraphData
  }

  private buildWeeklyTransitionGraphData = (): GraphData => {
    const now = dayjs()
    const rows = Enumerable.from(this.weeklyData ?? [])
      .where(
        d =>
          dayjs(d['開始日']) < now && dayjs(d['開始日']) >= dayjs('2020-03-02')
      )
      .select(d => {
        return {
          date: [
            dayjs(d['開始日']).format('YYYY-MM-DD'),
            dayjs(d['終了日']).format('YYYY-MM-DD')
          ],
          count: Number(d['小計'])
        }
      })

    return {
      dates: rows.select(d => d.date).toArray(),
      datasets: [
        {
          type: 'bar',
          title: '陽性者数',
          unit: '人',
          values: rows.select(d => d.count).toArray()
        }
      ]
    } as GraphData
  }
}
</script>

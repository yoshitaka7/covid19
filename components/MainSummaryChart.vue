<template>
  <data-view
    title="検査陽性者状況の推移"
    title-id="new-patients-chart"
    :date="date"
    url="https://www.pref.aichi.jp/site/covid19-aichi/"
    :remarks="remarks"
  >
    <template v-if="showSelector" v-slot:button>
      <data-selector v-model="dataKind" :items="dataKinds" />
    </template>

    <div style="flex-grow: 1; display: flex; align-items: start;">
      <time-bar-line-chart
        chart-id="new-patients-chart"
        :chart-data="chartData"
        legend-order-kind="asc"
      />
    </div>

    <template v-slot:infoPanel>
      <data-view-basic-info-panel
        :l-title="displayInfo.lTitle"
        :l-text="displayInfo.lText"
        :s-text="displayInfo.sText"
        :unit="displayInfo.unit"
      />
    </template>
  </data-view>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import dayjs from 'dayjs'
import * as Enumerable from 'linq'
import DataView from '@/components/DataView.vue'
import DataSelector, { SelectorItem } from '@/components/DataSelector.vue'
import DataViewBasicInfoPanel from '@/components/DataViewBasicInfoPanel.vue'
import DateSelectSlider from '@/components/DateSelectSlider.vue'
import TimeBarLineChart, { GraphData } from '@/components/TimeBarLineChart.vue'
import { MainSummaryDataType } from '~/utils/types'

type DataKind = 'daily-transition' | 'weekly-transition' | 'daily-cumulative'

type DisplayInfo = {
  lTitle: string
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
export default class MainSummaryChart extends Vue {
  @Prop()
  public date?: string

  @Prop()
  public dailyData?: MainSummaryDataType[]

  private readonly remarks = [
    '愛知県が発表した「検査陽性者の状況」を当サイトで記録・時系列化したものであり、実際の数値とは異なる可能性があります',
    '検査陽性者状況が取得できなかった日の値は表示していません',
    '凡例をクリックするとその項目の[表示/非表示]が切り替えられます',
    '7月24日より、[軽症中等症]が[軽症無症状]と[中等症]に分割されました'
  ]

  private readonly showSelector = false
  private readonly dataKind: DataKind = 'daily-transition'
  private readonly dataKinds = [
    { key: 'daily-transition', label: '日別' } as SelectorItem
  ]

  private readonly chartDataSet = new Map<DataKind, GraphData>()

  private formatDayBeforeRatio = (dayBeforeRatio: any) => {
    const dayBeforeRatioLocaleString = dayBeforeRatio.toLocaleString()
    const prefix = Math.sign(dayBeforeRatio) === 1 ? '+' : ''
    return `${prefix}${dayBeforeRatioLocaleString}`
  }

  private get displayDiffValue(): string {
    const dataset = this.chartData.datasets.slice(-1)[0]
    if (dataset.values.slice(-2)[0] === undefined) {
      return '-'
    }
    const lastDay = dataset.values.slice(-1)[0]
    const lastDayBefore = dataset.values.slice(-2)[0]
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

    const dataset = this.chartData.datasets.slice(-1)[0]
    const latestValueText = dataset.values.slice(-1)[0]?.toLocaleString() ?? ''
    const diffLabel =
      this.dataKind === 'weekly-transition' ? '前週比' : '前日比'
    const latestDate = this.formatDateLabel(this.chartData.dates.slice(-1)[0])
    return {
      lTitle: '退院',
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
    const today = dayjs()
    const rows = Enumerable.from(this.dailyData ?? [])
      .where(d => dayjs(d['更新日時']) < today)
      .select(d => {
        if (dayjs(d['更新日時']) < dayjs('2020-07-27 23:59:59')) {
          // 入院等分割前(～7/27)は、５個の全積み上げで、症状の軽い順で下から
          // 「退院等」「施設入所」「軽症中等症」「重症」「死亡」
          return {
            date: dayjs(d['更新日時']).format('YYYY-MM-DD'),

            discharged: Number(d['退院']) + Number(d['転院']), // 退院等
            isolated: Number(d['施設入所']),
            milds:
              Number(d['軽症中等症'] + d['軽症無症状']) + Number(d['中等症']),
            severes: Number(d['重症']),
            deaths: Number(d['死亡']),

            moderate: undefined, // 中等症
            asymptomatic: undefined, // 軽症無症状
            hospital_suspend: undefined, // 入院調整
            home: undefined, // 自宅療養
            suspend: undefined // 調整
          }
        } else {
          // 現時点(7/28～)は、９個の全積み上げで、症状の軽い順で下から
          // 「退院等」「施設入所」「自宅療養」「調整」「入院調整」「軽症無症状」「中等症」「重症」「死亡」
          return {
            date: dayjs(d['更新日時']).format('YYYY-MM-DD'),

            discharged: Number(d['退院']) + Number(d['転院']), // 退院等
            isolated: Number(d['施設入所']),
            home: Number(d['自宅療養']),
            suspend: Number(d['調整']),
            hospital_suspend: Number(d['入院調整']),
            asymptomatic:
              Number(d['入院']) - Number(d['重症']) - Number(d['中等症']),
            moderate: Number(d['中等症']),
            severes: Number(d['重症']),
            deaths: Number(d['死亡']),

            milds: undefined // 軽症中等症
          }
        }
      })
    return {
      dates: rows.select(d => d.date).toArray(),
      datasets: [
        {
          type: 'bar',
          title: '死亡',
          color: '#984807',
          unit: '人',
          values: rows.select(d => d.deaths).toArray(),
          order: 10
        },
        {
          type: 'bar',
          title: '重症',
          color: '#D99694',
          unit: '人',
          values: rows.select(d => d.severes).toArray(),
          order: 9
        },
        {
          type: 'bar',
          title: '中等症',
          color: '#E6C79A',
          unit: '人',
          values: rows.select(d => d.moderate).toArray(),
          order: 8
        },
        {
          type: 'bar',
          title: '軽症無症状',
          color: '#FEE4AA',
          unit: '人',
          values: rows.select(d => d.asymptomatic).toArray(),
          order: 7
        },
        {
          type: 'bar',
          title: '入院調整',
          color: '#7f7f7f',
          unit: '人',
          values: rows.select(d => d.hospital_suspend).toArray(),
          order: 6
        },
        {
          type: 'bar',
          title: '調整',
          color: '#bfbfbf',
          unit: '人',
          values: rows.select(d => d.suspend).toArray(),
          order: 5
        },
        {
          type: 'bar',
          title: '自宅療養',
          color: '#04cc90',
          unit: '人',
          values: rows.select(d => d.home).toArray(),
          order: 4
        },
        {
          type: 'bar',
          title: '軽症中等症',
          color: '#FCD5B5',
          unit: '人',
          values: rows.select(d => d.milds).toArray(),
          order: 3
        },
        {
          type: 'bar',
          title: '施設入所',
          color: '#92D050',
          unit: '人',
          values: rows.select(d => d.isolated).toArray(),
          order: 2
        },
        {
          type: 'bar',
          title: '退院等',
          color: '#0070C0',
          unit: '人',
          values: rows.select(d => d.discharged).toArray(),
          order: 1
        }
      ]
    } as GraphData
  }
}
</script>

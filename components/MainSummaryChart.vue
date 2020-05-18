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

    <time-bar-line-chart
      chart-id="new-patients-chart"
      :chart-data="chartData"
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
        :l-title="displayInfo.lTitle"
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
    '愛知県が発表した「検査陽性者の状況」を当プロジェクトで記録・時系列化したものであり、実際の数値とは異なる可能性があります',
    '[不定]は、感染症発生状況が取得できなかった日です（陽性者数累計を表示します）',
    '凡例をクリックするとその項目の[表示/非表示]が切り替えられます'
  ]

  private readonly showSelector = true
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
    const dataset = this.chartData.datasets[1]
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

    const dataset = this.chartData.datasets[1]
    const latestValueText = dataset.values.slice(-1)[0].toLocaleString()
    const diffLabel =
      this.dataKind === 'weekly-transition' ? '前週比' : '前日比'
    const latestDate = this.formatDateLabel(this.chartData.dates.slice(-1)[0])
    return {
      lTitle: '退院数',
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
    const rows = (this.dailyData ?? [])
      .filter(d => dayjs(d['更新日時']) < today)
      .map(d => {
        return {
          date: dayjs(d['更新日時']).format('YYYY-MM-DD'),
          milds: Number(d['軽症中等症']),
          severes: Number(d['重症']),
          isolated: Number(d['施設入所']),
          transfered: Number(d['転院']),
          deaths: Number(d['死亡']),
          discharged: Number(d['退院'])
        }
      })

    return {
      dates: rows.map(d => d.date),
      datasets: [
        {
          type: 'bar',
          title: '死亡',
          color: '#984807',
          unit: '人',
          values: rows.map(d => d.deaths),
          order: 6
        },
        {
          type: 'bar',
          title: '退院',
          color: '#0070C0',
          unit: '人',
          values: rows.map(d => d.discharged),
          order: 1
        },
        {
          type: 'bar',
          title: '転院',
          color: '#7F7F7F',
          unit: '人',
          values: rows.map(d => d.transfered),
          order: 4
        },
        {
          type: 'bar',
          title: '施設入所',
          color: '#92D050',
          unit: '人',
          values: rows.map(d => d.isolated),
          order: 2
        },
        {
          type: 'bar',
          title: '重症',
          color: '#D99694',
          unit: '人',
          values: rows.map(d => d.severes),
          order: 5
        },
        {
          type: 'bar',
          title: '軽症中等症',
          color: '#FCD5B5',
          unit: '人',
          values: rows.map(d => d.milds),
          order: 3
        }
      ]
    } as GraphData
  }
}
</script>

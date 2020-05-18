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
import DataView from '@/components/DataView.vue'
import DataSelector, { SelectorItem } from '@/components/DataSelector.vue'
import DataViewBasicInfoPanel from '@/components/DataViewBasicInfoPanel.vue'
import DateSelectSlider from '@/components/DateSelectSlider.vue'
import TimeBarLineChart, { GraphData } from '@/components/TimeBarLineChart.vue'
import { PatientsSummaryDaily, PatientsSummaryWeekly } from '~/utils/types'

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
export default class NewPatientsChart extends Vue {
  @Prop()
  public date?: string

  @Prop()
  public dailyData?: PatientsSummaryDaily[]

  @Prop()
  public weeklyData?: PatientsSummaryWeekly[]

  private readonly remarks = [
    '「陽性患者数」とは、愛知県が発表する「<a class=RemarksLink target=_blank href=https://www.pref.aichi.jp/site/covid19-aichi/kansensya-kensa.html>愛知県内発生事例</a>」を日別または週別に集計した人数です。(参考:<a class=RemarksLink target=_blank href=https://github.com/code4nagoya/covid19/blob/development/data/patients.csv>当サイトでCSV形式に加工したデータ</a>)。',
    '過去7日間の平均は、陽性患者数の後方7日移動平均値です'
  ]

  private readonly showSelector = true
  private dataKind: DataKind = 'daily-transition'
  private readonly dataKinds = [
    { key: 'weekly-transition', label: '週別' } as SelectorItem,
    { key: 'daily-transition', label: '日別' } as SelectorItem,
    { key: 'daily-cumulative', label: '累計' } as SelectorItem
  ]

  private readonly chartDataSet = new Map<DataKind, GraphData>()

  private get displayTitle(): string {
    return `陽性患者数${this.dataKind === 'weekly-transition' ? '(週別)' : ''}`
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
    this.chartDataSet.set(
      'daily-cumulative',
      this.buildDailyCumulativeGraphData()
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
      .filter(d => dayjs(d['日付']) < today)
      .map(d => {
        return {
          date: dayjs(d['日付']).format('YYYY-MM-DD'),
          count: Number(d['小計']),
          average: Number(d['平均'])
        }
      })

    return {
      dates: rows.map(d => d.date),
      datasets: [
        {
          type: 'bar',
          title: '陽性者数',
          unit: '人',
          values: rows.map(d => d.count),
          order: 2
        },
        {
          type: 'line',
          title: '過去7日間の平均',
          unit: '人',
          values: rows.map(d => d.average),
          order: 1
        }
      ]
    } as GraphData
  }

  private buildWeeklyTransitionGraphData = (): GraphData => {
    const today = dayjs()
    const rows = (this.weeklyData ?? [])
      .filter(d => dayjs(d['開始日']) < today)
      .map(d => {
        return {
          date: [
            dayjs(d['開始日']).format('YYYY-MM-DD'),
            dayjs(d['終了日']).format('YYYY-MM-DD')
          ],
          count: Number(d['小計'])
        }
      })

    return {
      dates: rows.map(d => d.date),
      datasets: [
        {
          type: 'bar',
          title: '陽性者数',
          unit: '人',
          values: rows.map(d => d.count)
        }
      ]
    } as GraphData
  }

  private buildDailyCumulativeGraphData = (): GraphData => {
    let subTotal = 0
    const today = dayjs()
    const rows = (this.dailyData ?? [])
      .filter(d => dayjs(d['日付']) < today)
      .map(d => {
        subTotal += Number(d['小計'])
        return {
          date: dayjs(d['日付']).format('YYYY-MM-DD'),
          total: subTotal
        }
      })

    return {
      dates: rows.map(d => d.date),
      datasets: [
        {
          type: 'bar',
          title: '陽性者累計数',
          unit: '人',
          values: rows.map(d => d.total)
        }
      ]
    } as GraphData
  }
}
</script>

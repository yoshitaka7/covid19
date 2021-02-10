<template>
  <data-view
    title="判断指標と達成状況"
    title-id="new-patients-chart"
    url="https://www.pref.aichi.jp/site/covid19-aichi/"
    :date="updateAt"
    :remarks="remarks"
  >
    <template v-slot:button>
      <data-selector v-model="dataKind" :items="dataKinds" />
    </template>

    <div style="flex-grow: 1; display: flex; align-items: start;">
      <time-bar-line-chart
        v-if="dataKind === 'history'"
        chart-id="monitoring-chart"
        :chart-data="chartData"
        :y-axis-left-setting="yAxisLeftSetting"
        legend-order-kind="asc"
      />

      <table v-if="dataKind === 'latest'" class="table">
        <thead>
          <tr>
            <th scope="col" class="col-header">
              基準項目
            </th>
            <th
              scope="col"
              class="col-header"
              :bgcolor="indicator.colors.caution.bgColor"
              :style="'color: ' + indicator.colors.caution.textColor"
            >
              警戒
            </th>
            <th
              scope="col"
              class="col-header"
              :bgcolor="indicator.colors.warning.bgColor"
              :style="'color: ' + indicator.colors.warning.textColor"
            >
              厳重<br />警戒
            </th>
            <th
              scope="col"
              class="col-header"
              :bgcolor="indicator.colors.danger.bgColor"
              :style="'color: ' + indicator.colors.danger.textColor"
            >
              危険
            </th>
            <th
              scope="col"
              class="col-header"
              :bgcolor="totalCell.bgColor"
              :style="'color: ' + totalCell.textColor"
            >
              {{ displayDate }}<br />の状況
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" class="row-header">
              新規感染者数
            </th>
            <td class="col-caution">{{ indicator.patients.caution }}人</td>
            <td class="col-warning">{{ indicator.patients.warning }}人</td>
            <td class="col-danger">{{ indicator.patients.danger }}人</td>
            <td
              class="col-actual"
              :bgcolor="patientCell.bgColor"
              :style="'color: ' + patientCell.textColor"
            >
              {{ patientCell.label }}人
            </td>
          </tr>
          <tr>
            <th scope="row" class="row-header">
              陽性率
            </th>
            <td class="col-caution">{{ indicator.rate.caution }}%</td>
            <td class="col-warning">{{ indicator.rate.warning }}%</td>
            <td class="col-danger">{{ indicator.rate.danger }}%</td>
            <td
              class="col-actual"
              :bgcolor="rateCell.bgColor"
              :style="'color: ' + rateCell.textColor"
            >
              {{ rateCell.label }}%
            </td>
          </tr>
          <tr style="border: 3px solid #a83945; border-top-style:none;">
            <th scope="row" class="row-header">
              入院患者数
            </th>
            <td class="col-caution">{{ indicator.hospitals.caution }}人</td>
            <td class="col-warning">{{ indicator.hospitals.warning }}人</td>
            <td class="col-danger">{{ indicator.hospitals.danger }}人</td>
            <td
              class="col-actual"
              :bgcolor="hospitalCell.bgColor"
              :style="'color: ' + hospitalCell.textColor"
            >
              {{ hospitalCell.label }}人
            </td>
          </tr>
          <tr style="height: 20px" />
          <tr style="border: 3px solid #a83945; border-bottom-style:none;">
            <th scope="row" class="row-header">
              重症者数
            </th>
            <td class="col-caution">{{ indicator.criticals.caution }}人</td>
            <td class="col-warning">{{ indicator.criticals.warning }}人</td>
            <td class="col-danger">{{ indicator.criticals.danger }}人</td>
            <td
              class="col-actual"
              :bgcolor="criticalCell.bgColor"
              :style="'color: ' + criticalCell.textColor"
            >
              {{ criticalCell.label }}人
            </td>
          </tr>
          <tr style="border: 3px solid #a83945; border-top-style:none;">
            <th scope="row" class="row-header">
              70歳以上
            </th>
            <td class="col-caution">{{ indicator.seniors.caution }}人</td>
            <td class="col-warning">{{ indicator.seniors.warning }}人</td>
            <td class="col-danger">{{ indicator.seniors.danger }}人</td>
            <td
              class="col-actual"
              :bgcolor="seniorCell.bgColor"
              :style="'color: ' + seniorCell.textColor"
            >
              {{ seniorCell.label }}人
            </td>
          </tr>
        </tbody>
      </table>
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
.table {
  height: 0;
  width: 100%;
  color: #a83945;
  border-collapse: collapse;
  border: 3px solid #a83945;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.col-header {
  padding: 10px;
  border: 1px solid #a83945;
}

.row-header {
  text-align: left;
  padding: 10px;
  border: 1px solid #a83945;
}

.col-caution {
  text-align: center;
  border: 1px solid #a83945;
}

.col-warning {
  text-align: center;
  border: 1px solid #a83945;
}

.col-danger {
  text-align: center;
  border: 1px solid #a83945;
}

.col-actual {
  text-align: center;
  border: 1px solid #a83945;
}
</style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import dayjs, { Dayjs } from 'dayjs'
import * as Enumerable from 'linq'
import NewPatientsChart, {
  NewSeniorPatientsAverageType,
  NewPatientsAverageType
} from './NewPatientsChart.vue'
import InspectionPersonsChart, {
  InspectionPersonAverageType
} from './InspectionPersonsChart.vue'
import HospitalizedChart, {
  HospitalizedAverageType
} from './HospitalizedChart.vue'
import CriticallyChart, { CriticallyAverageType } from './CriticallyChart.vue'
import {
  MainSummaryDataType,
  PatientsSummaryDaily,
  InspectionPersonsSummaryDaily
} from '~/utils/types'
import RemarksView from '@/components/RemarksView.vue'
import DataView from '@/components/DataView.vue'
import DataSelector, { SelectorItem } from '@/components/DataSelector.vue'
import TimeBarLineChart, {
  GraphData,
  YAxisSetting
} from '@/components/TimeBarLineChart.vue'
import DataViewBasicInfoPanel from '@/components/DataViewBasicInfoPanel.vue'
import { formatNumber } from '@/utils/formatNumber'

export const AICHI_POPULATION = 7549422

type ScoreType = {
  date: Dayjs
  patients7DaysNum: number | undefined // 新規感染者数(7日間平均)
  patients7DaysScore: number | undefined // 新規感染者数の危険度(100=20人)
  positivesRate: number | undefined // 陽性率(7日分の陽性者数÷検査人数)
  positivesScore: number | undefined // 陽性率の危険度(100=10%)
  hospitals7DaysNum: number | undefined // 入院患者数(7日間平均)
  hospitals7DaysScore: number | undefined // 入院患者数の危険度(50=150人, 100=250人)
  criticals7DaysNum: number | undefined // 重症者数(7日間平均)
  criticals7DaysScore: number | undefined // 重症者数の危険度(50=150人, 100=250人)
  seniors7DaysNum: number | undefined // 70歳以上(7日間平均)
  seniors7DaysScore: number | undefined // 70歳以上の危険度
}

type DataKind = 'latest' | 'history'

type DisplayInfo = {
  lText: string
  sText: string
  unit: string
}

// 指標群(新規感染者数、陽性率、入院患者数、重症者数、70歳以上)
type IndicatorKind = 'patient' | 'rate' | 'hospital' | 'critical' | 'senior'

type StatusKind = 'normal' | 'caution' | 'warning' | 'danger'

type Colors = {
  bgColor: string
  textColor: string
}

type Values = {
  normal: number // 注意
  caution: number // 警戒
  warning: number // 厳重警戒
  danger: number // 危険
}

type CellInfo = Colors & {
  indicator: IndicatorKind
  label: string
  status: StatusKind
}

@Component({
  components: {
    DataView,
    DataSelector,
    TimeBarLineChart,
    DataViewBasicInfoPanel,
    RemarksView
  }
})
export default class MonitoringView extends Vue {
  private readonly indicator = {
    colors: {
      normal: {
        bgColor: '#92d050',
        textColor: '#a83945'
      } as Colors,
      caution: {
        bgColor: '#F0E48B',
        textColor: '#a83945'
      } as Colors,
      warning: {
        bgColor: '#FF7A01',
        textColor: 'white'
      } as Colors,
      danger: {
        bgColor: '#FF0084',
        textColor: 'white'
      } as Colors
    },
    patients: {
      caution: 50,
      warning: 160,
      danger: 260
    } as Values,
    rate: {
      caution: 5.0,
      warning: 10.0,
      danger: 15.0
    } as Values,
    hospitals: {
      caution: 180,
      warning: 300,
      danger: 600
    } as Values,
    criticals: {
      caution: 18,
      warning: 30,
      danger: 60
    } as Values,
    seniors: {
      caution: 7,
      warning: 22,
      danger: 36
    } as Values
  }

  private readonly remarks = [
    '<a class=RemarksLink target=_blank href=https://twitter.com/ohmura_hideaki/status/1359084053119422465>2021年2月9日の愛知県知事のツイート</a>に基き、当サイトが独自に状況を掲載するもので、愛知県の公式発表ではありません',
    '「新規感染者数」「入院患者数」「重症者数」は、過去7日間の平均です。定義詳細は「新規感染者数」「入院患者数」「重症者数」の各グラフを参照',
    '「陽性率」は参考値の場合があります。定義詳細は「陽性率・検査実施人数」のグラフを参照',
    '「70歳以上」は70歳以上の新規陽性者数の過去7日間の平均です。'
  ]

  @Prop()
  public parientsDate!: string

  @Prop()
  public parientsData!: PatientsSummaryDaily[]

  @Prop()
  public inspectionPersonsDate!: string

  @Prop()
  public inspectionPersonsData!: InspectionPersonsSummaryDaily[]

  @Prop()
  public mainSummaryDate!: string

  @Prop()
  public mainSummaryData!: MainSummaryDataType[]

  private updateAt = '-'
  private displayDate = '-'
  private patientCell: CellInfo
  private rateCell: CellInfo
  private hospitalCell: CellInfo
  private totalCell: CellInfo
  private criticalCell: CellInfo
  private seniorCell: CellInfo

  private dataKind: DataKind = 'latest'
  private readonly dataKinds = [
    { key: 'latest', label: '最新' } as SelectorItem,
    { key: 'history', label: '推移' } as SelectorItem
  ]

  private readonly chartDataSet = new Map<DataKind, GraphData>()

  private readonly yAxisLeftSetting: YAxisSetting = {
    min: 0,
    suggestedMax: 110,
    unit: '%',
    visible: true,
    stacked: false,
    visibleAxisValue: false
  } as YAxisSetting

  private get displayInfo(): DisplayInfo {
    let lText = '－'
    switch (this.totalCell.status) {
      case 'normal':
        lText = '注意'
        break
      case 'caution':
        lText = '警戒'
        break
      case 'warning':
        lText = '厳重警戒'
        break
      case 'danger':
        lText = '危険'
        break
    }

    return {
      lText,
      sText: `${this.displayDate} 時点`,
      unit: ''
    }
  }

  private readonly formatDateLabel = (date: string | string[]): string => {
    return (typeof date === 'string' ? [date] : date)
      .map(d => dayjs(d).format('M/D'))
      .join('～')
  }

  constructor() {
    super()

    const scores = this.build7daysScore()

    // 3つのデータのもっとも最新の更新日をこのパネルの更新日とする
    this.updateAt = Enumerable.from([
      this.parientsDate,
      this.inspectionPersonsDate,
      this.mainSummaryDate
    ]).maxBy(d => d)

    // 3つのデータそれぞれの最新日付の中で、最も古い日を現状日とする
    const latestMinDate = scores.last().date
    this.displayDate = latestMinDate.format('M/D')

    const emptyCell = {} as CellInfo
    this.patientCell = Object.assign({}, { indicator: 'patient' }) as CellInfo
    this.rateCell = Object.assign({}, { indicator: 'rate' }) as CellInfo
    this.hospitalCell = Object.assign({}, { indicator: 'hospital' }) as CellInfo
    this.criticalCell = Object.assign({}, { indicator: 'critical' }) as CellInfo
    this.seniorCell = Object.assign({}, { indicator: 'senior ' }) as CellInfo

    const applyStyle = (
      average: number | undefined,
      indicators: Values,
      cautionColors: Colors,
      warningColors: Colors,
      dangerColors: Colors,
      cell: CellInfo
    ) => {
      if (average != null) {
        cell.label = formatNumber(average)

        const indicies: {
          indicator: number
          status: StatusKind
          bgColor: string
          textColor: string
        }[] = [
          {
            indicator: indicators.danger,
            status: 'danger',
            bgColor: dangerColors.bgColor,
            textColor: dangerColors.textColor
          },
          {
            indicator: indicators.warning,
            status: 'warning',
            bgColor: warningColors.bgColor,
            textColor: warningColors.textColor
          },
          {
            indicator: indicators.caution,
            status: 'caution',
            bgColor: cautionColors.bgColor,
            textColor: cautionColors.textColor
          }
        ]

        const hit = indicies.find(x => average >= x.indicator)
        if (hit != null) {
          cell.bgColor = hit.bgColor
          cell.textColor = hit.textColor
          cell.status = hit.status
        }
      }
    }

    const latest = scores.last()

    const items = Enumerable.from([
      {
        value: latest.patients7DaysNum,
        indicator: this.indicator.patients,
        cell: this.patientCell
      },
      {
        value: latest.positivesRate,
        indicator: this.indicator.rate,
        cell: this.rateCell
      },
      {
        value: latest.hospitals7DaysNum,
        indicator: this.indicator.hospitals,
        cell: this.hospitalCell
      },
      {
        value: latest.criticals7DaysNum,
        indicator: this.indicator.criticals,
        cell: this.criticalCell
      },
      {
        value: latest.seniors7DaysNum,
        indicator: this.indicator.seniors,
        cell: this.seniorCell
      }
    ])

    items.forEach(item =>
      applyStyle(
        item.value,
        item.indicator,
        this.indicator.colors.caution,
        this.indicator.colors.warning,
        this.indicator.colors.danger,
        item.cell
      )
    )

    this.totalCell = Object.assign({}, emptyCell) as CellInfo
    // 総合判断からは 重症者数 を除外
    const conclusionItems = Enumerable.from(items).where(
      x => x.cell.indicator !== 'critical'
    )
    if (conclusionItems.all(d => d.cell.status === 'danger')) {
      // 全て危険ならその日は赤
      this.totalCell.bgColor = this.indicator.colors.danger.bgColor
      this.totalCell.textColor = this.indicator.colors.danger.textColor
      this.totalCell.status = 'danger'
    } else if (
      conclusionItems.any(
        d => d.cell.status === 'warning' || d.cell.status === 'danger'
      )
    ) {
      // 一つでも厳重警戒以上ならその日は橙
      this.totalCell.bgColor = this.indicator.colors.warning.bgColor
      this.totalCell.textColor = this.indicator.colors.warning.textColor
      this.totalCell.status = 'warning'
    } else if (
      conclusionItems.any(
        d =>
          d.cell.status === 'caution' ||
          d.cell.status === 'warning' ||
          d.cell.status === 'danger'
      )
    ) {
      // 一つでも警戒以上ならその日は黄
      this.totalCell.bgColor = this.indicator.colors.caution.bgColor
      this.totalCell.textColor = this.indicator.colors.caution.textColor
      this.totalCell.status = 'caution'
    } else {
      // いずれにも該当しなかったらその日は緑
      this.totalCell.bgColor = this.indicator.colors.normal.bgColor
      this.totalCell.textColor = this.indicator.colors.normal.textColor
      this.totalCell.status = 'normal'
    }

    const graphData = this.buildDailyTransitionGraphData(scores)
    this.chartDataSet.set('history', graphData)
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

  private build7daysScore = (): Enumerable.IEnumerable<ScoreType> => {
    // 新規感染者数
    const newPatients = NewPatientsChart.makeAverageNewPatients(
      this.parientsData ?? []
    )
    // 陽性率
    const positives = InspectionPersonsChart.makeAveragePositives(
      this.inspectionPersonsData ?? []
    )
    // 入院患者数
    const hospitals = HospitalizedChart.makeAverageHospitals(
      this.mainSummaryData ?? []
    )
    // 重症者数
    const criticals = CriticallyChart.makeAverageCriticals(
      this.mainSummaryData ?? []
    )
    // 70歳以上
    const seniors = NewPatientsChart.makeAverageSeniorsNewPatients(
      this.parientsData ?? []
    )

    // 4つのデータそれぞれの最古日付の中で、最も新しい日をグラフの開始日とする
    const startDate = Enumerable.from([
      dayjs(newPatients.first().date),
      dayjs(positives.first().date),
      dayjs(hospitals.first().date),
      dayjs(criticals.first().date),
      dayjs(seniors.first().date)
    ]).maxBy(x => x)

    // 4つのデータそれぞれの最新日付の中で、最も古い日をグラフの終了日とする
    const endDate = Enumerable.from([
      dayjs(newPatients.last().date),
      dayjs(positives.last().date),
      dayjs(hospitals.last().date),
      dayjs(criticals.last().date),
      dayjs(seniors.last().date)
    ]).minBy(x => x)

    const now = dayjs()

    const calcScore = (num: number | undefined, vals: Values) => {
      if (num == null) {
        return 0
      }

      const values = [vals.normal, vals.caution, vals.warning, vals.danger]
      const scores = [0, 25, 50, 100]

      let index = values.findIndex(x => num < x)
      if (index < 0) {
        index = values.length - 1 // ヒットしないのは danger 超えなので danger を使う
      }

      const prevVal = values[index - 1] ?? 0
      const hitVal = values[index]
      const prevScore = scores[index - 1] ?? 0
      const hitScore = scores[index]

      const score =
        ((num - prevVal) / (hitVal - prevVal)) * (hitScore - prevScore) +
        prevScore
      return score
    }

    return newPatients
      .where(d => startDate <= d.date && d.date <= endDate)
      .zip<ScoreType>(
        positives.where(d => startDate <= d.date && d.date <= endDate),
        hospitals.where(d => startDate <= d.date && d.date <= endDate),
        criticals.where(d => startDate <= d.date && d.date <= endDate),
        seniors.where(d => startDate <= d.date && d.date <= endDate),
        (
          n: NewPatientsAverageType,
          p: InspectionPersonAverageType,
          h: HospitalizedAverageType,
          c: CriticallyAverageType,
          s: NewSeniorPatientsAverageType
        ): any => {
          return {
            date: n.date,
            patients7DaysNum: n.average7days, // 新規感染者数(7日間平均)
            patients7DaysScore: calcScore(
              n.average7days,
              this.indicator.patients
            ),
            positivesRate: p.average, // 陽性率(7日分の陽性者数÷検査人数)
            positivesScore: calcScore(p.average, this.indicator.rate),
            hospitals7DaysNum: h.average, // 入院患者数(7日間平均)
            hospitals7DaysScore: calcScore(h.average, this.indicator.hospitals),
            criticals7DaysNum: c.average, // 重症者数(7日間平均)
            criticals7DaysScore: calcScore(c.average, this.indicator.criticals),
            seniors7DaysNum: s.average7days, // 70歳以上
            seniors7DaysScore: calcScore(s.average7days, this.indicator.seniors)
          } as ScoreType
        }
      )
      .where(d => d.date < now)
  }

  private buildDailyTransitionGraphData = (
    rows: Enumerable.IEnumerable<ScoreType>
  ): GraphData => {
    return {
      dates: rows.select(d => d.date.format('YYYY-MM-DD')).toArray(),
      datasets: [
        {
          type: 'line',
          title: '新規感染者数',
          unit: '人',
          values: rows.select(d => d.patients7DaysScore).toArray(),
          tooltipTexts: rows
            .select(d => `新規感染者数: ${formatNumber(d.patients7DaysNum)} 人`)
            .toArray(),
          order: 1,
          color: '#bd3f4c'
        },
        {
          type: 'line',
          title: '陽性率',
          unit: '%',
          values: rows.select(d => d.positivesScore).toArray(),
          tooltipTexts: rows
            .select(d => `陽性率: ${formatNumber(d.positivesRate)}%`)
            .toArray(),
          order: 2,
          color: '#0070C0'
        },
        {
          type: 'line',
          title: '入院患者数',
          unit: '人',
          values: rows.select(d => d.hospitals7DaysScore).toArray(),
          tooltipTexts: rows
            .select(d => `入院患者数: ${formatNumber(d.hospitals7DaysNum)} 人`)
            .toArray(),
          order: 3,
          color: '#92D050'
        },
        {
          type: 'line',
          title: '重症者数',
          unit: '人',
          values: rows.select(d => d.criticals7DaysScore).toArray(),
          tooltipTexts: rows
            .select(d => `重症者数: ${formatNumber(d.criticals7DaysNum)} 人`)
            .toArray(),
          order: 4,
          color: '#7F7F7F'
        },
        {
          type: 'line',
          title: '70歳以上',
          unit: '人',
          values: rows.select(d => d.seniors7DaysScore).toArray(),
          tooltipTexts: rows
            .select(d => `70歳以上: ${formatNumber(d.seniors7DaysNum)} 人`)
            .toArray(),
          order: 5,
          color: '#FF828C'
        },
        {
          type: 'line',
          title: '警戒',
          unit: '%',
          values: rows.select(_ => 25).toArray(),
          tooltipVisible: false,
          order: 101,
          color: this.indicator.colors.caution.bgColor,
          lineStyle: 'dashed'
        },
        {
          type: 'line',
          title: '厳重警戒',
          unit: '%',
          values: rows.select(_ => 50).toArray(),
          tooltipVisible: false,
          order: 101,
          color: this.indicator.colors.warning.bgColor,
          lineStyle: 'dashed'
        },
        {
          type: 'line',
          title: '危険',
          unit: '%',
          values: rows.select(_ => 100).toArray(),
          tooltipVisible: false,
          order: 102,
          color: this.indicator.colors.danger.bgColor,
          lineStyle: 'dashed'
        }
      ]
    } as GraphData
  }
}
</script>

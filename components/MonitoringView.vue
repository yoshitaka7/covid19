<template>
  <data-view
    title="判断指標と達成状況"
    title-id="new-patients-chart"
    url="https://www.pref.aichi.jp/site/covid19-aichi/"
    :date="updateAt"
    :remarks="remarks"
  >
    <table class="table">
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
            注意<br />領域
          </th>
          <th
            scope="col"
            class="col-header"
            :bgcolor="indicator.colors.danger.bgColor"
            :style="'color: ' + indicator.colors.danger.textColor"
          >
            危険<br />領域
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
        <tr style="border: 3px solid #a83945">
          <th scope="row" class="row-header">
            感染率
          </th>
          <td class="col-caution">0.5人</td>
          <td class="col-danger" />
          <td class="col-actual">{{ youseiritsuCell.label }}人</td>
        </tr>
      </tbody>
    </table>

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
  </data-view>
</template>

<style lang="scss" scoped>
ul.remarks {
  font-size: 0.75rem;
  list-style-type: '※ ';
}

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
import dayjs from 'dayjs'
import * as Enumerable from 'linq'
import NewPatientsChart from './NewPatientsChart.vue'
import InspectionPersonsChart from './InspectionPersonsChart.vue'
import HospitalizedChart from './HospitalizedChart.vue'
import {
  MainSummaryDataType,
  PatientsSummaryDaily,
  InspectionPersonsSummaryDaily
} from '~/utils/types'
import DataView from '@/components/DataView.vue'

type StatusKind = 0 | 1 | 2 // 0:基準値未満, 1:注意, 2:危険

type Colors = {
  bgColor: string
  textColor: string
}

type Values = {
  caution: number
  danger: number
}

type CellInfo = Colors & {
  label: string
  status: StatusKind
}

@Component({
  components: {
    DataView
  }
})
export default class MonitoringView extends Vue {
  private readonly indicator = {
    colors: {
      caution: {
        bgColor: '#f0e68c',
        textColor: 'a83945'
      } as Colors,
      danger: {
        bgColor: '#ff6347',
        textColor: 'white'
      } as Colors
    },
    patients: {
      caution: 10,
      danger: 20
    } as Values,
    rate: {
      caution: 5.0,
      danger: 10.0
    } as Values,
    hospitals: {
      caution: 150,
      danger: 250
    } as Values
  }

  private readonly remarks = [
    '<a class=RemarksLink target=_blank href=https://www.pref.aichi.jp/site/covid19-aichi/taisakusisin.html>愛知県新型コロナウイルス感染拡大予防対策指針</a>の「指標」に基き、当プロジェクトが独自に状況を掲載するもので、愛知県の公式発表ではありません',
    '「新規感染者数」「入院患者数」は、過去7日間の平均です。定義詳細は「新規感染者数」「入院患者数」の各グラフを参照',
    '「陽性率」は参考値の場合があります。定義詳細は「陽性率・検査実施人数」のグラフを参照',
    '「感染率」とは、直近1週間の10万人あたり感染者数です。その算出には、推計人口(2020年3月1日時点)を使用'
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
  private youseiritsuCell: CellInfo

  constructor() {
    super()

    // 3つのデータのもっとも最新の更新日をこのパネルの更新日とする
    this.updateAt = Enumerable.from([
      this.parientsDate,
      this.inspectionPersonsDate,
      this.mainSummaryDate
    ]).maxBy(d => d)

    // 3つのデータそれぞれの最新日付の中で、最も古い日を現状日とする
    const latestMinDate = Enumerable.from([
      dayjs(this.parientsData.slice(-1)[0]['日付']),
      dayjs(this.inspectionPersonsData.slice(-1)[0]['日付']),
      dayjs(
        dayjs(this.mainSummaryData.slice(-1)[0]['更新日時']).format(
          'YYYY-MM-DD'
        )
      ) // 時刻を切り落とす
    ]).minBy(x => x)

    this.displayDate = latestMinDate.format('M/D')

    const format = (x: number, digits: number = 1) => {
      const per = 10 ** digits
      return String(Math.round(x * per) / per)
    }

    const emptyCell = {} as CellInfo

    // 現状日の新規陽性者数の後方７日間平均
    const latestPatient = NewPatientsChart.makeAveragePatients(
      this.parientsData
    )
      .reverse()
      .firstOrDefault(d => d.date <= latestMinDate)

    // 現状日の陽性率
    const latestInspection = InspectionPersonsChart.makeAveragePositivePerPatients(
      this.inspectionPersonsData
    )
      .reverse()
      .firstOrDefault(d => d.date <= latestMinDate)

    // 現状日の入院者数の後方７日間平均
    const latestMainSummary = HospitalizedChart.makeAverageHospitalized(
      this.mainSummaryData
    )
      .reverse()
      .firstOrDefault(d => d.date <= latestMinDate)

    this.patientCell = Object.assign({}, emptyCell) as CellInfo
    this.rateCell = Object.assign({}, emptyCell) as CellInfo
    this.hospitalCell = Object.assign({}, emptyCell) as CellInfo

    const applyStyle = (
      average: number | undefined,
      indicators: Values,
      cautionColors: Colors,
      dangerColors: Colors,
      cell: CellInfo
    ) => {
      if (average != null) {
        cell.label = format(average)
        if (average >= indicators.danger) {
          cell.bgColor = dangerColors.bgColor
          cell.textColor = dangerColors.textColor
          cell.status = 2
        } else if (average >= indicators.caution) {
          cell.bgColor = cautionColors.bgColor
          cell.textColor = cautionColors.textColor
          cell.status = 1
        }
      }
    }

    const items = Enumerable.from([
      {
        value: latestPatient?.average,
        indicator: this.indicator.patients,
        cell: this.patientCell
      },
      {
        value: latestInspection?.average,
        indicator: this.indicator.rate,
        cell: this.rateCell
      },
      {
        value: latestMainSummary?.average,
        indicator: this.indicator.hospitals,
        cell: this.hospitalCell
      }
    ])

    items.forEach(item =>
      applyStyle(
        item.value,
        item.indicator,
        this.indicator.colors.caution,
        this.indicator.colors.danger,
        item.cell
      )
    )

    this.totalCell = Object.assign({}, emptyCell) as CellInfo
    if (items.all(d => d.cell.status === 2)) {
      // 全て危険ならその日は赤
      this.totalCell.bgColor = this.indicator.colors.danger.bgColor
      this.totalCell.textColor = this.indicator.colors.danger.textColor
    } else if (items.any(d => d.cell.status >= 1)) {
      // 一つでも注意以上ならその日は黄色
      this.totalCell.bgColor = this.indicator.colors.caution.bgColor
      this.totalCell.textColor = this.indicator.colors.caution.textColor
    }

    // 現状日から７日前までの陽性者数合計
    const numPatients7days = Enumerable.from(this.inspectionPersonsData)
      .reverse()
      .where(d => dayjs(d['日付']) <= latestMinDate)
      .take(7)
      .sum(d => d['陽性者数'] ?? 0)

    this.youseiritsuCell = Object.assign({}, emptyCell) as CellInfo
    const youseiritsu = (numPatients7days / 7549422) * 100000 // 愛知県の10万人あたり陽性者数
    this.youseiritsuCell.label = format(youseiritsu, 2)
  }
}
</script>

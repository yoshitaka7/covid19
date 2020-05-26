<template>
  <data-view
    title="判断指標と達成状況"
    title-id="new-patients-chart"
    url="https://www.pref.aichi.jp/site/covid19-aichi/"
    :remarks="remarks"
  >
    <table border="3" bordercolor="#a83945" class="table_3HAQd">
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
        <tr>
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
  list-style-type: '※ ';
}

.table_3HAQd {
  height: 0;
  width: 100%;
  color: #a83945;
  border-collapse: collapse;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.col-header {
  padding: 10px;
}

.row-header {
  text-align: left;
  padding: 10px;
}

.col-caution {
  text-align: center;
}

.col-danger {
  text-align: center;
}

.col-actual {
  text-align: center;
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
    '「陽性率」は参考値の場合があります。定義詳細は「陽性率・検査実施人数」のグラフを参照'
  ]

  @Prop()
  public parientsData!: PatientsSummaryDaily[]

  @Prop()
  public inspectionPersonsData!: InspectionPersonsSummaryDaily[]

  @Prop()
  public mainSummaryData!: MainSummaryDataType[]

  private displayDate = '-'
  private patientCell: CellInfo
  private rateCell: CellInfo
  private hospitalCell: CellInfo
  private totalCell: CellInfo

  constructor() {
    super()

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

    const format = (x: number) => {
      return String(Math.round(x * 10) / 10)
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
    const maxStatus = items.maxBy(d => d.cell.status)
    if (maxStatus?.cell?.status ?? 0 > 1) {
      this.totalCell.bgColor = maxStatus?.cell.bgColor
      this.totalCell.textColor = maxStatus?.cell.textColor
    }
  }
}
</script>

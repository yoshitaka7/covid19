<template>
  <div class="MainPage">
    <page-header
      :icon="headerItem.icon"
      :title="headerItem.title"
      :date="headerItem.date"
    />
    <whats-new
      class="mb-1"
      text="全国を対象区域とした緊急事態宣言が 5/31 まで延長されました。愛知県は引き続き「特定警戒都道府県」 に指定されています"
      url="https://corona.go.jp/"
    />
    <whats-new
      class="mb-1"
      :text="newsItem.text"
      :date="newsItem.date"
      :url="newsItem.url"
    />
    <whats-new
      class="mb-4"
      text="当サイトは有志が作成したものです。お問い合わせは愛知県ではなく、当サイト運営まで。"
      url="/about"
    />
    <v-row class="DataBlock">
      <v-col cols="12" md="6" class="DataCard">
        <svg-card
          title="検査陽性者の状況"
          :title-id="'details-of-confirmed-cases'"
          :date="headerItem.date"
          :url="'https://www.pref.aichi.jp/site/covid19-aichi/'"
          :subtext="'（一部、県知事のTwitter）'"
          :title-date="confirmedCases['更新日時']"
          :title-remark="confirmedCases['備考']"
        >
          <confirmed-cases-table v-bind="confirmedCases" />
        </svg-card>
      </v-col>

      <v-col cols="12" md="6" class="DataCard">
        <time-bar-chart
          title="入院中数"
          :title-id="'number-of-in-hospital'"
          :chart-id="'time-bar-chart-in-hospital'"
          :chart-data-set="inHospitalSet"
          :date="Data.main_summary_history.date"
          :default-data-kind="'daily-transition'"
          :default-span="60"
          :remarks="[
            '「入院中数」とは、愛知県が発表した「検査陽性者の状況」のうち、「入院中」の人数です。',
            '愛知県が発表した「検査陽性者の状況」を当プロジェクトで記録・時系列化したものであり、実際の数値とは異なる可能性があります',
            '感染症発生状況が取得できなかった日の値は表示していません'
          ]"
          :url="'https://www.pref.aichi.jp/site/covid19-aichi/'"
          :show="false"
        />
      </v-col>

      <v-col cols="12" md="6" class="DataCard">
        <time-bar-chart
          title="重症者数"
          :title-id="'number-of-severe'"
          :chart-id="'time-bar-chart-severe'"
          :chart-data-set="severeSet"
          :date="Data.main_summary_history.date"
          :default-data-kind="'daily-transition'"
          :default-span="60"
          :unit="'人'"
          :remarks="[
            '「重症者数」とは、愛知県が発表した「検査陽性者の状況」のうち、「重症」の人数です。',
            '愛知県が発表した「検査陽性者の状況」を当プロジェクトで記録・時系列化したものであり、実際の数値とは異なる可能性があります',
            '感染症発生状況が取得できなかった日の値は表示していません'
          ]"
          :url="'https://www.pref.aichi.jp/site/covid19-aichi/'"
          :show="false"
        />
      </v-col>

      <v-col cols="12" md="6" class="DataCard">
        <time-bar-chart
          title="陽性患者数"
          :title-id="'number-of-confirmed-cases'"
          :chart-id="'time-bar-chart-patients'"
          :chart-data-set="patientsSet"
          :date="Data.patients_summary.date"
          :default-data-kind="'weekly-transition'"
          :default-span="60"
          :url="
            'https://www.pref.aichi.jp/site/covid19-aichi/kansensya-kensa.html'
          "
          :remarks="[
            sanitize(
              '「陽性患者数」とは、愛知県が発表する「<a class=RemarksLink target=_blank href=https://www.pref.aichi.jp/site/covid19-aichi/kansensya-kensa.html>愛知県内発生事例</a>」を日別または週別に集計した人数です。(参考:<a class=RemarksLink target=_blank href=https://github.com/code4nagoya/covid19/blob/development/data/patients.csv>当サイトでCSV形式に加工したデータ</a>)。'
            )
          ]"
        />
      </v-col>

      <v-col
        v-if="confirmedCasesGraph != null"
        cols="12"
        md="6"
        class="DataCard"
      >
        <time-stacked-bar-chart
          title="検査陽性者状況の推移"
          :title-id="'number-of-current-patients-history'"
          :chart-id="'time-stacked-bar-chart-patients-history'"
          :chart-data="confirmedCasesGraph"
          :chart-legends="confirmedCasesGraphLegends"
          :date="Data.main_summary_history.date"
          :latest-value-field="'discharged'"
          :latest-value-title="'退院'"
          :default-span="60"
          :unit="'人'"
          :url="'https://www.pref.aichi.jp/site/covid19-aichi/'"
          :remarks="[
            '愛知県が発表した「検査陽性者の状況」を当プロジェクトで記録・時系列化したものであり、実際の数値とは異なる可能性があります',
            '[不定]は、感染症発生状況が取得できなかった日です（陽性者数累計を表示します）',
            '凡例をクリックするとその項目の[表示/非表示]が切り替えられます'
          ]"
        />
      </v-col>
      <v-col cols="12" md="6" class="DataCard">
        <time-bar-chart
          title="検査実施件数"
          :title-id="'number-of-inspections'"
          :chart-id="'time-bar-chart-inspections'"
          :chart-data-set="inspectionsSet"
          :date="Data.inspections_summary.date"
          :default-data-kind="'weekly-transition'"
          :default-span="60"
          :remarks="[
            '日別と累計では、日別データが公開されている期間のみ表示',
            '愛知県分（愛知県衛生研究所等）及び保健所設置市分（名古屋市衛生研究所等）の合計',
            '民間施設等の検査件数及び陽性者数を含んでいます（発表時点での把握数）'
          ]"
          :url="
            'https://www.pref.aichi.jp/site/covid19-aichi/kansensya-kensa.html'
          "
        />
      </v-col>
      <v-col cols="12" md="6" class="DataCard">
        <column-map
          title="市町村別感染状況"
          :title-id="'patients-per-cities'"
          :date="Data.patients.date"
          :data="patientsPerCities"
          :legends="patientsPerCitiesLegends"
          :title-date="Data.patients.date"
          :remarks="[
            '公表されている居住地が、54市町村以外(尾張地方、三河地方など)や県外は対象外',
            '感染率とは10万人あたり感染者数を指し、その算出には、推計人口(2020年3月1日時点)を使用'
          ]"
          :url="'https://www.pref.aichi.jp/site/covid19-aichi/'"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import PageHeader from '@/components/PageHeader.vue'
import TimeBarChart from '@/components/TimeBarChart.vue'
import TimeStackedBarChart from '@/components/TimeStackedBarChart.vue'
import WhatsNew from '@/components/WhatsNew.vue'
import Data from '@/data/data.json'
import CityData from '@/data/city_data.json'

import formatConfirmedCases from '@/utils/formatConfirmedCases'
import formatConfirmedCasesGraph from '@/utils/formatConfirmedCasesGraph'
import formatPatientsPerCities from '@/utils/formatPatientsPerCities'
import SvgCard from '@/components/SvgCard.vue'
import ConfirmedCasesTable from '@/components/ConfirmedCasesTable.vue'
import ColumnMap from '@/components/ColumnMap.vue'
import weeklizer from '@/utils/weeklizer'
import {
  buildPatientChartSet,
  buildInspectionsChartSet,
  buildInHospitalChartSet,
  buildSevereChartSet
} from '@/utils/chart-data-builder'

export default {
  components: {
    PageHeader,
    TimeBarChart,
    TimeStackedBarChart,
    WhatsNew,
    SvgCard,
    ConfirmedCasesTable,
    ColumnMap
  },
  data() {
    // 日次データを週次化
    const dataWeekly = weeklizer(Data) // Data_weekly.json 化までのつなぎ

    // 感染者数グラフ
    const patientsSet = buildPatientChartSet(
      Data.patients_summary.data,
      dataWeekly.patients_summary.data
    )

    // 検査数グラフ
    const inspectionsSet = buildInspectionsChartSet(
      Data.inspections_summary.data,
      dataWeekly.inspections_summary.data
    )

    // 入院中数グラフ
    const inHospitalSet = buildInHospitalChartSet(
      Data.main_summary_history.data
    )

    // 重症者数グラフ
    const severeSet = buildSevereChartSet(Data.main_summary_history.data)

    // 検査陽性者の状況
    const confirmedCases = formatConfirmedCases(Data.main_summary_history)

    // 入院中患者数の推移
    const confirmedCasesGraph =
      Data.main_summary_history != null
        ? formatConfirmedCasesGraph(
            Data.patients_summary.data,
            Data.main_summary_history.data
          )
        : null

    const confirmedCasesGraphLegends = [
      { field: 'discharged', label: '退院', backgroundColor: '#0070C0' },
      { field: 'isolated', label: '施設入所', backgroundColor: '#92D050' },
      { field: 'milds', label: '軽症中等症', backgroundColor: '#FCD5B5' },
      { field: 'transfered', label: '転院', backgroundColor: '#7F7F7F' },
      { field: 'severes', label: '重症', backgroundColor: '#D99694' },
      { field: 'deaths', label: '死亡', backgroundColor: '#984807' },
      { field: 'unknown', label: '不定', backgroundColor: '#dddddd' }
    ]

    // 市区町村別の感染者数
    const patientsPerCitiesLegends = []
    const patientsPerCities = formatPatientsPerCities(
      CityData.data,
      Data.patients.data,
      patientsPerCitiesLegends
    )

    const data = {
      Data,
      patientsSet,
      inspectionsSet,
      inHospitalSet,
      severeSet,
      confirmedCases,
      confirmedCasesGraph,
      confirmedCasesGraphLegends,
      patientsPerCities,
      patientsPerCitiesLegends,
      headerItem: {
        icon: 'mdi-chart-timeline-variant',
        title: '愛知県内の最新感染動向',
        date: Data.lastUpdate
      },
      newsItem: {
        date: '',
        url: 'https://www.pref.aichi.jp/site/covid19-aichi/',
        text: '愛知県発表の新型コロナウイルス感染症に関する情報はこちら'
      }
    }
    return data
  },
  head() {
    return {
      title: '県内の最新感染動向'
    }
  }
}
</script>

<style lang="scss" scoped>
.MainPage {
  .DataBlock {
    margin: 20px -8px;
    .DataCard {
      @include largerThan($medium) {
        padding: 10px;
      }
      @include lessThan($small) {
        padding: 4px 8px;
      }
    }
  }
}
</style>

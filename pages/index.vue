<template>
  <div class="MainPage">
    <page-header
      :icon="headerItem.icon"
      :title="headerItem.title"
      :date="headerItem.date"
    />
    <whats-new
      class="mb-1"
      text="緊急事態宣言の対象区域が全国に拡大されました。愛知県は「特定警戒都道府県」 に指定されました"
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
    <!-- <static-info
      class="mb-4"
      :url="'/flow'"
      :text="'自分や家族の症状に不安や心配がある方はこちらをごらんください'"
      :btn-text="'相談の手順を見る'"
    /> -->
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
          :chart-data="inHospitalGraph"
          :date="Data.main_summary_history.date"
          :default-data-kind="'daily-transition'"
          :default-span="60"
          :unit="'人'"
          :remarks="[
            '愛知県が発表した【感染症発生状況】を当プロジェクトで記録・時系列化したものであり、実際の数値とは異なる可能性があります',
            '感染症発生状況が取得できなかった日の値は表示していません'
          ]"
          :url="'https://www.pref.aichi.jp/site/covid19-aichi/'"
          :show="false"
          :transition-label="'時点'"
        />
      </v-col>

      <v-col cols="12" md="6" class="DataCard">
        <time-bar-chart
          title="重症者数"
          :title-id="'number-of-severe'"
          :chart-id="'time-bar-chart-severe'"
          :chart-data="severeGraph"
          :date="Data.main_summary_history.date"
          :default-data-kind="'daily-transition'"
          :default-span="60"
          :unit="'人'"
          :remarks="[
            '愛知県が発表した【感染症発生状況】を当プロジェクトで記録・時系列化したものであり、実際の数値とは異なる可能性があります',
            '感染症発生状況が取得できなかった日の値は表示していません'
          ]"
          :url="'https://www.pref.aichi.jp/site/covid19-aichi/'"
          :show="false"
          :transition-label="'時点'"
        />
      </v-col>

      <v-col cols="12" md="6" class="DataCard">
        <time-bar-chart
          title="陽性患者数"
          :title-id="'number-of-confirmed-cases'"
          :chart-id="'time-bar-chart-patients'"
          :chart-data="patientsGraph"
          :date="Data.patients_summary.date"
          :default-data-kind="'weekly-transition'"
          :default-span="60"
          :unit="'人'"
          :url="
            'https://www.pref.aichi.jp/site/covid19-aichi/kansensya-kensa.html'
          "
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
            '愛知県が発表した【感染症発生状況】を当プロジェクトで記録・時系列化したものであり、実際の数値とは異なる可能性があります',
            '[不定]は、感染症発生状況が取得できなかった日です（陽性者数累計を表示します）'
          ]"
        />
      </v-col>
      <v-col cols="12" md="6" class="DataCard">
        <time-bar-chart
          title="検査実施件数"
          :title-id="'number-of-inspections'"
          :chart-id="'time-bar-chart-inspections'"
          :chart-data="inspectionsGraph"
          :date="Data.inspections_summary.date"
          :default-data-kind="'weekly-transition'"
          :default-span="60"
          :unit="'件'"
          :remarks="[
            inspectionsRemarks,
            '愛知県衛生研究所、名古屋市衛生研究所、厚生労働省機関で実施した県内の新型コロナウイルスの遺伝子検査件数',
            '愛知県分に民間施設等の検査件数及び陽性者数を含んでいます（発表時点での把握数）'
          ]"
          :url="
            'https://www.pref.aichi.jp/site/covid19-aichi/kansensya-kensa.html'
          "
        />
      </v-col>
      <v-col cols="12" md="6" class="DataCard">
        <data-table
          :title="'陽性患者の属性'"
          :title-id="'attributes-of-confirmed-cases'"
          :chart-data="patientsTable"
          :chart-option="{}"
          :date="Data.patients.date"
          :info="sumInfoOfPatients"
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
      <!--
      <v-col cols="12" md="6" class="DataCard">
        <time-bar-chart
          title="新型コロナコールセンター相談件数"
          :title-id="'number-of-reports-to-covid19-telephone-advisory-center'"
          :chart-id="'time-bar-chart-contacts'"
          :chart-data="contactsGraph"
          :date="Data.contacts.date"
          :unit="'件'"
          :url="''"
        />
      </v-col>
      <v-col cols="12" md="6" class="DataCard">
        <time-bar-chart
          title="新型コロナ受診相談窓口相談件数"
          :title-id="'number-of-reports-to-covid19-consultation-desk'"
          :chart-id="'time-bar-chart-querents'"
          :chart-data="querentsGraph"
          :date="Data.querents.date"
          :unit="'件'"
          :url="''"
        />
      </v-col>
      <v-col cols="12" md="6" class="DataCard">
        <metro-bar-chart
          title="名古屋市営地下鉄の利用者数の推移"
          :title-id="'predicted-number-of-nagoya-subway-passengers'"
          :chart-id="'metro-bar-chart'"
          :chart-data="metroGraph"
          :chart-option="metroGraphOption"
          :date="metroGraph.date"
        />
      </v-col>
      -->
    </v-row>
  </div>
</template>

<script>
import PageHeader from '@/components/PageHeader.vue'
import TimeBarChart from '@/components/TimeBarChart.vue'
// import MetroBarChart from '@/components/MetroBarChart.vue'
import TimeStackedBarChart from '@/components/TimeStackedBarChart.vue'
import WhatsNew from '@/components/WhatsNew.vue'
// import StaticInfo from '@/components/StaticInfo.vue'
import Data from '@/data/data.json'
import CityData from '@/data/city_data.json'
// import MetroData from '@/data/metro.json'
import DataTable from '@/components/DataTable.vue'
import formatGraph from '@/utils/formatGraph'
import formatTable from '@/utils/formatTable'
import formatRemarks from '@/utils/formatRemarks'
import formatConfirmedCases from '@/utils/formatConfirmedCases'
import formatConfirmedCasesGraph from '@/utils/formatConfirmedCasesGraph'
import formatPatientsPerCities from '@/utils/formatPatientsPerCities'
import formatInHospitalGraph from '@/utils/formatInHospitalGraph'
import formatSevereGraph from '@/utils/formatSevereGraph'
// import News from '@/data/news.json'
import SvgCard from '@/components/SvgCard.vue'
import ConfirmedCasesTable from '@/components/ConfirmedCasesTable.vue'
import ColumnMap from '@/components/ColumnMap.vue'

export default {
  components: {
    PageHeader,
    TimeBarChart,
    //    MetroBarChart,
    TimeStackedBarChart,
    WhatsNew,
    //    StaticInfo,
    DataTable,
    SvgCard,
    ConfirmedCasesTable,
    ColumnMap
  },
  data() {
    // 感染者数グラフ
    const patientsGraph = formatGraph(Data.patients_summary.data)
    // 感染者数
    const patientsTable = formatTable(Data.patients.data)

    const inspectionsGraph = formatGraph(Data.inspections_summary.data)

    const inspectionsRemarks = formatRemarks(Data.inspections_summary.data)
    // 入院中数グラフ
    const inHospitalGraph = formatInHospitalGraph(
      Data.main_summary_history.data
    )
    // 重症者数グラフ
    const severeGraph = formatSevereGraph(Data.main_summary_history.data)

    // 退院者グラフ
    // const dischargesGraph = formatGraph(Data.discharges_summary.data)

    // 相談件数
    // const contactsGraph = formatGraph(Data.contacts.data)
    // 帰国者・接触者電話相談センター相談件数
    // const querentsGraph = formatGraph(Data.querents.data)
    // 名古屋市営地下鉄の利用者数の推移
    // const metroGraph = MetroData
    // 検査実施日別状況
    // const inspectionsGraph = [
    //   Data.inspections_summary.data['県内'],
    //   Data.inspections_summary.data['その他']
    // ]
    // const inspectionsItems = [
    //  '県内発生（疑い例・接触者調査）',
    //  'その他（チャーター便・クルーズ便）'
    // ]
    // const inspectionsLabels = Data.inspections_summary.labels
    // 死亡者数
    // #MEMO: 今後使う可能性あるので一時コメントアウト
    // const fatalitiesTable = formatTable(
    //   Data.patients.data.filter(patient => patient['備考'] === '死亡')
    // )
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

    const sumInfoOfPatients = {
      lText: patientsGraph[
        patientsGraph.length - 1
      ].cumulative.toLocaleString(),
      sText: patientsGraph[patientsGraph.length - 1].label + 'の累計',
      unit: '人'
    }

    const sumInfoOfInspections = {
      lText: inspectionsGraph[
        inspectionsGraph.length - 1
      ].cumulative.toLocaleString(),
      sText: inspectionsGraph[inspectionsGraph.length - 1].label + 'の累計',
      unit: '件'
    }

    const data = {
      Data,
      patientsTable,
      patientsGraph,
      inspectionsGraph,
      inspectionsRemarks,
      inHospitalGraph,
      severeGraph,
      // dischargesGraph,
      // contactsGraph,
      // querentsGraph,
      // metroGraph,
      // inspectionsGraph,
      // inspectionsItems,
      // inspectionsLabels,
      confirmedCases,
      confirmedCasesGraph,
      confirmedCasesGraphLegends,
      sumInfoOfPatients,
      sumInfoOfInspections,
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
      // metroGraphOption: {
      //   responsive: true,
      //   legend: {
      //     display: true
      //   },
      //   scales: {
      //     xAxes: [
      //       {
      //         position: 'bottom',
      //         stacked: false,
      //         gridLines: {
      //           display: true
      //         },
      //         ticks: {
      //           fontSize: 10,
      //           maxTicksLimit: 20,
      //           fontColor: '#808080'
      //         }
      //       }
      //     ],
      //     yAxes: [
      //       {
      //         stacked: false,
      //         gridLines: {
      //           display: true
      //         },
      //         ticks: {
      //           fontSize: 12,
      //           maxTicksLimit: 10,
      //           fontColor: '#808080',
      //           callback(value) {
      //             return value.toFixed(2) + '%'
      //           }
      //         }
      //       }
      //     ]
      //   },
      //   tooltips: {
      //     displayColors: false,
      //     callbacks: {
      //       title(tooltipItems, _) {
      //         const label = tooltipItems[0].label
      //         return `期間: ${label}`
      //       },
      //       label(tooltipItem, data) {
      //         const currentData = data.datasets[tooltipItem.datasetIndex]
      //         const percentage = `${currentData.data[tooltipItem.index]}%`

      //         return `${metroGraph.base_period}の利用者数との相対値: ${percentage}`
      //       }
      //     }
      //   }
      // }
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

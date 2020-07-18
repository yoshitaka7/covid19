<template>
  <data-view
    class="ColumnMap"
    :title="title"
    :title-id="titleId"
    :url="url"
    :date="date"
    :remarks="remarks"
    :title-date="titleDate"
  >
    <table
      class="tabularmaps"
      :class="
        $vuetify.breakpoint.xs
          ? 'ColumnMap-TableSpacingForXS'
          : 'ColumnMap-TableSpacing'
      "
    >
      <tr v-for="(row, rowIndex) in table" :key="rowIndex">
        <td
          v-for="(col, colIndex) in row"
          :key="colIndex"
          :style="
            'background-color: ' +
              col.backgroundColor +
              '; color: ' +
              col.foregroundColor +
              ';'
          "
          :class="{ tmnull: col.values[0] == '' }"
        >
          <div>
            <div
              :class="
                $vuetify.breakpoint.mdAndDown
                  ? 'ColumnMap-PanelTextForMD'
                  : 'ColumnMap-PanelText'
              "
            >
              <div class="ColumnMap-CellsContainer">
                <span v-for="(cell, cellIndex) in col.values" :key="cellIndex">
                  {{ cell }}
                </span>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <date-select-slider
      :chart-data="weekDates"
      :value="displaySpan"
      :min="spanMin"
      :max="spanMax"
      :label-formatter="sliderLabelFormatter"
      @sliderInput="sliderUpdate"
    />

    <div class="ColumnMap-LegendPanel">
      <div class="ColumnMap-LegendMapPanel">
        <div class="ColumnMap-LegendTitle">
          凡例
        </div>
        <div class="ColumnMap-LegendMapCell">
          <div class="ColumnMap-LegendMapText">
            <span>居住地</span>
            <span>累計感染者数</span>
            <span>感染率※</span>
          </div>
        </div>
      </div>

      <div class="ColumnMap-LegendColorPanel">
        <div class="ColumnMap-LegendTitle" style="margin-left: 10px;">
          感染率で塗り分け
        </div>
        <div class="ColumnMap-LegendColorContainer">
          <div v-for="(legend, legendIndex) in legends" :key="legendIndex">
            <div
              class="ColumnMap-LegendColor"
              :style="
                'background-color: ' +
                  legend.backgroundColor +
                  '; color: ' +
                  legend.foregroundColor +
                  ';'
              "
            >
              {{ legend.rangeName }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </data-view>
</template>

<style lang="scss" scoped>
.ColumnMap {
  ::v-deep svg {
    width: 100%;
  }
  .Graph-Desc {
    margin-top: 10px;
    margin-bottom: 0;
    font-size: 11px;
    color: $gray-3;
  }
  &-TableSpacing {
    border-spacing: 5px;
  }
  &-TableSpacingForXS {
    border-spacing: 1px;
  }
  &-PanelText {
    font-size: 11px;
    line-height: 1.3;
    width: calc(11px * 4);
    margin: 0 auto;
    white-space: nowrap;
    overflow: hidden;
  }
  &-PanelTextForMD {
    font-size: 9px;
    line-height: 1.3;
    width: calc(9px * 3.2);
    margin: 0 auto;
    white-space: nowrap;
    overflow: hidden;
  }
  &-CellsContainer {
    display: flex;
    flex-direction: column;
    align-items: flex-center;
  }
  &-LegendPanel {
    display: flex;
    margin: 0px 5px 15px 5px;
  }
  &-LegendMapPanel {
    width: calc(100% - 200px);
    margin-top: 5px;
    display: flex;
    flex-direction: column;
  }
  &-LegendMapCell {
    width: calc(11px * 7);
    height: 60px;
    border: 1px solid #333;
    border-radius: 5px;
    text-align: center;
    padding: 5px 0px;
  }
  &-LegendTitle {
    font-size: 11px;
  }
  &-LegendColor {
    width: 60px;
    font-size: 10px;
    line-height: 25px;
    text-align: center;
    border-radius: 0px;
    border: 1px solid #333;
    margin-left: 5px;
    margin-bottom: 5px;
  }
  &-LegendMapText {
    display: flex;
    flex-direction: column;
    align-items: flex-center;
    height: 100%;
    justify-content: center;
    font-size: 11px;
    line-height: 1.3;
    width: calc(11px * 7);
    margin: 0 auto;
    white-space: nowrap;
    overflow: hidden;
  }
  &-LegendColorPanel {
    width: 200px;
    margin-top: 5px;
    display: flex;
    flex-direction: column;
  }
  &-LegendColorContainer {
    display: flex;
    align-items: flex-center;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}

/* tabularmaps */
.tabularmaps {
  border-collapse: separate;
  display: inline-block;
  width: 100%; // 90vw;
  // height: 67vw;
  position: relative;
}
.tabularmaps td {
  width: 200px; //calc(100% / 4);
  // height: calc(60vw / 5);
  height: 50px;
  //font-size: 3vw;
  vertical-align: middle;
  text-align: center;
  border-radius: 5px;
  border: 1px solid #333;
  margin: 0px;
  font-size: 11px;
}
.tabularmaps a {
  text-decoration: none;
  color: black;
}
.tabularmaps a:visited {
  text-decoration: none;
  color: #055;
}
.tmnull {
  background-color: transparent;
  border: 0px solid transparent !important;
}
#tmtitle {
  color: white;
}
</style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import dayjs from 'dayjs'
import { DateRange } from './TimeBarLineChart.vue'
import DataView from '@/components/DataView.vue'
import DateSelectSlider from '@/components/DateSelectSlider.vue'
import { WeekRange } from '~/utils/weeklizer'
import {
  WeekCityPatientDataType,
  CityDataType
} from '~/utils/formatPatientsPerCities'

type CitySummaryDataType = {
  cityCode: string // 市町村コード
  cityName: string // 市町村名
  patientsTotal: number // 患者数
  patientsPer100k: number // 10万人あたり患者数
  legendIndex: number // 該当凡例
}

type CitySummaryLegendType = {
  range: { min: number; max: number } | number //
  rangeName: string //
  foregroundColor: string //
  backgroundColor: string //
}

@Component({
  components: {
    DataView,
    DateSelectSlider
  }
})
export default class ColumnMap extends Vue {
  @Prop()
  public title?: string

  @Prop()
  public titleId?: string

  @Prop()
  public date?: string

  @Prop()
  public dataWeekly!: {
    weekRange: WeekRange
    cityNumMap: Map<string, WeekCityPatientDataType>
  }[]

  @Prop()
  public cityDataMap!: Map<string, CityDataType>

  @Prop()
  public url?: string

  @Prop()
  public remarks?: any[]

  @Prop()
  public titleDate?: string

  @Prop()
  public titleRemark?: string

  private readonly defaultSpan: number = 3

  private displaySpan: number[] = [0, 0]

  private spanMin: number = 0

  private get weekDates(): DateRange[] {
    return this.dataWeekly.map(x => [
      x.weekRange.from.format('YYYY/MM/DD'),
      x.weekRange.to.format('YYYY/MM/DD')
    ])
  }

  private get spanMax(): number {
    return this.dataWeekly.length - 1
  }

  private readonly sliderLabelFormatter = (
    date: DateRange,
    isFrom: boolean
  ) => {
    if (!date) {
      return ''
    } else if (typeof date === 'string') {
      return dayjs(date).format('M/D')
    } else {
      return date.map(date => dayjs(date).format('M/D'))[isFrom ? 0 : 1]
    }
  }

  private readonly legends: CitySummaryLegendType[] = [
    {
      range: 0,
      rangeName: '0人',
      foregroundColor: 'black',
      backgroundColor: 'white'
    },
    {
      range: { min: Number.MIN_SAFE_INTEGER, max: 2 },
      rangeName: '2人未満',
      foregroundColor: 'black',
      backgroundColor: '#c5eddf'
    },
    {
      range: { min: 2.0, max: 8.0 },
      rangeName: '2人以上',
      foregroundColor: 'white',
      backgroundColor: '#8abccf'
    },
    {
      range: { min: 8.0, max: 32.0 },
      rangeName: '8人以上',
      foregroundColor: 'white',
      backgroundColor: '#73a2c6'
    },
    {
      range: { min: 32.0, max: 128.0 },
      rangeName: '32人以上',
      foregroundColor: 'white',
      backgroundColor: '#4771b2'
    },
    {
      range: { min: 128, max: Number.MAX_SAFE_INTEGER },
      rangeName: '128人以上',
      foregroundColor: 'white',
      backgroundColor: '#00429d'
    }
  ]

  constructor() {
    super()

    this.displaySpan = [
      this.dataWeekly.length - this.defaultSpan,
      this.dataWeekly.length - 1
    ]
  }

  public sliderUpdate(sliderValue: number[]) {
    this.displaySpan = sliderValue
  }

  private get table() {
    // const TABULARMAP_SRC = `
    //   扶桑	犬山	春日井	尾張旭	瀬戸	みよし	豊田	豊根
    //   江南	大口	小牧	長久手	日進	知立	岡崎	東栄
    //   一宮	岩倉	北名古屋	豊山	東郷	刈谷	安城	設楽
    //   稲沢	清須	名古屋	大府	豊明	高浜	幸田	新城
    //   津島	あま	大治	阿久比	東浦	碧南	西尾	豊川
    //   愛西	蟹江	東海	半田	武豊			蒲郡
    //   弥富	飛島	知多	常滑	美浜	南知多	田原	豊橋`
    const TABULARMAP_SRC = `
      23362	23215	23206	23226	23204	23236	23211	23563
      23217	23361	23219	23238	23230	23225	23202	23562
      23203	23228	23234	23342	23302	23210	23212	23561
      23220	23233	23100	23223	23229	23227	23501	23221
      23208	23237	23424	23441	23442	23209	23213	23207
      23232	23425	23222	23205	23447			23214
      23235	23427	23224	23216	23446	23445	23231	23201`

    const items = []
    const ssrc = TABULARMAP_SRC.substring(1).split('\n')
    for (const ss of ssrc) {
      items.push(ss.split('\t'))
    }

    return items.map(row => {
      return row.map(col => {
        const result = new Map<string, CitySummaryDataType>()
        const ranged = this.dataWeekly.slice(
          this.displaySpan[0],
          this.displaySpan[1] + 1
        )

        const city = this.cityDataMap.get(col.trim())
        if (city != null) {
          const countOfCity = city['検索ワード'].reduce((count, word) => {
            const countOfSearchWord = ranged.reduce((cnt, weeked) => {
              const hit = weeked.cityNumMap.get(word)
              if (hit != null) {
                cnt += hit['感染者数'] ?? 0
              }
              return cnt
            }, 0)

            return count + countOfSearchWord
          }, 0)

          const patientsPer100k =
            Math.floor((countOfCity / city['人口']) * 1000000) / 10 // 10万人あたり感染者数
          const legendIndex = this.legends.findIndex(legend => {
            if (typeof legend.range === 'number') {
              return legend.range === patientsPer100k
            } else {
              return (
                legend.range.min <= patientsPer100k &&
                patientsPer100k < legend.range.max
              )
            }
          })

          result.set(city['市町村コード'], {
            cityCode: city['市町村コード'], // 市町村コード
            cityName: city['市町村名'], // 市町村名
            patientsTotal: countOfCity, // 患者数
            patientsPer100k,
            legendIndex
          } as CitySummaryDataType)
        }

        // const ranged = this.dataWeekly.slice(this.displaySpan[0], this.displaySpan[1] + 1)

        // for (const range of ranged) {
        //   const cityToNum = range.cityNumMap.get(col.trim())
        //   if (cityToNum != null) {
        //     const hit = result.get(cityToNum.cityCode)
        //     if (hit == null) {
        //       result.set(cityToNum.cityCode, cityToNum)
        //     } else {
        //       const cloned = Object.assign({}, hit)
        //       cloned.patientsTotal += cityToNum.patientsTotal
        //       result.set(cloned.cityCode, cloned)
        //     }
        //   }
        // }

        // const hit = this.data.get(col.trim())
        const hit = result.get(col.trim())
        if (hit == null) {
          return {
            values: ['', '', ''],
            foregroundColor: 'transparent',
            backgroundColor: 'white'
          }
        }

        const foregroundColor =
          hit.legendIndex >= 0
            ? this.legends[hit.legendIndex].foregroundColor
            : 'black'
        const backgroundColor =
          hit.legendIndex >= 0
            ? this.legends[hit.legendIndex].backgroundColor
            : 'white'

        return {
          values: [hit.cityName, hit.patientsTotal, hit.patientsPer100k],
          foregroundColor,
          backgroundColor
        }
      })
    })
  }
}
</script>

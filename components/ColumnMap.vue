<template>
  <data-view
    class="ColumnMap"
    :title="title"
    :title-id="titleId"
    :date="date"
    :url="url"
    :remarks="remarks"
  >
    <template v-slot:button>
      <p class="Graph-Desc">
        ※
        公表されている居住地が、54市町村以外(尾張地方、三河地方など)の場合や、県外は対象外<br />
        ※ 10万人あたり感染者数の算出には、推計人口(2020年3月1日時点)を使用
      </p>
    </template>

    <table class="tabularmaps">
      <tr v-for="(row, rowIndex) in table" :key="rowIndex">
        <td
          v-for="(cells, colIndex) in row"
          :key="colIndex"
          style=""
          :class="{ tmnull: cells[0] == '' }"
        >
          <div>
            <div
              :class="
                $vuetify.breakpoint.xs
                  ? 'ColumnMap-PanelTextForXS'
                  : 'ColumnMap-PanelText'
              "
            >
              <div
                style="display: flex; flex-direction: column; align-items: flex-center;"
              >
                <span v-for="(cell, cellIndex) in cells" :key="cellIndex">
                  {{ cell }}
                </span>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div v-for="remarks_text in remarks" :key="remarks_text">
      {{ remarks_text }}
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
  &-PanelText {
    font-size: 11px;
    line-height: 1.3;
    width: calc(11px * 4);
    margin: 0 auto;
    white-space: nowrap;
    overflow: hidden;
  }
  &-PanelTextForXS {
    font-size: 9px;
    line-height: 1.3;
    width: calc(9px * 3.5);
    margin: 0 auto;
    white-space: nowrap;
    overflow: hidden;
  }
}

/* tabularmaps */
.tabularmaps {
  border-spacing: 5px;
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

<script>
import DataView from '@/components/DataView.vue'

export default {
  components: { DataView },
  props: {
    title: {
      type: String,
      default: ''
    },
    titleId: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: ''
    },
    data: {
      type: Map,
      required: true,
      default: () => new Map()
    },
    legends: {
      type: Array,
      required: true,
      default: () => []
    },
    url: {
      type: String,
      required: false,
      default: ''
    },
    remarks: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  computed: {
    table() {
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
          const hit = this.data.get(col.trim())
          if (hit == null) {
            return ['', '', '']
          }

          return [hit.cityName, hit.patientsTotal, hit.patientsPer100k]
        })
      })
    }
  }
}
</script>

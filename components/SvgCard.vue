<template>
  <data-view
    class="SvgCard"
    :title="title"
    :title-id="titleId"
    :date="date"
    :url="url"
    :remarks="remarks"
    :subtext="subtext"
    :title-date="titleDate"
    :title-remark="titleRemark"
  >
    <template v-slot:button>
      <p class="Graph-Desc">
        （注）県内において疑い例または患者の濃厚接触者として検査を行ったものについて掲載<br />
        （チャーター機帰国者、クルーズ船乗客等は含まれていない。）<br />
        {{ titleRemark }}
      </p>
    </template>
    <slot />
    <div v-for="remarks_text in remarks" :key="remarks_text">
      {{ remarks_text }}
    </div>
  </data-view>
</template>

<style lang="scss" scoped>
.SvgCard {
  ::v-deep svg {
    width: 100%;
  }
  .Graph-Desc {
    margin-top: 10px;
    margin-bottom: 0;
    font-size: 12px;
    color: $gray-3;
  }
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
    url: {
      type: String,
      required: false,
      default: ''
    },
    remarks: {
      type: Array,
      required: false,
      default: () => []
    },
    subtext: {
      type: String,
      required: false,
      default: ''
    },
    titleDate: {
      type: String,
      required: false,
      default: ''
    },
    titleRemark: {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>

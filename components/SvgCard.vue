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
  >
    <div style="flex-grow: 1; display: flex; align-items: start;">
      <slot />
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

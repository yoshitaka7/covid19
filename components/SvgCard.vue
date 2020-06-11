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
    <div style="flex-grow: 1; display: flex; align-items: center;">
      <slot />
    </div>

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
.SvgCard {
  display: flex;
  flex-direction: column;

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

ul.remarks {
  font-size: 0.75rem;
  list-style-type: '※ ';
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

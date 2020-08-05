<template>
  <div class="DataView-DataInfo">
    <span class="DataView-DataInfo-summary">
      <span class="DataView-DataInfo-summary-items">
        <small class="DataView-DataInfo-summary-unit">{{ lTitle }}</small>
      </span>
      <span class="DataView-DataInfo-summary-items">{{ lText }}</span>
      <span class="DataView-DataInfo-summary-items">
        <small class="DataView-DataInfo-summary-unit">{{ unit }}</small>
      </span>
    </span>
    <br />
    <div class="DataView-DataInfo-date">
      <small class="DataView-DataInfo-date-part">{{ sTextLeft }}</small>
      <small class="DataView-DataInfo-date-part">{{ sTextRight }}</small>
    </div>
  </div>
</template>

<style lang="scss">
.DataView {
  &-DataInfo {
    margin-top: 20px;
    max-width: 45%;
    text-align: right;
    &-summary {
      display: inline-block;
      font-family: Hiragino Sans;
      font-style: normal;
      font-size: 0;
      line-height: 30px;
      &-items {
        font-size: 30px;
        margin: 0 2px;
      }
      &-unit {
        font-size: 0.6em;
      }
    }
    &-date {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    &-date-part {
      display: inline-block;
      white-space: nowrap;
      margin-left: 4px;
      font-size: 12px;
      line-height: 12px;
      color: $gray-3;
    }
  }
}
.DataView {
  @include card-container();
  height: 100%;
  &-Header {
    background-color: transparent !important;
    height: auto !important;
  }
  &-TitleContainer {
    padding: 14px 0 8px;
  }
  &-Title {
    @include card-h2();
  }
  // &-CardText {
  //   margin-bottom: 0px;
  //   margin-top: 20px;
  // }
}
.v-toolbar__content {
  height: auto !important;
}
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class DataViewBasicInfoPanel extends Vue {
  @Prop() private lText!: string
  @Prop() private lTitle!: string
  @Prop() private sText!: string
  @Prop() private unit!: string

  get sTextLeft() {
    const index = this.sText.indexOf('（')
    return this.sText.substring(0, index)
  }

  get sTextRight() {
    const index = this.sText.indexOf('（')
    return this.sText.substring(index)
  }
}
</script>

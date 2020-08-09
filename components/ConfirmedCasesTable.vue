<template>
  <ul :class="$style.container">
    <li :class="$style.box">
      <div :class="$style.inspections">
        <span> {{ $t('検査実施人数') }} </span>
        <span :class="$style.count">
          <strong>{{ formatNumber(検査実施人数) }}</strong>
          <span :class="$style.unit">{{ $t('人') }}</span>
        </span>
      </div>
    </li>
    <li :class="[$style.box, $style.parent]">
      <div :class="$style.content">
        <span> {{ $t('陽性患者数') }} ({{ $t('累積') }}) </span>
        <span :class="$style.count">
          <strong>{{ formatNumber(陽性患者数) }}</strong>
          <span :class="$style.unit">{{ $t('人') }}</span>
        </span>
      </div>
      <ul :class="$style.group">
        <li :class="[$style.box, $style.parent]">
          <div :class="$style.content">
            <span>{{ $t('入院等') }}{{ $t(formatBreakdown(備考)) }}</span>
            <span :class="$style.count">
              <strong>{{ formatNumber(入院中) }}</strong>
              <span :class="$style.unit">{{ $t('人') }}</span>
            </span>
          </div>
          <ul :class="$style.group">
            <li v-if="toNumber(軽症中等症) != null" :class="[$style.box]">
              <div :class="$style.content">
                <!-- eslint-disable vue/no-v-html-->
                <span v-html="$t('軽症・中等症')" />
                <!-- eslint-enable vue/no-v-html-->
                <span :class="$style.count">
                  <strong>{{ formatNumber(軽症中等症) }}</strong>
                  <span :class="$style.unit">{{ $t('人') }}</span>
                </span>
              </div>
            </li>
            <li v-if="toNumber(軽症無症状) != null" :class="[$style.box]">
              <div :class="$style.content">
                <!-- eslint-disable vue/no-v-html-->
                <span v-html="$t('軽症・無症状')" />
                <!-- eslint-enable vue/no-v-html-->
                <span :class="$style.count">
                  <strong>{{ formatNumber(軽症無症状) }}</strong>
                  <span :class="$style.unit">{{ $t('人') }}</span>
                </span>
              </div>
            </li>
            <li v-if="toNumber(中等症) != null" :class="[$style.box]">
              <div :class="$style.content">
                <!-- eslint-disable vue/no-v-html-->
                <span v-html="$t('中等症')" />
                <!-- eslint-enable vue/no-v-html-->
                <span :class="$style.count">
                  <strong>{{ formatNumber(中等症) }}</strong>
                  <span :class="$style.unit">{{ $t('人') }}</span>
                </span>
              </div>
            </li>
            <li :class="[$style.box]">
              <div :class="$style.content">
                <span>{{ $t('重症') }}</span>
                <span :class="$style.count">
                  <strong>{{ formatNumber(重症) }}</strong>
                  <span :class="$style.unit">{{ $t('人') }}</span>
                </span>
              </div>
            </li>
          </ul>
        </li>
        <li :class="[$style.box]">
          <div :class="$style.content">
            <span>{{ $t('施設入所') }}</span>
            <span :class="$style.count">
              <strong>{{ formatNumber(施設入所) }}</strong>
              <span :class="$style.unit">{{ $t('人') }}</span>
            </span>
          </div>
        </li>
        <li :class="[$style.box]">
          <div :class="$style.content">
            <span>{{ $t('転院') }}</span>
            <span :class="$style.count">
              <strong>{{ formatNumber(転院) }}</strong>
              <span :class="$style.unit">{{ $t('人') }}</span>
            </span>
          </div>
        </li>
        <li :class="[$style.box]">
          <div :class="$style.content">
            <span>{{ $t('死亡') }}</span>
            <span :class="$style.count">
              <strong>{{ formatNumber(死亡) }}</strong>
              <span :class="$style.unit">{{ $t('人') }}</span>
            </span>
          </div>
        </li>
        <li :class="[$style.box]">
          <div :class="$style.content">
            <span>{{ $t('退院') }}</span>
            <span :class="$style.count">
              <strong>{{ formatNumber(退院) }}</strong>
              <span :class="$style.unit">{{ $t('人') }}</span>
            </span>
          </div>
        </li>
      </ul>
    </li>
  </ul>
</template>

<i18n>
{
  "ja": {
    "人": "人",
    "累積": "累積",
    "入院等": "入院等",
    "中等症": "中等症",
    "重症": "重症",
    "施設入所": "施設入所",
    "転院": "転院",
    "死亡": "死亡",
    "退院": "退院",
    "軽症・無症状": "軽症・無症状",
    "陽性患者数": "陽性患者数",
    "検査実施人数": "検査実施人数",
    "備考": "備考"
  }
}
</i18n>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component
/* eslint-disable vue/prop-name-casing */
export default class ConfirmedCasedTable extends Vue {
  @Prop()
  public 検査実施人数!: number | string

  @Prop()
  public 陽性患者数!: number | string

  @Prop()
  public 入院中!: number | string

  @Prop()
  public 軽症中等症!: number | string

  @Prop()
  public 軽症無症状!: number | string

  @Prop()
  public 中等症!: number | string

  @Prop()
  public 重症!: number | string

  @Prop()
  public 施設入所!: number | string

  @Prop()
  public 転院!: number | string

  @Prop()
  public 死亡!: number | string

  @Prop()
  public 退院!: number | string

  @Prop()
  public 備考!: string

  toNumber(value: number | string): number | undefined {
    if (value == null || value === '') {
      return undefined
    }
    return Number(value)
  }

  formatNumber(value: number | string): string {
    if (value == null || value === '') {
      return '-'
    }
    return Number(value).toLocaleString()
  }

  formatBreakdown(remarks: string): string {
    const startpos = remarks.indexOf('入院等の内訳')
    if (startpos < 0) {
      return ''
    }
    const endpos = remarks.indexOf('。', startpos + 6)
    return (
      '（' +
      (endpos < 0
        ? remarks.substring(startpos + 4)
        : remarks.substring(startpos + 4, endpos)) +
      '）'
    )
  }
}
</script>

<style lang="scss" module>
$default-bdw: 3px;
$default-boxdiff: 35px;
$default-color: #bd3f4c;
$inspections-color: #333333;
// .container > .box > (.group > .box > ...) .pillar > .content
.container {
  width: 100%;
  box-sizing: border-box;
  color: $default-color;
  line-height: 1.35;
  * {
    box-sizing: border-box;
  }
  // override default styles
  padding-left: 0 !important;
  ul {
    padding-left: 0;
  }
}
.group {
  flex: 0 0 auto;
  padding-left: $default-bdw !important;
  border-top: $default-bdw solid $default-color;
  border-left: $default-bdw solid $default-color;
}
.content {
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border: $default-bdw solid $default-color;
  > span {
    display: block;
    @include font-size(14);
    &:first-child {
      text-align: left;
      margin-top: 1px;
      flex-shrink: 2;
    }
    &:last-child {
      margin-left: 10px;
      text-align: right;
      // white-space: nowrap;
      flex-shrink: 1;
    }
    &:not(:last-child) {
      overflow-wrap: break-word;
    }
  }
  strong {
    @include font-size(16);
  }
  span.unit {
    @include font-size(14);
  }
  span.count {
    white-space: nowrap;
  }
}
.inspections {
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border: $default-bdw solid $inspections-color;
  color: $inspections-color;
  > span {
    display: block;
    @include font-size(14);
    &:first-child {
      text-align: left;
      margin-top: 1px;
      flex-shrink: 2;
    }
    &:last-child {
      margin-left: 10px;
      text-align: right;
      // white-space: nowrap;
      flex-shrink: 1;
    }
    &:not(:last-child) {
      overflow-wrap: break-word;
    }
  }
  strong {
    @include font-size(16);
  }
  span.unit {
    @include font-size(14);
  }
  span.count {
    white-space: nowrap;
  }
}
.box {
  display: block;
  margin-top: $default-bdw;
  &.parent {
    border-top: $default-bdw solid $default-color;
    border-left: $default-bdw solid $default-color;
    position: relative;
    padding-left: $default-boxdiff - $default-bdw * 2;
    &::after {
      content: '';
      display: block;
      position: absolute;
      left: -1px;
      bottom: 0;
      width: $default-boxdiff - $default-bdw - 2;
      border-bottom: $default-bdw solid $default-color;
    }
    > .content {
      margin-left: -($default-boxdiff - $default-bdw * 2);
      width: calc(100% + #{($default-boxdiff - $default-bdw * 2)});
      border-top: none;
      border-left: none;
      border-bottom: none;
    }
  }
}
@function px2vw($px, $vw: 0) {
  @if $vw > 0 {
    @return ceil($px / $vw * 100000vw) / 1000;
  } @else {
    @return $px * 1px;
  }
}
@mixin override($vw, $bdw, $fz, $boxdiff) {
  .group {
    padding-left: px2vw($bdw, $vw) !important;
    border-top: px2vw($bdw, $vw) solid $default-color;
    border-left: px2vw($bdw, $vw) solid $default-color;
  }
  .content {
    padding: px2vw(5, $vw) px2vw(10, $vw);
    border: px2vw($bdw, $vw) solid $default-color;
    > span {
      @include font-size($fz);
      &:first-child {
        margin-top: px2vw(1, $vw);
      }
      &:last-child {
        margin-left: 10px;
      }
    }
    strong {
      @include font-size($fz + 2);
    }
    span.unit {
      @include font-size($fz);
    }
  }
  .inspections {
    padding: px2vw(5, $vw) px2vw(10, $vw);
    border: px2vw($bdw, $vw) solid $inspections-color;
    > span {
      @include font-size($fz);
      &:first-child {
        margin-top: px2vw(1, $vw);
      }
      &:last-child {
        margin-left: 10px;
      }
    }
    strong {
      @include font-size($fz + 2);
    }
    span.unit {
      @include font-size($fz);
    }
  }
  .box {
    margin-top: px2vw($bdw, $vw);
    &.parent {
      border-top: px2vw($bdw, $vw) solid $default-color;
      border-left: px2vw($bdw, $vw) solid $default-color;
      padding-left: px2vw($boxdiff, $vw) - px2vw($bdw, $vw) * 2;
      &::after {
        width: px2vw($boxdiff - $bdw, $vw);
        border-bottom: px2vw($bdw, $vw) solid $default-color;
      }
      > .content {
        margin-left: -(px2vw($boxdiff, $vw) - px2vw($bdw, $vw) * 2);
        width: calc(100% + #{(px2vw($boxdiff, $vw) - px2vw($bdw, $vw) * 2)});
      }
    }
  }
}
// Vuetify Breakpoints: Large (1264)
@include lessThan(1263) {
  @include override(1263, 3, 14, 35);
}
// Vuetify Breakpoints: Small (960)
@include lessThan(959) {
  @include override(960, 3, 14, 35);
}
// Vuetify Breakpoints: Extra Small (600)
@include lessThan(600) {
  @include override(600, 3, 14, 35);
}
</style>

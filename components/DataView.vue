<template>
  <v-card class="DataView pa-1">
    <div class="DataView-content">
      <div class="DataView-TitleContainer">
        <h3 :id="titleId" class="DataView-ToolbarTitle">
          {{ title }}
        </h3>
        <div v-if="titleDate" class="DataView-ToolbarTitleDate">
          {{ formattedTitleDate }} 時点
        </div>
        <slot name="button" />
      </div>
      <slot name="infoPanel" />
    </div>
    <v-card-text
      :class="
        $vuetify.breakpoint.xs ? 'DataView-CardTextForXS' : 'DataView-CardText'
      "
    >
      <slot />
    </v-card-text>
    <v-footer class="DataView-Footer" width="97%">
      <time :datetime="formattedDate">{{ date }} 更新</time>
      <a
        v-if="url"
        class="OpenDataLink"
        :href="url"
        target="_blank"
        rel="noopener"
      >
        出典: 愛知県新型コロナウイルス感染症対策サイト{{ subtext }}
        <v-icon class="ExternalLinkIcon" size="15">
          mdi-open-in-new
        </v-icon>
      </a>
    </v-footer>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import {
  convertDatetimeToISO8601Format,
  convertDateToShortFormat
} from '@/utils/formatDate'

@Component
export default class DataView extends Vue {
  @Prop() private title!: string
  @Prop() private titleId!: string
  @Prop() private date!: string
  @Prop() private url!: string
  @Prop() private info!: any // FIXME expect info as {lText:string, sText:string unit:string}
  @Prop() private titleDate!: string
  @Prop() private remarks!: object
  @Prop() private subtext!: string

  formattedDate: string = convertDatetimeToISO8601Format(this.date)
  formattedTitleDate: string = convertDateToShortFormat(this.titleDate)
}
</script>

<style lang="scss">
.RemarksLink {
  font-size: 0.75rem;
  text-decoration: none;
  .ExternalLinkIcon {
    vertical-align: text-bottom;
  }
}
.DataView {
  &-DataInfo {
    &-summary {
      color: $gray-2;
      font-family: Hiragino Sans;
      font-style: normal;
      font-size: 30px;
      line-height: 30px;
      white-space: nowrap;
      &-unit {
        font-size: 0.6em;
        width: 100%;
      }
    }
    &-date {
      font-size: 12px;
      line-height: 12px;
      color: $gray-3;
      width: 100%;
      display: inline-block;
    }
  }
}
.DataView {
  @include card-container();
  display: flex;
  flex-direction: column;
  height: 100%;
  &-content {
    display: flex;
    padding: 4px 16px;
    height: auto !important;
    .v-toolbar__content {
      align-items: start;
    }
  }
  &-Header {
    background-color: transparent !important;
    height: auto !important;
  }
  &-TitleContainer {
    flex-grow: 1;
    padding-right: 4px;
    color: $gray-2;
  }
  &-Title {
    @include card-h2();
  }
  &-ToolbarTitle {
    font-size: 1.25rem;
    font-weight: normal;
    line-height: 1.5;
  }
  &-ToolbarTitleDate {
    width: 100%;
    text-align: right;
    white-space: nowrap;
    display: inline-block;
    font-size: 12px;
    line-height: 12px;
    color: $gray-3;
  }
  &-CardText {
    margin-bottom: 0px;
    margin-top: 0px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  &-CardTextForXS {
    margin-bottom: 0px;
    margin-top: 0px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  &-Footer {
    background-color: $white !important;
    margin: 2px 4px 12px;
    @include font-size(12);
    color: $gray-3 !important;
    justify-content: space-between;
    flex-direction: row-reverse;
    .OpenDataLink {
      text-align: right;
      white-space: normal;
      font-size: 0.75rem;
      text-decoration: none;
      .ExternalLinkIcon {
        vertical-align: text-bottom;
      }
    }
  }
}
.v-toolbar__content {
  height: auto !important;
}
</style>

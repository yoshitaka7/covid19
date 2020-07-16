<template>
  <v-expansion-panels v-model="expands" :flat="true" :accordion="false">
    <v-expansion-panel class="remarks_panel">
      <v-expansion-panel-header :hide-actions="true">
        注記
        <span>
          <v-icon v-if="expands != '0'" size="20">
            $expand
          </v-icon>
          <v-icon
            v-if="expands == '0'"
            size="20"
            style="transform: rotate(180deg);"
          >
            $expand
          </v-icon>
        </span>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <ul>
          <!-- eslint-disable vue/no-v-html -->
          <li
            v-for="remarks_text in remarks"
            :key="remarks_text"
            v-sanitaize
            v-html="remarks_text"
          />
          <!-- eslint-disable vue/no-v-html -->
        </ul>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class RemarksView extends Vue {
  @Prop() private remarks!: object
  expands = ''
}
</script>

<style lang="scss" scoped>
.remarks_panel {
  color: $gray-3 !important;

  ul {
    font-size: 0.75rem;
    list-style-type: '※ ';
    padding-left: 0px;
  }

  .v-expansion-panel-header {
    font-size: 0.75rem;
    min-height: 0px;
    padding: 0px;
  }
}
</style>

<style lang="scss">
.RemarksLink {
  font-size: 0.75rem;
  text-decoration: none;
  .ExternalLinkIcon {
    vertical-align: text-bottom;
  }
}
</style>

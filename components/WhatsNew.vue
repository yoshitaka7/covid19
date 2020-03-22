<template>
  <div class="WhatsNew">
    <a
      class="WhatsNew-list-item-anchor"
      :href="url"
      target="_blank"
      rel="noopener"
    >
      <v-icon size="18" class="WhatsNew-heading-icon">
        mdi-information
      </v-icon>
      <time
        class="WhatsNew-list-item-anchor-time px-2"
        :datetime="formattedDate(date)"
      >
        {{ date }}
      </time>
      <span class="WhatsNew-list-item-anchor-link">
        {{ text }}
        <v-icon
          v-if="!isInternalLink(url)"
          class="WhatsNew-item-ExternalLinkIcon"
          size="12"
        >
          mdi-open-in-new
        </v-icon>
      </span>
    </a>
  </div>
</template>

<script>
import { convertDateToISO8601Format } from '@/utils/formatDate'

export default {
  props: {
    text: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  methods: {
    isInternalLink(path) {
      return !/^https?:\/\//.test(path)
    },
    formattedDate(dateString) {
      return convertDateToISO8601Format(dateString)
    }
  }
}
</script>

<style lang="scss">
.WhatsNew {
  @include card-container();
  padding: 10px;
  margin-bottom: 20px;
}

.WhatsNew-heading {
  display: flex;
  align-items: center;
  @include card-h2();
  margin-bottom: 12px;
  color: $gray-2;
  margin-left: 12px;

  &-icon {
    margin: 0 3px;
    color: $gray-2 !important;
  }
}

.WhatsNew .WhatsNew-list {
  padding-left: 0px;
  list-style-type: none;

  &-item {
    &-anchor {
      display: flex;
      text-decoration: none;
      margin: 5px;
      font-size: 14px;

      @include lessThan($medium) {
        flex-wrap: wrap;
      }

      &-time {
        flex: 0 0 auto;
        @include lessThan($medium) {
          flex: 0 0 100%;
        }
        color: $gray-1;
      }

      &-link {
        flex: 0 1 auto;
        @include text-link();
        @include lessThan($medium) {
          padding-left: 8px;
        }
      }

      &-ExternalLinkIcon {
        margin-left: 2px;
        color: $gray-3 !important;
      }
    }
  }
}
</style>

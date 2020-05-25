<template>
  <div class="WhatsNew">
    <nuxt-link class="WhatsNew-list-item-anchor" :to="url">
      <v-icon size="18" class="WhatsNew-heading-icon">
        mdi-information
      </v-icon>
      <div class="WhatsNew-list-item-anchor-time px-2" />
      <span class="WhatsNew-list-item-anchor-link">
        {{ text }}
      </span>
    </nuxt-link>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }
}
</script>

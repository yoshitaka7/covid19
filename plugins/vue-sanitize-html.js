import Vue from 'vue'
import VueSanitizeHtml from 'vue-sanitize-html-plugin'

Vue.use(VueSanitizeHtml, {
  allowedTags: ['a'],
  allowedAttributes: {
    a: ['href', 'class', 'target']
  }
})

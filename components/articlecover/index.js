Component({
  properties: {
    article: {
      type: Object,
      value: ''
    },

    index: {
      type: Number,
      value: 0
    },
    
  },
  methods: {
    gotoarticle(v) {
      var id = this.data.article.id
      this.triggerEvent('gotoarticle', { id: id })
    }
  }
});

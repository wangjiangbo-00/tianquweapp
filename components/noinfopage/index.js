Component({
  properties: {
    src: {
      type: String,
      value: ''
    },

    message: {
      type: String,
      value: ''
    },
    tips: {
      type: String,
      value: ''
    },
    
  },
  methods: {
    gotoarticle(v) {
      var id = this.data.article.id
      this.triggerEvent('gotoarticle', { id: id })
    }
  }
});

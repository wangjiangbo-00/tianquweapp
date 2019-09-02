Component({
  properties: {
    item: {
      type: Object,
      value: ''
    },

    index: {
      type: Number,
      value: 0
    },
    
  },
  methods: {
    gogroup(e) {
      
      var item = this.data.item;

      wx.setStorageSync("currentgroup", item);

      wx.navigateTo({
        url: '../goods/goods?goods_id=' + item.goodsBasic.id,
      })


    },
    gotoarticle(v) {
      var id = this.data.article.id
      this.triggerEvent('gotoarticle', { id: id })
    }
  }
});

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
        url: '../goodsgroup/goodsgroup?id=' + item.id + "&&goods_id=" + item.goodsCover.id,
      })


    },
    gotoshop(v) {
      var id = this.data.item.shopCover.id
      wx.navigateTo({
        url: '../shopdetail/shopdetail?shopid=' + id,
      })
    }
  }
});

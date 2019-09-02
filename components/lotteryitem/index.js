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
    golottery(e) {
      
      var item = this.data.item;

      wx.navigateTo({
        url: '../lottery/lottery?lotteryid=' + item.id,
      })


    },
    gotoshop(v) {
      var id = this.data.item.shopid
      wx.navigateTo({
        url: '../shopdetail/shopdetail?shopid=' + id,
      })
    }
  }
});

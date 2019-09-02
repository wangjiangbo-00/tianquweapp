Component({
  properties: {
    items: {
      type: Array,
      value: []
    },

    index: {
      type: Number,
      value: 0
    },
    
  },
  methods: {
    gotogoods(e) {
      
      var id = e.currentTarget.dataset.id;
      var url = '../goods/goods?goods_id=' + id
      wx.navigateTo({
        url: url,
      })
    }
  }
});

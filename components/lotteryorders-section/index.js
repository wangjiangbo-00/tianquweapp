Component({
  properties: {
    orders: {
      type: Array,
      value: []
    },

    index: {
      type: Number,
      value: 0
    },
    
  },
  methods: {
    orderAction(e) {
      
      var order_id = e.currentTarget.dataset.order_id;
      var index = e.currentTarget.dataset.index;
      var action = e.currentTarget.dataset.action;
      
      this.triggerEvent('orderAction', { order_id: order_id,index:index,action:action })
    },
    todetails(e){
      var order_id = e.currentTarget.dataset.order_id;
      var type = e.currentTarget.dataset.type;
      
      if (type == 0 || type == 3 || type == 4 )
      {
        var url = "../order/order?id=" + order_id;
        url+="&&viewtype=" + type;
        wx.navigateTo({
          url: url,
        })
      }
      else if (type == 1)
      {
        var index = e.currentTarget.dataset.index;
        var order = this.data.orders[index];
        var url = "../group/group?id=" + order.groupOrderId + "&order_id=" + order.id;
        
        wx.navigateTo({
          url: url,
        })
      }
      else if (type == 2) {
        var url = "../refundprocess/refundprocess?id=" + order_id;
        wx.navigateTo({
          url: url,
        })
      }
      
    }
  }
});

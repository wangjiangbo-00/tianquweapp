var util = require('../../utils/util.js')

const app = getApp()
Page({
  data: {
    "order": [],
    "URL": 　3,
    "modalHidden": true,
    hiddenmodalput: true,
    "pageName": "售后详情"
  },
  onLoad: function (options) {
    this.is_onload = 1;
    app.setRecommender(options);
    this.loadding();
    this.orderid = options.id;
    var self = this;

    this.getConfig();
    app.checkNavbar(this);


    util.checkNet({
      success: function () {
        util.succNetCon(self);
        var orders = self.getData();//token,this.offset,this.size
      },
      error: function () {
        util.notNetCon(self, 1);
      }
    });
    // 页面初始化 options为页面跳转所带来的参数
  },
  onCompanyInput: function (e) {
    this.setData({
      company: e.detail.value
    });
  },

  onCodeInput: function (e) {
    this.setData({
      code: e.detail.value
    });
  },
  editShopAddr:function(){
    this.setData({
      "hiddenmodalput": false,
    });
  },

  confirm: function (e) {
    var that = this;
    var orderid = this.data.order.orderid;
    var company = this.data.company;
    var code = this.data.code;
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/setrefundexpressinfo?";
    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += orderid
    url += "&&companyname=";
    url += company
    url += "&&code=";
    url += code
    wx.request({
      url: url,

      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res.data)

        var returncode = res.data.returncode;
        that.setData({
          hiddenmodalput: true
        });
        if (returncode == 0) {
          wx.showToast({
            title: '修改成功',
            icon: '',
            image: '',
            duration: 1000,
            mask: true,
            success: function(res) {

            },
            fail: function(res) {},
            complete: function(res) {},
          })

        }
      }
    })
    this.setData({
      hiddenmodalput: true
    })
  },

  cancel: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  //配置方法
  getConfig: function () {
    var token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl();
    this.size = util.config('page_size');
    this.offset = util.config('page_offset');
    this.token = token;
    this.page = 1;
    this.refundprocess_status = util.config('refundprocess_status');
  },
  loadding: function () {
    util.loadding(this);
  },
  loaded: function () {
    util.loaded(this);
  },
  makecall: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.order.shopphone,
    })

  },
  getData: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getrefundprocess?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += this.orderid

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {
          var order = data.message;

          order.order_time = util.formatTime(order.createtime);
          order.refundprocess_status_lang = self.refundprocess_status[order.status];

          order.orderGoods.introduction = order.orderGoods.goodtitle
          order.orderGoods.cover = order.orderGoods.goodposter
          order.orderGoods.group_number = order.orderGoods.group_number
          order.order_price = order.orderGoods.goods_price
          order.orderGoods.id = order.orderGoods.goodId
          order.shipfeedesp = "免运费"

          if (order.applypics) {
            var pics = order.applypics.split(";");
            for (var i = 0; i < pics.length; i++) {
              //pics[i] = "http://p4wgvxk6d.bkt.clouddn.com/" + pics[i];
            }
            order.applypics = pics;
          }

          if (order.applyreason == 0) {
            order.reasonstr = "商品变质";
          }
          else if (order.applyreason == 1) {
            order.reasonstr = "商家发错货";
          }
          else if (order.applyreason == 2) {
            order.reasonstr = "物流破损严重";
          }
          else {
            order.reasonstr = "商家发错货";
          }


          if (order.applymode == 0) {
            order.modestr = "只退款";
          }
          else {
            order.modestr = "退货退款";
          }


          self.setData({ "order": order });

          if (order.status >= 5)
          {
            self.getShopAddr();

          }
        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
          return false;
        }
      }
    });
  },

  getShopAddr: function (e) {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getshopsendbackaddr?";

    url += "session=";
    url += app.globalData.session

    url += "&&shopid=";
    url += this.data.order.shopid

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {
          var addr = data.message;


          self.setData({ "addr": addr });
          


          
        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
          return false;
        }
      }
    });
  },
  showShopAddr: function (e) {
    var self = this;
    this.setData({
      "service_detail": 1
    });
    setTimeout(function () {
      self.setData({ "service_detail": 2 });
    }, 150)
  },
  close_service_detail: function (e) {
    this.setData({
      "service_detail": 0
    });
  },
  orderBuy: function (e) {
    if (this.data.btn_order_done) return true;
    this.setData({
      "btn_order_done": true
    });
    this.order_id = e.currentTarget.dataset.order_id;
    this.url = this.baseApiUrl;
    this.session = app.globalData.session;
    util.wxpay(this);
    this.order_id = false;
  },
  //取消訂單
  orderCancel: function (e) {
    this.order_id = e.currentTarget.dataset.order_id;

    var self = this;

    wx.showModal({
      title: '确定“取消订单”吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          self.modalConfirm();
        }
      }
    })

  },
  modalConfirm: function (e) {
    var self = this;
    if (this.order_id == undefined) {
      return false;
    }
    var token = this.token;
    var url = this.baseApiUrl;

    url += "/ziyoutechan/customer/cancelorder?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += this.id


    util.loadding(self, 1);
    util.ajax({
      "url": url,
      "method": 　"GET",

      "success": function (data) {
        if (data.returncode == 0) {
          util.toast(self, '订单取消成功');
          self.loaded();
          self.refresh();
        } else {
          self.error(data);
        }
      }
    });
    this.order_id = undefined;
  },
  modalCancel: function (e) {
    this.setData({
      'modalHidden': true
    });
    this.order_id = undefined;
  },
  refresh: function (e) {
    var self = this;
    util.checkNet({
      success: function () {
        util.succNetCon(self);
        var orders = self.getData();//token,this.offset,this.size
      },
      error: function () {
        util.notNetCon(self, 0);
      }
    });
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
    this.getData();
    wx.stopPullDownRefresh();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    if (!this.is_onload) {
      var orders = this.getData();
    } else {
      this.is_onload = 0;
    }
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
    wx.removeStorageSync("refundprocess")
  },
  error: function (data) {
    this.loaded();
    if (data['result'] == 'fail') {
      util.toast(this, data.error_info);
    }
  },
  
  
  

  editApply: function () {
    var url = "../refundapply/refundapply?orderid=";
    url += this.data.order.orderid
    url += "&&isadd=0"
    
    wx.setStorageSync("refundprocess", this.data.order)


    wx.navigateTo({
      url: url,
    })
  },

  toOrder: function() {


    var url = "../order/order?id=" + this.orderid ;
    url += "&&viewtype=0";
    wx.navigateTo({
      url: url,
    })
    

   


    
  }
  ,
  orderReceive: function (e) {
    this.order_id = e.currentTarget.dataset.order_id;
    var self = this;
    wx.showModal({
      title: '确定“确认收货”吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          self.orderReceiveFun();
        } else if (res.cancel) { }
      }
    })
  },
  orderReceiveFun: function () {
    var order_id = this.order_id;
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/conformReceive?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += order_id
    var self = this;
    var data = {
    };

    this.loadding();
    util.ajax({
      "url": url,
      "method": 　"POST",
      "data": data,
      "success": function (data) {
        if (data['result'] == "ok") {
          self.loaded();
          self.refresh();
        } else {
          self.error(data);
        }
      }
    });
  }
})
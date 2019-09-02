var util = require('../../utils/util.js')
const app = getApp()
Page({
  data: {
    "URL": 3,
    "is_over": false,
    "no_data": false,
    "modalHidden": true,
    "expressOpen": 0,
    "modalHidden1": true,
    "express": {
      'error': false,
      'info': '',
      'load': true
    },
    "orders": false,
    order_type: 'tab1',
    "pageName": "限时折扣",
    needhome: true, 
    "nothing_text": "暂时没有商品参加这个活动",
    
    // text:"这是一个页面"
  },
  onLoad: function(options) {

    app.setRecommender(options);
    app.checkNavbar(this);
    this.is_onload = 1;

    this.options = options;

    var pid = options.id;

    this.getConfig();

    var platformactivitiy = wx.getStorageSync("platformactivitiy");


    if (platformactivitiy)
    {
      this.setData({
        "pid": pid,
        "platformactivitiy": platformactivitiy,
        "pageName": platformactivitiy.discount_name
      });

    }
    else{
      this.setData({
        "pid": pid,
        
      });

      this.getDiscountInfo();
    }




    

    

    wx.removeStorageSync("platformactivitiy");

    var status = wx.getStorageSync("order_status");

    this.order_status = status;


    

    if (status == undefined || status == '') {
      this.setData({
        "all_status": 0
      });
      this.order_status = 0
    } else {
      this.setData({
        "all_status": this.order_status
      });
    }

    var self = this;
    util.checkNet({
      success: function() {
        util.succNetCon(self);

         self.getData(); //token,this.offset,this.size

        
      },
      error: function() {
        util.notNetCon(self);
      }
    });


  },


  
  


  //配置方法
  getConfig: function() {
    var token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl();
    this.size = util.config('page_size');
    this.size = 5;
    this.offset = util.config('page_offset');
    this.token = token;
    this.page = 1;

    this.setData({
      'pullload_text': util.config('pullload_text')
    });
  },

  onReady: function() {
    // 页面渲染完成
  },
  onShow: function(e) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })

    if (!this.is_onload) {
      var order_status = wx.getStorageSync('order_status');
      // 页面初始化 options为页面跳转所带来的参数
      if (order_status != '') {

        var all_status = order_status;
        this.setData({
          "all_status": all_status
        });
        this.order_status = all_status;


        wx.removeStorageSync('order_status');
        this.refresh(1);
      } else {
        this.refresh();
      }
    } else {
      this.is_onload = 0;
    }

  },
  pullDown: function(e) {
    if (this.data.is_over == 1) return false;
    this.setData({
      "pullDown": 1
    });
    if (!this.data.is_over) {
      this.page = this.page + 1;
      this.getData();
    }
  },
  pullUpLoad: function(e) {},

  getDiscountInfo: function (isclear = 0) {
    if (this.data.no_data == 1) return false;


    var offset = (this.page - 1);
    var order_status = this.order_status;
    var size = this.size;


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getplatformactivitiyinfo?";

    url += "session=";
    url += app.globalData.session

    url += "&&pid=";
    url += this.data.pid;


    var data = {
      "offset": offset,
      "size": size,

    };

    var self = this;
    util.ajax({
      url: url,
      data: data,
      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {

          var platformactivitiy = data.message;

          self.setData({
            
            "platformactivitiy": platformactivitiy,
            "pageName": platformactivitiy.discount_name
          });

          
        } else {
          self.error(data);
          return false;
        }
      }
    });
  },
  getData: function(isclear = 0) {
    if (this.data.no_data == 1) return false;


    var offset = (this.page - 1);
    var order_status = this.order_status;
    var size = this.size;


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getplatformdiscountgoods?";

    url += "session=";
    url += app.globalData.session

    url += "&&pid=";
    url += this.data.pid;


    var data = {
      "offset": offset,
      "size": size,

    };

    var self = this;
    util.ajax({
      url: url,
      data: data,
      method: "GET",
      success: function(data) {
        self.loaded();
        if (data.returncode == 0) {

          var order_list = data.lists;
          var order_status = util.config('order_status');
          var discountgoods = order_list.map(function (item) {


            item.starttime = util.formatTime(item.starttime);
            item.endtime = util.formatTime(item.endtime);

            
            return item;
          });

          var allData = '';
          var agoData = isclear ? false : self.data.scroll_items;

          if (discountgoods.length != 0) {

            if (agoData) {
              allData = agoData;
              discountgoods.map(function (item) {
                allData.push(item);
              });
            } else {
              allData = discountgoods;
            }
            self.setData({
              "scroll_items": allData
            });


            if (discountgoods.length < self.size) {
              self.setData({
                "is_over": 1,

              });
            }

          } else {
            if (!agoData) {

              self.setData({
                scroll_items: []

              });
              self.setData({
                "is_over": 1,
                "no_data": 1
              });
            }
            else {
              self.setData({
                scroll_items: agoData

              });
              self.setData({
                "is_over": 1,

              });
            }
          }
        } else {
          self.error(data);
          return false;
        }
      }
    });
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },


  handleChange: function(e) {
    var self = this;

    self.setData({
      "all_status": e.detail.index,
      pullDown: 0
    });

    util.checkNet({
      success: function() {
        util.succNetCon(self);
        util.loadding(self, 1);
        self.setData({
          'scroll_items': false,
          'is_over': 0,
          'no_data': 0,
          'pullUpLoad': 0
        });
        self.order_status = e.detail.key;
        self.page = 1;
        self.getData();
      },
      error: function() {
        util.notNetCon(self, 0);
      }
    });
    //util.loaded(this);
  },
  
  orderPay: function(order_id, index) {
    if (this.data.btn_order_done) return true;
    this.setData({
      "btn_order_done": true
    });
    this.order_id = order_id;
    this.session = app.globalData.session;
    util.wxpay(this);
    this.order_id = false;
  },
  orderCancel: function(order_id, index) {
    this.order_id = order_id;

    var self = this;


    wx.showModal({
      title: '取消订单',
      content: '取消订单后，订单将彻底删除，请确认',
      success: function(res) {
        if (res.confirm) {
          self.modalConfirm();
        }
      }
    })



  },

  toGift: function(order_id, index) {

    var order = this.data.orders[index];
    var url = "../sendgift/sendgift";

    order.isdetails = false;

    wx.setStorageSync("giftorder", order)
    wx.navigateTo({
      url: url,
    })

  },
  orderReceive: function(order_id, index) {

    this.order_id = order_id;

    var self = this;
    wx.showModal({
      title: '确定“确认收货”吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          self.orderReceiveFun();
        } else if (res.cancel) {}
      }
    })
  },


 
  //取消訂單

  loadding: function() {
    util.loadding(this);
  },
  loaded: function() {
    util.loaded(this);
  },
  error: function(data) {
    this.loaded();
    //如果是 查询物流信息出错 不显示弹窗
    if (data.error_code == '41001') {
      this.setData({
        'express': {
          "loading": false,
          "error": 1,
          "info": util.config('error_text')[8]
        }
      });
      return true;
    }

    if (data['result'] == 'fail') {
      util.toast(this, data.error_info);
    }
  },
  
  
  //初始化数据
  refresh: function(isclear = 0) {
    var self = this;
    util.checkNet({
      success: function() {
        util.succNetCon(self);


        //是否清空已有数据
        if (isclear) {
          util.loadding(self);
          self.setData({
            'is_over': 0,
            'no_data': 0,
            'pullDown': 0
          });
          self.page = 1;
          self.setData({
            'orders': false
          });
          self.getData();
        } else {
          //加载数据完毕后，重载新数据
          if (self.page == 1) {
            self.setData({
              'is_over': 0,
              'no_data': 0,
              'pullDown': 0
            });
            self.getData(1);
          }
        }

        self.order_id = undefined;

      },
      error: function() {
        util.notNetCon(self, 0);
      }
    });
  },
  onShareAppMessage: function () {

    

    var title = this.data.platformactivitiy.discount_name + "活动正在火热进行,快来尽享超低折扣吧"

    var pid = this.data.platformactivitiy.discountid;

    
    return getApp().share({ title: title, desc: "", path: "pages/platformdiscounts/platformdiscounts?id=" + pid });
      },
  close_express: function() {
    this.setData({
      'expressOpen': 0,
      'shipping_info': {},
      'express': {
        "loading": false
      }
    });
  },

})
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
    "scroll_items": false,
    order_type: 'tab1',
    "pageName": "超级团购",
    needhome: true,
    "nothing_text": "暂时没有团购活动",
 
    // text:"这是一个页面"
  },
  onLoad: function(options) {
    this.is_onload = 1;
    app.setRecommender(options);
    app.checkNavbar(this);
    this.options = options;

    var status = wx.getStorageSync("order_status");

    this.order_status = status;


    this.getConfig();

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

        var orders = self.getData(); //token,this.offset,this.size
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
  getData: function(isclear = 0) {
    if (this.data.is_over == 1) return false;


    var offset = (this.page - 1);
    var datastatus = this.data.all_status;
    var size = this.size;


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getplatformgroup?";

    url += "session=";
    url += app.globalData.session

    if (datastatus != undefined) {
      url += "&&datastatus=";
      url += this.data.all_status;
    } else {
      url += "&&datastatus=";
      url += -1;
    }


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
          var groups = order_list.map(function (item) {


            var stage_format = item.stage_format;

            if (stage_format==null)
            {
              return null;
            }

            var stages = stage_format.split(",");

            var statge = stages[stages.length - 1];

            var stagevalues = statge.split(":");

            var num = stagevalues[0];

            var discount = parseFloat(stagevalues[1]).toFixed(1) ;

            item.discount = discount;
          



            item.starttime_lang = util.formatTimeWithyrsf(item.starttime);
            item.expiretime_lang = util.formatTimeWithyrsf(item.expiretime);
            

           

            if (item.status == 4)
            {
              item.status_lang = "即将开始";
              item.status_class = "status_coming";
            }
            else if (item.status == 5)
            {
              item.status_lang = "正在进行";
              item.status_class = "status_on";
            }
            else if (item.status > 5) {
              item.status_lang = "已经结束";
              item.status_class = "status_over";
            }
            return item;
          });

          var allData = '';
          var agoData = isclear ? false : self.data.scroll_items;

          if (groups.length != 0) {

            if (agoData) {
              allData = agoData;
              groups.map(function (item) {
                allData.push(item);
              });
            } else {
              allData = groups;
            }
            self.setData({
              "scroll_items": allData
            });


            if (groups.length < self.size) {
              self.setData({
                "is_over": 1,

              });
            }

          } else {
            if (self.data.scroll_items == false || isclear) self.setData({
              scroll_items: []
            });
            self.setData({
              "is_over": 1,
              "no_data": 1
            });
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


  handleChange: function (e) {
    var self = this;

    self.setData({ "all_status": e.detail.key, pullDown: 0 });

    util.checkNet({
      success: function () {
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
      error: function () {
        util.notNetCon(self, 0);
      }
    });
    //util.loaded(this);
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

    
    return getApp().share({ title: "田趣邀您参加超级团购，快来看看吧", desc: "", path: "pages/supergroups/supergroups?useless=0" }); 
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
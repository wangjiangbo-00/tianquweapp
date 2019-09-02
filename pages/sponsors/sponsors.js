var util = require('../../utils/util.js')
const app = getApp()

import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';
import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';
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
    "pageName": "免费抽奖",
    needhome: true,
    "nothing_text": "您还未发起过抽奖",
    "nothing_tips": "去发起一个试试吧",


    // text:"这是一个页面"
  },
  onLoad: function (options) {
    this.is_onload = 1;
    app.setRecommender(options);
    app.checkNavbar(this);
    this.options = options;

    var status = 0;



    this.getConfig();


    this.setData({
      "all_status": status
    });


    var self = this;
    util.checkNet({
      success: function () {
        util.succNetCon(self);

        self.getData(); //token,this.offset,this.size
      },
      error: function () {
        util.notNetCon(self);
      }
    });


  },


  //配置方法
  getConfig: function () {
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

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function (e) {
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
  pullDown: function (e) {
    if (this.data.is_over == 1) return false;
    this.setData({
      "pullDown": 1
    });
    if (!this.data.is_over) {
      this.page = this.page + 1;
      this.getData();
    }
  },
  pullUpLoad: function (e) { },
  getData: function (isclear = 0) {
    if (this.data.no_data == 1) return false;


    var offset = (this.page - 1);
    var datastatus = this.data.all_status;
    var size = this.size;


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getuserlotterys?";

    url += "session=";
    url += app.globalData.session

    


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

          var lotterys = data.lists;
        

          var lotterys = lotterys.map(function (lottery) {

            
            lottery.start_time = util.formatTimeWithyrsf(lottery.start_time);
            lottery.end_time = util.formatTimeWithyrsf(lottery.endtime);
            lottery.createtime = util.formatTimeWithyrsf(lottery.createtime);

            

            if (lottery.mode == 2 || lottery.mode == 3) {
              var parms = JSON.parse(lottery.parms);

              lottery.chance = parms.chance
            }
            else if (lottery.mode == 4) {
              var parms = JSON.parse(lottery.parms);

              lottery.peoplenum = parms.num
            }

            if (lottery.status == 0) {
              lottery.status_lang = "等待上架";
              ;
            }


            else if (lottery.status == 1) {
              lottery.status_lang = "申请上架中";
              ;
            }

            else if (lottery.status == 2) {
              lottery.status_lang = "申请拒绝";
              ;
            }
            else if (lottery.status == 5) {
              lottery.status_lang = "正在进行";
              lottery.status_class = "status_on";
            }
            else if (lottery.status > 5) {
              lottery.status_lang = "已经结束";

              lottery.status_class = "status_over";
            }
            return lottery;
          });

          var allData = '';
          var agoData = isclear ? false : self.data.scroll_items;

          if (lotterys.length != 0) {


            if (agoData) {
              allData = agoData;
              lotterys.map(function (order) {
                allData.push(order);
              });
            } else {
              allData = lotterys;
            }




            self.setData({
              "scroll_items": allData
            });


            if (lotterys.length < self.size) {
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
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  gotolottery: function (e) {
    

    var lotteryid = e.currentTarget.dataset.lotteryid;
    var index = e.currentTarget.dataset.index;

    var lottery = this.data.scroll_items[index];


    if (lottery.status == 2 || lottery.status == 1 ||lottery.status>3)
    {
      wx.navigateTo({
        url: '../lottery/lottery?lotteryid=' + lotteryid + "&&selfmanage=1",
      })
    }
    else
    {
      wx.navigateTo({
        url: '../sponsor/sponsor?lotteryid=' + lotteryid,
      })
    }
    
    


    
  },

  deleteLottery: function (e) {

    var self = this;

    var lotteryid = e.target.dataset.lotteryid;
    var index = e.target.dataset.index;

    var lottery = this.data.scroll_items[index];


    Dialog.confirm({
      title: "操作确认",
      message: "活动尚未开始，您确定删除吗？"
    }).then(() => {

      var url = self.baseApiUrl;
      url += "/ziyoutechan/customer/deleteuserlottery?";

      url += "session=";
      url += app.globalData.session
      url += "&&lotteryid=";
      url += lotteryid

      util.ajax({
        url: url,

        method: "GET",
        success: function (data) {
          self.loaded();
          if (data.returncode == 0) {

            Toast.success("删除成功")
            self.refresh(1);

          } else {
            self.error(data);
            return false;
          }
        }
      });


      // on confirm
    }).catch(() => {
      // on cancel
    });


  },

  addNewLottery: function (e) {

    wx.navigateTo({
      url: '../sponsor/sponsor?lotteryid=' + 0,
    })
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

  loadding: function () {
    util.loadding(this);
  },
  loaded: function () {
    util.loaded(this);
  },
  error: function (data) {
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
  refresh: function (isclear = 0) {
    var self = this;
    util.checkNet({
      success: function () {
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
            'scroll_items': false
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
      error: function () {
        util.notNetCon(self, 0);
      }
    });
  },
  onShareAppMessage: function () {


    return getApp().share({ title: "田趣邀您参加免费抽奖，快来看看吧", desc: "", path: "pages/lotterys/lotterys?useless=0" });
  },
  close_express: function () {
    this.setData({
      'expressOpen': 0,
      'shipping_info': {},
      'express': {
        "loading": false
      }
    });
  },

})
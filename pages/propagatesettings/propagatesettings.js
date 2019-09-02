var util = require('../../utils/util.js')
import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';

import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';
const app = getApp()
Page({
  data: {
    "address_list": [],
    loaded: false,
    "pageName": "推广设置",
    "nothing_text": "您还没有添加收货地址",

  },
  onLoad: function(options) {
    var self = this;

    this.is_onload = 1;
    app.setRecommender(options);
    app.checkNavbar(this);
    this.sell_type = options.sell_type;



    var data = {};




    this.setData(data);
    this.token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl();
    util.checkNet({
      success: function() {
        util.succNetCon(self);
        self.getData(); //token,this.offset,this.size
      },
      error: function() {
        util.notNetCon(self, 1);
      }
    });
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function() {
    wx.hideNavigationBarLoading();
    // 页面渲染完成
  },
  onShow: function() {
    if (!this.is_onload) {
      this.refresh();
    } else {
      this.is_onload = 0;
    }
    // 页面显示
  },
  refresh: function() {
    util.loadding(this, 1);
    this.getData();
  },

  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  onOpenSettingClose: function() {
    this.setData({
      "openSettingshow": 0
    })
  },

  bindOpenSetting: function(res) {
    var self = this;
    if (!res.detail.authSetting['scope.address']) {
      Toast('授权失败');
    } else {
      Toast('授权成功,请继续添加');
    }


  },
  //监听用户下拉动作
  onPullDownRefresh: function() {
    this.refresh();
    wx.stopPullDownRefresh();
  },
  loadding: function() {
    util.loadding(this);
  },
  loaded: function() {
    util.loaded(this);
  },
  selectedDEFAULT: function(e) {
    util.loadding(this, 1);
    var self = this;
    var id = e.currentTarget.dataset.id;

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/setpropagatesettingdefault?";

    url += "session=";
    url += app.globalData.session


    url += "&&settingid=";
    url += id
    util.ajax({
      "url": url,
      "method": 　 "get",

      "success": function(res) {
        util.loaded(self);
        if (res.returncode == 0) {

          self.getData();
        }
      }
    });
  },

  addsetting: function(e) {
    var self = this;
    
    wx.navigateTo({
      "url": "../propagatesetting/propagatesetting?id=" + 0,
    });
  },
  //修改地址页面
  editSetting: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      "url": "../propagatesetting/propagatesetting?id=" + id ,
    });
  },

  
  getData: function() {
    {


      var self = this;

      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getpropagatesettings?";

      url += "session=";
      url += app.globalData.session



      util.ajax({
        "url": url,
        "method": 　 "POST",
        "success": function(data) {
          util.loaded(self);
          if (data.returncode == 0) {



            var settings = data.lists;

            if (settings && settings.length > 0) {

               settings = settings.map(function (setting) {
                if (setting.type == 0)
                {
                  setting.typestr = "个人微信号"
                }
                else if (setting.type == 1) {
                  setting.typestr = "微信公众号"
                }
                else if (setting.type == 2) {
                  setting.typestr = "线下店铺"
                }
                return setting;
              });
              
              


              self.setData({
                "scroll_items": settings
              });
            } else {
              self.setData({
                "scroll_items": false,

              });
              self.setData({
                "is_over": 1,
                "no_data": 1
              });
            }





          }

        }
      });
    }
  },
  deleteSetting: function(a) {
    var self = this;
    var s = a.currentTarget.dataset.id;
    a.currentTarget.dataset.index;
    wx.showModal({
      title: "提示",
      content: "确认删除该推广方式吗？",
      success: function(a) {
        if (a.confirm) {
          var url = self.baseApiUrl;
          url += "/ziyoutechan/customer/deletepropagatesetting?";

          url += "session=";
          url += app.globalData.session

          url += "&&settingid=";
          url += s
          util.ajax({
            "url": url,
            "method": 　 "POST",
            "success": function(data) {
              if (data.returncode == 0) {

                self.getData();

              }

            }
          });
        }



      }
    });
  },
  //错误处理函数
  error: function(data) {
    this.setData({
      page: {
        load: 1
      }
    });
    if (data['result'] == 'fail') {
      util.toast(this, data.error_info);
    }
  },
})
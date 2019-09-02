var util = require('../../utils/util.js')
var app = getApp();
Page({
  data: {
    "URL": 4,
    "userInfo": util.config('userInfo'),
    "pageName": "系统服务"


  },
  onLoad: function(options) {
    var token = wx.getStorageSync('token');
    app.setRecommender(options);
    app.checkNavbar(this);

    util.loaded(this);

    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function() {
    // 页面渲染完成
  },
  gotoQuestions: function() {
    wx.navigateTo({
      url: '../questioncategory/questioncategory',
    })
  },

  show_service_detail: function(e) {
    var self = this;
    this.setData({
      "service_detail": 1
    });
    setTimeout(function() {
      self.setData({
        "service_detail": 2
      });
    }, 150)
  },
  close_service_detail: function(e) {
    this.setData({
      "service_detail": 0
    });
  },
  onShow: function() {


  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  getDate: function() {

    this.baseApiUrl = util.baseurl();
    var self = this;

  },
  clearCache: function() {
    wx.clearStorageSync();
  },
  login: function() {
    var self = this;
    var code = '';
    var token = wx.getStorageSync('token');
    getApp().login(token);

    self.me(token);
  },
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
  getOrderCount: function(token) {
    this.baseApiUrl = util.baseurl();
    var self = this;

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getordercount?";

    url += "session=";
    url += app.globalData.session
    util.ajax({
      "url": url,

      "success": function(data) {
        util.loaded(self);
        if (data.returncode == 0) {
          self.setData({
            "unpaid": data.message.unpay,
            "unreceived": data.message.unship
          });
        } else if (data['result'] == "fail") {
          wx.removeStorageSync('token');

        }

      }
    });
  },
  scroll: function(data) {},

  toOrder: function(e) {
    wx.setStorageSync('order_type', e.currentTarget.dataset.type);
    wx.switchTab({
      url: "orders"
    });
  },
  toGroup: function(e) {
    wx.setStorageSync('groups_type', 1);
    wx.switchTab({
      url: "groups"
    });
  }
})
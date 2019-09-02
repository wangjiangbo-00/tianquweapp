var util = require('../../utils/util.js')
var app = getApp();
Page({
  data:{
      "URL" : 4,
    "userInfo": util.config('userInfo'),
    "pageName": "个人中心"
        
      
  },
  onLoad:function(options){
    app.setRecommender(options);
     var token = wx.getStorageSync('token');
     

    app.checkNavbar(this);

    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function() {

    
     var self = this;
    this.me();
     setTimeout(function(){
       util.loaded(self);
     },200)


    
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  me:function(){
     
     this.baseApiUrl = util.baseurl();
     var self = this;

    var userinfo = app.globalData.userInfo;

    if(userinfo == null || userinfo == undefined)
    {
      app.getUserInfo(function () {
        self.setData({ "userInfo": app.globalData.userInfo })
      })
    }
    else
    {
      self.setData({ "userInfo": app.globalData.userInfo })

    }
    
  },

  bindGetUserInfo: function (e) {
    if (e.detail.userInfo != null) {
      app.globalData.userInfo.headpic = e.detail.userInfo.avatarUrl
      app.globalData.userInfo.nickname = e.detail.userInfo.nickName
      

      this.updateUserInfo();

      wx.showToast({
        title: '更新成功',
      })

      


    }
    else {

      wx.showModal({
        title: '对不起，获取授权失败',
        content: '',
        success: function (res) {
          
        }
      })


    }
    console.log(e.detail.userInfo)
  },

  updateUserInfo: function () {
    {
      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/setUserPersonal?";

      url += "session=";
      url += app.globalData.session

      var data = {
        "nickname": app.globalData.userInfo.nickname,
        "headpic": app.globalData.userInfo.headpic,

      };

      var self = this;
      util.ajax({
        "url": url,
        "data": data,
        "method": "GET",
        "success": function (data) {
          if (data.returncode == 0) {
            app.getUserInfo(
              function(){
                self.setData({ "userInfo": app.globalData.userInfo })
              }
            );



          } else {
            self.error(data);
          }
        }
      });
    }
  },

  clearCache:function(){
    wx.clearStorageSync();
  },
  login:function(){
    var self = this;
    var code = '';
    var token = wx.getStorageSync('token');
    getApp().login(token);
    
    self.me(token);
  },
   error:function(data) {
    this.setData({page : {load : 1}});
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },

  scroll : function(data) {
  },
  
  gotoorders : function(e) {
    wx.setStorageSync('order_status', e.currentTarget.dataset.status);  
    wx.switchTab({url : "../orders/orders"});
  },
  gotogroups : function(e) {
    
    var url = "../groups/groups";

    
    wx.navigateTo({
      url: url,
    })
  },

  gotorefunds: function (e) {

    var url = "../refunds/refunds";


    wx.navigateTo({
      url: url,
    })
  },

  gotogifts: function (e) {

    var url = "../gifts/gifts";


    wx.navigateTo({
      url: url,
    })
  },

  gotorewards: function (e) {

    var url = "../rewards/rewards";


    wx.navigateTo({
      url: url,
    })
  },
})
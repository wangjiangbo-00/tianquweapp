var util = require('../../utils/util.js')
const qiniuUploader = require('../../utils/qiniu/qiniuUploader.js')
const app = getApp()
Page({
  data:{
    
     
    

     
     'modalHidden' : true,
    activecode:"",
   
    hiddenmodalput: true,
    "pageName": "推广返利"
     
  },
  formId:function(options){
  },

  gotoindex: function (options) {
    wx.switchTab({
      url: '../index/index',
    })
  },
  

  gotorules:function()
  {
    wx.navigateTo({
      url: '../questiondetails/questiondetails?id=9&&cid=7',
    })
  },

  gotowithdrew: function (options) {

    var account = this.data.account;
    if(!account)
    {
      wx.showToast({
        title: '数据错误',
      })
      return false;
    }

    wx.setStorageSync("account", account)
    var url = "../withdrew/withdrew"

    wx.navigateTo({
      url: url,
    })
  },


  gotorecommendcode: function (options) {

      var composemsg = {
        "composeshowimageurl": "https://tqxjbu-1256942653.cos.ap-chengdu.myqcloud.com/tqxj_img_shop/s__1547626072",
        "composetitle": "田趣小集:汇聚全国名优特产惠购社区",
        "composeinfo": "享美食,送好礼,抽大奖,赢返利",
        "composeleftshare1": "给你推荐高品质特产平台",
      
        "composerightshare1": "长按小程序码",
        "composerightshare2": "开启美食之旅",
        "composeqr": "",
      }
    

    this.setData({
      shareshow: false

    });

    wx.setStorageSync("composemsg", composemsg);
    wx.navigateTo({
      url: '../wximagecompose/wximagecompose?type=' + 7 + "&&refid=" + 707,
    })


  },

  getData: function (options) {
    this.baseApiUrl = util.baseurl();
    var self = this;

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getaccount?";

    url += "session=";
    url += app.globalData.session
    util.ajax({
      "url": url,

      "success": function (data) {
        util.loaded(self);
        if (data.returncode == 0) {

          var account = data.message;


          if(account){

            if (account.consume >= self.consumelimit){
              account.canapply = true;
            }
            else
            {
              account.canapply = false;
            }
            self.setData({
              "account": data.message,

            });
          }
          
        } else if (data['result'] == "fail") {
          wx.removeStorageSync('token');

        }

      }
    });  
  },


  applyrecommender: function (options) {
    this.baseApiUrl = util.baseurl();
    var self = this;

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/applyrecommender?";

    url += "session=";
    url += app.globalData.session
    util.ajax({
      "url": url,

      "success": function (data) {
        util.loaded(self);
        if (data.returncode == 0) {

          app.getUserInfo(

          )
          self.getData();
          self.setData({ "isrecommender": true });
          wx.showToast({
            title: '开通成功',
          })

          

          

        } else {
          wx.showToast({
            title: '开通失败',
          })

        }

      }
    });
  },
  cancel: function () {
    this.setData({
      hiddenmodalput: true
    });
  },

  applyrecommenderwithactivecode: function (options) {
    this.baseApiUrl = util.baseurl();
    var self = this;

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/applyrecommenderwithactivecode?";

    url += "session=";
    url += app.globalData.session
    url += "&&code=";
    url += this.data.activecode
    util.ajax({
      "url": url,

      "success": function (data) {
        util.loaded(self);
        if (data.returncode == 0) {
          app.getUserInfo(

          )
          wx.showToast({
            title: '开通成功',
          })
          self.setData({ "isrecommender": true });
          self.getData();



        } else {
          wx.showToast({
            title: '开通失败',
          })

        }

      }
    });
    self.setData({
      hiddenmodalput: true
    })
  },

  
  
  //错误处理函数
  error:function(data) {
    this.setData({page : {load : 1}});
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },
  modalCancel:function(options){
    this.setData({modalHidden : true});
  },

  onInput: function (e) {
    this.setData({
      activecode: e.detail.value
    });
  },

  

  activecode: function (e) {
    this.setData({
      "hiddenmodalput": false,
    });
  },
 
  
  
  
   

  
  
  
  onLoad:function(options){

    app.setRecommender(options);
    app.checkNavbar(this);
    

    
    

    util.loadding(this);
  
    this.options = options;

    this.setData({ "options": options });
    var self = this;
    this.token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl(); 

    this.consumelimit = util.config('recommed_cusume_check');
    
    var data_version = wx.getStorageSync('data_version');
    

    var userInfo = app.globalData.userInfo;

    
    if (userInfo != null) {
      userInfo.updatetimestr = util.formatTimeWithNyr(userInfo.updatetime)
      self.setData({
        userInfo: userInfo
      })

    }

    if (userInfo && userInfo.isrecommender == 1) {
      this.setData({ "isrecommender": true });
    }
    
    
  },


  showshare: function () {
    this.setData({
      shareshow: true

    });
  },
  
  gotoarticles: function (e) {
    
    var url = "../articles/articles"

    wx.navigateTo({
      url: url,
    })
  },
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
  tapName:function(e){
  },
  onReady:function(){
  },
  onShow:function(){
	this.setData({page : {"load" : 1}});
    wx.getSystemInfo( {
      success: ( res ) => {
        this.setData( {
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    this.getData();
    
    // 页面显示
  },

  shareclose: function () {
    this.setData({
      shareshow: false

    });
  },



  onShareAppMessage: function () {

    var usr = app.globalData.userInfo;
    var whoname = "你的好友"

    if (usr && usr.nickname) {
      whoname = "你的好友" + usr.nickname;

    }

    var bannerlist = this.data.banners;

    var shareimg = "/images/defaultshareimg.jpg";

    

    return getApp().share({ title: "享美食,送好礼,抽大奖,赢返利,尽在田趣小集", imageUrl: shareimg, path: "pages/index/index?useless=0" });
  },
  bindRedirect: function (e) {
    var url = e.currentTarget.dataset.url;
    if (!url) return false;

    wx.navigateTo({ "url": url })
  },

  
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  address_select: function(e) {
     this.setData({
      address_select: 1
    })
  },
  
  

  
  close: function(e) {
    this.setData({
      "address_select" : 0
    });
  }
})
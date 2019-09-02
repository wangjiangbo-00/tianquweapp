var util = require('./utils/util.js')

import Toast from './thirdpartcomponents/vant/dist/toast/toast';
App({
  onLaunch: function() {
    var self = this;

    var systeminfo = wx.getSystemInfoSync();

    
    console.log(systeminfo)

    this.globalData.systeminfo = systeminfo;

    const version = systeminfo.SDKVersion

    if (util.compareVersion(version, '1.9.0') >= 0) {

      var rate = 750.0 / (systeminfo.windowWidth * 1.0);
      self.globalData.navHeight = systeminfo.statusBarHeight * rate + 96
    } else {

      self.globalData.navHeight = 140
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '微信版本过低',
        content: '当前微信版本过低，会降低您的用户体验，请升级到最新微信版本后重试。'
      })
    }

    if (util.compareVersion(version, '1.9.9') >= 0) {

      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate)
      })

      updateManager.onUpdateReady(function () {

        updateManager.applyUpdate()

      })

      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
        wx.showModal({
          title: '更新提示',
          content: '新版本下载失败',
          showCancel: false
        })
      })
    } else {

      
    }

    



    this.getConfig();

    if (this.globalData.debug == true) {
      this.globalData.url = "http://127.0.0.1:8012";
    };

    var session = wx.getStorageSync('session');

    console.log("dologin with session" + session)

    if (session == null || session == "") {

      this.login();
    } else {
      this.globalData.session = session;

      var userInfo = wx.getStorageSync("userInfo")
      if (userInfo!=null)
      {
        //暂时设置为缓存内容，在部分分享页面需要直接读取userInfo时提升体验
        this.globalData.userInfo = userInfo;
      }
      this.checktogetuserinfo();
    }


  },

  bindGetUserInfo: function (e) {
    if (e.detail.userInfo != null) {
      this.globalData.userInfo.headpic = e.detail.userInfo.avatarUrl
      this.globalData.userInfo.nickname = e.detail.userInfo.nickName 
      wx.setStorageSync('userInfo', this.globalData.userInfo);

      this.updateUserInfo();
      Toast.success('更新成功,快去体验吧');
      
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
      url += this.globalData.session

      var data = {
        "nickname": this.globalData.userInfo.nickname,
        "headpic": this.globalData.userInfo.headpic,

      };

      var self = this;
      util.ajax({
        "url": url,
        "data": data,
        "method": "GET",
        "success": function (data) {
          if (data.returncode == 0) {
            self.getUserInfo();



          } else {
            self.error(data);
          }
        }
      });
    }
  },
  getConfig: function() {

    this.baseApiUrl = util.baseurl();
    this.size = util.config('page_size');
    this.offset = util.config('page_offset');

    this.page = 1;
    this.order_status = util.config('order_status');
  },


  checkNavbar: function (that) {

    var pages = getCurrentPages();
    var showHome = false;
    var showNav = false;

    var forceshow = wx.getStorageSync("setnextpageshowhome");

    wx.removeStorageSync("setnextpageshowhome");
    if (pages.length == 1 || forceshow)
    {
      if (that.data.needhome && that.data.needhome == true)
      {
        showHome = true;
      }
      
    }
    else
    {
      showNav = true;
    }

    
    console.log("set checkNavbar  with showNav: = " + showNav + "showHome:=" + showHome);
    
    that.setData({
      "showHome": showHome,
      "showNav": showNav,
      navH: this.globalData.navHeight
    })
  },

  checktogetuserinfo() {

    this.getUserInfo();

  },

  onShow: function() {},
  onHide: function() {},
  share: function(obj) {

    var remcommenderid = 0;
    var userInfo = this.globalData.userInfo;
    var share_text = util.config('share_text');

    if (userInfo && userInfo.isrecommender == 1) {
      remcommenderid = userInfo.id;


    }
    obj.path = obj.path + "&&remcommenderid=" + remcommenderid;

    


    if (obj.imageUrl)
    {
      return {
        title: obj.title || share_text.title,
        path: obj.path || share_text.path,
        imageUrl: obj.imageUrl ,
        withShareTicket: false,

      }
    }
    else
    {
      return {
        title: obj.title || share_text.title,
        path: obj.path || share_text.path,
        withShareTicket: false,

      }
    }

    
  },


  setRecommender: function(options) {

    var scene = options.scene;
    if (scene) {
      scene = decodeURIComponent(options.scene)

      var userid = 0;

      var sceneitems = scene.split(":")


      for (var i = 0; i < sceneitems.length;i++)
      {
        var sceneitem = sceneitems[i];
        if (sceneitem.indexOf("rd") != -1) {
          //推广员界面扫码
          userid = sceneitem.substring(2);
          break;
        }

        if (sceneitem.indexOf("rar") != -1) {
          //推广员界面扫码
          userid = sceneitem.substring(3);
          break;
        }
        
      }

      

  
      if (userid != 0) {
        var now = new Date().getTime();

        var recommenderinfo = {
          "recommenderid": userid,
          "recommendertime": now
        }

        wx.setStorageSync("recommenderinfo", recommenderinfo);
        console.log("set recommenderinfo info from scene  = " + scene);
      }

    } else {

      console.log("without scene");
      var remcommenderid = options.remcommenderid;

      if (remcommenderid) {
        remcommenderid = parseInt(remcommenderid);


        if (remcommenderid != 0) {
          var now = new Date().getTime();

          var recommenderinfo = {
            "recommenderid": remcommenderid,
            "recommendertime": now
          }

          wx.setStorageSync("recommenderinfo", recommenderinfo);
          console.log("set recommenderinfo info from scene with id id = " + remcommenderid);

        }


      }

    }

  },

  


  login: function(syncaftercall) {
    var _self = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          //暂时不动这里的逻辑，理论上出现让用户认证时间远远大于执行完到子页面onload执行获取到推荐人的时间
          console.log("test login")

          var recommdender = 0;
            var recommenderinfo = wx.getStorageSync("recommenderinfo");

            if (recommenderinfo) {

              var recommendertime = recommenderinfo.recommendertime;

              var now = new Date().getTime();
              var spantime = (now - recommendertime) / 1000;

              if (spantime < 3600 * 24) {
                recommdender = recommenderinfo.recommenderid;
              }


            }
          

          var url = _self.baseApiUrl;
          url += "/ziyoutechan/customer/onlogin?code=";
          url = url + res.code;
          url += "&&recommender=" + recommdender;
          util.ajax({
            "url": url,
            "method": 　 "GET",
            "success": function(res) {

              var returncode = res.returncode;
              if (returncode == 0) {
                var session = res.message.session;
                _self.globalData.session = session;
                wx.setStorageSync('session', session);
                _self.checktogetuserinfo();

                if (syncaftercall && typeof syncaftercall === "function")
                {
                  syncaftercall();
                }

              }
            }
          });
        } else {
          if (obj.error != undefined) {
            obj.error();
          }
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail:function(){

        wx.showModal({
          title: '登录失败',
          content: '未授权登录状态，部分功能将无法使用，请体谅',
        })

      }
    });
  },
  getUserInfo: function(syncaftercall) {
    var that = this
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getuserinfo?";

    url += "session=";
    url += this.globalData.session
    util.ajax({
      "url": url,

      "success": function(data) {

        if (data.returncode == 0) {

          that.globalData.userInfo = data.message;

          wx.setStorageSync('userInfo', that.globalData.userInfo);

          if (syncaftercall) {
            syncaftercall();
          }

        } else {
          self.error(data);
        }
      }
    });
  },
  globalData: {
    userInfo: null,
    locationInfo: null,
    session: null,
    currentDevice: 0,
    debug: false,
    url: "https://www.zhuangdawang.com", //

    usersetting: null,
    recommender: 0,
    navHeight:150,

  }

})
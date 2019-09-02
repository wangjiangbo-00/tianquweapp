const util = require('../../utils/util.js')
const app = getApp()
import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';
Page({
  data: {
    spreadshowchecked: false,
    "pageName": "个人设置"
  },
  onLoad: function (options) {
    app.setRecommender(options);
    app.checkNavbar(this);

    this.getConfig();

    var userinfo = app.globalData.userInfo;
    if (userinfo != null) {
      var configflag = userinfo.configflag;

      var spreadshowchecked = configflag & 1;

      this.setData({ spreadshowchecked: spreadshowchecked })
    }



  },



  loaded: function () {
    util.loaded(this);
  },


  //错误处理函数
  error: function (data) {
    this.setData({ page: { load: 1 } });
    if (data['result'] == 'fail') {
      util.toast(this, data.error_info);
    }
  },

  changeSwitch: function () {
    var changedData = {};
    changedData['isgiveChecked'] = !this.data['isgiveChecked'];
    this.setData(changedData);
  },

  //添加地址 || 或者修改地址
  onspreadshowChange: function (e) {

    var self = this;


    var spreadshowchecked = !this.data['spreadshowchecked'];

    if (spreadshowchecked) {
      var value = 1;
    }
    else {
      var value = 0;
    }
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/setuserconfigflag?";

    url += "session=";
    url += app.globalData.session;

    url += "&&flagbit=0&&";


    url += "value=";
    url += value;


    util.ajax({
      "url": url,

      success: function (data) {
        if (data.returncode == 0) {
          self.setData({ spreadshowchecked: spreadshowchecked })

          Toast({
            message:"设置成功",
            duration:1000
          });

          app.getUserInfo();
        }
      }
    })

  },




 

  onReady: function () {
  },
  onShow: function () {
    this.setData({ page: { "load": 1 } });
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  getConfig: function () {
    this.baseApiUrl = util.baseurl();
    this.size = util.config('page_size');
    this.offset = util.config('page_offset');
    this.page = 1;

    this.setData({
      "pullload_text": util.config('pullload_text')
    });
  },

})
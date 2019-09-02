var util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

    "pageName": "内容编辑"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var text = options.text ? options.text:"";
    app.setRecommender(options);
    app.checkNavbar(this);
    
    var vname = options.vname ? options.vname:"texteditdata";
    var tips = options.tips ? options.tips : "提示：请输入少于500个文字";
    var vname = options.vname ? options.vname : "texteditdata";
    var placeholder = options.placeholder ? options.placeholder : "请输入编辑内容";
    this.setData({
      "text": text,
      "vname": vname,
      "tips": tips,
 
    })

    var appDebug = util.config('appDebug');
    this.appDebug = appDebug;



  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  textchange: function(e) {

    this.setData({
      'text': e.detail.value
    });
    
  },

  conform: function(e) {
    var text = this.data.text;

    var pages = getCurrentPages() //获取加载的页面
    let prevPage = pages[pages.length - 2];

    prevPage.setData({ //直接给上移页面赋值
      [this.data.vname]: text,
      textchange: true
    });

    console.log("set textchange  with value: = " + e.detail.value );

    wx.navigateBack({

    })


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
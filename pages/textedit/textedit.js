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

    app.checkNavbar(this);

    var text = options.text;
    
    var isadd = parseInt(options.isadd);

    var index = options.index;

    var istitle = parseInt(options.istitle);

    this.setData({
      "text": text,
      "isadd": isadd,
      "istitle": istitle,
      "index": index
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


    if (!this.appDebug)
    {
      return false;

    }

    this.setData({
      'text': e.detail.value
    });

    var istitle = parseInt(this.data.istitle)

    if (istitle) {
      var pages = getCurrentPages() //获取加载的页面
      let prevPage = pages[pages.length - 2];
      var article = prevPage.data.article;
      article.title = e.detail.value;
      prevPage.setData({ //直接给上移页面赋值
        article: article,
        textchange: true
      });
      prevPage.draft = article;
      wx.setStorageSync("draft" + article.id, prevPage.draft)
      wx.navigateBack({

      })

    } else {
      var pages = getCurrentPages() //获取加载的页面
      let prevPage = pages[pages.length - 2];

      var text = {
        "type": 1,
        "content": e.detail.value
      }

      var article = prevPage.data.article;


      var isadd = parseInt(this.data.isadd)
      if (isadd) {
        if (article.contents == undefined) {
          article.contents = [];
        }
        article.contents.splice(this.data.index + 1, 0, text);
      } else {
        article.contents[this.data.index].content = e.detail.value
      }
      prevPage.setData({ //直接给上移页面赋值
        article: article,

        textchange:true

      });
      prevPage.draft = article;
      wx.setStorageSync("draft"  + article.id, prevPage.draft)
      wx.navigateBack({

      })
    }


  },

  conform: function(e) {
    this.setData({
      'text': e.detail.value
    });

    var istitle = parseInt(this.data.istitle)

    if (istitle) {
      var pages = getCurrentPages() //获取加载的页面
      let prevPage = pages[pages.length - 2];
      var article = prevPage.data.article;
      article.title = e.detail.value;
      prevPage.setData({ //直接给上移页面赋值
        article: article,
        textchange: true
      });
      prevPage.draft = article;
      wx.setStorageSync("draft" + article.id, prevPage.draft)
      wx.navigateBack({

      })

    } else {
      var pages = getCurrentPages() //获取加载的页面
      let prevPage = pages[pages.length - 2];

      var text = {
        "type": 1,
        "content": e.detail.value
      }

      var article = prevPage.data.article;



      var isadd = parseInt(this.data.isadd)
      if (isadd) {
        if (article.contents == undefined) {
          article.contents = [];
        }
        article.contents.splice(this.data.index + 1, 0, text);
      } else {
        article.contents[this.data.index].content = e.detail.value
      }
      prevPage.setData({ //直接给上移页面赋值
        article: article,
        textchange: true
      });
      prevPage.draft = article;
      wx.setStorageSync("draft" + article.id, prevPage.draft)
      wx.navigateBack({

      })
    }


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
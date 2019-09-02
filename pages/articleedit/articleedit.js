var util = require('../../utils/util.js')
var wxoss = require('../../utils/txoss/wxoss.js');
const app = getApp()
Page({
  data: {
    "article": {},
    originalarticle: null,
    draft: null,
    "pageName": "文章编辑"
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
  getArticle: function() {

    if (this.data.articleid) {

    }

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getarticle?";

    url += "session=";
    url += app.globalData.session

    url += "&&articleid=";
    url += this.data.articleid


    var self = this;
    util.ajax({
      "url": url,

      "checkbind": false,
      "success": function(data) {

        if (data.returncode == 0) {

          var article = data.message;
          article.modifytime = util.formatDate(article.modifytime);
          var content = JSON.parse(article.content);

          article.contents = content;

          self.setData({
            originalarticle: article
          })



          if (parseInt(self.data.withdraft) == 1) {
            var draft = wx.getStorageSync("draft" + article.id);
            if (draft) {
              article = draft;
              self.draft = draft;

            } else {
              article = null;
            }



          } else {

          }




          self.setData({
            "article": article
          });


        }
      }
    });
  },
  textAdd: function(e) {
    var index = e.currentTarget.dataset.index;

    var text = "";

    var url = "../textedit/textedit?text=" + text;

    url += "&&index=" + index;

    url += "&&isadd=" + 1;
    url += "&&istitle=" + 0;

    wx.navigateTo({
      url: url,
    })
  },

  imageAdd: function(e) {
    var index = e.currentTarget.dataset.index;
    var self = this;

    var userInfo = app.globalData.userInfo;

    wx.chooseImage({
      // 设置最多可以选择的图片张数，默认9,如果我们设置了多张,那么接收时//就不在是单个变量了,
      count: 1,
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res) {
        // 
        var filePath = res.tempFilePaths[0]
        var Key = "tqxj_img_userarticle/" + "u" + userInfo.id + "_" + new Date().getTime()
        wxoss.postObject(
          filePath,
          Key,
          function() {

            var article = self.data.article;

            var picpath = "https://tqxjbu-1256942653.cos.ap-chengdu.myqcloud.com/" + Key;
            if (true) {

              var img = {
                "type": 2,
                "content": picpath
              }
              if (!article.contents) {
                article.contents = [];
              }


              article.contents.splice(index + 1, 0, img);
              self.setData({ 
                article: article,

              });
              self.draft = article;
              wx.setStorageSync("draft" + article.id, self.draft)
              self.setPrePageRefresh();
            }

          })










      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })

  },
  editText: function(e) {
    var index = e.currentTarget.dataset.index;

    var text = this.data.article.contents[index].content;

    var url = "../textedit/textedit?text=" + text;

    url += "&&index=" + index;

    url += "&&isadd=" + false;
    url += "&&istitle=" + 0;

    wx.navigateTo({
      url: url,
    })
  },
  titletextChange: function(e) {

    var text = this.data.article.title != undefined ? this.data.article.title : "";

    var url = "../textedit/textedit?text=" + text;

    url += "&&index=" + 0;
    url += "&&isadd=" + false;
    url += "&&istitle=" + 1;

    wx.navigateTo({
      url: url,
    })
  },

  editImg: function(e) {
    var index = e.currentTarget.dataset.index;
    var self = this;

    var userInfo = app.globalData.userInfo;

    wx.chooseImage({
      // 设置最多可以选择的图片张数，默认9,如果我们设置了多张,那么接收时//就不在是单个变量了,
      count: 1,
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res) {


        // 获取成功,将获取到的地址赋值给临时变量
        var tempFilePaths = res.tempFilePaths;
        var article = self.data.article;

        if (article.contents[index].type == 2) {
          var needdel = false;
          if (self.data.originalarticle) {
            var bfind = false;
            for (var i = 0; i < self.data.originalarticle.contents.length; i++) {
              if (self.data.originalarticle.contents[i].type == 2 &&
                self.data.originalarticle.contents[i].content == article.contents[index].content) {
                bfind = true;
                break;
              }
            }

            if (!bfind) {
              needdel = true;
            }



          } else {
            needdel = true;
          }

          if (needdel) {
            var pic = article.contents[index].content;
            var pickey = pic.substring(pic.indexOf('.com') + 5, pic.length);
            var pics = [
              pickey
            ]
            util.deleteqiniupics(pics);
          }
        }


        var filePath = res.tempFilePaths[0]
        var Key = "tqxj_img_userarticle/" + "u" + userInfo.id + "_" + new Date().getTime()
        wxoss.postObject(
          filePath,
          Key,
          function () {

            var article = self.data.article;

            var picpath = "https://tqxjbu-1256942653.cos.ap-chengdu.myqcloud.com/" + Key;
            if (true) {

              article.contents[index].content = picpath;
              self.setData({ //直接给上移页面赋值
                article: article,

              });
              self.draft = article;
              wx.setStorageSync("draft" + article.id, self.draft)
              self.setPrePageRefresh();
            }

          })


        

        


      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })

  },


  removeitem: function(e) {
    var index = e.currentTarget.dataset.index;
    var self = this;

    wx.showModal({
      title: '确定移除',
      content: '',
      success: (e) => {
        if (e.confirm) {


          var article = self.data.article;

          if (article.contents[index].type == 2) {
            var needdel = false;
            if (self.data.originalarticle) {
              var bfind = false;
              for (var i = 0; i < self.data.originalarticle.contents.length; i++) {
                if (self.data.originalarticle.contents[i].type == 2 &&
                  self.data.originalarticle.contents[i].content == article.contents[index].content) {
                  bfind = true;
                  break;
                }
              }

              if (!bfind) {
                needdel = true;
              }



            } else {
              needdel = true;
            }

            if (needdel) {
              var pic = article.contents[index].content;
              var pickey = pic.substring(pic.indexOf('.com') + 5, pic.length);
              var pics = [
                pickey
              ]
              util.deleteqiniupics(pics);
            }


          }
          article.contents.splice(index, 1);
          self.setData({ //直接给上移页面赋值
            article: article,

          });
          self.draft = article;
          wx.setStorageSync("draft" + article.id, self.draft)
          self.setPrePageRefresh();
        }
      }
    })


  },




  moveupitem: function(e) {
    var index = e.currentTarget.dataset.index;
    var self = this;

    if (index < 1) {
      return
    } else {
      var article = self.data.article;
      [article.contents[index - 1], article.contents[index]] = [article.contents[index], article.contents[index - 1]]

      self.setData({ //直接给上移页面赋值
        article: article,

      });
      self.draft = article;
      wx.setStorageSync("draft" + article.id, self.draft)
      self.setPrePageRefresh();
    }



  },

  movedownitem: function(e) {
    var index = e.currentTarget.dataset.index;
    var self = this;
    var article = self.data.article;
    if (index > article.contents.length - 2) {
      return
    } else {

      [article.contents[index], article.contents[index + 1]] = [article.contents[index + 1], article.contents[index]]

      self.setData({ //直接给上移页面赋值
        article: article,

      });

      self.draft = article;
      wx.setStorageSync("draft" + article.id, self.draft)
      self.setPrePageRefresh();
    }




  },

  titlecoverChange: function(e) {
    var index = e.currentTarget.dataset.index;
    var self = this;
    var userInfo = app.globalData.userInfo;

    wx.chooseImage({


      // 设置最多可以选择的图片张数，默认9,如果我们设置了多张,那么接收时//就不在是单个变量了,
      count: 1,
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res) {


        // 获取成功,将获取到的地址赋值给临时变量
        var tempFilePaths = res.tempFilePaths;
        var article = self.data.article;
        var needdel = false;
        if (self.data.originalarticle) {
          if (self.data.originalarticle.coverpic != article.coverpic) {
            needdel = true;
          }
        } else {
          needdel = true;
        }

        if (needdel && article.coverpic) {

          var pic = article.coverpic;
          var pickey = pic.substring(pic.indexOf('.com') + 5, pic.length);
          var pics = [
            pickey
          ]
          util.deleteqiniupics(pics);

        }


        var filePath = res.tempFilePaths[0]
        var Key = "tqxj_img_userarticle/" + "u" + userInfo.id + "_" + new Date().getTime()
        wxoss.postObject(
          filePath,
          Key,
          function () {

            var article = self.data.article;

            var picpath = "https://tqxjbu-1256942653.cos.ap-chengdu.myqcloud.com/" + Key;
            if (true) {

              article.coverpic = picpath;
              self.setData({ //直接给上移页面赋值
                article: article,

              });

              self.draft = article;
              wx.setStorageSync("draft" + article.id, self.draft)
              self.setPrePageRefresh();
            }

          })


        


      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })

  },



  //添加地址 || 或者修改地址
  listenFormSubmit: function(e) {

    var self = this;

    var article = this.data.article;


    var url = self.baseApiUrl;

    if (this.data.articleid) {
      url += "/ziyoutechan/customer/updatearticle?";

    } else {
      url += "/ziyoutechan/customer/addarticle?";
    }


    url += "session=";
    url += app.globalData.session;



    var data = {
      id: this.data.articleid,
      cid: 0,
      goodsid: this.data.goodsid,
      type: this.data.viewmode,
      shopid: this.data.shopid,
      orderid: this.data.orderid,
      title: article.title,
      coverpic: article.coverpic,
      content: JSON.stringify(article.contents),
      ispublic: 0,
    }

    util.ajax({
      "url": url,
      "data": data,
      ContentType: "application/x-www-form-urlencoded",
      method: "POST",
      success: function(data) {
        if (data.returncode == 0) {

          if (self.data.originalarticle) {
            var pics = [];
            if (self.data.originalarticle.contents) {
              for (var i = 0; i < self.data.originalarticle.contents.length; i++) {
                var content = self.data.originalarticle.contents[i];
                if (content.type == 2) {
                  var bfind = false;
                  for (var j = 0; j < article.contents.length; j++) {
                    if (article.contents[j].type == 2 && article.contents[j].content == content.content) {
                      bfind = true;
                      break;
                    }
                  }
                  if (!bfind) {
                    pics.push(content.content.substring(content.content.indexOf('.com') + 5, content.content.length))
                  }
                }
              }
            }

            if (self.data.originalarticle.coverpic && self.data.originalarticle.coverpic != article.coverpic) {
              var coverpic = self.data.originalarticle.coverpic
              pics.push(coverpic.substring(coverpic.indexOf('.com') + 5, coverpic.length))
            }


            util.deleteqiniupics(pics);
          }


          self.setPrePageRefresh();
          wx.removeStorageSync("draft" + self.data.articleid);
          wx.showModal({
            title: '提交成功',
            content: '',
            success: () => {
              wx.navigateBack({

              })
            }
          })
        }
      }
    })








  },
  bindHideKeyboard: function(e) {
    wx.hideKeyboard()
  },




  onLoad: function(options) {

    wx.hideShareMenu();
    app.checkNavbar(this);
    if (!this.options.isadd) {
      wx.setNavigationBarTitle({
        title: '编辑文章'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '添加文章'
      })
    }

    util.loadding(this);

    this.options = options;
    var articleid = options.id != undefined ? parseInt(options.id) : 0;
    var viewmode = options.viewmode != undefined ? parseInt(options.viewmode) : 0;
    var goodsid = options.goodsid != undefined ? parseInt(options.goodsid) : 0;

    var shopid = options.shopid != undefined ? parseInt(options.shopid) : 0;

    var orderid = options.orderid != undefined ? parseInt(options.orderid) : 0;

    this.setData({
      "articleid": articleid,
      "withdraft": parseInt(options.withdraft),
      "viewmode": viewmode,
      "goodsid": goodsid,
      "shopid": shopid,
      "orderid": orderid,
    });
    if (this.options.articleid) {
      wx.setNavigationBarTitle({
        title: '编辑文章'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '添加文章'
      })
    }
    var self = this;

    this.baseApiUrl = util.baseurl();


    util.checkNet({
      success: function() {
        util.succNetCon(self);
        if (self.data.articleid) {
          self.getArticle();
        } else {
          var article = self.data.article;
          article.id = 0;
          self.setData({
            article,
            article
          })
        }


      },
      error: function() {
        util.notNetCon(self, 1);
      }
    });
  },





  setPrePageRefresh: function() {

    var pages = getCurrentPages() //获取加载的页面
    let prevPage = pages[pages.length - 2];

    prevPage.setData({
      needrefresh: true
    })

  },

  onReady: function() {},
  onShow: function() {
    this.setData({
      page: {
        "load": 1
      }
    });

    if (this.data.textchange) {
      this.setData({
        textchange: false
      });
      this.setPrePageRefresh();
    }



    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    var self = this;

    var draft = wx.getStorageSync("draft" + 0)
    if (parseInt(this.data.articleid) == 0 && draft) {
      wx.showModal({
        title: '提交编辑',
        content: '您编辑的内容尚未提交',
        cancelText: "丢弃",
        confirmText: "提交",
        success: function(e) {
          if (e.confirm) {


            var article = self.data.article;


            var url = self.baseApiUrl;


            url += "/ziyoutechan/customer/addarticle?";



            url += "session=";
            url += app.globalData.session;



            var data = {
              id: 0,
              cid: 0,
              goodsid: self.data.goodsid,
              type: 1,
              shopid: self.data.shopid,
              orderid: self.data.orderid,
              title: article.title,
              coverpic: article.coverpic,
              content: JSON.stringify(article.contents),
              ispublic: 0,
            }

            util.ajax({
              "url": url,
              "data": data,
              ContentType: "application/x-www-form-urlencoded",
              method: "POST",
              success: function(data) {
                if (data.returncode == 0) {
                  wx.removeStorageSync("draft" + 0);
                  var pages = getCurrentPages() //获取加载的页面
                  let currentPage = pages[pages.length - 1];

                  currentPage.refresh(1);
                }
              }
            })
          } else {



            if (draft) {
              var pics = [];
              if (draft.coverpic) {
                pics.push(draft.coverpic.substring(draft.coverpic.indexOf('.com') + 5, draft.coverpic.length))
              }
              if (draft.contents) {
                for (var i = 0; i < draft.contents.length; i++) {
                  var content = draft.contents[i];
                  if (content.type == 2) {

                    pics.push(content.content.substring(content.content.indexOf('.com') + 5, content.content.length))

                  }
                }
              }

              util.deleteqiniupics(pics);
            }
            wx.removeStorageSync("draft" + 0);
          }
        }
      })
    }
    // 页面关闭
  },


})
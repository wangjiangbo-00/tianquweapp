var util = require('../../utils/util.js')
const qiniuUploader = require('../../utils/qiniu/qiniuUploader.js')
const app = getApp()
Page({
  data: {
    "article": null,
    bcollect:false,
    "articleshow": "articleshow_0",
    "styleTypes": ['默认', '黑色'],
    
    "styleIndex": 0,
    "pageName": "文章展示",
    needhome: true
  },
  

  gotohome: function (data) {

wx.switchTab({
  url: '../index/index',
})
  },

  gotogoods: function (data) {

    var goodsid = this.data.article.goodsid;

    wx.redirectTo({
      url: '../goods/goods?goods_id='+goodsid,
    })
  },


  onShareAppMessage: function () {

    var usr = app.globalData.userInfo;
    var whoname = "你的好友"

    if (usr && usr.nickname) {
      whoname = "你的好友" + usr.nickname;

    }

    var title = whoname + "向您推荐一篇文章 - " + this.data.article.title


    var shareimg = null;

    if (this.data.article.headpic) {
      shareimg = this.data.article.headpic;

    }



    return getApp().share({ title: title, imageUrl: shareimg, path: "pages/articleshow/articleshow?id=" + this.data.article.id  });
  },

  gotoarticles: function (data) {

    wx.navigateTo({
      url: '../articles/articles',
    })
  },

  styleChange: function (e) {
    var self = this;

    var style = e.detail.value;

    var url = self.baseApiUrl;
    url += "/ziyoutechan/customer/setarticlebgstyle?";

    url += "session=";
    url += app.globalData.session
    url += "&&articleid=";
    url += this.data.articleid

    url += "&&style=";
    url += style

    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {
        
        if (data.returncode == 0) {

          
          var article = self.data.article;

          article.bgstyle = style;
          var showstyle = "showstyle_" + article.bgstyle;
          article.showstyle = showstyle;

          self.setData({
            "article": article,
            styleIndex: style
          });

        } else {
          self.error(data);
          return false;
        }
      }
    });

    
  },
  
  //错误处理函数
  error:function(data) {
    this.setData({page : {load : 1}});
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },
  
  
  
  //添加地址 || 或者修改地址
  
   

  
  submitdraft:function(options) {
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
      goodsid: 403,
      type: 1,
      shopid: 0,
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
      success: function (data) {
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
  
  onLoad:function(options){
    

    util.loadding(this);
    app.checkNavbar(this);
  
    this.options = options;

    var viewmode = options.viewmode != undefined ? parseInt(options.viewmode):0;
    var previewdraft = options.previewdraft != undefined ? parseInt(options.previewdraft) : 0;
    this.setData({ 
      "articleid": options.id ,
      "viewmode": viewmode ,
      "previewdraft": previewdraft
      });
    var self = this;
    this.token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl(); 
    
    var data_version = wx.getStorageSync('data_version');
    var userinfo = app.globalData.userInfo;

    if (userinfo != null && userinfo.articlecollect != undefined && userinfo.articlecollect != null) {
      var collectstr = userinfo.articlecollect;

      if (collectstr)
      {
        var collectarr = collectstr.split(",");

        for (var i = 0; i < collectarr.length; i++) {
          if (collectarr[i] == self.data.articleid) {
            self.setData({
              bcollect: true
            })
            break
          }

        }
      }
      


      
    }

    
    
      util.checkNet({
        success: function () {
          util.succNetCon(self);
          self.getArticle();

        },
        error: function () {
          util.notNetCon(self, 1);
        }
      });
    
    


    
    
    
  },
  
  onReady:function(){
  },

  getArticle: function () {

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
      "success": function (data) {

        if (data.returncode == 0) {

          var article = data.message;
          article.modifytime = util.formatDate(article.modifytime);

          var showstyle = "showstyle_" + article.bgstyle;

          var content = JSON.parse(article.content);

          article.contents = content;
          
          self.setData({
            originalarticle: article
          })


          if (self.data.previewdraft == 1)
          {
            var draft = wx.getStorageSync("draft" + article.id);
            if (draft ) {
              article = draft;
              
            }
            else
            {
              article =  null;
            }
            
          }
          article.showstyle = showstyle;

          self.setData({
            "styleIndex": article.bgstyle
          });

          
          

          self.setData({
            "article": article
          });

          self.checkRead();
        }
      }
    });
  },


  collect: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/setarticlecollect?";

    url += "session=";
    url += app.globalData.session

    url += "&&articleid=";
    url += this.data.articleid

    url += "&&action=";
    url += 1

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {

        if (data.returncode == 0) {

          app.getUserInfo();
          self.setData({
            bcollect: true
          })
          wx.showToast({
            title: '收藏成功',
          })

        } else {
          self.error(data);
          return false;
        }
      }
    });
  },


  uncollect: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/setarticlecollect?";

    url += "session=";
    url += app.globalData.session

    url += "&&articleid=";
    url += this.data.articleid

    url += "&&action=";
    url += 2

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {

        if (data.returncode == 0) {

          app.getUserInfo();
          self.setData({
            bcollect: false
          })
          wx.showToast({
            title: '取消成功',
          })
        } else {
          self.error(data);
          return false;
        }
      }
    });
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

    
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  checkRead:function() {
    var userinfo = app.globalData.userInfo;

    if (userinfo != null && userinfo.articlecollect != undefined && userinfo.articlecollect != null) {
      if (userinfo.id != this.data.article.cid)
      {
        var readrecords = wx.getStorageSync("readrecords")

        if (readrecords)
        {
          var time = readrecords[this.data.articleid];
          if (time)
          {
            var d = new Date();
            var nowtime = parseInt(d.getTime() / 1000);

            if ((nowtime - time) > 24 * 60 * 60) {
              var d = new Date();
              readrecords[this.data.articleid] = parseInt(d.getTime() / 1000);
              wx.setStorageSync("readrecords", readrecords)
              this.addRead();
            }
          }
          else
          {
            var d = new Date();
            readrecords[this.data.articleid] = parseInt(d.getTime() / 1000);
            wx.setStorageSync("readrecords", readrecords)
            this.addRead();
          }

          
        
          
          


        }
        else
        {
          readrecords = {}
          var d = new Date();
          readrecords[this.data.articleid] = parseInt(d.getTime()/1000);
          wx.setStorageSync("readrecords", readrecords)
          this.addRead();
        }
      }
    }
    
  },
  addRead: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/addread?";

    url += "session=";
    url += app.globalData.session

    url += "&&articleid=";
    url += this.data.articleid

    

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {

        if (data.returncode == 0) {

          
        } else {
          self.error(data);
          return false;
        }
      }
    });
  },
  

  

  

  

  
  
  
})
var util = require('../../utils/util.js');
const ImgLoader = require('../../utils/img-loader/img-loader.js')
const app = getApp()

Page({
  data: {
    score: [1, 2, 3, 4, 5],
    bcollect: false,
    "scrollable": true,
    "pageName": "店铺详情",
    needhome: true,
  },
  onLoad: function(options) {

    var self = this;
    app.setRecommender(options);
    app.checkNavbar(this);
    self.getConfig();

    self.setData({
      shopid: options.shopid
    })

    var userinfo = app.globalData.userInfo;

    if (userinfo != null && userinfo.shopcollect != undefined && userinfo.shopcollect != null) {
      var collectstr = userinfo.shopcollect;
      var collectarr = collectstr.split(",");


      collectarr.map(function(collect) {
        if (collect == self.data.shopid) {
          self.setData({
            bcollect: true
          })
        }



      })
    }
    util.checkNet({
      success: function() {
        util.succNetCon(self);
        self.shopDetails();
        self.goodsList();
        //self.shopArticles(self.data.shopid);


        var shop_notice = wx.getStorageSync("shop_notice_" + self.data.shopid);

        var needfetch = true;

        if (shop_notice) {
          var fetchtime = shop_notice.fetchtime;

          if (fetchtime) {
            var spantime = (new Date().getTime() - fetchtime) / 1000;


            if (spantime < 3600 * 6) {
              needfetch = false;
            }
          }


        }

        if (needfetch) {
          self.getShopNotice();
        }
        //self.imgLoader = new ImgLoader(self, self.imageOnLoad.bind(self))
      },
      error: function() {
        util.notNetCon(self, 1);
      }
    });
  },
  gotoarticles: function() {
    var shopid = this.data.shopid;
    var url = "../articles/articles?viewmode=2&&shopid="


    url += shopid;
    wx.navigateTo({
      url: url,
    })

  },


  getShopNotice: function() {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getsystemnotice?";

    url += "session=";
    url += app.globalData.session


    url += "&&shopid=";
    url += this.data.shopid

    var self = this;




    util.ajax({
      "url": url,
      "success": function(data) {
        if (data.returncode == 0) {

          var notice = data.message;

          if (notice && notice.is_enable) {
            self.setData({
              "notice": notice
            })

            notice.fetchtime = new Date().getTime();




            wx.setStorageSync("shop_notice_" + self.data.shopid, notice)

            setTimeout(function() {
              self.setData({
                "notice": null
              })
            }, 60000)
          } else {
            var notice = {

            }
            notice.fetchtime = new Date().getTime();

            wx.setStorageSync("shop_notice_" + self.data.shopid, notice)
          }
        }
      }
    });
  },

  onShareAppMessage: function() {
    var cityname = this.data.shop.cityname;

    var title = "这里汇聚了" + cityname + "地区的名特小吃,快来看看吧"

    var shareimg = null;
    if (this.data.shop.shopbanner) {
      shareimg = this.data.shop.shopbanner;

    }


    return getApp().share({

      title: title,
      imageUrl: shareimg,
      path: "pages/shopdetail/shopdetail?shopid=" + this.data.shop.id
    });
  },

  shopArticles: function(shopid) {
    if (this.data.no_article == 1) return false;


    var offset = 0;

    var size = 2;


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getshoparticles?";

    url += "session=";
    url += app.globalData.session


    var data = {
      "offset": offset,
      "size": size,
      shopid: shopid

    };

    var self = this;
    util.ajax({
      url: url,
      data: data,
      method: "GET",
      success: function(data) {

        if (data.returncode == 0) {

          var article_list = data.lists;

          var articles = article_list.map(function(article) {
            article.modifytime = util.formatDate(article.modifytime);


            if (article.ispublic == 1) {
              article.publicstr = "公开文章"
            } else {
              article.publicstr = "私密文章"
            }
            return article;
          });

          var allData = '';


          if (articles.length != 0) {


            allData = articles;

            self.setData({
              "articles": allData
            });


            if (articles.length < self.size) {
              self.setData({
                "is_over": 1,
                "no_article": 1
              });
            }

          } else {
            if (self.data.scroll_items == false || isclear) self.setData({
              scroll_items: []
            });
            self.setData({
              "is_over": 1,
              "no_article": 1
            });
          }
        } else {
          self.error(data);
          return false;
        }
      }
    });
  },
  getConfig: function() {
    this.baseApiUrl = util.baseurl();
    this.size = util.config('page_size');
    this.offset = util.config('page_offset');
    this.page = 1;

    this.setData({
      "pullload_text": util.config('pullload_text')
    });
  },
  goodsList: function() {
    if (this.data.no_data) return true;
    var offset = (this.page - 1);
    var size = this.size;
    var data = {
      "offset": offset,
      "size": size
    };

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getshopgoods?";

    url += "session=";
    url += app.globalData.session

    url += "&&shopid=";
    url += this.data.shopid

    var page = 0;


    if (offset == 0 && this.cate_id) {
      util.loadding(this, 1);
    }

    var self = this;


    util.ajax({
      "url": url,
      "data": data,
      "success": function(data) {

        var allData = '';

        var goods = data.lists;
        if (goods.length != 0) {
          if (goods.length < self.size) {
            self.setData({
              "is_over": 1,
              "no_data": 1
            });

          }

          /*
          if(agoData) {
            allData = agoData;
            goods.map(function(good) {
              allData.push(good);
            });
          } else {
            allData = goods;
          }*/

          allData = goods;

          self.setData({
            goods: allData
          });
          //self.loadImages();
        } else {
          if (self.data.goods == false) {
            self.setData({
              goods: []
            });

          }
          self.setData({
            "is_over": 1,
            "no_data": 1
          });


        }

        self.setData({
          is_scroll: true
        });
        self.setData({
          loaded: true
        });
      }
    });
  },
  shopDetails: function(e) {
    var offset = 0;
    var size = 100;
    var data = {
      "offset": offset,
      "size": size
    };
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getshopdetail?";

    url += "session=";
    url += app.globalData.session

    url += "&&shopid=";
    url += this.data.shopid


    var self = this;
    util.ajax({
      "url": url,
      "data": data,
      "checkbind": false,
      "success": function(data) {

        if (data.returncode == 0) {

          var shop = data.message;


          var shopsales = shop.shopsales;

          if (shopsales > 9999) {
            shopsales = (shopsales / 10000).toFixed(1) + "万"
          }

          shop.shopsalesstr = shopsales;


          self.setData({
            "shop": shop
          });
        }
      }
    });
  },
  onReady: function() {},
  onShow: function() {

  },
  onHide: function() {},
  onUnload: function() {},
  onPullDownRefresh: function() {},
  collect: function() {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/setshopcollect?";

    url += "session=";
    url += app.globalData.session

    url += "&&shopid=";
    url += this.data.shopid

    url += "&&action=";
    url += 1

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function(data) {

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


  uncollect: function() {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/setshopcollect?";

    url += "session=";
    url += app.globalData.session

    url += "&&shopid=";
    url += this.data.shopid

    url += "&&action=";
    url += 2

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function(data) {

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


  location: function() {
    var t = this.data.shop;
    wx.openLocation({
      latitude: parseFloat(t.latitude),
      longitude: parseFloat(t.longitude),
      name: t.name,
      address: t.address
    });
  },

});
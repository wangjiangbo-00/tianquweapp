var util = require('../../utils/util.js');
var WxParse = require('../../utils/wxParse/wxParse.js');
const ImgLoader = require('../../utils/img-loader/img-loader.js')

const app = getApp()

import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';
Page({
  data: {
    indicatorDots: false,
    autoplay: false,
    interval: 3500,
    duration: 800,
    loaded: false,
    "current": 1,
    bcollect: false,
    buysum: 1,
    sell_type: 1,
    spec_showprice: 0,
    goods_discount_id: 0,
    "pageName": "商品详情",
    "directbuystr":"直接购买",
    "groupbuystr":"一键开团"
  },
  onLoad: function(options) {

    app.setRecommender(options);
    this.is_onload = 1;
    this.goods_id = options.goods_id;
    var self = this;
    var userinfo = app.globalData.userInfo;
    app.checkNavbar(this);

    if (userinfo != null && userinfo.goodscollect != undefined && userinfo.goodscollect != null) {
      var collectstr = userinfo.goodscollect;
      var collectarr = collectstr.split(",");


      collectarr.map(function(collect) {
        if (collect == self.goods_id) {
          self.setData({
            bcollect: true
          })
        }



      })
    }
    //this.goods_id = 6464;
    //  wx.showNavigationBarLoading();
    this.baseApiUrl = util.baseurl();


    util.checkNet({
      success: function() {
        util.succNetCon(self);
        self.goodsDetail(self.goods_id);
        self.goodsGroups(self.goods_id);
        self.goodsDiscount(self.goods_id);
        self.goodsArticles(self.goods_id);
      },
      error: function() {
        util.notNetCon(self);
      }
    });

    // 页面初始化 options为页面跳转所带来的参数
    this.imgLoader = new ImgLoader(this)

    //this.doneOrderBanner();
    //console.log(options);
    // 页面初始化 options为页面跳转所带来的参数
  },
  refresh: function() {
    var self = this;
    util.checkNet({
      success: function() {
        util.succNetCon(self); //恢复网络访问
        self.goodsDetail(self.goods_id);
        self.goodsGroups(self.goods_id);
        self.goodsArticles(self.goods_id);
      },
      error: function() {
        util.notNetCon(self, 0);
      }
    });
  },
  bindchange: function(e) {
    var current = e.detail.current + 1;
    this.setData({
      current: current
    });
  },
  onReady: function() {

    // 页面渲染完成
  },

  showshopselfleft: function() {
    this.setData({
      selfliftshow: true

    });

  },

  onselfliftClose: function() {
    this.setData({
      selfliftshow: false

    });
  },
  onShow: function() {
    if (!this.is_onload) {
      this.goodsGroups(this.goods_id);
    } else {
      this.is_onload = 0;
    }


    // 页面显示
  },
  buySumChange({
    detail
  }) {
    var buysum = detail.value;
    if (buysum > 10) {
      wx.showToast({
        title: '最多选10个',
      })
    } else {
      this.setData({
        buysum: detail.value
      })
    }

  },
  goodsArticles: function(goodsid) {
    if (this.data.no_article == 1) return false;


    var offset = 0;

    var size = 2;


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getgoodsarticles?";

    url += "session=";
    url += app.globalData.session


    var data = {
      "offset": offset,
      "size": size,
      goodsid: goodsid

    };

    var self = this;
    util.ajax({
      url: url,
      data: data,
      method: "GET",
      success: function(data) {
        self.loaded();
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
            if (self.data.articles == false) self.setData({
              articles: []
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


  goodsShopPickupPoint: function(goodsid) {

    var self = this;
    var key = "pickuppoint_" + self.data.goods.shop.id
    var needfetch = true;
    var pickuppoint = wx.getStorageSync(key);

    if (pickuppoint != null) {
      var fetchtime = pickuppoint.fetchtime;

      if (fetchtime) {
        var spantime = (new Date().getTime() - fetchtime) / 1000;


        if (spantime < 3 * 3600) {
          needfetch = false;
          self.setData({
            "pickuppoint": pickuppoint
          })
        }

      }


    }

    if (needfetch) {

      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getshoppickuppoint?";

      url += "session=";
      url += app.globalData.session


      url += "&&shopid=";
      url += this.data.goods.shop.id





      util.ajax({
        url: url,

        method: "GET",
        success: function(data) {
          self.loaded();
          if (data.returncode == 0) {

            var pickuppoint = data.message;

            pickuppoint.fetchtime = new Date().getTime();

            if (pickuppoint) {
              self.setData({
                "pickuppoint": pickuppoint
              })

              var key = "pickuppoint_" + self.data.goods.shop.id

              wx.setStorageSync(key, pickuppoint)
            } else {
              self.setData({
                "pickuppoint": null
              })
            }


          } else {
            self.error(data);
            return false;
          }
        }
      });
    }
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  //监听用户下拉动作
  onPullDownRefresh: function() {
    util.loadding(this, 1);
    this.goodsDetail(this.goods_id);
    this.goodsGroups(this.goods_id);
    this.goodsArticles(self.goods_id);
    wx.stopPullDownRefresh();
  },
  gotoarticles: function() {
    var goodsid = this.goods_id;
    var url = "../articles/articles?viewmode=1&&goodsid="


    url += goodsid;
    wx.navigateTo({
      url: url,
    })

  },
  goodsDetail: function(goods_id, obj = {}) {


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getgoodsdetails?";

    url += "session=";
    url += app.globalData.session

    url += "&&goodsid=";
    url += goods_id
    var self = this;
    util.ajax({
      url: url,
      success: function(data) {
        if (data.returncode == 0) {

          var goodsdetails = data.message;

          var goods = {};

          if (goodsdetails.goods) {
            goods = goodsdetails.goods;
            goods.gallery = goodsdetails.gallery;
            goods.goodsSkuList = goodsdetails.goodsSkuList;
          } else {
            goods = goodsdetails;
          }

          if (goods.state == 0 || goods.shopstate == 0)
          {
            self.setData(
              {
                "directbuystr": "商品下架",
                "groupbuystr": "商品下架"
              }
            )
          }
          else
          {
            if (goods.stock < 1) {
              self.setData(
                {
                  "directbuystr": "暂时缺货",
                  "groupbuystr": "暂时缺货"
                }
              )
            }
          }


          




          goods.sell_type = 0;

          
          var sellcount = goods.sell_count

          if (sellcount > 9999) {
            sellcount = (sellcount / 10000).toFixed(1) + "万"
          }

          goods.sell_count = sellcount;

          var shopsales = goods.shop.shopsales;

          if (shopsales > 9999) {
            shopsales = (shopsales / 10000).toFixed(1) + "万"
          }

          goods.shop.shopsalesstr = shopsales;

          goods.group_price = goods.group_price.toFixed(1)
          goods.price = goods.price.toFixed(1)

          var spec_showprice = goods.group_price;
          var goods_spec_format = JSON.parse(goods.goods_spec_format);

          if (goods_spec_format) {
            for (var i = 0; i < goods_spec_format.length; i++) {
              for (var j = 0; j < goods_spec_format[i].value.length; j++) {
                goods_spec_format[i].value[j].isselect = 0;
              }

            }
          }

          self.setData({
            goods: goods,
            goods_spec_format: goods_spec_format,
            spec_showprice: spec_showprice,
            isShow_out: 0 >= parseInt(100),
            gallery: goods.gallery,
            wxParseData: WxParse.wxParse('goods_desc', 'html', goods.description, self, 0)
          });
          if (goods.openselflift == 1) {
            self.goodsShopPickupPoint();
          }
          var footprints = wx.getStorageSync("footprints");
          if (footprints) {

            var goodsid = self.data.goods.id;

            var bfind = false;

            for (var i = 0; i < footprints.length; i++) {
              if (footprints[i].id == goodsid) {
                bfind = true;

                if (i != footprints.length - 1) {
                  var current = footprints[i];

                  footprints.splice(i, 1);

                  footprints.splice(footprints.length, 0, current);
                  wx.setStorageSync("footprints", footprints)
                }





                break
              }
            }

            if (!bfind) {
              footprints.splice(footprints.length, 0, {
                id: self.data.goods.id,
                introduction: self.data.goods.introduction,
                cover: self.data.goods.pictureurl,
                sell_count: self.data.goods.sell_count,
                group_number: self.data.goods.group_number,
                group_price: self.data.goods.group_price
              });
              wx.setStorageSync("footprints", footprints)
            }

          } else {
            footprints = [{
              id: self.data.goods.id,
              introduction: self.data.goods.introduction,
              cover: self.data.goods.pictureurl,
              sell_count: self.data.goods.sell_count,
              group_number: self.data.goods.group_number,
              group_price: self.data.goods.group_price
            }]

            wx.setStorageSync("footprints", footprints)
          }

          var goods_image_cache = wx.getStorageSync('goods_banner_' + goods.id + "_windowHeight_" + self.data.windowHeight + "_windowWidth_" + self.data.windowWidth);
          if (goods_image_cache) {
            self.setData({
              'goods_banner': {
                "width": goods_image_cache.width + "px",
                "height": goods_image_cache.height + "px",
                "onload": 1
              },
            });
            util.loaded(self);

            obj.success != undefined ? obj.success() : '';
          } else {
            util.loadding(self, 1);
            self.imgLoader.load(goods.gallery[0], function(err, imgs) {
              var goods_banner = util.wxAutoImageCal(imgs.ev);
              self.setData({
                'goods_banner': {
                  "width": goods_banner.imageWidth + "px",
                  "height": goods_banner.imageheight + "px",
                  "onload": 1
                },
              });
              wx.setStorageSync('goods_banner_' + goods.id + "_windowHeight_" + self.data.windowHeight + "_windowWidth_" + self.data.windowWidth, {
                width: goods_banner.imageWidth,
                height: goods_banner.imageheight
              });

              util.loaded(self);

              obj.success != undefined ? obj.success() : '';
            });
          }



        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
        }
      }
    });
  },
  goodsGroups: function(goods_id) {


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getgoodsgroups?";

    url += "session=";
    url += app.globalData.session

    url += "&&goodsid=";
    url += goods_id
    var self = this;
    var data = [];
    data['offset'] = 0;
    data['size'] = 5;
    util.ajax({
      url: url,
      data: data,
      success: function(data) {
        if (data.returncode == 0) {

          var times = [];
          var j = 0

          var groups = [];





          for (var i = 0; i < data.lists.length; i++) {
            var group = data.lists[i];

            var expiretime = util.getTime(group.expiretime);
            if (expiretime > new Date().getTime()) {
              times[j++] = (expiretime - new Date().getTime());
              groups.push(group);
            }
          }
          self.setData({
            'groups': groups
          });

          if (self.timer) clearTimeout(self.timer);
          util.countdowns(self, times);
        } else {
          self.error(data);
        }
      }
    });
  },

  goodsDiscount: function(goods_id) {


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getgoodsdiscount?";

    url += "session=";
    url += app.globalData.session

    url += "&&goodsid=";
    url += goods_id
    var self = this;
    var data = [];
    data['offset'] = 0;
    data['size'] = 5;
    util.ajax({
      url: url,
      data: data,
      success: function(data) {
        if (data.returncode == 0) {

          var discount = data.message;
          if (discount != null) {

            discount.starttime_format = util.formatTimeWithyrsf(discount.starttime);

            discount.endtime_format = util.formatTimeWithyrsf(discount.endtime);

            if (discount.status == 4) {
              discount.status_lang = "即将开始"

              var starttime = util.getTime(discount.starttime);

              // 清除定时器
              var time = (new Date().getTime() - starttime);



              util.countdownWithTimer(self, self.discountTimer, time, "discountclock");
            } else if (discount.status == 5) {
              discount.status_lang = "正在进行"


              var endtime = util.getTime(discount.endtime);
              // 清除定时器
              var time = (endtime - new Date().getTime());

              util.countdownWithTimer(self, self.discountTimer, time, "discountclock");
            }
            self.setData({
              'discount': discount
            });
            self.setData({
              'goods_discount_id': discount.id
            });
          }

        } else {
          self.error(data);
        }
      }
    });
  },
  loadding: function() {
    util.loadding(this);
    //this.setData({page : {load : 0}});
  },
  loaded: function() {
    util.loaded(this);
    //this.setData({page : {load : 1}});
  },
  //错误处理函数
  error: function(data) {
    this.loaded();
    if (data['result'] == 'fail') {
      util.toast(this, data.error_info);
    }
  },
  cusImageLoad: function(e) {
    var that = this;
    console.log(util.wxAutoImageCal(e));
    that.setData(util.wxAutoImageCal(e));
  },

  select_spec: function(e) {
    var index_spec = e.currentTarget.dataset.index_spec;
    var index_spec_value = e.currentTarget.dataset.index_spec_value;

    var specs = this.data.goods_spec_format;
    var spec = specs[index_spec];

    if (spec) {
      for (var i = 0; i < spec.value.length; i++) {
        specs[index_spec].value[i].isselect = 0;
      }


      if (specs[index_spec].value[index_spec_value]) {
        specs[index_spec].value[index_spec_value].isselect = 1;
        var specprice = this.getspecprice();
        this.setData({
          spec_showprice: specprice
        })

        if (this.data.discount && this.data.discount.status == 5 && this.data.discount.discount < 10) {

          var spec_dsicountprice = (specprice * this.data.discount.discount * 0.1).toFixed(1);


          this.setData({
            spec_dsicountprice: spec_dsicountprice
          });
        }

      }

      this.setData({
        goods_spec_format: specs
      })

    }
  },

  unselect_spec: function(e) {
    var index_spec = e.currentTarget.dataset.index_spec;
    var index_spec_value = e.currentTarget.dataset.index_spec_value;

    var specs = this.data.goods_spec_format;


    if (specs[index_spec]) {

      if (specs[index_spec].value[index_spec_value]) {
        specs[index_spec].value[index_spec_value].isselect = 0;
      }

      this.setData({
        goods_spec_format: specs
      })

    }
  },
  onShareAppMessage: function() {

    var usr = app.globalData.userInfo;
    var whoname = ""

    if (usr && usr.nickname) {
      whoname =  usr.nickname;

    }

    var title = this.data.goods.introduction


    var shareimg = null;

    if (this.data.goods.pictureurl) {
      shareimg = this.data.goods.pictureurl;

    } else if (this.data.goods.bannerurl) {
      shareimg = this.data.goods.bannerurl;
    }


    return getApp().share({
      title: title,
      imageUrl: shareimg,
      path: "pages/goods/goods?goods_id=" + this.goods_id
    });
  },
  toIndex: function(e) {
    wx.switchTab({
      url: '../index/index'
    })
  },
  show_group_desc: function(e) {
    this.setData({
      "show_group_desc": 1
    });
  },
  close_group_desc: function(e) {
    this.setData({
      "show_group_desc": 0
    });
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

  directbuy: function(e) {
    var self = this;

    var goods = this.data.goods;


    if (goods.state == 0 || goods.shopstate == 0) {
      Toast.fail("已下架")
      return false
    }
    else {
      if (goods.stock < 1) {
        Toast.fail("没有库存")
        return false
      }
    }


    this.setData({
      "sell_type": 0
    });

    var spec_showprice = this.data.goods.price;

    this.setData({
      "goods_sku_choose": 1,
      spec_showprice: spec_showprice
    });

    if (this.data.discount && this.data.discount.status == 5 && this.data.discount.discount < 10) {

      var spec_dsicountprice = (spec_showprice * this.data.discount.discount * 0.1).toFixed(1);


      this.setData({
        spec_dsicountprice: spec_dsicountprice
      });
    }
    setTimeout(function() {
      self.setData({
        "goods_sku_choose": 2
      });
    }, 150)
  },


  groupbuy: function(e) {

    var goods = this.data.goods;


    if (goods.state == 0 || goods.shopstate == 0) {
      Toast.fail("已下架")
      return false
    }
    else {
      if (goods.stock < 1) {
        Toast.fail("没有库存")
        return false
      }
    }
    var self = this;

    this.setData({
      "sell_type": 1
    });
    var spec_showprice = this.data.goods.group_price;


    this.setData({
      "goods_sku_choose": 1,
      spec_showprice: spec_showprice
    });

    if (this.data.discount && this.data.discount.status == 5 && this.data.discount.discount < 10) {

      var spec_dsicountprice = (spec_showprice * this.data.discount.discount * 0.1).toFixed(1);


      this.setData({
        spec_dsicountprice: spec_dsicountprice
      });
    }
    setTimeout(function() {
      self.setData({
        "goods_sku_choose": 2
      });
    }, 150)
  },


  getspecprice: function(e) {
    var goods = this.data.goods;

    var sku_list = this.data.goods.goodsSkuList;


    if (sku_list) {
      var goods_spec_format = this.data.goods_spec_format;

      var ball = true;

      var skustr = ""

      for (var i = 0; i < goods_spec_format.length; i++) {
        var bfind = false;
        for (var j = 0; j < goods_spec_format[i].value.length; j++) {
          if (goods_spec_format[i].value[j].isselect == 1) {
            bfind = true;
            skustr += goods_spec_format[i].value[j].spec_id + ":" + goods_spec_format[i].value[j].spec_value_id
          }



        }
        if (i != goods_spec_format.length - 1) {
          skustr += ";";
        }

        if (!bfind) {

          ball = false;
          break;
        }

      }

      if (ball) {
        var skuid = 0;
        for (var i = 0; i < sku_list.length; i++) {
          if (sku_list[i].attr_value_items == skustr) {
            skuid = sku_list[i].id;
            return this.sell_type == 1 ? sku_list[i].group_price : sku_list[i].price
            break;
          }
        }







      }



    }
    return this.sell_type == 1 ? goods.group_price : goods.price
  },

  sku_confirm: function(e) {
    var goods = this.data.goods;

    var sku_list = this.data.goods.goodsSkuList;


    if (sku_list && sku_list.length > 0) {
      var goods_spec_format = this.data.goods_spec_format;

      var ball = true;

      var skustr = ""

      for (var i = 0; i < goods_spec_format.length; i++) {
        var bfind = false;
        for (var j = 0; j < goods_spec_format[i].value.length; j++) {
          if (goods_spec_format[i].value[j].isselect == 1) {
            bfind = true;
            skustr += goods_spec_format[i].value[j].spec_id + ":" + goods_spec_format[i].value[j].spec_value_id
          }



        }
        if (i != goods_spec_format.length - 1) {
          skustr += ";";
        }

        if (!bfind) {
          wx.showToast({
            title: '请选择' + goods_spec_format[i].spec_name,
          })
          ball = false;
          break;
        }

      }

      if (ball) {
        var skuid = 0;
        for (var i = 0; i < sku_list.length; i++) {
          if (sku_list[i].attr_value_items == skustr) {
            skuid = sku_list[i].id;
            break;
          }
        }

        if (skuid > 0) {
          wx.setStorageSync("goodsforoder", this.data.goods);
          wx.setStorageSync("discountforoder", this.data.discount);
          this.setData({
            "goods_sku_choose": 0
          });
          var url = "../checkout/checkout?goods_id=" + goods.id + "&sell_type=" + this.data.sell_type + "&feeid=" + goods.feeid +
            "&skuid=" + skuid + "&buysum=" + this.data.buysum + "&goods_discount_id=" + this.data.goods_discount_id;

          wx.navigateTo({
            url: url,
          })
        } else {
          wx.showToast({
            title: '系统错误',
          })
        }



      }

    } else {
      //没有sku的情况下，直接使用good的原始数据作为测试
      var skuid = 0;

      wx.setStorageSync("goodsforoder", this.data.goods);
      wx.setStorageSync("discountforoder", this.data.discount);
      this.setData({
        "goods_sku_choose": 0
      });
      var url = "../checkout/checkout?goods_id=" + goods.id + "&sell_type=" + this.data.sell_type + "&feeid=" + goods.feeid +
        "&skuid=" + 0 + "&buysum=" + this.data.buysum + "&goods_discount_id=" + this.data.goods_discount_id;

      wx.navigateTo({
        url: url,
      })
    }
  },


  close_service_detail: function(e) {
    this.setData({
      "service_detail": 0
    });
  },
  close_sku_choose: function(e) {
    this.setData({
      "goods_sku_choose": 0
    });

    //to do clear select spec
  },
  show_group_list: function(e) {
    this.setData({
      "show_group_list": 1
    });
  },
  close_group_lists: function(e) {
    this.setData({
      "show_group_list": 0
    });
  },




  previewImage: function(e) {
    var idx = e.currentTarget.dataset.idx;
    var gallery = [];

    for (var i = 0; i < this.data.gallery.length; i++) {
      gallery[i] = this.data.gallery[i].img_url;
    }

    wx.previewImage({
      current: gallery[idx],
      urls: gallery
    })
  },

  collect: function() {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/setgoodscollect?";

    url += "session=";
    url += app.globalData.session

    url += "&&goodsid=";
    url += this.goods_id

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
    url += "/ziyoutechan/customer/setgoodscollect?";

    url += "session=";
    url += app.globalData.session

    url += "&&goodsid=";
    url += this.goods_id

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
            title: '取消收藏成功',
          })
        } else {
          self.error(data);
          return false;
        }
      }
    });
  },
})
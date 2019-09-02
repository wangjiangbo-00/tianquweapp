var util = require('../../utils/util.js');
var WxParse = require('../../utils/wxParse/wxParse.js');
const ImgLoader = require('../../utils/img-loader/img-loader.js')
const app = getApp()
import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';

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
    goods_discount_id: 0,
    spec_showprice: 0,
    "pageName": "团购详情",
    needhome: true,
    needInitCheck: true,
    pageInit: 1,
    "pageinitoverclass": ""
  },
  onLoad: function(options) {

    var mode = Math.floor(Math.random() * 3)


    this.setData({ "initanimationmode": mode });


    this.is_onload = 1;
    app.setRecommender(options);
    this.goods_id = options.goods_id;
    app.checkNavbar(this);


    var scene = options.scene;
    if (scene) {
      scene = decodeURIComponent(options.scene)

      var sceneitems = scene.split(":")

      var sceneuserid = 0;

      var refid = 0;


      for (var i = 0; i < sceneitems.length; i++) {
        var sceneitem = sceneitems[i];
        

        if (sceneitem.indexOf("rf") != -1) {
          refid = sceneitem.substring(2);
          break;
        }

      }


      this.groupid = refid;
      

    }

    if (!this.groupid || this.groupid == 0) {
      this.groupid = options.id ? parseInt(options.id) : 0;
    }

    

    var id = this.options.id;

    var self = this;

    var userinfo = app.globalData.userInfo;

    this.baseApiUrl = util.baseurl();


    util.checkNet({
      success: function() {
        util.succNetCon(self);
        self.getData();
        self.getAppointment();

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
        self.getData();
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
  onShow: function() {
    if (!this.is_onload) {

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

  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  //监听用户下拉动作
  onPullDownRefresh: function() {
    util.loadding(this, 1);
    this.getData();
    wx.stopPullDownRefresh();
  },

  showshare: function () {
    this.setData({
      shareshow: true

    });
  },

  shareclose: function () {
    this.setData({
      shareshow: false

    });
  },

  getData: function() {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getplatformgroupdetails?";

    url += "session=";
    url += app.globalData.session

    url += "&&groupid=";
    url += this.groupid

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function(data) {


        
        
        setTimeout(function () {
          self.setData({

            "pageInit": 1
          });
        }, 100)

        self.loaded();
        if (data.returncode == 0) {
          var gruopdetails = data.message;

          if (gruopdetails) {
            var group = gruopdetails.teamFounder;

            if (group) {

              self.goods_id = group.goodsCover.id

              group.starttime_lang = util.formatTimeWithyrsf(group.starttime);
              group.expiretime_lang = util.formatTimeWithyrsf(group.expiretime);
              if (group.status == 4) {
                group.status_lang = "即将开始"


                var starttime = util.getTime(group.starttime);

                // 清除定时器
                var time = (new Date().getTime() - starttime);



                util.countdownWithTimer(self, self.groupTimer, time, "groupclock");
              } else if (group.status == 5) {
                group.status_lang = "正在进行"


                var endtime = util.getTime(group.expiretime);
                // 清除定时器
                
                // 清除定时器
                var time = (endtime - new Date().getTime());

                util.countdownWithTimer(self, self.groupTimer, time, "groupclock");
              }

              else if (group.status == 6) {
                group.status_lang = "已结束"


              }

              var stage_format = group.stage_format;

              if (stage_format == null) {
                return null;
              }

              var stages = stage_format.split(",");

              var processdatas = [{

                "num": 1,
                "discount": 10,


              }];

            

              var statge = stages[stages.length - 1];

              var stagevalues = statge.split(":");

              var num = stagevalues[0];

              var discount = parseFloat(stagevalues[1]).toFixed(1);

              group.discount = discount;

              for (var i = 0; i < stages.length; i++) {

                var item = {};
                var statge = stages[i];

                var stagevalues = statge.split(":");

                var num = parseInt(stagevalues[0]);

                var discount = parseFloat(stagevalues[1]).toFixed(1);

                item.discount = discount;
                item.num = num;

                processdatas.push(item);
              }






              var len = processdatas.length - 1;
              var processes = [];

              for (var i = 0; i < len; i++) {
                processes[i] = 0;
              }

              var processclass = "process_4";

              if (processdatas.length == 3) {
                processclass = "process_2";
              } else if (processdatas.length == 4) {
                processclass = "process_3";
              } else if (processdatas.length == 5) {
                processclass = "process_4";
              } else if (processdatas.length == 6) {
                processclass = "process_5";
              } else if (processdatas.length == 7) {
                processclass = "process_6";
              }

              var people = gruopdetails.people;

              group.people = people;

              var lastprocessdata = processdatas[processdatas.length - 1];

              var currentdiscount = 10;
              var nextdiscount = 10;
              var peoplelack = 0;

              if (people > 1) {
                for (var i = 0; i < processdatas.length; i++) {
                  var processdata = processdatas[i];
                  if (people < processdata.num) {

                    var processdatabefore = processdatas[i - 1];
                    var startnum = processdatabefore.num;
                    var endnum = processdata.num;

                    var space = endnum - startnum;

                    var has = people - startnum;

                    var process = Math.round((has * 100) / space);

                    processes[i - 1] = process;

                    discount = processdatabefore.discount;
                    currentdiscount = processdatabefore.discount;

                    nextdiscount = processdata.discount
                    peoplelack = processdata.num - people

                    
                    break;

                  } else if (people == processdata.num) {
                    var processdatabefore = processdatas[i - 1];

                    processes[i - 1] = 100;
                    discount = processdatabefore.discount;
                    currentdiscount = processdata.discount;

                    

                    if (i == processdatas.length-1)
                    {
                      nextdiscount = processdatas[i].discount
                      peoplelack = 0

                    }
                    else{
                      nextdiscount = processdatas[i + 1].discount
                      peoplelack = processdatas[i + 1].num - processdatas[i].num
                    }
                    break;

                  } else {
                    var processdata = processdatas[i];
                    processes[i] = 100;
                  }
                }

                

                self.setData({
                  "processes": processes,
                  "processclass": processclass,
                  lastprocessdata: lastprocessdata,
                  processdatas: processdatas,
                  currentdiscount: currentdiscount,
                  nextdiscount: nextdiscount,
                  peoplelack: peoplelack
                });
              } else {

                var secondprocessdata = processdatas[1];

                var peoplelack = secondprocessdata.num - people;

                var nextdiscount = secondprocessdata.discount;

                self.setData({
                  "processes": processes,
                  "processclass": processclass,
                  lastprocessdata: lastprocessdata,
                  processdatas: processdatas,
                  currentdiscount: currentdiscount,
                  nextdiscount: nextdiscount,
                  peoplelack: peoplelack
                });
              }

              group.currentdiscount = currentdiscount;
              group.nextdiscount = nextdiscount;
              group.peoplelack = peoplelack;
              group.orderid = gruopdetails.orderid;


              self.setData({
                "group": group,

              });
            }
          }

        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
          return false;
        }
      }
    });
  },

  generateshareimg: function () {

    var that = this
    var userinfo = app.globalData.userInfo;
    if (!(userinfo != undefined && userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0 )) {

      this.setData({ "userinfoshow": 1 })
    }
    else {

      var relay = false;

      var type = 3;

      var group = this.data.group;

     

      

      

      
        var composemsg = {
          "composeshowimageurl": this.data.group.goodsCover.bannerurl,
          "composetitle": this.data.group.goodsCover.goods_name + "正在团购,原价" + this.data.group.goodsCover.group_price + "元",
          "composeinfo": "参团人越多,折扣越大,最低至" + this.data.group.discount + "折",
          "composeleftshare1": "邀请你一起参团享低价",
          "composeleftshare2": "快帮我助力赢大奖",
          "composerightshare1": "长按小程序码",
          
          "composerightshare2": "赢取更低折扣",
          "composerightqr": group.qrpic,
        }
      
      



      wx.setStorageSync("composemsg", composemsg);
      wx.navigateTo({
        url: '../wximagecompose/wximagecompose?type=' + type + "&&refid=" + group.id,
      })
    }
    this.setData({
      shareshow: false

    });


  },

  goodsDetail: function(goods_id, func) {


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
          }
          else {
            goods = goodsdetails;
          }
          goods.sell_type = 0;
          var sellcount = goods.sell_count

          if (sellcount > 9999) {
            sellcount = (sellcount / 10000).toFixed(1) + "万"
          }

          goods.sell_count = sellcount;

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


          });

          func();

        }  else {
          util.notNetCon(self, 1, 1);
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

    var title = this.data.group.goodsCover.goods_name +  "正在进行超级团购,最低可至" + this.data.group.discount + "折。"

    var shareimg = null;

    if (this.data.group.goodsCover.pictureurl) {
      shareimg = this.data.group.goodsCover.pictureurl;

    }
    else if (this.data.group.goodsCover.bannerurl) {
      shareimg = this.data.group.goodsCover.bannerurl;
    }
    return getApp().share({
      title: title,
      imageUrl: shareimg,
      path: "pages/goodsgroup/goodsgroup?id=" + this.data.group.id + "&&goods_id=" + this.goods_id
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


  gotoshop: function(e) {
    var id = this.data.group.shopCover.id;
    wx.navigateTo({
      url: '../shopdetail/shopdetail?shopid=' + id,
    })
  },

  gotogoods: function (e) {
    var id = this.data.group.goodsCover.id;
    wx.navigateTo({
      url: '../goods/goods?goods_id=' + id,
    })
  },


  gotoorder: function(e) {
    var id = this.data.group.orderid;
    var url = "../order/order?id=" + id;
    wx.navigateTo({
      url: url,
    })
  },


  gotoMore(v) {

    wx.switchTab({
      url: '../promitionindex/promitionindex',
    })
  },

  groupbuy: function(e) {

    var self = this;
    this.setData({
      "sell_type": 2
    });
    if (this.data.goods) {
      var goods = this.data.goods;

      if (this.data.goods_spec_format && this.data.goods_spec_format.length == 0) {
        var skuid = 0;

        wx.setStorageSync("goodsforoder", this.data.goods);
        var url = "../checkout/checkout?goods_id=" + goods.id + "&sell_type=" + this.data.sell_type + "&feeid=" + goods.feeid +
          "&skuid=" + 0 + "&buysum=" + this.data.buysum + "&group_order_id=" + this.data.group.id;

        wx.navigateTo({
          url: url,
        })
      } else {
        var spec_showprice = this.data.goods.group_price;
        this.setData({
          "goods_sku_choose": 1,
          spec_showprice: spec_showprice
        });
        setTimeout(function() {
          self.setData({
            "goods_sku_choose": 2
          });
        }, 150)
      }


    } else {
      //尚未获取商品信息，先获取

      this.goodsDetail(this.goods_id, function() {

        var goods_spec_format = self.data.goods_spec_format;

        
        if (self.data.goods_spec_format && self.data.goods_spec_format.length==0) {

          var goods = self.data.goods;
          var skuid = 0;

          wx.setStorageSync("goodsforoder", self.data.goods);
          var url = "../checkout/checkout?goods_id=" + goods.id + "&sell_type=" + self.data.sell_type + "&feeid=" + goods.feeid +
            "&skuid=" + 0 + "&buysum=" + self.data.buysum + "&group_order_id=" + self.data.group.id;

          wx.navigateTo({
            url: url,
          })
        } else {


          var spec_showprice = self.data.goods.group_price;
          self.setData({
            "goods_sku_choose": 1,
            spec_showprice: spec_showprice
          });
          setTimeout(function() {
            self.setData({
              "goods_sku_choose": 2
            });
          }, 150)
        }
      });


    }






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
            return this.sell_type == 2 ? sku_list[i].group_price : sku_list[i].price
            break;
          }
        }







      }



    }
    return this.sell_type == 2 ? goods.group_price : goods.price
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
          this.setData({
            "goods_sku_choose": 0
          });
          var url = "../checkout/checkout?goods_id=" + goods.id + "&sell_type=" + this.data.sell_type + "&feeid=" + goods.feeid +
            "&skuid=" + skuid + "&buysum=" + this.data.buysum + "&group_order_id=" + this.data.group.id;


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
      this.setData({
        "goods_sku_choose": 0
      });
      wx.setStorageSync("goodsforoder", this.data.goods);
      var url = "../checkout/checkout?goods_id=" + goods.id + "&sell_type=" + this.data.sell_type + "&feeid=" + goods.feeid +
        "&skuid=" + 0 + "&buysum=" + this.data.buysum + "&group_order_id=" + this.data.group.id;

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


  getAppointment: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getsupergroupappointment?";

    url += "session=";
    url += app.globalData.session

    url += "&&groupid=";
    url += this.groupid

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {
          var appointment = data.message;

          if (appointment) {
            self.setData({
              "appointment": appointment
            });
          } else {
            
          }



        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
          return false;
        }
      }
    });
  },

  onUserinfoClose: function (e) {
    this.setData({ "userinfoshow": 0 })
  },

  bindGetUserInfo: function (e) {

    app.bindGetUserInfo(e);

  },


  appointment: function (e) {

    var action = parseInt(e.detail.target.dataset.action) ;


    var userinfo = app.globalData.userInfo;
    if (!(userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0)) {
      this.setData({ "userinfoshow": 1 })

    }
    else {
      var formid = e.detail.formId;
      var title = action == 1 ? "确认预约" : "取消预约"
      var msg = action == 1 ? "预约后，系统会在活动开始后及时给您发送通知":"取消后，系统将不会给你发送通知"
      var toastmsg = action == 1 ? "预约成功" : "取消成功"
      Dialog.confirm({
        title: title,
        message: msg
      }).then(() => {

        var url = this.baseApiUrl;
        url += "/ziyoutechan/customer/supergroupappointment?";

        url += "session=";
        url += app.globalData.session

        url += "&&groupid=";
        url += this.groupid


        url += "&&formid=";
        url += formid

        url += "&&action=";
        url += action

        var self = this;
        util.ajax({
          url: url,

          method: "GET",
          success: function (data) {
            self.loaded();
            if (data.returncode == 0) {
              Toast.success(toastmsg);
              self.getAppointment();
              //提示参与成功
            } else if (data.returncode == 1003) {
              // 参数错误
            } else if (data.returncode == 1017) {
              // 活动未开始
            } else if (data.returncode == 1018) {
              // 活动结束
            } else {
              util.notNetCon(self, 1, 1);
              self.error(data);
              return false;
            }
          }
        });
        // on confirm
      }).catch(() => {
        // on cancel
      });
    }
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
            title: '取消成功',
          })
        } else {
          self.error(data);
          return false;
        }
      }
    });
  },
})
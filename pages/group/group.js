var util = require('../../utils/util.js');
const app = getApp()
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
    needhome: true
  },
  onLoad:function(options){
    this.is_onload = 1;
    app.setRecommender(options);
    this.options = options;
    this.getConfig();
    app.checkNavbar(this);

    var self = this;
    util.checkNet({
      success : function() {
        util.succNetCon(self);
        self.getGroup();
        
      },
      error : function() {
        util.notNetCon(self);
      }
     });

    // 页面初始化 options为页面跳转所带来的参数
  },
  refresh : function() {
    var self = this;
    util.checkNet({
      success : function() {
        util.succNetCon(self);
        self.getGroup();
        
      },
      error : function() {
        util.notNetCon(self);
      }
    });
  },
  //监听用户下拉动作
  onPullDownRefresh:function() {
    this.refresh();
    wx.stopPullDownRefresh();
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    if(!this.is_onload) {
        this.getGroup();
     } else { 
      this.is_onload = 0;
    }
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏

  },
  onUnload:function(){
    // 页面关闭
  },
  loadding:function() {
    this.setData({page : {load : 0}});
  },
  loaded : function() {
    this.setData({page : {load : 1}});
  },
  cusImageLoad: function (e){
    var that = this;
    //这里看你在wxml中绑定的数据格式 单独取出自己绑定即可
    that.setData(util.wxAutoImageCal(e));
  },
  //配置方法
  getConfig:function() {
     var token = wx.getStorageSync('token');
     this.baseApiUrl = util.baseurl(); 
     this.token = token;
     this.setData({
       "load_text" :  util.config('pullload_text').load_text,
       "no_tuan_orders" :  util.config('pullload_text').no_tuan_orders,
       "tuan_status" : util.config('tuan_status'),
       "web" : util.config('web'),
       "group_text" : util.config('group_text'),
       "group_pic" : util.config('group_pic')
     });
     this.size = util.config('page_size');
     this.offset = util.config('page_offset');
     this.page = 1;
  },
  sku_confirm: function (e) {
    var goods = this.data.goods;

    var sku_list = this.data.goods.goodsSkuList;


    if (sku_list && sku_list.length>0) {
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
            "&skuid=" + skuid + "&buysum=" + this.data.buysum + "&group_order_id=" + this.data.group_order.teamFounder.id;


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
        "&skuid=" + 0 + "&buysum=" + this.data.buysum + "&group_order_id=" + this.data.group_order.teamFounder.id;

      wx.navigateTo({
        url: url,
      })
    }
  },


  close_service_detail: function (e) {
    this.setData({
      "service_detail": 0
    });
  },
  close_sku_choose: function (e) {
    this.setData({
      "goods_sku_choose": 0
    });
  },

  goodsDetail: function (goods_id, func) {


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getgoodsdetails?";

    url += "session=";
    url += app.globalData.session

    url += "&&goodsid=";
    url += goods_id
    var self = this;
    util.ajax({
      url: url,
      success: function (data) {
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

        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
        }
      }
    });
  },


  buySumChange({ detail }) {
    var buysum = detail.value;
    if (buysum > 10) {
      wx.showToast({
        title: '最多选10个',
      })
    }
    else {
      this.setData({
        buysum: detail.value
      })
    }

  },

  joinGroup: function (e) {
    var self = this;

    var group = this.data.group_order.teamFounder;

    if (group.groupresult == 1)
    {

      wx.switchTab({
        url: '../index/index',
      })

    }
    else
    {
      this.setData({
        "sell_type": 1
      });
      if (this.data.goods) {
        var goods = this.data.goods;

        if (!this.data.goods_spec_format) {
          var skuid = 0;

          wx.setStorageSync("goodsforoder", this.data.goods);
          var url = "../checkout/checkout?goods_id=" + goods.id + "&sell_type=" + this.data.sell_type + "&feeid=" + goods.feeid +
            "&skuid=" + 0 + "&buysum=" + this.data.buysum + "&group_order_id=" + this.data.group_order.teamFounder.id;

          wx.navigateTo({
            url: url,
          })
        } else {
          var spec_showprice = this.data.goods.group_price;
          this.setData({
            "goods_sku_choose": 1,
            spec_showprice: spec_showprice
          });
          setTimeout(function () {
            self.setData({
              "goods_sku_choose": 2
            });
          }, 150)
        }


      } else {
        //尚未获取商品信息，先获取

        this.goodsDetail(this.data.group_order.goods.id, function () {

          if (!self.data.goods_spec_format) {

            var goods = self.data.goods;
            var skuid = 0;

            wx.setStorageSync("goodsforoder", self.data.goods);
            var url = "../checkout/checkout?goods_id=" + goods.id + "&sell_type=" + self.data.sell_type + "&feeid=" + goods.feeid +
              "&skuid=" + 0 + "&buysum=" + self.data.buysum + "&group_order_id=" + this.data.group_order.teamFounder.id;

            wx.navigateTo({
              url: url,
            })
          } else {


            var spec_showprice = self.data.goods.group_price;
            self.setData({
              "goods_sku_choose": 1,
              spec_showprice: spec_showprice
            });
            setTimeout(function () {
              self.setData({
                "goods_sku_choose": 2
              });
            }, 150)
          }
        });


      }
    }

    
    






  },

  select_spec: function (e) {
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

  unselect_spec: function (e) {
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

  getspecprice: function (e) {
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
    return this.sell_type == 2 ? goods.group_price : goods.price
  },
  goodsList:function() {
    var offset = this.offset;
    var size = this.size;
    var data = {
      "offset" : offset,
      "size" : size,
      catid:0
    };

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getrecommendgoods?";

    url += "session=";
    url += app.globalData.session
    
    
    
    var self = this;
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
         var goods = data.lists;
         self.setData({
            "goodslist" : goods
         });
         self.loaded();
      }
    });
  },
  countdown:function(expire_time) {
    // 清除定时器
    if(this.timer) clearTimeout(this.timer);

    var expire_time = util.getTime(expire_time);

    // 清除定时器
    

    var times =  (expire_time - new Date().getTime() ) ;
    util.countdown(this,times);
  },
  getGroup:function() {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getgroupdetails?";

    url += "session=";
    url += app.globalData.session

    url += "&&groupid=";
    url += this.options.id
    var self = this; 
    var data = {
     
    };
    
    if(this.options.type == 1) {
      data.type = 1;
    }
    var self = this;
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
          if (data.returncode == 0) {
            data.group_order = data.message;
            var users = data.group_order.users.map(function(user) {
                user.join_time = util.formatTime(user.join_time );
                return user;
             });

            var userinfo = app.globalData.userInfo;
            data.group_order.users= users;

            data.group_order.group_title_class = data.group_order.teamFounder.groupresult == '2' ? 'tips_err' : data.group_order.teamFounder.groupresult == '1' ? 'tips_succ tips_succ2' : 'tips_succ tips_succ2';
            
            data.group_order.group_detail_class = data.group_order.teamFounder.groupresult == '2' ? 'tm_err' : data.group_order.teamFounder.groupresult == '1' ? 'tm_succ' : 'tm_tm';
             
             var group_but_text = '';
             var group_but_url = '';
              
             // 买了 没买 团进行中
             var is_shop = false;
             for(var i=0;i<data.group_order.users.length;i++) {
               if (userinfo.id == data.group_order.users[i].user_id) {
                    is_shop = true;
                }
             } 

            if (data.group_order.teamFounder.groupresult == '0') {

               

                if(!is_shop) {
                  group_but_url = '../checkout/checkout?sell_type=1&goods_id=' + data.group_order.goods.id + "&group_order_id=" + data.group_order.teamFounder.id;
                    group_but_text = self.data.group_text[1];  
                } else {
                    group_but_url = '';
                    group_but_text = self.data.group_text[0].replace("%s", (data.group_order.teamFounder.requirenum - data.group_order.teamFounder.people));
                }
             } else {
                group_but_url = 'index';
                group_but_text = self.data.group_text[2];
             }


             var tips_tit = '';
             var tips_detail = '';
             var open_group_type = '';

             if(!is_shop) {
                open_group_type = 0;
             } else if (data.group_order.users[0].user_id != data.group_order.order.buyerid) {
                open_group_type = 1;
              } else {
                open_group_type = 2;
              }

            tips_tit = self.data.tuan_status[data.group_order.teamFounder.groupresult]['tips_title'][open_group_type];
            tips_detail = self.data.tuan_status[data.group_order.teamFounder.groupresult]['tips_detail'][open_group_type];

             data.group_order.tips_tit = tips_tit; 
             data.group_order.tips_detail = tips_detail; 
             data.group_order.group_but_text = group_but_text; 
             data.group_order.group_but_url = group_but_url; 

             self.countdown(data.group_order.teamFounder.expiretime);

             var defaultPic = [];
             for (var i = 0; i < data.group_order.teamFounder.requirenum - data.group_order.teamFounder.people;i++) {
               defaultPic[i] = self.data.group_pic.defaultAvatar;
             }
             
             data.group_order.defaultAvatar = defaultPic;
             self.cate_id = data.group_order.goods.catid;
             self.goodsList();

            data.group_order.goods.introduction = data.group_order.goods.introduction
            data.group_order.goods.cover = data.group_order.goods.pictureurl
            data.group_order.goods.group_number = data.group_order.goods.group_number
            data.group_order.goods.group_price = data.group_order.goods.group_price
            data.group_order.goods.id = data.group_order.goods.id

             self.setData({
                "group_order" : data.group_order
             });
          } else if(data.result == 'fail') {
             util.notNetCon(self,1,1);
             self.error(data);

          } else {
             util.notNetCon(self,1,1);
             self.error({
                "result" : 'fail',
                "error_info" : util.config('error_text')[0]
             });
          }
          self.loaded();
      }
    });
  },
  error:function(data) {
    this.loaded();
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },
  bindRedirect:function(e) {
    var url = e.currentTarget.dataset.url;
    if(!url) return false;

    if(url == 'index' || url == 'groups' || url == 'orders' || url == 'personal') {
       wx.switchTab({
         "url" : url
       });
    } else {

      var pages = getCurrentPages()    //获取加载的页面
      if(pages.length >= 3) {
        
        wx.redirectTo({
          "url": url
        })  
        return true;        
      }

      wx.navigateTo({
        "url": url,
      })  
    }
    
  },
  
  groupShareUp:function(e) {
     this.setData({'share_down' : false});
  },
  onShareAppMessage: function () {
    var usr = app.globalData.userInfo;
    var whoname = ""

    if (usr && usr.nickname) {
      whoname = usr.nickname;

    }

    var title =  "快来和我一起拼-" + this.data.group_order.goods.goodsname + "吧"


    var shareimg = null;

    if (this.data.group_order.goods.pictureurl) {
      shareimg = this.data.group_order.goods.pictureurl;

    } else if (this.data.group_order.goods.bannerurl) {
      shareimg = this.data.group_order.goods.bannerurl;
    }


    return getApp().share({
      title: title,
      imageUrl: shareimg,
      path: "pages/group/group?id=" + this.options.id
    });
  },
  show_group_desc : function(e) {
    this.setData({
      "show_group_desc" : 1
    });
  },
  close_group_desc : function(e) {
    this.setData({
      "show_group_desc" : 0
    });
  }
})
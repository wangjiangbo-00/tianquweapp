var util = require('../../utils/util.js')
const app = getApp()
Page({
  data:{
    "btn_order_done" : false,
    "error" : {
       "result" : '',
       "error_info" : ''
    },
    'order_tixinged' : 0,
    "authOpen" : 0,
    "expressfee":0,
    "isgiveChecked": 0,
    "pageName": "领取礼品",
    
    pageInit: 0,
    "pageinitoverclass": ""
    // text:"这是一个页面"
  },
  onLoad:function(options){
    this.is_onload = 1;
    app.setRecommender(options);
	  util.loadding(this,1);
    app.checkNavbar(this);
    var bindtype = options.type ? parseInt(options.type):0;

    if (bindtype == 0)
    {
      var goods_id = options.goods_id;

      var orderid = options.orderid;

      var token = options.token; 

      var order = wx.getStorageSync("orderforgift")

      this.setData({
        bindtype: bindtype,
        goods_id: goods_id,
        token: token,
        orderid: orderid,
        order: order
      });
    }
    else
    {
      var lotteryid = options.lotteryid;

      this.setData({
        bindtype: bindtype,
        lotteryid: lotteryid
       
      });
    }
    
    
    
    this.baseApiUrl = util.baseurl(); 
  
    

    var self = this;
    

    
    this.address();

    
    

    
  },

  changeSwitch: function() {
    var changedData = {};
    changedData['isgiveChecked'] = !this.data['isgiveChecked'];
    this.setData(changedData);
  },
   refresh : function() {
     var self = this;
     util.checkNet({
       success : function() {
          util.succNetCon(self);//恢复网络访问
          self.address();
         if (this.data.bindtype == 0) {
           this.goodsDetail();
         }
       },
       error : function() {
          util.notNetCon(self,0);
       }
     });
  },
  //跳转地址页面
  redirectAddresses:function() {

    if (this.data.isgiveChecked)
    {
      wx.showToast({
        title: '不需要填写地址',
      })
      return;
    }
    
    
    var url = "../addresses/addresses?sell_type=" + 0 ; 
    url += " &address_id=" + this.data.address.id;
    
    //是否生成订单    
    util.redirect(url, 1);
    
  },
  
  

  gotogoods: function (e) {
    var pages = getCurrentPages()
    if (pages[pages.length - 2] != undefined && pages[pages.length - 2].route == "pages/goods/goods") 
    {
      wx.navigateBack({

      })
    }
    
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){

    var needgetaddr = wx.getStorageSync("needgetaddr");

    if (needgetaddr)
    {
      this.address();
    }
    if(!this.is_onload) {

      if(this.data.bindAddr == 0)
      {
        this.caculateExpressFee(this.data.address.province)
      }

      
      
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
    wx.removeStorageSync("orderforgift")
  },

  onUserinfoClose: function (e) {
    this.setData({ "userinfoshow": 0 })
  },

  bindGetUserInfo: function (e) {

    app.bindGetUserInfo(e);

  },
  btnOrderDone:function(e){

    var userinfo = app.globalData.userInfo;
    if (!(userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0)) {
      this.setData({ "userinfoshow": 1 })
      
    }
    else
    {
      if (!this.data.address) 
      {
        wx.showToast({
          title: '您还未添加收货地址',
        })
        return false;
      }
      if (this.data.btn_order_done) return true;
      var self = this;
      this.setData({
        "btn_order_done": true
      });


      if (this.data.order_id) {
        self.order_id = this.data.order_id;
        return util.wxpay(self);
      }

      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/createorder?";

      url += "session=";
      url += app.globalData.session

      //默认是单独购买
      var data = {
        "goods_id": this.goods_id,
        "address_id": this.data.address_id,
        "groupbuy": this.sell_type == 1 ? 1 : 0,
        "group_order_id": this.group_order_id ? this.group_order_id : 0,
        "expressfee": this.data.expressfee,
        "is_given": this.data.isgiveChecked?1:0,
      };

      util.ajax({
        "url": url,
        "data": data,
        "success": function (data) {
          if (data.returncode == 0) {
            //服务端生成订单成功
            //  self.setData({
            //   "btn_order_done" : false
            // });
            //微信支付
            self.order_id = data.message.id;
            self.session = app.globalData.session;
            self.url = this.baseApiUrl;
            util.wxpay(self);
            self.setData({ "order_id": self.order_id });
            //self.wxpay();
          } else if (data['result'] == "fail") {

            self.setData({ "order_id": 0 });

            util.toast(self, data.error_info);
          } else {

            self.setData({ "order_id": 0 });

            util.toast(self, util.config('error_text')[0]);
          }
        }
      });
    }
    
  },


  bindAddr: function (e) {


    var userinfo = app.globalData.userInfo;
    if (!(userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0)) {
      
      this.setData({ "userinfoshow": 1 })
    }
    else {
      if (!this.data.address) {
        wx.showToast({
          title: '您还未添加收货地址',
        })
        return false;
      }
      if (this.data.btn_order_done) return true;
      var self = this;
      this.setData({
        "btn_order_done": true
      });


      if (self.data.bindtype == 0)
      {
        var url = this.baseApiUrl;
        url += "/ziyoutechan/customer/bindgiftaddr?";

        url += "session=";
        url += app.globalData.session

        //默认是单独购买
        var data = {
          "orderid": this.data.orderid,

          "address_id": this.data.address_id,

          "token": this.data.token,

        };



        util.ajax({
          "url": url,
          "data": data,
          "success": function (data) {
            if (data.returncode == 0) {
              //绑定成功 跳转到礼品页面
              wx.showModal({
                title: '领取成功',
                content: '恭喜你领取到了礼物，快去看看吧',
                showCancel: false,
                success: function (res) {

                  wx.setStorageSync("setnextpageshowhome", 1);
                  var url = "../gifts/gifts?all_status=1"
                  wx.redirectTo({
                    url: url,
                  })
                }
              })


            } else {

              wx.showModal({
                title: '领取失败',
                content: '很抱歉，礼物已经被别人领走了',
                showCancel: false,
                success: function (res) {
                  var url = "../gifts/gifts"
                  wx.navigateBack({

                  })
                }
              })
            }
          }
        });
      }

      else if (self.data.bindtype == 1)
      {
        var url = this.baseApiUrl;
        url += "/ziyoutechan/customer/binduserlotteryaddr?";
        url += "session=";
        url += app.globalData.session

        //默认是单独购买
        var data = {
          "lotteryid": this.data.lotteryid,

          "address_id": this.data.address_id,
        };



        util.ajax({
          "url": url,
          "data": data,
          "success": function (data) {
            if (data.returncode == 0) {
              //绑定成功 跳转到礼品页面
              wx.showModal({
                title: '领取成功',
                content: '恭喜你领取到了礼物，快去看看吧',
                showCancel: false,
                success: function (res) {
                  var url = "../lottery/lottery?lotteryid=" + self.data.lotteryid;
                  wx.redirectTo({
                    url: url,
                  })
                }
              })


            } else {

              wx.showModal({
                title: '领取失败',
                content: '很抱歉，礼物已经被别人领走了',
                showCancel: false,
                success: function (res) {
                  var url = "../lottery/lottery?lotteryid=" + self.data.lotteryid;
                  wx.navigateBack({

                  })
                }
              })
            }
          }
        });
      }




      

      
    }

  },
  error:function(data) {
    util.loaded(this);
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },
 
  address: function () {
    {
      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getdefaultaddr?";

      url += "session=";
      url += app.globalData.session


      var self = this;
      util.ajax({
        "url": url,
        "method": 　"GET",
        "success": function (data) {
          if (data.returncode == 0) {
            util.loaded(self);
            var address = data.message;

            if (address) {
              self.setData({
                "address": address,
                address_id: address.id,
                shiptype: 0
              });

              self.caculateExpressFee();
            }
            else {
              self.setData({
                "address": false,
                address_id: 0,
                shiptype: 0
              });
            }

          } else {
            self.error(data);
          }
        }
      });
    }
  },
  

  goodsDetail:function(){
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getgoodsdetails?";

    url += "session=";
    url += app.globalData.session

    url += "&&goodsid=";
    url += this.data.goods_id
    var self = this;
     util.ajax({
        url : url,
        success : function(data){
			     util.loaded(self);
          self.setData({

            "pageinitoverclass": "fade_out"
          });


          setTimeout(function () {
            self.setData({

              "pageInit": 1
            });
          }, 500)
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

             goods.cover = goods.pictureurl
      
              self.setData({
                goods: goods,
                gallery: goods.gallery
              });
            } else {
              util.notNetCon(self,1,1);
              self.error(data);
            } 
        } 
     });
  },

  caculateExpressFee: function () {

    var self = this;

    var shiptype = this.data.shiptype;

    if (shiptype == 1) {
      var expressfeestr = "减免" + this.data.goods.selfliftreturn * this.data.buysum

      var totalmoney = this.data.goodsmoney - this.data.goods.selfliftreturn * this.data.buysum

      totalmoney = totalmoney.toFixed(2);
      self.setData({
        expressfeestr: expressfeestr,
        totalmoney: totalmoney
      });
    }
    else {

      var address = this.data.address;

      if (address) {
        var url = this.baseApiUrl;
        url += "/ziyoutechan/customer/caculateExpressFee?";

        url += "session=";
        url += app.globalData.session

        url += "&&goodsid=";
        url += this.data.goods_id
        url += "&&provinceid=";
        url += address.province

        url += "&&feeid=";
        url += this.feeid;
        var self = this;
        util.ajax({
          url: url,
          success: function (data) {
            util.loaded(self);
            if (data.returncode == 0) {

              var buysum = 1;

              buysum = self.data.order.orderGoods.buysum;

              var expressfee = data.message.expressfee * buysum
              var prefee = data.message.prefee * buysum

              self.setData({
                expressfee: expressfee,
                prefee: prefee
              })

            } else {
              util.notNetCon(self, 1, 1);
              self.error(data);
            }
          }
        });
      }



    }



  },
  errorGo: function(e) {
    wx.redirectTo({
      url: "index"
    })
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
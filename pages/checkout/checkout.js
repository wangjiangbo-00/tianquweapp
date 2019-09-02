var util = require('../../utils/util.js')
const app = getApp()
import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';
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
    "prefee": 0,
    "isgiveChecked":0,
    "shiptype":0,
    "swithdisabled":false,
    "pageName": "确认订单"
    // text:"这是一个页面"
  },
  onLoad:function(options){
    this.is_onload = 1;
	  util.loadding(this,1);
    app.checkNavbar(this);
    this.sell_type = options.sell_type;
    this.goods_id = options.goods_id;
    var address_id = options.address_id ? options.address_id:0 ;
    this.feeid = options.feeid;

    var shiptype =0;

    this.shiptype = shiptype;

    this.goods_discount_id = options.goods_discount_id ? options.goods_discount_id:0;
    this.group_order_id = options.group_order_id ? options.group_order_id : 0;
    //团购订单
    
    this.token = wx.getStorageSync('token'); 
    this.baseApiUrl = util.baseurl(); 

    var userinfo = app.globalData.userInfo;

    if (userinfo != null) {
      var configflag = userinfo.configflag;

      var spreadshow = configflag & 1;

      if (spreadshow)
      {
        var isrecommdender = userinfo.isrecommender;
        var recommdender = 0;

        if (isrecommdender == 1) {
         
        }
        else {
          var recommenderinfo = wx.getStorageSync("recommenderinfo");

          if (recommenderinfo) {

            var recommendertime = recommenderinfo.recommendertime;

            var now = new Date().getTime();
            var spantime = (now - recommendertime) / 1000;

            if (spantime < 3600 * 24) {
              recommdender = recommenderinfo.recommenderid;

              if (recommenderinfo.recommendname)
              {
                this.setData({
                  spreadshow:true,
                  spreadshowname: recommenderinfo.recommendname
                })

              }
              else
              {
                this.getspreadname(recommdender);
              }


            }


          }
        }
      }

      
    }


    var discount = wx.getStorageSync('discountforoder') ? wx.getStorageSync('discountforoder'):null; 

    wx.removeStorageSync("discountforoder");
  
    this.setData({
      sell_type : this.sell_type,
      goods_id :　this.goods_id,
      address_id: address_id,
      skuid: options.skuid,
      goods_discount_id: options.goods_discount_id,
      buysum: options.buysum,
      group_order_id: this.group_order_id,
      discount: discount, 
      shiptype: shiptype
    });

    var self = this;
    setTimeout(function(){
      self.setData({'order_tixinged' : 1});
    }
    ,50);

    
    this.address();

    
    var goods = wx.getStorageSync("goodsforoder");
    this.setData({
      goods: goods,
    });

    //wx.removeStorageSync("goodsforoder");

    if (this.data.skuid>0)
    {

      var skulist = goods.goodsSkuList;

      for(var i = 0;i<skulist.length;i++)
      {
        if (this.data.skuid == skulist[i].id)
        {
          var price = this.data.sell_type == 1 || this.data.sell_type == 2 ? skulist[i].group_price : skulist[i].price;

          
          this.setData({
            goodsprice: price,
            
            goodssku: skulist[i].sku_name
          });

          var discount = self.data.discount;

          if (discount && discount.status == 5 && discount.discount < 10) {
            var discountprice = (price * discount.discount * 0.1).toFixed(1);

            this.setData({
              discountprice: discountprice,

              
            });
          }
          else
          {
            this.setData({
              discountprice: price,


            });
          }
        }
      }
      
    }
    else
    {
      var price = this.data.sell_type == 1 || this.data.sell_type == 2  ? this.data.goods.group_price : this.data.goods.price;
      this.setData({
        goodsprice: price,
      });

      var discount = self.data.discount;

      if (discount && discount.status == 5 && discount.discount <10) {
        var discountprice = (price * discount.discount * 0.1).toFixed(1);

        this.setData({
          discountprice: discountprice,


        });
      }
      else {
        this.setData({
          discountprice: price,


        });
      }
    }

    var goodsmoney = this.data.discountprice * this.data.buysum;

    this.setData({
      goodsmoney: goodsmoney,


    });

    if (this.data.goods.openselflift)
    {
      this.goodsShopPickupPoint();
    }


    



    

    

    setTimeout(function () {
      self.doneOrderBanner();
    }, 300);
     
    // 页面初始化 options为页面跳转所带来的参数
  },
  userInfo: function () {

    var self = this;

    var userinfo = app.globalData.userInfo;

    if (userinfo == null || userinfo == undefined) {
      app.getUserInfo(function () {
        self.setData({ "userInfo": app.globalData.userInfo })
      })
    }
    else {
      self.setData({ "userInfo": app.globalData.userInfo })

    }

  },


  goodsShopPickupPoint: function (goodsid) {

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
        success: function (data) {
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

  closespreadshow: function () {

    this.setData({ "spreadshow": false})

  },
  changeSwitch: function() {

    

    if (this.data.isgiveChecked == 0)
    {
      this.setData({'isgiveChecked':1});


      if (this.data.shiptype == 1) {

        this.setData(
          {
            oldshiptype: this.data.shiptype,
            shiptype: 0,

          }
        )

      }
      else
      {
        this.setData(
          {
            oldshiptype: 0,
           

          }
        )
      }
    }
    else
    {
      this.setData({ 'isgiveChecked': 0});

      if (this.data.oldshiptype && this.data.oldshiptype == 1) {

        this.setData(
          {
            
            shiptype: 1,

          }
        )


        
      }
    }

    
    this.caculateExpressFee();
    
    
    
  },


  switchtap: function () {



    if (!this.order_id) {
     
    } else {
      util.toast(this, "订单已生成，不能修改了哦");
    }



  },
   refresh : function() {
     var self = this;
     util.checkNet({
       success : function() {
          util.succNetCon(self);//恢复网络访问
          self.address();
          //self.goodsDetail();
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
    
    if (this.data.address != undefined && this.data.address.id != undefined && this.data.address.id > 0) {
      var url = "../addresses/addresses?shiptype=" + this.data.shiptype + "&sell_type=" + this.sell_type; 
      url += " &address_id=" + this.data.address.id;
    } else {
      var url = "../addresses/addresses?shiptype=" + this.data.shiptype + "&sell_type=" + this.sell_type; 
    }
       

    //是否生成订单    
    if (!this.order_id) {
      util.redirect(url, 1);
    } else {
      util.toast(this, "订单已生成，不能修改了哦");
    }
  },
  doneOrderBanner : function() {
    
  },
  order_tixinged:function(e) {
    this.setData({'order_tixinged' : 1});
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
    this.userInfo();

    var needgetaddr = wx.getStorageSync("needgetaddr");

    
    
    
    if(!this.is_onload) {

      //this.address();
      
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

    console.log("checkout unload..............");

    wx.removeStorageSync("goodsforoder");
  },

  onUserinfoClose: function (e) {
    this.setData({ "userinfoshow": 0 })
  },

  bindGetUserInfo: function (e) {

    app.bindGetUserInfo(e);

  },
  btnOrderDone:function(e){

    var userinfo = app.globalData.userInfo;
    if (!( userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0)) {
      this.setData({ "userinfoshow": 1 })
      
    }
    else
    {
      if (this.data.isgiveChecked ==0 && this.data.shiptype == 0 && !this.data.address) 
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

      var discount = self.data.discount;
      var goods_discount_id = 0;

      if (discount && discount.status == 5)
      {
        goods_discount_id = discount.id;
      }

      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/createorder?";

      url += "session=";
      url += app.globalData.session

      var isrecommdender = userinfo.isrecommender;
      var recommdender = 0;

      if (isrecommdender == 1)
      {
        recommdender = userinfo.id;
      }
      else
      {
        var recommenderinfo = wx.getStorageSync("recommenderinfo");

        if (recommenderinfo) {

          var recommendertime = recommenderinfo.recommendertime;

          var now = new Date().getTime();
          var spantime = (now - recommendertime) / 1000;

          if (spantime < 3600 * 24 )
          {
            recommdender = recommenderinfo.recommenderid;
          }


        }
      }

      var extra = {};

      if(this.data.shiptype == 1)
      {
        extra.shiptype = 1;

      }

      extra = JSON.stringify(extra)

      


      

      //默认是单独购买
      var data = {
        "goods_id": this.goods_id,
        "address_id": this.data.address_id,
        "groupbuy": this.sell_type == 2 ? 2 : this.sell_type == 1?1:0,
        "group_order_id": this.group_order_id ? this.group_order_id : 0,
        "expressfee": this.data.isgiveChecked ? this.data.prefee:this.data.expressfee,
        "is_given": this.data.isgiveChecked?1:0,
        "buysum": this.data.buysum,
        "skuid": this.data.skuid,
        "recommenderid": recommdender,
        "goods_discount_id": goods_discount_id,
        "extra": extra
        
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
            self.setData({ 
              "order_id": self.order_id,
              "swithdisabled":true
               });
            //self.wxpay();
          } else if (data.returncode == 1011) {

            self.setData({ "order_id": 0 });

            util.toast(self, data.errormsg);
          } else {

            self.setData({ "order_id": 0 });

            util.toast(self, data.errormsg);
          }
        }
      });
    }
    
  },
  error:function(data) {
    util.loaded(this);
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },
 
  address:function(){{
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getdefaultaddr?";

    url += "session=";
    url += app.globalData.session

    
    var self = this; 
      util.ajax({
          "url" :  url,
          "method" :　"GET",
          "success" : function(data) {
            if (data.returncode == 0) {
              util.loaded(self);  
              var address = data.message;

              if (address)
              {
                self.setData({
                  "address": address,
                  address_id: address.id,
                  shiptype:0
                });

                self.caculateExpressFee(address.provinceid);
              }
              else
              {
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
   }},
  

  goodsDetail:function(){
    

    
  },

  

  caculateExpressFee: function () {

    var self = this;

    var shiptype = this.data.shiptype;

    if (shiptype == 1)
    {
      var expressfeestr = "减免" + this.data.goods.selfliftreturn*this.data.buysum

      var totalmoney = this.data.goodsmoney - this.data.goods.selfliftreturn * this.data.buysum

      totalmoney = totalmoney.toFixed(2);
      self.setData({
        expressfeestr: expressfeestr,
        totalmoney: totalmoney
      });
    }
    else
    {

      var address = this.data.address;

      if (address)
      {
        var url = this.baseApiUrl;
        url += "/ziyoutechan/customer/caculateExpressFee?";

        url += "session=";
        url += app.globalData.session

        url += "&&goodsid=";
        url += this.goods_id
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

              var expressfee = data.message.expressfee * self.data.buysum
              var prefee = data.message.prefee * self.data.buysum

              self.setData({
                expressfee: expressfee,
                prefee: prefee
              })

              var isgiven = self.data.isgiveChecked;

              if (isgiven == 1)
              {
                if (prefee>0)
                {
                  var expressfeestr = "预付运费" + prefee
                  var totalmoney = self.data.goodsmoney + prefee
                }
                else
                {
                  var expressfeestr = "免运费" 
                  var totalmoney = self.data.goodsmoney 
                }
                
              }
              else
              {
                if (expressfee > 0) {
                  var expressfeestr = "运费" + expressfee

                  var totalmoney = self.data.goodsmoney + expressfee
                }else
                {
                  var expressfeestr = "免运费" 

                  var totalmoney = self.data.goodsmoney 
                }
              }

              totalmoney = totalmoney.toFixed(2);
              self.setData({
                expressfeestr: expressfeestr,
                totalmoney: totalmoney
              });


              


              

            } else {
              util.notNetCon(self, 1, 1);
              self.error(data);
            }
          }
        });
      }

      

    }


    
  },

  getspreadname: function (userid) {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getspreadname?";

    url += "session=";
    url += app.globalData.session

    url += "&&userid=";
    url += userid;
    var self = this;
    util.ajax({
      url: url,
      success: function (data) {
        util.loaded(self);
        if (data.returncode == 0) {

          var name = data.extramsg;
          

          var recommenderinfo = wx.getStorageSync("recommenderinfo");

          if (recommenderinfo) {

            recommenderinfo.recommendname = name
            wx.setStorageSync("recommenderinfo", recommenderinfo)

            self.setData({
              spreadshow: true,
              spreadshowname: recommenderinfo.recommendname
            })
          }
          

        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
        }
      }
    });
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
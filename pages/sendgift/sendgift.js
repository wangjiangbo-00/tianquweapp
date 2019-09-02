var util = require('../../utils/util.js');
const app = getApp()
Page({
  data:{
    
    "pageName": "赠送礼物"
  },
  onLoad:function(options){
    this.is_onload = 1;
    app.setRecommender(options);
    app.checkNavbar(this);
    this.getConfig();
    var order = wx.getStorageSync("giftorder");
    this.orderid = order.id

    var userinfo = app.globalData.userInfo;
    this.setData({ "userInfo": userinfo })
    if (!order.isdetails)
    {
      this.getOrder();
    
    }
    else
    {
      if (order.orderExtra && order.orderExtra.blessing_message) {
        this.setData({ "giftmsg": order.orderExtra.blessing_message });
      }
      this.setData({ "order": order })
    }

    

    util.loaded(this);

    this.options = options;
    

    var self = this;
    util.checkNet({
      success : function() {
        util.succNetCon(self);
        
      },
      error : function() {
        util.notNetCon(self);
      }
     });

    // 页面初始化 options为页面跳转所带来的参数
  },
  sendcheck: function(){

    var msg = this.data.giftmsg;
    var bneed = false;
    var order = this.data.order

    if (msg != undefined && msg)
    {
      if (order.orderExtra && order.orderExtra.blessing_message) {
        if (msg != order.orderExtra.blessing_message) {
          bneed = true;
        }
      }
      else {
        bneed = true;
      }

      if (bneed) {

        var url = this.baseApiUrl;
        url += "/ziyoutechan/customer/changeblessmessage?";

        url += "session=";
        url += app.globalData.session

        url += "&&orderid=";
        url += this.orderid

        url += "&&message=";
        url += this.data.giftmsg

        var self = this;
        util.ajax({
          url: url,

          method: "GET",
          success: function (data) {
            self.loaded();
            if (data.returncode == 0) {

            } else {
              util.notNetCon(self, 1, 1);
              self.error(data);
              return false;
            }
          }
        });
      }
    }
  

    

  },

  giftmsginput: function (e) {
    this.setData({
      giftmsg: e.detail.value
    })
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
    var appDevelop = util.config('appDevelop');
    this.setData({
      "appDevelop": appDevelop
    });

  },
  testreceive: function (){
    var token = this.data.order.given_token;
    var id = this.data.order.id;

    var url = "../giver/giver?id="+id+"&&token="+token;

    wx.navigateTo({
      url: url,
    })


  },
  goodsList:function() {
    var offset = this.offset;
    var size = this.size;
    var data = {
      "offset" : offset,
      "size" : size
    };

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getrecommendgoods?";

    url += "session=";
    url += app.globalData.session
    
    if(this.cate_id != undefined && this.cate_id != 0) {
      data.catid = this.cate_id;
    } 
    
    var self = this;
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
         var goods = data.lists;
         self.setData({
            "goods" : goods
         });
         self.loaded();
      }
    });
  },
  
  getOrder:function() {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getorder?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += this.orderid

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {
          var order = data.message;
          order.pay_time = util.formatTimeWithNyr(order.paytime);
          order.order_time = util.formatTimeWithNyr(order.createtime);
         

          order.orderGoods.introduction = order.orderGoods.goodtitle
          order.orderGoods.cover = order.orderGoods.goodposter
          order.orderGoods.group_number = order.orderGoods.group_number
          order.orderGoods.group_price = order.orderGoods.goods_price
          order.orderGoods.id = order.orderGoods.goodId
          order.shipfeedesp = "免运费"

          if (order.orderExtra && order.orderExtra.blessing_message)
          {
            self.setData({ "giftmsg": order.orderExtra.blessing_message });
          }

          if (order.isgiven) {
            if (order.preshippfee > 0) {
              order.shipfeedesp = "预付运费" + order.preshippfee + "元"
            }
          }
          else {
            if (order.shipping_money > 0) {
              order.shipfeedesp = "运费" + order.shipping_money + "元"
            }
          }

          if (order.orderStatus == '0' || order.orderStatus == '1' || order.orderStatus == '2') {
            order.state_class = "state_1";
          } else if (order.orderStatus == '3') {
            order.state_class = "state_2";
          } else if (order.orderStatus == '4') {
            order.state_class = "state_3";
          }
          if (order.orderStatus == 3) {
            


          }
          self.setData({ "order": order });
        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
          return false;
        }
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
  joinGroup:function(e) {
    var url = e.currentTarget.dataset.url;
    if(!url) {
      //this.setData({'share_down' : true});
      return false;
    } 

    this.bindRedirect(e);
  },
  groupShareUp:function(e) {
     this.setData({'share_down' : false});
  },
  onShareAppMessage: function () {

    var title =  "收到一份礼物 - " + this.data.order.orderGoods.goodtitle + " 快去看看吧"

    var shareimg = null;

    if (this.data.order.orderGoods.goodposter) {
      shareimg = this.data.order.orderGoods.goodposter;

    }
    
      return app.share({ 
        title: title,
        imageUrl: shareimg,
       path: "pages/giver/giver?id=" + this.data.order.id + "&&token=" + this.data.order.given_token});
    
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
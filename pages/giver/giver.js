var util = require('../../utils/util.js');
const app = getApp()
Page({
  data:{
    
    "pageName": "收到礼物",
    needhome: true,
    needInitCheck: true,
    pageInit: 0,
    "pageinitoverclass": ""
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
        self.getOrder();
        
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
        self.getOrder();
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
        this.getOrder();
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
       "giver_status": util.config('giver_status'),
       "lottery_status": util.config('lottery_status'),
       "web" : util.config('web'),
       "giver_text" : util.config('giver_text'),
       
       "group_pic" : util.config('group_pic')
     });
     this.size = util.config('page_size');
     this.offset = util.config('page_offset');
     this.page = 1;
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
    url += "/ziyoutechan/customer/getorderwithtoken?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += this.options.id

    url += "&&token=";
    url += this.options.token
    var self = this; 
    var data = {
     
    };
    
    
    var self = this;
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){

        self.setData({

          "pageinitoverclass": "fade_out"
        });


        setTimeout(function () {
          self.setData({

            "pageInit": 1
          });
        }, 500)
          if (data.returncode == 0) {

            var order = data.message;
            data.order = data.message;

            
            
            var userinfo = app.globalData.userInfo;
            
            data.order.group_title_class = data.order.givenstatus == '1' || data.order.givenstatus == '2'? 'tips_err' : data.order.givenstatus == '0' ? 'tips_succ tips_succ2' : 'tips_succ tips_succ2';
            
            data.order.group_detail_class = data.order.givenstatus == '1' || data.order.givenstatus == '2'? 'tm_err' : data.order.givenstatus == '0' ? 'tm_succ' : 'tm_tm';


            if (data.order.givenstatus == '1' || data.order.givenstatus == '2')
            {
              wx.hideShareMenu({
                
              })
            }
             
             var group_but_text = '';
             var group_but_url = '';
              
             // 买了 没买 团进行中
             var is_shop = false;
             
             data.order.group_but_text = data.order.givenstatus == '1' ? self.data.giver_text[0] : self.data.giver_text[1]; 

            if (parseInt(order.ordertype)  == 2)
            {
              var tips_tit = self.data.lottery_status[data.order.givenstatus]['tips_title'][0];
              var tips_detail = self.data.lottery_status[data.order.givenstatus]['tips_detail'][0];

              wx.setNavigationBarTitle({
                title: '中奖喽',
              })
            }
            else
            {
              var tips_tit = self.data.giver_status[data.order.givenstatus]['tips_title'][0];
              var tips_detail = self.data.giver_status[data.order.givenstatus]['tips_detail'][0];
              wx.setNavigationBarTitle({
                title: '收到礼物喽',
              })
            }

             

             data.order.tips_tit = tips_tit;
             data.order.tips_detail = tips_detail; 

            data.order.orderGoods.introduction = data.order.orderGoods.goodtitle
            data.order.orderGoods.cover = data.order.orderGoods.goodposter
            data.order.orderGoods.group_number = data.order.orderGoods.group_number
            data.order.orderGoods.group_price = data.order.orderGoods.goods_price
            data.order.orderGoods.id = data.order.orderGoods.goodId
            data.order.shipfeedesp = "免运费"

            if (data.order.ordertype == 2)
            {
              data.order.blessing_message = "大吉大利，恭喜发财"
            }
            else
            {
              if (!data.order.orderExtra.blessing_message) {
                data.order.blessing_message = "大吉大利，恭喜发财"
              }
            }

            

             self.setData({
                "order" : data.order
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
  joinGroup:function(e) {
    var url = e.currentTarget.dataset.url;
    if(!url) {
      //this.setData({'share_down' : true});
      return false;
    } 

    this.bindRedirect(e);
  },
  acceptGift: function (e) {

    var order = this.data.order;
    wx.setStorageSync("orderforgift",order);
    var url = "../giveraddr/giveraddr?type=0&&orderid=" + this.data.order.id + "&&goods_id=" + this.data.order.orderGoods.goodId + "&&token=" + this.data.order.given_token;

    
    wx.redirectTo({
      url: url,
    })

   
  },
  goIndex: function (e) {
    var url = "../index/index";
    

    wx.switchTab({
      url: url,
    });
  },
  groupShareUp:function(e) {
     this.setData({'share_down' : false});
  },
  gotogoods: function (e) {
    var order_id = e.currentTarget.dataset.order_id;
    var goodsid = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: '../goods/goods?goods_id='+goodsid,
    })
  },

  gotoIndex: function (e) {
    
   wx.switchTab({
     url: '../index/index',
   })
  },
  onShareAppMessage: function () {

    var title = "收到一份礼物 - " + this.data.order.orderGoods.goodtitle + " 快去看看吧"


    var shareimg = null;

    if (this.data.order.orderGoods.goodposter) {
      shareimg = this.data.order.orderGoods.goodposter;

    }
    


    return getApp().share({ title: title, imageUrl: shareimg, path: "pages/giver/giver?id=" + this.data.order.id + "&&token=" + this.data.order.given_token });
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
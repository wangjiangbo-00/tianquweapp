var util = require('../../utils/util.js');
const ImgLoader = require('../../utils/img-loader/img-loader.js')
const app = getApp()


Page({
  data:{
      "URL" : 1,
      'autoplay': false,
      'interval': 3500,
      'duration': 500,
      'loaded': false,
      'indicator-dots' : false,
      "is_over" : false,
      "no_data" : false,
      "goods_img" : {
        "imageWidth" : 0,
        "imageheight" : 0
      },
      "banner_img" : {
        "imageWidth" : 0,
        "imageheight" : 0
      },
      "nav_scroll_left" : 0,
      "page_cate" : [],
      "current" : 1,
      "scrollable": true,
    "pageName": "田趣小集",
    needInitCheck:true,
    pageInit:0,

   },
  onLoad:function(options){


    var mode = Math.floor(Math.random() * 3)


    this.setData({ "initanimationmode": mode });

    app.setRecommender(options);
    app.checkNavbar(this);
     var self = this;
     
     self.getConfig();

     util.checkNet({
        success : function() {
          util.succNetCon(self);
          self.goodsCate();

          var shop_notice = wx.getStorageSync("shop_notice_0");

          var needfetch = true;

          if (shop_notice)
          {
            var fetchtime = shop_notice.fetchtime;

            if (fetchtime)
            {
              var spantime = (new Date().getTime() - fetchtime) / 1000;


              if (spantime < 3600 * 6)
              {
                needfetch = false;
              }
            }

            
          }

          if (needfetch )
          {
            self.getShopNotice();
          }
          
        },
        error : function() {
          util.notNetCon(self,1);
        }
     });
  },
  getConfig:function() {
    this.baseApiUrl = util.baseurl(); 
     this.size = util.config('page_size');
     this.offset = util.config('page_offset');
     this.page = 1;

     this.setData({
       "pullload_text" :  util.config('pullload_text')
     });
  },



  pullDown: function( e ) {
    if (this.data.is_over == 1) return false;
    this.setData({ "pullDown": 1, "is_scroll": false });
    this.page = this.page + 1;
    //this.goodsList();
  },
  pullUpLoad: function(e) {
    
  },

  error: function (data) {
    this.setData({ page: { load: 1 } });
    if (data['result'] == 'fail') {
      util.toast(this, data.error_info);
    }
  },
  goTop: function(e) {
    this.setData({
      "scroll_Top" : -Math.random()
    });
  },
  scroll:function(e) {
    if(this.data.windowHeight < e.detail.scrollTop) {
       this.setData({"goTopClass" : 'top-button-show-nav'});
    } else {
      this.setData({"goTopClass" : 'top-button-hide'});
    }
  },
  onReady:function(){},
  onShow:function(){
    wx.getSystemInfo( {
      success: ( res ) => {
        this.setData( {
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },
  onHide:function(){
    console.log("index page hide")

    this.pagedata = undefined;


  },
  onUnload:function(){
    
  },

  onPullDownRefresh:function() {
     var self = this;
     self.getConfig();
     util.checkNet({
        success : function() {
          util.succNetCon(self);
          self.goodsCate();
          //self.imgLoader = new ImgLoader(self, self.imageOnLoad.bind(self))
        },
        error : function() {
          util.notNetCon(self,1);
        }
     });
  },
  error:function(data) {
    this.setData({page : {load : 1}});
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },


  getShopNotice: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getsystemnotice?";

    url += "session=";
    url += app.globalData.session


    url += "&&shopid=";
    url += 0

    var self = this;
    

    

    util.ajax({
      "url": url,
      "success": function (data) {
        if (data.returncode == 0) {

          var notice = data.message;

          if (notice && notice.is_enable)
          {
            self.setData(
              {
                "notice":notice
              }
            )

            notice.fetchtime = new Date().getTime();


            wx.setStorageSync("shop_notice_0", notice)

            setTimeout(function(){
              self.setData(
                {
                  "notice": null
                }
              )
            },60000)
          }
          else
          {
           var notice = {

            }
            notice.fetchtime = new Date().getTime();

            wx.setStorageSync("shop_notice_0", notice)
          }
        }
      }
    });
  }, 

  bannerList:function() {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getbanners?";

    url += "session=";
    url += app.globalData.session
    
    var self = this;
    var page = 0;
    if(this.cate_id != undefined) {
       page = this.cate_id;
    }

    if(self.pagedata == undefined) {
      self.pagedata  = {};
    }

    if(self.pagedata != undefined && self.pagedata[page] != undefined) {
      var pagedata = self.pagedata[page];
      var agoData = page.goods;
    } else {
      self.pagedata[page] = {};
    }
   
    util.ajax({
      "url" :  url,
      "success" : function(data) {

        
        self.pagedata[page].banners = data.lists;
          self.setData({
            "banners" : data.lists,
            "pageinitoverclass": "fade_out"
          });

          setTimeout(function(){
            self.setData({
              
              "pageInit": 1,
              
              
            });
          },800)
        }
     });
  },   
  goodsList:function() {
    if (this.data.is_over == 1) return false;
    var offset = (this.page - 1);
    var size = this.size;
    var data = {
      "offset" : offset,
      "size" : size
    };
   
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getrecommendgoods?";

    url += "session=";
    url += app.globalData.session
    
    var page = 0;
    if (this.cate_id != undefined && this.cate_id != 0) {
      data.catid = this.cate_id;
      page = this.cate_id;
    }
    else {
      data.catid = 0;
    }

    if(offset == 0 && this.cate_id) {
      util.loadding(this,1); 
    }
    
    var self = this;
 

    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){

        self.loaded();
         
         if (page == 0 && self.cate_id == 0 && self.page == 1) {
           self.bannerList();
         }   
         var allData = '';

         if(self.pagedata == undefined) {
            self.pagedata  = {};
         }

         
         if(self.pagedata != undefined && self.pagedata[page] != undefined) {
            var pagedata = self.pagedata[page];
            if (self.page == 1) {
              //var agoData = pagedata.goods;
            } else {
              //var agoData = self.data.goods;
            }       
         } else {
            self.pagedata[page] = {};
         }
          
         var goods = data.lists;
        if(goods.length != 0) {
            if(goods.length < self.size) {
              self.setData({ "is_over": 1 });
              if (self.page == 1) {
                self.pagedata[page].is_over = 0;
                self.pagedata[page].no_data = 0;
              }
            }
            
            
            if (false) {
              allData = agoData.concat(goods);
            } else {
              allData = goods;
            }

            if (self.page == 1 && allData.length > 0) {
              self.pagedata[page].goods = goods;
              self.pagedata[page].p = self.page;
            }
                
            self.setData({goods : allData});
            
        }  else {
          if(self.data.goods == false) {
            self.setData({goods : []});
            self.pagedata[page].goods = [];
          }
          self.setData({
            "is_over" : 1,
            "no_data" : 1
          });

          if (self.page == 1) {
            self.pagedata[page].is_over = 0;
            self.pagedata[page].no_data = 0;
          }
        } 

        self.setData({ is_scroll: true });
        self.setData({ loaded: true });
      }
    });
  },
  cusImageLoad: function (e){

    var id = e.currentTarget.dataset.id;
    var that = this;
    var data = {};
    
    if( data[id] == undefined) {
      data[id] = util.wxAutoImageCal(e);
      that.setData(data);
      this.setData({'image_load' : 1});
    }
    util.loaded(this);
  },
  
  goodsCate:function(e){
    var offset = 0;
    var size = 100;
    var data = {
      "offset" : offset,
      "size" : size
    };
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getcategorys?";

    url += "session=";
    url += app.globalData.session
    var self = this; 
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
        self.loaded();
        if (data.returncode == 0) {
           self.cate_id = 0;
           self.goodsList(); 
           self.setData({
             "cates": data.lists
           });
        }
      }
    });
  },
  loadding:function() {this.setData({page : {load : 0}});},
  loaded : function() {this.setData({page : {load : 1}});},
  channelRendered:function(e) {   
    var nav_scroll_left = 0;
    this.cate_id = e.currentTarget.dataset.cate_id;
    this.current_index = e.currentTarget.dataset.index;
    var nav_temp = 0;

    this.setData({ "scroll_Top": 0, "pullDown": 0, "goods": false, "is_scroll": true });

    var plus = 30;
    if (this.current_index != -1) {
      var plus = 10 * this.data.cates[this.current_index].name.length;
    }

    var nav_scroll_left = (e.currentTarget.offsetLeft - (this.data.windowWidth / 2) + plus);
    this.setData({ 'nav_scroll_left': nav_scroll_left });

    this.setData({ "current_index": this.current_index });

    var page = 0;
    if (this.cate_id != undefined) { page = this.cate_id; }
    if (this.pagedata == undefined || this.pagedata[page] == undefined) { util.loadding(this, 1); }

    this.refresh();    
  },
  refresh:function() {
     var page = 0;
     var self = this;

     if (this.cate_id != undefined) { page = this.cate_id; }
     if (this.pagedata != undefined && this.pagedata[page] != undefined && this.pagedata[page].goods != undefined) {

       if (this.pagedata[page].is_over == undefined || this.pagedata[page].no_data == undefined) {
         this.pagedata[page].is_over = false;
         this.pagedata[page].no_data = false;
       }
       this.page = this.pagedata[page].p;
       this.setData(this.pagedata[page])
       util.loaded(this);

       return;
     }

     util.loadding(this,1);
     util.checkNet({
       success : function() {
          if(self.data.notNetCon.error) {
             util.succNetCon(self);
             self.goodsCate();
             
             //self.imgLoader = new ImgLoader(self, self.imageOnLoad.bind(self))
          } else {
             self.setData({'goods' : false,'is_over' : 0,'no_data' : 0,"scroll_Top" : -Math.random(),"pullDown" : 0,"banners" : []});
             self.page = 1;
             self.goodsList();

             util.loaded(self);
          }
        },
      error : function() {
        self.setData({goods : false});
        
        util.notNetCon(self,0);
      }
    });     
  },  
  onShareAppMessage: function () {

    

    var bannerlist = this.data.banners;

    var shareimg = null;

    
    shareimg = "/images/defaultshareimg.jpg";

    
    
    return getApp().share({ title: "享美食,送好礼,抽大奖,赢返利,尽在田趣小集", imageUrl: shareimg,path : "pages/index/index?useless=0"});},
  bindRedirect:function(e) {
    var url = e.currentTarget.dataset.url;
    if(!url) return false;

    wx.navigateTo({"url": url})
  },
  bannerDetail:function(e) {
    var index = e.target.dataset.index;
    var shopid = this.data.banners[index].id;

    var banner = this.data.banners[index];

    var type = banner.type;
    var refid = banner.refid;
    if(type == 1)
    {
      var url = '../goods/goods?goods_id=' ;
      url += refid;



      if (!url) return false;


      wx.navigateTo({ url: url })
    }
    else if (type == 2)
    {
      var url = "../shopdetail/shopdetail?shopid=";
      url += refid;



      if (!url) return false;


      wx.navigateTo({ url: url })
    }
    else if (type == 2) {
      var url = "../shopdetail/shopdetail?shopid=";
      url += refid;



      if (!url) return false;


      wx.navigateTo({ url: url })
    }

    else if (type == 3) {
      var url = "../platformdiscounts/platformdiscounts?id=";
      url += refid;



      if (!url) return false;


      wx.navigateTo({ url: url })
    }

    else if (type == 4) {

      if(refid == 0)
      {
        var url = "../lotterys/lotterys";
      }
      else
      {
        var url = "../lottery/lottery?lotteryid=";
        url += refid;
      }
      
     



      if (!url) return false;


      wx.navigateTo({ url: url })
    }

    else if (type == 5) {
      if (refid == 0) {
        var url = "../supergroups/supergroups";
      }
      else {
        var url = "../goodsgroup/goodsgroup?id=";
        url += refid;
      }





      if (!url) return false;


      wx.navigateTo({ url: url })
    }
    else
    {

    }
    
  },

  getUserInfo: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getuserinfo?";

    url += "session=";
    url += app.globalData.session
    util.ajax({
      "url": url,

      "success": function (data) {
        util.loaded(self);
        if (data.returncode == 0) {
          var nickname = data.message.nickname;
          var headpic = data.message.headpic;

          app.globalData.userInfo = data.message;

          if (nickname == null || headpic == null) {
            app.getUserInfo(function (userinfo) {
              if (userinfo != null) {
                self.setData({
                  "userInfo": {
                    "avatarUrl": userinfo.avatarUrl,
                    "nickName": userinfo.nickName
                  }
                });

                self.updateUserInfo();
              }


            })
          }
          else {
            self.setData({
              "userInfo": {
                "avatarUrl": data.message.headpic,
                "nickName": data.message.nickname
              }
            });
          }



        } else {
          self.error(data);
        }
      }
    });
  },
  bindchange:function(e) {
    var current = e.detail.current + 1;

    this.setData({current : current});
  },
})
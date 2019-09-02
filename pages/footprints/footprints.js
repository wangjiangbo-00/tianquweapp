var util = require('../../utils/util.js')
const app = getApp()
Page({
  data:{
      "URL" : 3,
      "is_over" : false,
      "no_data" : false,
      "modalHidden" : true,
      "expressOpen" : 0,
      "modalHidden1" : true,
      "express" : {
        'error' : false,
        'info' : '',
        'load' : true
      },
    "orders": false,
    "pageName": "我的足迹",
    "nothing_text": "您还没有浏览记录",

    // text:"这是一个页面"
  },
  onLoad:function(options) {
    this.is_onload = 1;
    app.setRecommender(options);
    this.options = options;
    app.checkNavbar(this);
   
    this.getConfig();

    if (this.all_status == undefined)
    {
      this.setData({ "all_status": 1 });
    }

    this.getData();

    this.loaded();
     



    var self = this;
      util.checkNet({
        success : function() {
        util.succNetCon(self);
      
        //token,this.offset,this.size
      },
      error : function() {
        util.notNetCon(self);
      }
    });

    
  },

  
  //配置方法
  getConfig:function() {
     var token = wx.getStorageSync('token');
     this.baseApiUrl = util.baseurl(); 
     this.size = util.config('page_size');
     this.offset = util.config('page_offset');
     this.token = token;
     this.page = 1;

     this.setData({'pullload_text' : util.config('pullload_text')});
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow: function( e ) {
    wx.getSystemInfo( {
      success: ( res ) => {
        this.setData( {
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })

    if(!this.is_onload) {
      // 页面初始化 options为页面跳转所带来的参数
      if( wx.getStorageSync('order_type') != '') {
         if(wx.getStorageSync('order_type') == '3') {
            this.setData({"all_status" : 3});
            this.order_status = undefined;  
         } else {
            var all_status = wx.getStorageSync('order_type') == "0" ? 0 : 1;
            this.setData({"all_status" : all_status});
            this.order_status = all_status; 
         }
         
         wx.removeStorageSync('order_type');      
         this.refresh(1);
      } else {
        this.refresh();  
      }
    } else {
      this.is_onload = 0;
    }
    
  },
  pullDown: function( e ) {
    if (this.data.is_over == 1) return false;
    this.setData({"pullDown" : 1});
    if(!this.data.is_over) {
      this.page = this.page + 1;
      this.getData();  
    }
  },
  pullUpLoad: function(e) {
  },
  getData:function(isclear=0) {
    

    var footprints = wx.getStorageSync("footprints");

    if (footprints) {
      footprints.reverse();
      

      this.setData({
        goods: footprints
      })
    }
                
  },
  

  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  
  
  loadding:function() {
    util.loadding(this);
 },
 loaded : function() {
    util.loaded(this);
 },
 error:function(data) {
    this.loaded();
    //如果是 查询物流信息出错 不显示弹窗
    if(data.error_code == '41001') {
        this.setData({
          'express' : {
          "loading" : false,"error" : 1,"info" : util.config('error_text')[8]}
        });
        return true;
    }
    
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    } 
  },
  
  
  //初始化数据
  refresh:function(isclear=0) {
    var self = this;
    util.checkNet({
      success : function() {
         util.succNetCon(self);
         

        //是否清空已有数据
        if(isclear) {
          util.loadding(self);
          self.setData({'is_over' : 0,'no_data' : 0,'pullDown' : 0});
          self.page = 1;
          self.setData({'orders' : false});
          self.getData();
        } else {
          //加载数据完毕后，重载新数据
          if(self.page == 1) {
            self.setData({'is_over' : 0,'no_data' : 0,'pullDown' : 0});
            self.getData(1);
          }
        }

        self.order_id = undefined;
         
      },
      error : function() {
        util.notNetCon(self,0);
      }
    });
  },  
  
})
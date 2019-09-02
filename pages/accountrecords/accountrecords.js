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
      "orders" : false,
    "pageName": "账户记录",
    "nothing_text": "您还没有账户记录",


    // text:"这是一个页面"
  },
  onLoad:function(options) {
    this.is_onload = 1;
    app.setRecommender(options);
    this.options = options;

   
    this.getConfig();
    app.checkNavbar(this);

    if (this.all_status == undefined)
    {
      this.setData({ "all_status": 0 });
    }
    

    var self = this;
      util.checkNet({
        success : function() {
        util.succNetCon(self);
      
        var orders = self.getData();//token,this.offset,this.size
      },
      error : function() {
        util.notNetCon(self);
      }
    });

    
  },

  handleChange: function (e) {
    var self = this;

    self.setData({ "all_status": e.detail.key, pullDown: 0 });

    util.checkNet({
      success: function () {
        util.succNetCon(self);
        util.loadding(self, 1);
        self.setData({
          'scroll_items': false,
          'is_over': 0,
          'no_data': 0,
          'pullUpLoad': 0
        });
        self.order_status = e.detail.key;
        self.page = 1;
        self.getData();
      },
      error: function () {
        util.notNetCon(self, 0);
      }
    });
    //util.loaded(this);
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
      //this.refresh(1);
      // 页面初始化 options为页面跳转所带来的参数
      
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
    
    var offset = (this.page - 1);
    var order_status = this.order_status;
    var size = this.size;
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getaccountrecords?";




    url += "session=";
    url += app.globalData.session

    url += "&&status=";
    url += this.data.all_status



    var data = {
      "offset": offset,
      "size": size,

    };


    var self = this;
    util.ajax({
      url: url,
      data: data,
      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {

          var record_list = data.lists;

          var records = record_list.map(function (record) {
            record.createtime = util.formatTimeWithNyr(record.createtime);


            if (record.type == 1)
            {
              if (record.status == 0) {
                record.balance = "结算中"
              }
              else if (record.status == 2) {
                record.balance = record.extra
              }
              record.money = "+ " + record.money 

              record.monyeclass = "moneyadd"
              record.title = "消费返利"
            }

            else if (record.type == 2) {

              if (record.status == 0) {
                record.balance = "待结算"
              }
              else if (record.status == 2)
              {
                record.balance = record.extra
              }
              record.money = "+ " + record.money

              record.monyeclass = "moneyadd"

              record.title = "推广收入"
            }
            else
            {
              record.money = "- " + record.money 

              record.monyeclass = "moneyremove"

              record.title = "用户提现"
            }



            record.publicstr = "";




            return record;
          });

          var allData = '';
          var agoData = isclear ? false : self.data.scroll_items;

          if (records.length != 0) {


            if (agoData) {
              allData = agoData;
              records.map(function (record) {
                allData.push(record);
              });
            } else {
              allData = records;
            }

            self.setData({
              "scroll_items": allData
            });


            if (records.length < self.size) {
              self.setData({
                "is_over": 1,
     
              });
            }
            

          } else {
            if (!agoData) {

              self.setData({
                scroll_items: []

              });
              self.setData({
                "is_over": 1,
                "no_data": 1
              });
            }
            else {
              self.setData({
                scroll_items: agoData

              });
              self.setData({
                "is_over": 1,

              });
            }
          }
        } else {
          self.error(data);
          return false;
        }
      }
    });
                
  },
  getAccoundRecords: function (isclear = 0) {
   

      var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getaccoundrecord?";
    
    


    url += "session=";
    url += app.globalData.session

    url += "&&status=";
    url += this.data.all_status

    var self = this;
    util.ajax({
      url: url,
      
      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {

          var record_list = data.lists;

          var records = record_list.map(function (record) {
            record.modifytime = util.formatDate(record.modifytime);
            
            

            
            record.publicstr = "";
            



            return record;
          });

          var allData = '';
          

          if (records.length != 0) {

            
            allData = records;
            
            self.setData({
              "records": allData
            });


            
            if (records.length < self.size) {
              self.setData({
                "is_over": 1,

              });
            }

          } else {
            if (self.data.scroll_items == false || isclear) self.setData({ scroll_items: [] });
            self.setData({
              "is_over": 1,
              "no_record": 1
            });
          }
        } else {
          self.error(data);
          return false;
        }
      }
    });
  },

  getGoods: function (isclear = 0) {
    


    var offset = (this.page - 1) * this.size;

    var size = this.size;


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getgoodscollect?";

    url += "session=";
    url += app.globalData.session

    var self = this;
    util.ajax({
      url: url,
     
      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {

          var orders = data.lists;

          var allData = '';
          var agoData = isclear ? false : self.data.scroll_items;

          orders = orders.map(function(order){
            order.cover = order.image.imageurl
            return order
          })

          if (orders.length != 0) {

            if (agoData) {
              allData = agoData;
              orders.map(function (order) {
                
                allData.push(order);
              });
            } else {
              allData = orders;
            }
            self.setData({
              "scroll_items": allData
            });


            if (orders.length < self.size) {
              self.setData({
                "is_over": 1,
   
              });
            }

          } else {
            
            self.setData({ scroll_items: [] });
            self.setData({
              "is_over": 1,
              "no_data": 1
            });
          }
        } else {
          self.error(data);
          return false;
        }
      }
    });
  },


  getShops: function (isclear = 0) {
    


    var offset = (this.page - 1) * this.size;

    var size = this.size;


    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getshopcollect?";

    url += "session=";
    url += app.globalData.session

    var self = this;
    util.ajax({
      url: url,
    
      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {

          var orders = data.lists;

          var allData = '';
          var agoData = isclear ? false : self.data.scroll_items;

          if (orders.length != 0) {

            if (agoData) {
              allData = agoData;
              orders.map(function (order) {
                allData.push(order);
              });
            } else {
              allData = orders;
            }
            self.setData({
              "scroll_items": allData
            });


            if (orders.length < self.size) {
              self.setData({
                "is_over": 1,
                "no_data": 1
              });
            }

          } else {
            if (self.data.scroll_items == false || isclear) self.setData({ scroll_items: [] });
            self.setData({
              "is_over": 1,
              "no_data": 1
            });
          }
        } else {
          self.error(data);
          return false;
        }
      }
    });
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  statusChange:function(e){
     var self = this;

     self.setData({ "all_status": e.currentTarget.dataset.all_status,pullDown: 0});
     
     util.checkNet({
      success : function() {
        util.succNetCon(self);
        util.loadding(self,1);
        self.setData({
          'orders' : [],
          'is_over' : 0,
          'no_data' : 0,
          'pullUpLoad' : 0
        });
        
        self.page = 1;
        self.getData();      
      },
      error : function() {
        util.notNetCon(self,0);
      }
    });
    
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
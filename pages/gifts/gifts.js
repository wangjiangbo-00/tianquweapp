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
    "pageName": "礼物箱",
    needhome: true,
    "nothing_text": "您还没有礼物记录",
    
    // text:"这是一个页面"
  },
  onLoad:function(options) {
    this.is_onload = 1;
    app.setRecommender(options);
    this.options = options;
    app.checkNavbar(this);
   
    this.getConfig();


    var all_status = options.all_status == undefined ? 1 : options.all_status

    if (all_status == 1)
    {
      
      wx.setNavigationBarTitle({
        title: '收到的礼物',
      })
    }
    else if (all_status == 2)
    {
      wx.setNavigationBarTitle({
        title: '送出的礼物',
      })
    }
    this.setData({ "all_status": all_status });


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
    if(this.data.is_over == 1) return false;


    var offset = (this.page - 1) * this.size;
    var order_status = this.order_status;
    var size = this.size;
    

    var url = this.baseApiUrl;
    

    var bsend = true;

    if (this.data.all_status == undefined)
    {
      url += "/ziyoutechan/customer/getsendgiftorders?";
    }
    else
    {
      var status = parseInt(this.data.all_status );
      if (status == 1)
      {
        url += "/ziyoutechan/customer/getreceivegiftorders?";
        bsend = false;
      }
      else
      {
        url += "/ziyoutechan/customer/getsendgiftorders?";
        bsend = true;
      }
    }
    url += "session=";
    url += app.globalData.session

    var data = {
      "offset" : offset,
      "size" : size,
      
    };
    
    var self = this;
     util.ajax({
        url : url,
        data : data,
        method : "GET",
        success : function(data){
            self.loaded();
            if (data.returncode == 0) {
              
              var order_list = data.lists; 
              var order_status = util.config('order_status');
              var orders =  order_list.map(function (order) {
                order.pay_time = util.formatTime(order.paytime );
                order.order_time = util.formatTime(order.createtime );
                order.order_status_lang = order_status[order.orderStatus];
                

                if(bsend)
                {
          
                  if ( order.givenstatus == 0) {
                    order.order_status_lang = order_status[11];
                  }

                  else if ( order.givenstatus == 1) {
                    order.order_status_lang = order_status[12];
                  }
                }
                else
                {
                  
                }

                order.shipfeedesp = "免运费"

                if (order.ordertype == 1) {
                  if (order.preshippfee > 0) {
                    order.shipfeedesp = "预付运费" + order.preshippfee + "元"
                  }
                } else {
                  if (order.shipping_money > 0) {
                    order.shipfeedesp = "运费" + order.shipping_money + "元"
                  }
                }
                
                    return order;
                });

              var allData = '';
              var agoData = isclear ? false : self.data.scroll_items;
              
              if(orders.length != 0) {
                  
                 if(agoData) {
                      allData = agoData;
                      orders.map(function(order) {
                        allData.push(order);
                      });
                 } else {
                   allData = orders;
                 }
                self.setData({
                  "scroll_items" : allData
                });

                
                if(orders.length < self.size) {
                  self.setData({
                    "is_over" : 1,
    
                  });
                }
                
              }  else {
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

  orderAction: function (e) {
    var order_id = e.detail.order_id;
    var index = e.detail.index;
    var action = parseInt(e.detail.action);

    switch (action) {
      case 1: //继续支付
        this.orderPay(order_id, index)
        break;
      case 2://删除订单
        this.orderCancel(order_id, index)
        break;

      case 3://赠送礼物
        this.toGift(order_id, index)
        break;
      case 4://修改地址

        break;
      case 5://确认收货
        this.orderReceive(order_id, index)
        break;
      case 6://查看物流
        this.expressShow(order_id, index)
        break;
      case 7://申请退款
        this.orderRefundApply(order_id, index);
        break;
      case 8://添加评论
        this.addArticle(order_id, index);
        break;
      case 9://退款详情
        this.refundDetails(order_id, index);
        break;
      case 10://重新购买
        this.orderRebuy(order_id, index);
        break;
      case 11://团购详情
        this.orderGroup(order_id, index);
        break;
      case 12://

        break;
      default:
        break
    }
  }
  ,
  orderPay: function (order_id, index) {
    if (this.data.btn_order_done) return true;
    this.setData({
      "btn_order_done": true
    });
    this.order_id = order_id;
    this.session = app.globalData.session;
    util.wxpay(this);
    this.order_id = false;
  },
  orderCancel: function (order_id, index) {
    this.order_id = order_id;

    var self = this;


    wx.showModal({
      title: '取消订单',
      content: '取消订单后，订单将彻底删除，请确认',
      success: function (res) {
        if (res.confirm) {
          self.modalConfirm();
        }
      }
    })



  },

  toGift: function (order_id, index) {

    var order = this.data.scroll_items[index];
    var url = "../sendgift/sendgift";

    order.isdetails = false;

    wx.setStorageSync("giftorder", order)
    wx.navigateTo({
      url: url,
    })

  },
  orderReceive: function (order_id, index) {

    this.order_id = order_id;

    var self = this;
    wx.showModal({
      title: '确定“确认收货”吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          self.orderReceiveFun();
        } else if (res.cancel) { }
      }
    })
  },


  expressShow: function (order_id, index) {


    var order_id = e.currentTarget.dataset.order_id;

    this.setData({ "expressOpen": 1, 'express': { loading: true } });
    var order_id = e.currentTarget.dataset.order_id;

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getexpressinfo?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += order_id
    var self = this;
    util.ajax({
      "url": url,
      "method": "GET",
      "data": [],
      "success": function (data) {
        if (data.returncode == 0) {


          var expressdata = data.message;

          self.setData({
            'express': { loading: false },
            "shipping_info": expressdata
          });


        } else {
          self.setData({
            'express': {
              "loading": false, "error": 1, "info": util.config('error_text')[8]
            }
          });
        }
      }
    });
  },

  orderRefundApply: function (order_id, index) {



    var order = this.data.scroll_items[index];

    var self = this;

    if (!order.canrefund) {
      wx.showModal({
        title: '超出申请时限',
        content: '退货需在签收或者自动签收72个小时内提出申请，',

        success: function (res) {
          if (res.confirm) {

          } else if (res.cancel) { }
        }
      })
    }
    else {
      var url = "../refundapply/refundapply?orderid=";
      url += order.id
      url += "&&isadd=1"



      wx.navigateTo({
        url: url,
      })

    }

  },

  refundDetails: function (order_id, index) {

    var order = this.data.scroll_items[index];

    var self = this;

    var url = "../refundprocess/refundprocess?orderid=";
    url += order.id

    wx.navigateTo({
      url: url,
    })



  },
  orderRebuy: function (order_id, index) {

    var index = index;

    var order = this.data.scroll_items[index];

    var goodsid = order.goodId;

    var url = "../goods/goods?goods_id=";
    url += goodsid;
    wx.navigateTo({
      url: url,
    })

  },


  addArticle: function (order_id, index) {

    var order = this.data.scroll_items[index];

    var goodsid = order.goodId;

    var url = "../articleedit/articleedit?goodsid=" + goodsid;

    wx.navigateTo({
      url: url,
    })
  },
  orderGroup: function (order_id, index) {

    var order = this.data.scroll_items[index];
    var url = "../group/group?id=" + order.groupOrderId + "&order_id=" + order.id;

    wx.navigateTo({
      url: url,
    })
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
        self.order_status = e.currentTarget.dataset.all_status == '3' ? undefined : e.currentTarget.dataset.all_status;
        self.page = 1;
        self.getData();      
      },
      error : function() {
        util.notNetCon(self,0);
      }
    });
    //util.loaded(this);
  },
  orderPay:function(e) {
    if(this.data.btn_order_done) return true;
    this.setData({
      "btn_order_done" : true
    });
    this.order_id = e.currentTarget.dataset.order_id;
    this.session = app.globalData.session;
    util.wxpay(this);
    this.order_id = false;
  },

  orderRebuy: function (e) {
    
    var goodid = e.currentTarget.dataset.good_id;
    
    var url = "../goods/goods?goods_id=";
    url += goodid;
    wx.navigateTo({
      url: url,
    })
    
  },

  orderGroup: function (e) {
    if (this.data.btn_order_done) return true;
    this.setData({
      "btn_order_done": true
    });
    this.order_id = e.currentTarget.dataset.order_id;
    this.session = app.globalData.session;
    util.wxpay(this);
    this.order_id = false;
  },
  //取消訂單
  orderCancel:function(e) {
    this.order_id = e.currentTarget.dataset.order_id;
    
    var self = this;
    // this.setData({
    //   'modalHidden' : false,
    //   'titleModel' : '确定“取消订单”吗？'
    // });

    wx.showModal({
      title: '取消订单后，订单将彻底删除，确定“取消订单”吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
           self.modalConfirm();
        } 
      }
    })



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
  modalConfirm:function(e) {
    util.loadding(this,1);
    
    var self = this;
    if(this.order_id == undefined) {
       return false;
    }

   
    var token = this.token;
    var url = this.baseApiUrl ;   
    
    url += "/ziyoutechan/customer/cancelorder?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += this.order_id
    
    util.ajax({
        "url" :  url,
        "method" :　"GET",
        
        "success" : function(data) {
            util.loaded(self);
            if (data.returncode == 0) {
              self.setData({page : {"load" : 1,"operate" : 0}});
              util.toast(self,'订单取消成功');
              self.refresh();
            } else {
               self.error(data);
            }  
        }
      });
    this.order_id = undefined;
  },
  modalCancel:function(e) {
     this.setData({
      'modalHidden' : true
    });
    this.order_id = undefined;
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
  
  close_express: function () {
     this.setData( {
        'expressOpen' : 0,
        'shipping_info' : {},
        'express' : {"loading" : false}
     });
  }   
  ,
  expressShow : function(e) {
    var order_id = e.currentTarget.dataset.order_id;
    
    this.setData({"expressOpen" : 1,'express' : {loading : true}});
    var token = this.token;
    var url = this.baseApiUrl + "?g=Api&m=Project&a=express&order_id=" +　order_id;   
    var self = this;
    util.ajax({
      "url" :  url,
      "method" :　"GET",
      "data" : [],
      "success" : function(data) {
        if(data['result'] == "ok") {
          self.setData({
            'express' : {loading : false},
            "shipping_info" : data.shipping
          });
          } else {
            self.setData({
              'express': {
                "loading": false, "error": 1, "info": util.config('error_text')[8]
              }
            });    
          }  
         }
       });
  },
  orderReceive : function(e) {

      this.order_id = e.currentTarget.dataset.order_id;

      var self = this;
      wx.showModal({
        title: '确定“确认收货”吗？',
        content: '',
        success: function(res) {
          if (res.confirm) {
             self.orderReceiveFun();
          } else if (res.cancel) {}
        }
      })
  },
  orderReceiveFun : function() {
    var order_id = this.order_id;
    var token = this.token;
    var url = this.baseApiUrl + "?g=Api&m=Weuser&a=receivedOrder&token=" + token + "&order_id=" +　order_id;   
    var self = this;
    var data = {
    };
    
    this.loadding();
    util.ajax({
        "url" :  url,
        "method" :　"POST",
        "data" : data,
        "success" : function(data) {
            if(data['result'] == "ok") {
              self.loaded();
              self.refresh();
            } else {
              self.error(data);
            }  
        }
      });
  }
})
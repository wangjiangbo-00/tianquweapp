var util = require('../../utils/util.js')

const app = getApp()

import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';

import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';
Page({
  data: {
    "order": [],
    "URL": 　3,
    "modalHidden": true,
    needhome: true,
    "pageName": "订单详情"
  },
  onLoad: function (options) {
    this.is_onload = 1;
    this.loadding();
    this.orderid = options.id;
    app.setRecommender(options);
    
    var self = this;

    app.checkNavbar(this);

    this.getConfig();

    if (this.id == undefined) {
      this.error({ result: 'fail', error_info: '该订单不存在,请刷新该订单!' });
      util.notNetCon(self, 1, 1);
      return false;
    }

    util.checkNet({
      success: function () {
        util.succNetCon(self);
        var orders = self.getData();//token,this.offset,this.size
      },
      error: function () {
        util.notNetCon(self, 1);
      }
    });
    // 页面初始化 options为页面跳转所带来的参数
  },
  //配置方法
  getConfig: function () {
    var token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl();
    this.size = util.config('page_size');
    this.offset = util.config('page_offset');
    this.token = token;
    this.page = 1;
    this.order_status = util.config('order_status');
    this.refundprocess_status = util.config('refundprocess_status');
  },
  loadding: function () {
    util.loadding(this);
  },
  loaded: function () {
    util.loaded(this);
  },
  getData: function () {
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
          order.order_status_lang = self.order_status[order.orderStatus];

          if (order.orderStatus == 4)
          {
            var finishreason = order.finishreason;

            if (finishreason == 1)
            {
              order.order_status_lang = self.order_status[9];
            }
            else if (finishreason == 2)
            {
              order.order_status_lang = self.order_status[13];
            }
          }
          else if (order.orderStatus == 6)
          {
            var refundprocess = order.refundProcessStatus;
            order.order_status_lang = "商品售后(" + self.refundprocess_status[refundprocess] + ")";
          }

          order.orderGoods.introduction = order.orderGoods.goodtitle
          order.orderGoods.cover = order.orderGoods.goodposter
          order.orderGoods.group_number = order.orderGoods.group_number
          order.orderGoods.group_price = order.orderGoods.goods_price
          order.orderGoods.id = order.orderGoods.goodId
          order.shipfeedesp = "免运费"

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

          if (order.orderExtra)
          {
            if (order.fixaddr == 2) {
              order.fixaddrStr = "(修改成功)"
            }
            else if (order.fixaddr == 1) {
              order.fixaddrStr = "(已申请修改)"
            }
            else {
              order.fixaddrStr = "";
            }

            order.orderExtra.givertime = util.formatTimeWithNyr(order.orderExtra.givertime);
          }

          

          if (order.orderStatus == '0' || order.orderStatus == '1' || order.orderStatus == '2') {
            order.state_class = "state_1";
          } else if (order.orderStatus == '3') {
            order.state_class = "state_2";
          } else if (order.orderStatus == '4') {
            order.state_class = "state_3";
          }
          if (order.orderStatus == 3 || (order.orderStatus == 4 && order.finishreason == 0) ) {

            
            //todo

            var sign_time = util.getTime(order.sign_time);

            
            var spantime = (new Date().getTime() - sign_time) / 1000;
            order.refundcss = "";
            if (spantime < 3600 * 24 * 8) {
              order.canrefund = true;
              order.refundcss = "state_btn_3";
            }


          }

          if (order.orderStatus == 3) {
            var userInfo = app.globalData.userInfo;
            if (userInfo != null) {
              if (userInfo.isrecommender) {
                order.cancomment = 1
              }

            }

          }
          self.setData({ "order": order });

          var userInfo = app.globalData.userInfo;
          if (userInfo != null) {
            self.setData({
              userInfo: userInfo
            })

          }
        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
          return false;
        }
      }
    });
  },



  orderAction: function (e) {
    var order_id = e.currentTarget.dataset.order_id;
    var index = e.detail.index;
    var action = parseInt(e.currentTarget.dataset.action);

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
        this.commentshow(order_id, index);
        break;

      case 13://
        this.tryrefund(order_id, index);
        break;

      case 14://
        this.fixaddr(order_id, index);
        break;

      

      case 15://
        this.orderRefunds(order_id, index);
        break;


      case 16://
        this.orderCheckPay(order_id, index);
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
  },

  commentshow: function (order_id, index) {

    var order = this.data.order;

    var articleid = order.orderExtra.articleid;
    var url = "../articleshow/articleshow?id=" + articleid;
    url += "&&previewdraft=0"
    url += "&&viewmode="
    url += 0
    wx.navigateTo({
      url: url,
    })
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

  tryrefund: function (order_id, index) {
    this.order_id = order_id;

    var self = this;


    wx.showModal({
      title: '申请退款',
      content: '申请退款后，请注意联系卖家，如存在运费等问题，请与卖家协商解决。',
      success: function (res) {
        if (res.confirm) {
          var token = self.token;
          var url = self.baseApiUrl;

          url += "/ziyoutechan/customer/addrefundflag?";

          url += "session=";
          url += app.globalData.session

          url += "&&orderid=";
          url += self.order_id


          util.loadding(self, 1);
          util.ajax({
            "url": url,
            "method": "GET",

            "success": function (data) {
              if (data.returncode == 0) {
                util.toast(self, '申请成功');
                self.loaded();
                self.refresh();
              } else {
                self.error(data);
              }
            }
          });
        }
      }
    })



  },

  fixaddr: function (order_id, index) {


    this.order_id = order_id;
    var self = this;

    var order = this.data.order;

    if (order.isselflift == 1)
    {
      Toast("自己取货不需要修改地址喽")

    }
    else
    {
      wx.showModal({
        title: '修改收货地址',
        content: '提交申请后，请及时联系卖家提供新发货地址，产生费用或其他问题需与卖家协商解决',
        success: function (res) {
          if (res.confirm) {
            var token = self.token;
            var url = self.baseApiUrl;

            url += "/ziyoutechan/customer/fixorderaddr?";

            url += "session=";
            url += app.globalData.session

            url += "&&orderid=";
            url += self.order_id


            util.loadding(self, 1);
            util.ajax({
              "url": url,
              "method": "GET",

              "success": function (data) {
                if (data.returncode == 0) {
                  util.toast(self, '申请成功');
                  self.loaded();
                  self.refresh();
                } else {
                  self.error(data);
                }
              }
            });
          }
        }
      })
    }
    



  },


  orderCheckPay: function (order_id, index) {


    this.order_id = order_id;
    var self = this;
    var token = self.token;
    var url = self.baseApiUrl;

    url += "/ziyoutechan/customer/checkorderpay?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += self.order_id


    util.loadding(self, 1);
    util.ajax({
      "url": url,
      "method": "GET",

      "success": function (data) {
        if (data.returncode == 0) {
          util.toast(self, '查询完成:' + data.extramsg);
          self.loaded();
          self.refresh();
        } else {
          self.error(data);
        }
      }
    });



  },

  toGift: function (order_id, index) {

    var order = this.data.order;
    var url = "../sendgift/sendgift";
    order.isdetails = true;

    wx.setStorageSync("giftorder", order)
    wx.navigateTo({
      url: url,
    })

  },


  orderRefunds: function (order_id, index) {

    var order = this.data.order;
    var url = "../orderrefunds/orderrefunds?orderid=" + order_id;
    


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

    var order = this.data.order;


    if (order.isselflift == 1) {
      Toast("自取模式没有物流信息")

    }
    else {

    this.setData({ "expressOpen": 1, 'express': { loading: true } });

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
    }
  },

  orderRefundApply: function (order_id, index) {

    var order = this.data.order;

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


      var order = this.data.order;

      wx.setStorageSync("orderrefund", order)

      wx.navigateTo({
        url: url,
      })

    }

  },

  refundDetails: function (order_id, index) {

    var order = this.data.order;

    wx.setStorageSync("orderrefund", order)

    var url = "../refundprocess/refundprocess?id=";
    url += order.id

    wx.navigateTo({
      url: url,
    })



  },
  orderRebuy: function (order_id, index) {

    var index = index;

    var order = this.data.order;

    var goodsid = order.orderGoods.id;

    var url = "../goods/goods?goods_id=";
    url += goodsid;
    wx.navigateTo({
      url: url,
    })

  },


  addArticle: function (order_id, index) {

    var order = this.data.order;

    var goodsid = order.goodId;

    var url = "../articleedit/articleedit?goodsid=" + goodsid;

    wx.navigateTo({
      url: url,
    })
  },
  orderGroup: function (order_id, index) {

    var order = this.data.order;
    if (order.groupbuy == 1)
    {
      var url = "../group/group?id=" + order.groupOrderId + "&order_id=" + order.id;
    }
    else{
      var url =  '../goodsgroup/goodsgroup?id=' + order.groupOrderId + "&&goods_id=" + order.orderGoods.goodid
    }
    wx.navigateTo({
      url: url,
    })
  },
  modalConfirm: function (e) {
    var self = this;
    if (this.order_id == undefined) {
      return false;
    }
    var token = this.token;
    var url = this.baseApiUrl;

    url += "/ziyoutechan/customer/cancelorder?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += this.order_id


    util.loadding(self, 1);
    util.ajax({
      "url": url,
      "method": 　"GET",

      "success": function (data) {
        if (data.returncode == 0) {
          util.toast(self, '订单取消成功');
          self.loaded();
          wx.switchTab({
            url: '../orders/orders',
          })
        } else {
          self.error(data);
        }
      }
    });
    this.order_id = undefined;
  },
  modalCancel: function (e) {
    this.setData({
      'modalHidden': true
    });
    this.order_id = undefined;
  },
  makecall: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.order.orderShop.shopcontact,
    })

  },
  refresh: function (e) {
    var self = this;
    util.checkNet({
      success: function () {
        util.succNetCon(self);
        var orders = self.getData();//token,this.offset,this.size
      },
      error: function () {
        util.notNetCon(self, 0);
      }
    });
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
    this.getData();
    wx.stopPullDownRefresh();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    if (!this.is_onload) {
      var orders = this.getData();
    } else {
      this.is_onload = 0;
    }
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭

    wx.removeStorageSync("orderrefund")

     
  },
  error: function (data) {
    this.loaded();
    if (data['result'] == 'fail') {
      util.toast(this, data.error_info);
    }
  },
  
  close_express: function () {
    this.setData({
      'expressOpen': 0,
      'shipping_info': {},
      'express': { "loading": false }
    });
  }
  ,

  orderReceiveFun: function () {
    var order_id = this.order_id;
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/conformReceive?";

    url += "session=";
    url += app.globalData.session

    url += "&&orderid=";
    url += order_id
    var self = this;
    var data = {
    };

    this.loadding();
    util.ajax({
      "url": url,
      "method": 　"POST",
      "data": data,
      "success": function (data) {
        if (data.returncode == 0) {
          self.loaded();
          self.refresh();
        } else {
          self.error(data);
        }
      }
    });
  }
})
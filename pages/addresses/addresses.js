var util = require('../../utils/util.js')
import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';

import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';
const app = getApp()
Page({
  data: {
    "address_list": [],
    loaded: false,
    "pageName": "收货地址",
    "nothing_text": "您还没有添加收货地址",

  },
  onLoad: function(options) {

    this.is_onload = 1;
    app.setRecommender(options);
    app.checkNavbar(this);
    this.sell_type = options.sell_type;

    this.goods_id = options.goods_id;

    this.address_id = options.address_id;

    this.shiptype = options.shiptype ? options.shiptype : 0;

    

    var goods = wx.getStorageSync("goodsforoder");
    if (goods) {
      var shopid = goods.shop.id;

      var key = "pickuppoint_" + shopid;

      var pickuppoint = wx.getStorageSync(key);

      if (pickuppoint) {
        this.setData({
          pickuppoint: pickuppoint
        })
      }

    }
    this.setData({
      goods: goods,
    });



    var data = {};

    if (this.sell_type && this.sell_type != undefined) {
      data.from_order = true;
      data.sell_type = this.sell_type;

      var goods = wx.getStorageSync("goodsforoder");
      this.setData({
        goods: goods,
      });
    } else {
      data.from_order = false; 
    }

    

    if (this.address_id && this.address_id != undefined) {
      data.address_id = this.address_id;
    }

    if (this.shiptype && this.shiptype != undefined) {
      data.shiptype = this.shiptype;
    }

    this.setData(data);
    this.token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl();
    this.addressList();
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function() {
    wx.hideNavigationBarLoading();
    // 页面渲染完成
  },
  onShow: function() {
    if (!this.is_onload) {
      this.refresh();
    } else {
      this.is_onload = 0;
    }
    // 页面显示
  },
  refresh: function() {
    util.loadding(this, 1);
    this.addressList();
  },

  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  onOpenSettingClose: function() {
    this.setData({
      "openSettingshow": 0
    })
  },

  bindOpenSetting: function(res) {
    var self = this;
    if (!res.detail.authSetting['scope.address']) {
      Toast('授权失败');
    } else {
      Toast('授权成功,请继续添加');
    }


  },
  //监听用户下拉动作
  onPullDownRefresh: function() {
    this.refresh();
    wx.stopPullDownRefresh();
  },
  loadding: function() {
    util.loadding(this);
  },
  loaded: function() {
    util.loaded(this);
  },
  selectedDEFAULT: function(obj) {
    util.loadding(this, 1);
    var self = this;
    var index = obj.currentTarget.dataset.index;
    var data = this.data.address_list;

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/setaddrdefault?";

    url += "session=";
    url += app.globalData.session


    url += "&&address_id=";
    url += data[index].id
    util.ajax({
      "url": url,
      "method": 　 "get",

      "success": function(res) {
        util.loaded(self);
        if (res.returncode == 0) {

          for (var i = 0; i < data.length; i++) {
            data[i].isdefault = (i == index ? 1 : 0);
          }
          self.setData({
            address_list: data
          });
        }
      }
    });
  },

  getWechatAddress: function(a) {
    var self = this;
    wx.chooseAddress({
      success: function(t) {
        if ("chooseAddress:ok" == t.errMsg) {

          var data = {

            "uid": 0,
            "consigner": t.userName,
            "mobile": t.telNumber,
            "province": 0,
            "city": 0,
            "district": 0,
            "address": t.detailInfo,
            "zip_code": "",
            "isdefault": 0,
            "provincename": t.provinceName,
            "cityname": t.cityName,
            "districtname": t.countyName,
          };

          var addresses = self.data.address_list;
          var bduplicate = false;
          if (addresses && addresses.length > 0) {

            for (var i = 0; i < addresses.length; i++) {
              if (t.detailInfo == addresses[i].address) {
                bduplicate = true;
                break;
              }

            }
          }

          if (bduplicate) {
            wx.showModal({
              title: '地址重复',
              content: '您选择的新地址已经存在',
            })

          } else {


            var provinceName = t.provinceName;
            var cityName = t.cityName;
            var countyName = t.countyName;

            var url = self.baseApiUrl;
            url += "/ziyoutechan/customer/transweixinaddr?";

            url += "session=";
            url += app.globalData.session

            util.ajax({
              "url": url,
              "method": "get",
              data: data,
              "success": function(data) {
                if (data.returncode == 0) {
                  self.addressList();
                } else if (data.returncode == 1010) {
                  wx.showModal({
                    title: '获取地址失败',
                    content: '微信地址尚未被系统收录，点击确认后重试',
                    success: function(res) {
                      if (res.confirm) {
                        wx.redirectTo({
                          url: '../addresses/addresses',
                        })
                      }
                    }
                  })
                }

              }

            });
          }

        } else {
          wx.showModal({
            title: '授权失败',
            content: '获取您的地址授权失败,一些功能使用将受到限制',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {

              }
            }
          })
        }

      },
      fail: function(err) {
        console.log("chooseAddress err = " + err.errMsg)
        if (err.errMsg && err.errMsg.indexOf("auth den") != -1) {

          self.setData({
            "openSettingshow": 1
          })
        }
      }
    });
  },
  //修改地址页面
  edit: function(e) {
    var address_id = e.currentTarget.dataset.address_id;
    wx.navigateTo({
      "url": "../address/address?address_id=" + address_id + "&goods_id=" + this.goods_id + "&sell_type=" + this.sell_type,
    });
  },

  select: function(e) {
    var address_id = e.currentTarget.dataset.id;
    var address_list = this.data.address_list;


    for (var i = 0; i < address_list.length; i++) {
      if (address_list[i].id == address_id) {
        let pages = getCurrentPages(); //当前页面
        let prevPage = pages[pages.length - 2]; //上一页面
        prevPage.setData({ //直接给上移页面赋值
          address: address_list[i],
          address_id: address_id,
          shiptype:0
        });

        prevPage.caculateExpressFee();

        wx.navigateBack({ //返回
          delta: 1
        })
      }
    }
  },
  chooseselfleft: function(e) {

    let pages = getCurrentPages(); //当前页面
    let prevPage = pages[pages.length - 2]; //上一页面
    prevPage.setData({ //直接给上移页面赋值
      shiptype: 1
    });


    prevPage.caculateExpressFee();

    wx.navigateBack({ //返回
      delta: 1
    })

  },
  addressList: function() {
    {


      var self = this;

      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getshipaddrs?";

      url += "session=";
      url += app.globalData.session



      util.ajax({
        "url": url,
        "method": 　 "POST",
        "success": function(data) {
          util.loaded(self);
          if (data.returncode == 0) {



            var address_list = data.lists;

            if (address_list && address_list.length > 0) {
              address_list.map(function(address) {
                address.select = false;
                if (self.address_id != undefined) {
                  if (address.id == self.address_id) {
                    address.select = true;
                  }
                }

              });



              self.setData({
                "address_list": data.lists
              });
            } else {
              self.setData({
                "address_list": false,

              });
              self.setData({
                "is_over": 1,
                "no_data": 1
              });
            }





          }

        }
      });
    }
  },
  deleteAddress: function(a) {
    var self = this;
    var s = a.currentTarget.dataset.id;
    a.currentTarget.dataset.index;
    wx.showModal({
      title: "提示",
      content: "确认删除改收货地址？",
      success: function(a) {
        if (a.confirm) {
          var url = self.baseApiUrl;
          url += "/ziyoutechan/customer/deleteshipaddr?";

          url += "session=";
          url += app.globalData.session

          url += "&&addrid=";
          url += s
          util.ajax({
            "url": url,
            "method": 　 "POST",
            "success": function(data) {
              if (data.returncode == 0) {

                if (self.options.goods_id != undefined && self.options.sell_type != undefined) {
                  wx.setStorageSync('needgetaddr', true);
                }


                self.addressList();

              }

            }
          });
        }



      }
    });
  },
  //错误处理函数
  error: function(data) {
    this.setData({
      page: {
        load: 1
      }
    });
    if (data['result'] == 'fail') {
      util.toast(this, data.error_info);
    }
  },
})
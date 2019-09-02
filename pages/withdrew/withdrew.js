var util = require('../../utils/util.js')


import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';
import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';

var app = getApp();
Page({
  data: {
    // text:"这是一个页面"  
    toast1Hidden: true,
    modalHidden: true,
    modalHidden2: true,
    notice_str: '',
    withdrewvalue:"",
    needclear: false,
    "pageName": "我的提现"

  },
  checkPhone:function (e) {
      //验证手机号必须为11位数字
      console.log(e.detail.value);
  },
  
  toast1Change: function (e) {
    this.setData({ toast1Hidden: true });
  },
  //弹出确认框  
  modalTap: function (e) {
    this.setData({
      modalHidden: false
    })
  },
  confirm_one: function (e) {
    console.log(e);
    this.setData({
      modalHidden: true,
      toast1Hidden: false,
      notice_str: '提交成功'
    });
  },
  cancel_one: function (e) {
    console.log(e);
    this.setData({
      modalHidden: true,
      toast1Hidden: false,
      notice_str: '取消成功'
    });
  },
  //弹出提示框  
  modalTap2: function (e) {
    this.setData({
      modalHidden2: false
    })
  },
  modalChange2: function (e) {
    this.setData({
      modalHidden2: true
    })
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  onLoad: function (options) {

    var account = wx.getStorageSync("account")
    wx.removeStorageSync("account");

    var lastwithdrew = wx.getStorageSync("lastwithdrew")

    if (lastwithdrew)
    {
      
        var spantime = (new Date().getTime() - lastwithdrew) / 1000;

        if (spantime < 3600 * 24) {

          var spantimestr = util.formatTime(spantime)
          this.setData({
            tips: "两次提现之间请间隔24小时",
          
          })
        }
        else
        {
          wx.removeStorageSync("lastwithdrew");
        }
      
    }

    app.setRecommender(options);
    app.checkNavbar(this);
    if (account.money_lock > 0)
    {
      this.setData({
        tips: "请等待上次提现结束"
      })
    }

    this.setData({"account":account});
    // 页面初始化 options为页面跳转所带来的参数  
    this.baseApiUrl = util.baseurl(); 
  },
  onReady: function () {
    // 页面渲染完成  
  },
  onShow: function () {
    // 页面显示  
  },
  onHide: function () {
    // 页面隐藏  
  },
  onUnload: function () {
    // 页面关闭  
  },
  formSubmit: function (e) {
    var that = this;
    var formData = e.detail.value;
    var money = parseFloat(this.data.withdrewvalue) ;

    var availablemoney = this.data.account.money

    if (this.data.account.money_lock>0)
    {
      Toast('请等待上次提现结束');
      return false;
    }

    if (money > availablemoney || money<1)
    {
      
      Toast('金额不符');
      return false;
    }


    var lastwithdrew = wx.getStorageSync("lastwithdrew")

    if (lastwithdrew) {

      var spantime = (new Date().getTime() - lastwithdrew) / 1000;

      if (spantime < 3600 * 24) {

      
        Toast('两次提现请间隔24个小时');

        return false;
      }
      

    }

    var formid = e.detail.formId;
    Dialog.confirm({
      title: '确认提现',
      message: '您确认提现操作吗？',

    }).then(() => {
      var url = that.baseApiUrl;
      url += "/ziyoutechan/customer/withdrew?";
      url += "session=";
      url += app.globalData.session
      url += "&&money=";
      url += money

      url += "&&formid=";
      url += formid
      wx.request({
        url: url,

        success: function (res) {

          wx.setStorageSync("lastwithdrew", new Date().getTime());
          console.log(res.data)

          var returncode = res.data.returncode;
          if (returncode == 0) {

            
            Toast('申请已提交，请耐心等候');

            setTimeout(function(){
              wx.navigateBack({
                
              })
            },2000)


          }

        }
      })
    }).catch(() => {
      // on cancel
    });
    
  },
  formReset: function () {
    console.log('form发生了reset事件');
    this.modalTap2();
  },
  clearinput: function (e) {
    this.setData({
      withdrewvalue: ""
    })
    this.setData({
      tips: ""
    })
  },
  bindKeyInput: function (e) {
    var withdrewvalue = parseFloat(e.detail.value) ;
    this.setData({
      withdrewvalue: e.detail.value
    })

    if (withdrewvalue)
    {
      this.setData({
        needclear: true
      })

      if (withdrewvalue>this.data.account.money)
      {
        this.setData({
          tips: "提现金额大于余额"
        })
      }
      else
      {
        if (withdrewvalue<1)
        {
          this.setData({
            tips: "提现金额小于最低限额"
          })
        }
        else{
          this.setData({
            tips: ""
          })
        }
      }
    }
    else
    {
      this.setData({
        needclear: false
      })

      this.setData({
        tips: ""
      })
    }
  },
}) 
var util = require('../../utils/util.js')
const qiniuUploader = require('../../utils/qiniu/qiniuUploader.js')
const app = getApp()
var wxoss = require('../../utils/txoss/wxoss.js');
import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';
import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';
Page({
  data:{
   
     
    "adTypes": ['只退款','退货退款'],
     "address_name" : [0,1],
     "adTypeIndex" : 0,


    "refundReasons": ['商品变质', '商家发错货', '物流破损严重'],
    
    "refundReasonIndex": 0,

    
    "pageName": "申请退款"
  },
  onLoad: function (options) {
    app.setRecommender(options);
    app.checkNavbar(this);

    var isadd = this.options.isadd != undefined ? parseInt(this.options.isadd) : 1;
    this.setData({
      "isadd": isadd
    })
    if (!isadd) {
      this.setData({
        "pageName": "编辑申请"
      })
    }


    util.loadding(this);

    this.options = options;

    var order = wx.getStorageSync("orderrefund");
    this.setData({ "order": order });

    
    this.setData({ "options": options });
    var self = this;
    this.token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl();

    var data_version = wx.getStorageSync('data_version');
    if (!this.data.isadd) {
      var refundprocess = wx.getStorageSync('refundprocess');



      if (refundprocess != null) {
        this.setData({
          "refundprocess": refundprocess
        })
        this.setData({
          "avatarUrl": refundprocess.applypics,
          "adTypeIndex": refundprocess.applymode,
          "refundReasonIndex": refundprocess.applyreason,
          "refundinfo": refundprocess.applymsg,
        })
      }

    }





  },
  

   
  
  //错误处理函数
  error:function(data) {
    this.setData({page : {load : 1}});
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },
  modalCancel:function(options){
    this.setData({modalHidden : true});
  },
  

  editText: function (e) {

    if (this.data.refundinfo)
    {
      var text = this.data.refundinfo;
    }
    else{
      var text = "";
    }
  
    var url = "../commonedit/commonedit?text=" + text + "&&vname=refundinfo";

    

    wx.navigateTo({
      url: url,
    })
  },


  checkInput: function (formData) {

    if (!formData.money || formData.money < 0 || formData.money > this.data.order.ordermoney )
    {

      Toast("请输入正确退款金额")
      return false;

    }

    if (!formData.mobile ) {

      Toast("请输入联系方式")
      return false;

    }

    if (!this.data.refundinfo)
    {
      Toast("请输入描述信息")
      return false;
    }

    return true
    
  },
 
  
  //添加地址 || 或者修改地址
  listenFormSubmit:function(e){



    
    var that = this;  
    var formData = e.detail.value; 

    if (!this.checkInput(formData))
    {
      return false;
    } 

    var pd = this.data.refundinfo;

    var pics = this.data.avatarUrl;
    var userInfo = app.globalData.userInfo;
    if (pd == undefined) {
      pd = ""
    }


    if ((!this.data.isadd && pics.length > 0 && pics[0].indexOf("weiruikj.cn") != -1) || pics.length == 0)
    {
      var url = that.baseApiUrl;

      
      if (that.data.isadd) {
        url += "/ziyoutechan/customer/refundapply?";
      }
      else {
        url += "/ziyoutechan/customer/editrefundapply?";
      }

      
      var picstr = ""

      if (pics)
      {
         picstr = pics.join(";");
      }
      
      url += "session=";
      url += app.globalData.session;


      var data = {
        orderid: that.options.orderid,
        refundmode: formData.mode,
        reason: formData.reason,
        money: formData.money,
        refundinfo: pd,
        pics: picstr,
        contact: formData.mobile,
      }

      util.ajax({
        "url": url,
        "data": data,
        success: function (data) {
          if (data.returncode == 0) {
            wx.showModal({
              title: '成功',
              content: '',
              success: () => {
                wx.navigateBack({

                })
              }
            })
          }
        }
      })
    }
    else
    {
      var url = this.baseApiUrl;
      url += "/ziyoutechan/system/gettxosskey?";

      util.ajax({
        "url": url,
        "data": {},
        success: function (data) {
          if (data.returncode == 0) {

            if (data.extramsg != undefined) {
              var token = data.extramsg;


              var qnpics = [];
              var qn = 0;

              for (var i = 0; i < pics.length; i++) {

                var filePath = pics[i]
                var Key = "tqxj_img_userrefundapply/" + "u" + userInfo.id + "_" + new Date().getTime() 


                wxoss.postObject(
                  filePath,
                  Key,
                  function () {
                    
                  
                    qnpics.push("https://tqxjbu-1256942653.cos.ap-chengdu.myqcloud.com/" + Key);

                  
                  qn++;

                  if (qn >= pics.length) {
                    //提交消息

                    var qnpicstr = qnpics.join(";");

                    var url = that.baseApiUrl;

                    if (that.data.isadd) {
                      url += "/ziyoutechan/customer/refundapply?";
                    }
                    else {
                      url += "/ziyoutechan/customer/editrefundapply?";
                    }


                    url += "session=";
                    url += app.globalData.session;


                    var data = {
                      orderid: that.options.orderid,
                      refundmode: formData.mode,
                      reason: formData.reason,
                      money: formData.money,
                      refundinfo: pd,
                      pics: qnpicstr,
                      contact: formData.mobile,
                    }

                    util.ajax({
                      "url": url,
                      "data": data,
                      success: function (data) {
                        if (data.returncode == 0) {
                          wx.showModal({
                            title: '成功',
                            content: '',
                            success: () => {
                              wx.navigateBack({

                              })
                            }
                          })
                        }
                      }
                    })



                  }


                }, (error) => {
                  console.error('error: ' + JSON.stringify(error));
                }, null,// 可以使用上述参数，或者使用 null 作为参数占位符
                  (progress) => {
                    
                  }, cancelTask => that.setData({ cancelTask })
                );
              }




            }
          }
        },
        error: function (res) {
          
        }
      });
    }

    

    
  },
   bindHideKeyboard: function(e) {
      wx.hideKeyboard()
  },

  
  cleartext: function (e) {

    var self = this;

    Dialog.confirm({
      title: "操作确认",
      message: "您确定要清空文本框内容吗？"
    }).then(() => {

      self.setData({
        
        "refundinfo": "",
      })
        
      
      // on confirm
    }).catch(() => {
      // on cancel
    });
    
  },
  
  
  
 
  
  
  onReady:function(){
  },
  onShow:function(){
	this.setData({page : {"load" : 1}});
    wx.getSystemInfo( {
      success: ( res ) => {
        this.setData( {
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })

    
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  
  
  
  
  adTypesChange: function(e) {
    var adTypeIndex = e.detail.value; 
    this.setData({
      adTypeIndex: adTypeIndex
    })
  },

  refundReasonChange: function (e) {
    var refundReasonIndex = e.detail.value;
    this.setData({
      refundReasonIndex: refundReasonIndex
    })
  },

  
  bindViewTap: function () {
    var that = this;
    wx.chooseImage({
      // 设置最多可以选择的图片张数，默认9,如果我们设置了多张,那么接收时//就不在是单个变量了,
      count: 3,
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        // 获取成功,将获取到的地址赋值给临时变量
        var tempFilePaths = res.tempFilePaths;
        that.setData({
          //将临时变量赋值给已经在data中定义好的变量
          avatarUrl: tempFilePaths
        })
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  }
})
/**
 * wx-cropper 1.1
 */

const app = getApp()
var util = require('../../utils/util.js')
import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';
import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 之后可以动态替换

    "pageName": "生成分享图",
    canvasshow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.setRecommender(options);
    app.checkNavbar(this);

    this.getConfig();
  


    var refid = options.refid ? parseInt(options.refid) : 0;
    var type = options.type ? parseInt(options.type) : 0;

    var composemsg = wx.getStorageSync("composemsg");

    wx.removeStorageSync("composemsg")

    if (type == 0 || refid == 0 || composemsg == null)
    {
      Toast.fail("参数错误生成失败");
      return;
    }



    this.setData({
      refid: refid,
      type: type,
      composemsg: composemsg
    })

    
    

    var windowWidth = app.globalData.systeminfo.windowWidth
    this.setData({
      width: windowWidth,
      height: windowWidth * 1.6,
      scale: 1.6,
      pixelRatio: app.globalData.systeminfo.pixelRatio
    })


    this.setData({
      canvasshow: true,
      
    })

    var vname = options.vname ? options.vname : "texteditdata";

    this.setData({
      imageSrc: "",
      "vname": vname,


    })


    this.generateImage();

  },

  getConfig: function () {
    var token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl();
    this.size = util.config('page_size');
    this.offset = util.config('page_offset');
    this.token = token;
    this.page = 1;
    this.order_status = util.config('order_status');
  },

  onUserinfoClose: function (e) {
    this.setData({ "userinfoshow": 0 })
  },

  bindGetUserInfo: function (e) {

    app.bindGetUserInfo(e);

  },

  onOpenSettingClose: function () {
    this.setData({ "openSettingshow": 0 })
  },

  bindOpenSetting: function (res) {
    var self = this;
    if (!res.detail.authSetting['scope.writePhotosAlbum']) {
      Toast('授权失败');
    }
    else {
      Toast('授权成功,请继续操作');
    }


  },

  generateImage() {

    var that = this
    var userinfo = app.globalData.userInfo;
    if (!(userinfo != undefined && userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0 )) {

      Toast.fail("用户信息不全，生成失败");
      return;
    }
    else {

      this.downQc_code();
      this.downAvatarUrl(userinfo.headpic );
      this.downShowUrl(this.data.composemsg.composeshowimageurl);
      this.checkdownload();
    }
  },



  //绘制canvas图片









  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    

  },

  /**
   * 选择本地图片
   */
  saveImage: function () {
    var _this = this
    wx.saveImageToPhotosAlbum({
      filePath: this.data.imageSrc,
      success: function (res) {
        wx.showToast({
          title: '保存成功',
        })
      },
      fail: function (err) {
        

        console.log("chooseAddress err = " + err.errMsg)
        if (err.errMsg && err.errMsg.indexOf("auth den") != -1) {

          
          _this.setData({ "openSettingshow": 1 })
        }
        else
        {
          wx.showToast({
            title: '保存失败',
          })
        }

        
      }
    })
  },


  downQc_code: function () {
    var _this = this;

    var userinfo = app.globalData.userInfo;
    var type = this.data.type;

    var bqrgenerate = false;

    var img = "";

    if (type == 1 || type == 3)
    {
      if (userinfo.isrecommender == 1)
      {
        bqrgenerate = true;
      }
      else
      {
        
        img = this.data.composemsg.composeqr;
      }

    }
    else if (type == 2 )
    {
      bqrgenerate = true;
    }
    else if (type == 7)
    {
      if (userinfo.qrpic && userinfo.qrpic.length > 0)
      {
        img = userinfo.qrpic;
      }
      else
      {
        bqrgenerate = true;
      }

    }

    if (!bqrgenerate)
    {
      wx.downloadFile({
        url: img,
        success: function (res) {
          console.log(res.tempFilePath)
          _this.setData({
            qc_code: res.tempFilePath
          })

        }
      })
    }
    else
    {

      if (type == 7)
      {
        _this.getuserqr();
      }
      else
      {
        _this.getuseractivityqr();
      }
      

    }

    
  },


  downShowUrl: function (img) {
    var _this = this;
    wx.downloadFile({
      url: img,
      success: function (res) {
        console.log(res.tempFilePath)
        _this.setData({
          showurl: res.tempFilePath
        })

      }
    })
  },

  downAvatarUrl: function (img) {
    var _this = this;
    wx.downloadFile({
      url: img,
      success: function (res) {
        console.log(res.tempFilePath)
        _this.setData({
          avatarUrl: res.tempFilePath
        })

      }
    })
  },

  checkdownload: function () {
    var self = this;
    wx.showLoading({
      title: '下载资源中...',
    })

    var times = 0;
    var timer = setInterval(function () {
      var avatarUrl = self.data.avatarUrl;
      var qc_code = self.data.qc_code;
      var showurl = self.data.showurl;
      if (avatarUrl != null && qc_code != null && showurl!=null) {

        wx.hideLoading();
        clearInterval(timer);
        self.drawImageMiddleMode();
      }
      else
      {
        times++;
        if (times>20)
        {
          wx.hideLoading();
          clearInterval(timer);
          Dialog.confirm({
            title: "下载失败",
            message: "下载所需资源失败,请检查网络,或尝试重新生成？"
          }).then(() => {

            // on confirm
          }).catch(() => {
            // on cancel
          });
        }

      }
    }, 500)
  },
    //保存

  


  drawImage: function () {
    wx.showLoading({
      title: '绘制图片中...',
    })
    var that = this
    const ctx = wx.createCanvasContext('myCanvas')
    var userinfo = app.globalData.userInfo;
    var bgPath = '/images/cleanbg.png'
    var portraitPath = that.data.avatarUrl;
    var hostNickname = userinfo.nickname
    var qrPath = that.data.qc_code;
    var showurl = that.data.showurl;
    var windowWidth = this.data.width;
    //绘制背景图片
    ctx.drawImage(bgPath, 0, 0, windowWidth, that.data.scale * windowWidth)
    
    //绘制主海报
    
    

    ctx.drawImage(showurl, 0, 0, windowWidth, 0.5 * windowWidth)


    //绘制第一段文本
    ctx.setFillStyle('#000000')

    
    ctx.setFontSize(16)
    ctx.setTextAlign('left')
    ctx.fillText("抽奖奖品：" + this.data.composemsg.composetitle, 10, 0.5 * windowWidth + 36);


    ctx.setFillStyle('#acacac')
    ctx.setFontSize(16)
    ctx.setTextAlign('left')
    ctx.fillText(this.data.composemsg.composeinfo, 10, 0.5 * windowWidth + 64);


   

    var cr = 15;

    var startl = 10

    var starth = 1.25 * windowWidth 
    //绘制头像
    ctx.save()
    ctx.beginPath()
    ctx.arc(cr + startl, starth + cr, cr, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(portraitPath, startl, starth, cr * 2, cr * 2)
    ctx.restore()
    

    ctx.setFillStyle('#000000')
    ctx.setFontSize(16)
    ctx.setTextAlign('left')
    ctx.fillText(hostNickname, startl + cr * 2 + 3, starth + 20)

    
    //绘制左侧文本
    ctx.setFillStyle('#65A7E1')
    //ctx.setFontSize(16)
    ctx.font = "italic normal 16px sans-serif"
    ctx.setTextAlign('left')
    ctx.fillText(this.data.composemsg.composeleftshare1, 10, 1.42 * windowWidth)


    ctx.setFillStyle('#65A7E1')
    //ctx.setFontSize(16)
    ctx.font = "normal normal 16px sans-serif"
    ctx.setTextAlign('left')
    ctx.fillText(this.data.composemsg.composeleftshare2, 10, 1.42 * windowWidth + 21)
 
   
    
      //绘制二维码
    ctx.drawImage(qrPath, 0.55 * windowWidth, 0.95 * windowWidth, 0.40 * windowWidth, 0.40 * windowWidth)


    //绘制右侧文本
    ctx.setFillStyle('#000000')
    ctx.setFontSize(16)
    ctx.font = 'normal bold 16px sans-serif';
    ctx.setTextAlign('left')
    ctx.fillText(this.data.composemsg.composerightshare1, windowWidth - 130, 1.42 * windowWidth)


    ctx.setFillStyle('#000000')
    ctx.setFontSize(16)
  
    ctx.font = 'normal bold 16px sans-serif';
    ctx.setTextAlign('left')
    ctx.fillText(this.data.composemsg.composerightshare2, windowWidth - 130, 1.42 * windowWidth + 21)

    ctx.draw(true, () => {
      // 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    保证了在微信小程序中裁剪的图片模糊  位置不对的问题


      // 生成图片
      var pixelRatio = this.data.pixelRatio;
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: windowWidth ,
        height: windowWidth * that.data.scale,
        destWidth: windowWidth * pixelRatio,
        destHeight: windowWidth * that.data.scale * pixelRatio,
        quality: 1.0,
        canvasId: 'myCanvas',
        success: function (res) {
          

          that.setData({
            imageSrc: res.tempFilePath,
          })
          // 成功获得地址的地方

        },
        complete: function (res) {
          wx.hideLoading()

          
          // 成功获得地址的地方

        },
        fail: function (res) {
          Toast.fail("绘制失败");


          // 成功获得地址的地方

        },

      })
    })
  },


  drawImageMiddleMode: function () {
    wx.showLoading({
      title: '绘制图片中...',
    })
    var that = this
    const ctx = wx.createCanvasContext('myCanvas')
    var userinfo = app.globalData.userInfo;
    var bgPath = '/images/cleanbg.png'
    var portraitPath = that.data.avatarUrl;
    var hostNickname = userinfo.nickname
    var qrPath = that.data.qc_code;
    var showurl = that.data.showurl;
    var windowWidth = this.data.width;
    //绘制背景图片
    ctx.drawImage(bgPath, 0, 0, windowWidth, that.data.scale * windowWidth)

    //绘制主海报



    ctx.drawImage(showurl, 0, 0, windowWidth, 0.5 * windowWidth)


    //绘制第一段文本
    ctx.setFillStyle('#000000')


    ctx.setFontSize(16)
    ctx.setTextAlign('left')
    ctx.fillText( this.data.composemsg.composetitle, 10, 0.5 * windowWidth + 36);


    ctx.setFillStyle('#acacac')
    ctx.setFontSize(16)
    ctx.setTextAlign('left')
    ctx.fillText(this.data.composemsg.composeinfo, 10, 0.5 * windowWidth + 64);




    var cr = 15;

    var startl = 0.5 * windowWidth - 40

    var starth = 0.75 * windowWidth
    //绘制头像
    ctx.save()
    ctx.beginPath()
    ctx.arc(cr + startl, starth + cr, cr, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(portraitPath, startl, starth, cr * 2, cr * 2)
    ctx.restore()


    ctx.setFillStyle('#000000')
    ctx.setFontSize(16)
    ctx.setTextAlign('left')
    ctx.fillText(hostNickname, startl + cr * 2 + 3, starth + 20)


    //绘制左侧文本
    ctx.setFillStyle('#000000')
    //ctx.setFontSize(16)
    ctx.font = "italic normal 16px sans-serif"
    ctx.setTextAlign('left')

    
    ctx.fillText(this.data.composemsg.composeleftshare1, 0.5 * windowWidth - 80, starth + 56)


    //ctx.setFillStyle('#65A7E1')
    //ctx.setFontSize(16)
    //ctx.font = "normal normal 16px sans-serif"
    //ctx.setTextAlign('left')
    //ctx.fillText(this.data.composemsg.composeleftshare2, 10, 1.42 * windowWidth + 21)



    //绘制二维码
    ctx.drawImage(qrPath, 0.3 * windowWidth, 0.98 * windowWidth, 0.40 * windowWidth, 0.40 * windowWidth)


    //绘制右侧文本
    ctx.setFillStyle('#000000')
    ctx.setFontSize(16)
    ctx.font = 'normal bold 16px sans-serif';
    ctx.setTextAlign('left')
    ctx.fillText(this.data.composemsg.composerightshare1, 0.5 * windowWidth -  48, 1.45 * windowWidth)


    ctx.setFillStyle('#000000')
    ctx.setFontSize(16)

    ctx.font = 'normal bold 16px sans-serif';
    ctx.setTextAlign('left')
    ctx.fillText(this.data.composemsg.composerightshare2, 0.5 * windowWidth - 48, 1.45 * windowWidth + 21)

    ctx.draw(true, () => {
      // 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    保证了在微信小程序中裁剪的图片模糊  位置不对的问题


      // 生成图片
      var pixelRatio = this.data.pixelRatio;
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: windowWidth,
        height: windowWidth * that.data.scale,
        destWidth: windowWidth * pixelRatio,
        destHeight: windowWidth * that.data.scale * pixelRatio,
        quality: 1.0,
        canvasId: 'myCanvas',
        success: function (res) {


          that.setData({
            imageSrc: res.tempFilePath,
          })
          // 成功获得地址的地方

        },
        complete: function (res) {
          wx.hideLoading()


          // 成功获得地址的地方

        },
        fail: function (res) {
          Toast.fail("绘制失败");


          // 成功获得地址的地方

        },

      })
    })
  },

  /**
   * 初始化图片信息
   * 获取图片内容，并初始化裁剪框
   */

  getuseractivityqr: function () {

    var self = this;

    var url = self.baseApiUrl;

    url += "/ziyoutechan/customer/getuseractivityqr?";

    url += "session=";
    url += app.globalData.session;

    url += "&&type=";
    url += this.data.type;

    url += "&&refid=";
    url += this.data.refid;



    util.ajax({
      "url": url,
      method: "GET",
      success: function (data) {
        if (data.returncode == 0) {

          var recommendimg = data.message;

          if (recommendimg) {
            wx.downloadFile({
              url: recommendimg.pic,
              success: function (res) {
                console.log(res.tempFilePath)
                self.setData({
                  qc_code: res.tempFilePath
                })

              }
            })
          }
          else {
            Toast.fail("生成分享二维码失败");
          }




        }
        else {
          Toast.fail("生成分享二维码失败");
        }
      }
    })

  },

  getuserqr: function () {

    var self = this;

    var url = self.baseApiUrl;

    url += "/ziyoutechan/customer/getuserqr?";

    url += "session=";
    url += app.globalData.session;

    
    util.ajax({
      "url": url,
      method: "GET",
      success: function (data) {
        if (data.returncode == 0) {

          app.getUserInfo();

          var userinfo = data.message;

          if (userinfo)
          {
            wx.downloadFile({
              url: userinfo.qrpic,
              success: function (res) {
                console.log(res.tempFilePath)
                self.setData({
                  qc_code: res.tempFilePath
                })

              }
            })
          }
          else {
            Toast.fail("生成分享二维码失败");
          }

         


        }
        else
        {
          Toast.fail("生成分享二维码失败");
        }
      }
    })

  },

  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
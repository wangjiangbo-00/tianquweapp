var util = require('../../utils/util.js')
const qiniuUploader = require('../../utils/qiniu/qiniuUploader.js')
const app = getApp()
Page({
  data: {
    "article": null,
    bcollect:false,
    "articleshow": "articleshow_0",
    "styleTypes": ['默认', '黑色'],
    
    "styleIndex": 0,
    "cover": "http://pd8s3tjek.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20180822163119.jpg",
    "pageName": "推广码"
  },
  
  //错误处理函数
  error:function(data) {
    this.setData({page : {load : 1}});
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },
  
  
  
  //添加地址 || 或者修改地址
  
   

  
  generateimg:function() {
    var self = this;

    var article = this.data.article;


    var url = self.baseApiUrl;

   
    url += "/ziyoutechan/customer/getuseractivityqr?";

    


    url += "session=";
    url += app.globalData.session;

    url += "&&type=";
    url += 1;

    url += "&&refid=";
    url += 43;

    

    util.ajax({
      "url": url,
      method: "GET",
      success: function (data) {
        if (data.returncode == 0) {

          
        }
      }
    })
  },
  
  onLoad:function(options){
    
    app.setRecommender(options);
    app.checkNavbar(this);
    util.loadding(this);

    
  
    this.getConfig()

    var self = this
    
      util.checkNet({
        success: function () {
          util.succNetCon(self);

          self.getData();
         

        },
        error: function () {
          util.notNetCon(self, 1);
        }
      });
    
    


    
    
    
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
  
  onReady:function(){
  },

  getData: function () {

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getrecommendpic?";

    url += "session=";
    url += app.globalData.session

    url += "&&templeteid=";
    url += 0

    

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {

        if (data.returncode == 0) {
          var recommendimg = data.message;

          self.setData({
            recommendimg: recommendimg
          })

        } else {
          self.error(data);
          return false;
        }
      }
    });
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

  onShareAppMessage: function () {

    var usr = app.globalData.userInfo;
    var whoname = "你的好友"

    if (usr && usr.nickname) {
      whoname = "你的好友" + usr.nickname;

    }


    return getApp().share({
      title: whoname + "向您推荐田趣小集",
     desc: "",
      path: '/pages/index/index?useless=0',
      imageUrl: this.data.cover });
    
  },

  saveimage: function () {
    var cover = this.data.recommendimg.pic;

    wx.downloadFile({
      url: cover, //仅为示例，并非真实的资源
      success: function (res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          console.log(res)
            var filePath = res.tempFilePath
          wx.saveImageToPhotosAlbum({
            filePath: filePath,
              success: function (res) {
                wx.showToast({
                  title: '保存成功',
                })
              },
              fail: function (res) {
                wx.showToast({
                  title: '保存失败',
                })
              }
            })
          
        }
      }
    })

    
  },

  
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  
  

  

  

  

  
  
  
})
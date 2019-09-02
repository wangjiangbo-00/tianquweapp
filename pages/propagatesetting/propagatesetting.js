const util = require('../../utils/util.js')
const qiniuUploader = require('../../utils/qiniu/qiniuUploader.js')
const app = getApp()
import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';
Page({
  data:{
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime(),
    maxDate: new Date(2019, 10, 1).getTime(),
    currentDate: new Date().getTime(),
     "address_select" : 0,
     "provinceValue" : '',
     "cityValue" : '',
     "areaValue" : '',
     "provinceIndex" : '',
     "cityIndex" : '',
     "areaIndex" : '',
    "propagatetypes": ['个人微信号', '公众号', '店铺&活动'],
     "propagatetypeindex" : 0,
    

    "lotterydraws": ['发起者配送', '同城送达', '中奖者自取'],
    
    "lotterydrawindex": 0,

     "areasAnimation" : {},
     "citysAnimation" : {},
     "provincesAnimation" : {},
     'provinceTop' : "0em",
     'cityTop' : "0em",
     'areaTop'  : "0em",
     'provinceVal' : "0",
     'cityVal' : "0",
     'areaVal'  : "0",
     'modalHidden' : true,
     'address' :  {
       "receive_name" : '',
       "mobile" : '',
       "address" : ''
     },
     
    'avatarUrl': "",
    "pageName": "我的抽奖"
  },
  formId:function(options){
  },
  deletes:function(options){
    var self = this;
    wx.showModal({
      title: '确定删除这个地址吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
           self.modalConfirm();
        } 
      }
    })
  },

   
  loaded: function () {
    util.loaded(this);
  },

  ontimeChoosed(event) {

    var time = event.detail;
    this.setData({
      currentDate: event.detail,
      'datetimeshow': false
    });
  },
  timeselect: function (e) {
    this.setData({ 'datetimeshow': true });
  },

  onDatetimeClose: function (e) {
    this.setData({ 'datetimeshow': false });
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
  

  getpropagatesettings: function () {
    {
      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getpropagatesettings?";

      url += "session=";
      url += app.globalData.session


      var self = this;
      util.ajax({
        "url": url,
        "method": 　"GET",
        "success": function (data) {
          if (data.returncode == 0) {
            util.loaded(self);
            if (data.lists.length > 0) {

              var propagatesettings = data.lists;

              var propagatesetting = null;
              

              for (var i in propagatesettings) {
                if (propagatesettings[i]['isdefault'] == 1) {
                  propagatesetting = list[i];
                } else if (i >= propagatesettings.length - 1) {
                  propagatesetting = propagatesettings[0];
                }
              }
              


              
              self.setData({
                "propagatesettings": propagatesettings,
                "propagatesetting": propagatesetting,
              });

              
            } else {
              self.setData({
                "propagatesettings": false,
                propagatesetting: false
              });

              
            }

            
          } else {
            self.error(data);
          }
        }
      });
    }
  },

  

  editText: function (e) {

    if (this.data.introduction)
    {
      var text = this.data.introduction;
    }
    else{
      var text = "";
    }
  
    var url = "../commonedit/commonedit?text=" + text + "&&vname=introduction";

    

    wx.navigateTo({
      url: url,
    })
  },
  propagatetypeindexChange: function (e) {
    var propagatetypeindex = e.detail.value;
    this.setData({
      propagatetypeindex: propagatetypeindex
    })
  },
  //添加地址 || 或者修改地址
  listenFormSubmit:function(e){
    
    var that = this;  
    var formData = e.detail.value;  

    var introduction = this.data.introduction;

    

    if (introduction == undefined) {
      introduction = ""
    }

  
      var url = that.baseApiUrl;

      
      if (that.data.isadd) {
        url += "/ziyoutechan/customer/addpropagatesetting?";
      }
      else {
        url += "/ziyoutechan/customer/editpropagatesetting?";
      }

      
      
      
      url += "session=";
      url += app.globalData.session;


      var data = {
        id:this.data.settingid,
        userid: 0,
        name: formData.name,
        type: formData.type,
        spreadvalue: formData.spreadvalue,
        introduction: introduction,
        isdefault: 0,
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
  
  
  
  onLoad:function(options){
    app.setRecommender(options);
    app.checkNavbar(this);

    var settingid = this.options.id != undefined ? parseInt(this.options.id):0;
    this.setData({
      "settingid": settingid
    })
    if (settingid == 0)
    {
      this.setData({
        "isadd": 1
      })
    }
    else
    {
      this.setData({
        "isadd": false
      })
    }
    
    


    util.loadding(this);
  
    this.options = options;

    this.setData({ "options": options });
    var self = this;
    this.baseApiUrl = util.baseurl(); 
    
  
    util.checkNet({
      success: function () {
        util.succNetCon(self);

        if (self.data.settingid!=0)
        {
          self.getData();//token,this.offset,this.size
        }
         
      },
      error: function () {
        util.notNetCon(self, 1);
      }
    });
    
    
    
  },

  getData: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getpropagatesetting?";

    url += "session=";
    url += app.globalData.session

    url += "&&settingid=";
    url += this.data.settingid

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {
          var propagatesetting = data.message;
          


          if (propagatesetting.type == 0) {
            propagatesetting.typestr = "个人微信号"
          }
          else if (propagatesetting.type == 1) {
            propagatesetting.typestr = "微信公众号"
          }
          else if (propagatesetting.type == 2) {
            propagatesetting.typestr = "线下店铺"
          }

          self.setData({
            "propagatesetting": propagatesetting,
            propagatetypeindex: propagatesetting.type,
            introduction: propagatesetting.introduction
          });
        } else {
          self.setData({
            "propagatesetting": false,
            propagatetypeindex: 0,
            introduction: false
          });
          util.notNetCon(self, 1, 1);
          self.error(data);
          return false;
        }
      }
    });
  },
  
  
  
  init: function() {
    //this.data.cityValue;
    //this.data.provinceValue;
    //this.data.areaValue;
    //var pos = target["pos_" + target.id];
    //var speed = target["spd_" + target.id] * Math.exp(-0.03 * d);
    var provinceTop = parseFloat(this.data.provinceTop.replace(/em/g, ""));
    var cityTop = parseFloat(this.data.cityTop.replace(/em/g, ""));
    var areaTop = parseFloat(this.data.areaTop.replace(/em/g, ""));

    //坐标
    var provincePos = provinceTop;
    var cityPos = cityTop;
    var areaPos = areaTop;

    for(var i = 0;i < parseInt(this.data.provinceVal); i++) {
        provincePos = provincePos - 2.5;
    }

    for(var i = 0;i < parseInt(this.data.cityVal); i++) {
        cityPos = cityPos - 2.5;
    }

    for(var i = 0;i < parseInt(this.data.areaVal); i++) {
        areaPos = areaPos - 2.5;
    }

    this.animationObj1.translate3d(0,provincePos + "em",0).step({duration: 80});
    this.setData({
      animationProvinces : this.animationObj1.export(),
    }); 

    this.animationObj2.translate3d(0,cityPos + "em",0).step({duration: 80});
    this.setData({
      animationCitys : this.animationObj2.export(),
    });

    this.animationObj3.translate3d(0,areaPos + "em",0).step({duration: 80});
    this.setData({
        animationAreas : this.animationObj3.export(),
     })
  },
  
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
  tapName:function(e){
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

    this.animationObj1 = wx.createAnimation({
      duration: 80,
      timingFunction: 'ease',
    })
    
    this.animationObj2 = wx.createAnimation({
      duration: 80,
      timingFunction: 'ease',
    })
    this.animationObj3 = wx.createAnimation({
      duration: 80,
      timingFunction: 'ease',
    })
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  address_select: function(e) {
     this.setData({
      address_select: 1
    })
  },
  
  
  
  lotterymodeChange: function(e) {
    var lotterymodeindex = e.detail.value ; 
    this.setData({
      lotterymodeindex: lotterymodeindex
    })
  },

  lotterydrawChange: function (e) {
    var lotterydrawindex = e.detail.value;
    this.setData({
      lotterydrawindex: lotterydrawindex
    })
  },

  lotteryspreadChange: function (e) {
    var lotteryspreadindex = e.detail.value;
    this.setData({
      lotteryspreadindex: lotteryspreadindex
    })
  },

  finish: function(e) {
    this.setData({ 'toast_style': " " });
    if (!this.data.old_value[0]) {
      this.setData({"province_tip":true});
      return false;
    } else {
      if (this.province_tip)
        this.setData({ "province_tip": false });
    }

    if (!this.data.old_value[1]) {
      this.setData({"city_tip":true});
      return false;
    } else {
      if (this.city_tip) this.setData({ "city_tip": false });
    }
    if (!this.data.old_value[2]) {
      this.setData({"district_tip":true});
      return false;
    } else {
      if (this.district_tip) this.setData({ "district_tip": false });
    }
    this.setData({ "address_select": 0 });
  },

  
  close: function(e) {
    this.setData({
      "address_select" : 0
    });
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
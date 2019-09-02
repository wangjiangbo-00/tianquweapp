var util = require('../../utils/util.js');
const ImgLoader = require('../../utils/img-loader/img-loader.js')
const app = getApp()
Page({
  data:{
      
    "scrollable": true,
    "pageName": "平台活动",
    
    "pageinitoverclass":"",
    needInitCheck: true,
    pageInit: 0,
   },
  onLoad:function(options){

    var self = this;
    app.setRecommender(options);
  
    wx.getSystemInfo({
      success: (res) => {
        self.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })


this.getConfig();
    app.checkNavbar(this);
    var self = this;
    util.checkNet({
      success: function () {
        util.succNetCon(self);
        self.goodsList();
        self.getData(); 
      },
      error: function () {
        util.notNetCon(self);
      }
    });
  },


  onShareAppMessage: function () { 


    return getApp().share({ title: "抽奖 团购 折扣 各种活动应有尽有,快来看看吧", desc: "", path: "pages/promitionindex/promitionindex?useless=0" }); 
    },

  getConfig: function () {
    this.baseApiUrl = util.baseurl();
    this.size = util.config('page_size');
    this.offset = util.config('page_offset');
    this.page = 1;

    this.setData({
      "pullload_text": util.config('pullload_text')
    });
  },

  goodsList: function () {
    var offset = this.offset;
    var size = this.size;
    var data = {
      "offset": offset,
      "size": size,
      catid: 0
    };

    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getrecommendgoods?";

    url += "session=";
    url += app.globalData.session



    var self = this;
    util.ajax({
      "url": url,
      "data": data,
      "success": function (data) {
        var goods = data.lists;
        self.setData({
          "goods": goods
        });
        self.loaded();
      }
    });
  },

  loadding: function () {
    util.loadding(this);
  },
  loaded: function () {
    util.loaded(this);
  },

  gotopromition: function (e) {

    var index = e.currentTarget.dataset.index;


    var platformactivitiy = this.data.platformactivities[index];

    if (platformactivitiy.type == 4)
    {
      var url = "../lotterys/lotterys";
    }
    else if (platformactivitiy.type == 5)
    {
      var url = "../supergroups/supergroups";
    }
    else if (platformactivitiy.type == 6) {
      var url = "../freeorders/freeorders";
    }
    else if (platformactivitiy.type == 2 || platformactivitiy.type == 3)
    {
      wx.setStorageSync("platformactivitiy", platformactivitiy);

      var url = "../platformdiscounts/platformdiscounts?id=" + platformactivitiy.discountid;
    }

    

    wx.navigateTo({
      url: url,
    })
  },


  //初始化数据
  refresh: function (isclear = 0) {
    var self = this;
    util.checkNet({
      success: function () {
        util.succNetCon(self);


        //是否清空已有数据
        if (isclear) {
          util.loadding(self);
          self.setData({
            'is_over': 0,
            'no_data': 0,
            'pullDown': 0
          });
          self.page = 1;
          
          self.getData();
        } else {
          //加载数据完毕后，重载新数据
          if (self.page == 1) {
            self.setData({
              'is_over': 0,
              'no_data': 0,
              'pullDown': 0
            });
            self.getData(1);
          }
        }

        self.order_id = undefined;

      },
      error: function () {
        util.notNetCon(self, 0);
      }
    });
  },

  scroll: function (e) {
    if (420 < e.detail.scrollTop) {
      this.setData({ "goTopClass": 'top-button-show-nav' });
    } else {
      this.setData({ "goTopClass": 'top-button-hide' });
    }
  },
  goTop: function (e) {

    
    this.setData({
      "scrollTop": 1
    });
    
  },

  getData: function (isclear = 0) {
    
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getplatformactivities?";

    url += "session=";
    url += app.globalData.session

  
    var self = this;
    util.ajax({
      url: url,
      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {
          var platformactivities = data.lists;

          

          setTimeout(function () {
            self.setData({

              "pageInit": 1,

            });
          }, 1000)
            self.setData({
              "platformactivities": platformactivities
            });

          
  
        } else {
          self.error(data);
          return false;
        }
      }
    });



    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getpromotionshows?";

    url += "session=";
    url += app.globalData.session


    var self = this;
    util.ajax({
      url: url,
      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {
          var platformactivitieshows = data.message;


          var lotterys = platformactivitieshows.giftActivities;

          var lotterys = lotterys.map(function (lottery) {

            lottery.start_time = util.formatTimeWithyrsf(lottery.start_time);
            lottery.end_time = util.formatTimeWithyrsf(lottery.endtime);

            if (lottery.personas) {
              lottery.personas = JSON.parse(lottery.personas);
            }
            else {
              lottery.personas = null;
            }

            if (lottery.mode == 2 || lottery.mode == 3) {
              var parms = JSON.parse(lottery.parms);

              lottery.chance = parms.chance
            }
            else if (lottery.mode == 4) {
              var parms = JSON.parse(lottery.parms);

              lottery.peoplenum = parms.num
            }

            if (lottery.status == 4) {
              lottery.status_lang = "即将开始";
              lottery.status_class = "status_coming";
            }
            else if (lottery.status == 5) {
              lottery.status_lang = "正在进行";
              lottery.status_class = "status_on";
            }
            else if (lottery.status > 5) {
              lottery.status_lang = "已经结束";

              lottery.status_class = "status_over";
            }
            return lottery;
          });

          platformactivitieshows.giftActivities = lotterys;


          var groups = platformactivitieshows.teamFounders;

          var groups = groups.map(function (item) {


            var stage_format = item.stage_format;

            if (stage_format == null) {
              return null;
            }

            var stages = stage_format.split(",");

            var statge = stages[stages.length - 1];

            var stagevalues = statge.split(":");

            var num = stagevalues[0];

            var discount = parseFloat(stagevalues[1]).toFixed(1);

            item.discount = discount;




            item.starttime_lang = util.formatTimeWithyrsf(item.starttime);
            item.expiretime_lang = util.formatTimeWithyrsf(item.expiretime);




            if (item.status == 4) {
              item.status_lang = "即将开始";
              item.status_class = "status_coming";
            }
            else if (item.status == 5) {
              item.status_lang = "正在进行";
              item.status_class = "status_on";
            }
            else if (item.status > 5) {
              item.status_lang = "已经结束";
              item.status_class = "status_over";
            }
            return item;
          });

          platformactivitieshows.teamFounders = groups;

        

          self.setData({
            "platformactivitieshows": platformactivitieshows
          });



        } else {
          self.error(data);
          return false;
        }
      }
    });




  },
  
})
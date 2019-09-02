var util = require('../../utils/util.js');
var WxParse = require('../../utils/wxParse/wxParse.js');
const ImgLoader = require('../../utils/img-loader/img-loader.js')
const app = getApp()

import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';

import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';


var participatetiptimer = null;
Page({
  data: {
    indicatorDots: false,
    autoplay: false,
    interval: 3500,
    duration: 800,
    loaded: false,
    "current": 1,
    bcollect: false,
    buysum: 1,
    sell_type: 1,
    spec_showprice: 0,
    "pageName": "抽奖详情",
    needhome: true, 
    needInitCheck: true,
    pageInit: 0,
    datetimeshow:false,
    showparticipatetip:true
  },
  onLoad: function (options) {
    this.loaded();
    app.setRecommender(options);

    this.checklotteryrecommend = true;

    app.checkNavbar(this);
    this.getConfig();

    var self = this;


    var scene = options.scene;
    if (scene) {
      scene = decodeURIComponent(options.scene)

      var sceneitems = scene.split(":")

      var sceneuserid = 0;

      var refid = 0;


      for (var i = 0; i < sceneitems.length; i++) {
        var sceneitem = sceneitems[i];
        if (sceneitem.indexOf("ru") != -1) {
          //推广员界面扫码
          sceneuserid = sceneitem.substring(2);
          
        }
        else if (sceneitem.indexOf("rar") != -1) {
          //推广员界面扫码
          sceneuserid = sceneitem.substring(3);
          
        }

        if (sceneitem.indexOf("rf") != -1)
        {
          refid =  sceneitem.substring(2);
        }

      }


      this.lotteryid = refid;
      this.relayuserid = sceneuserid;

      console.log("get lotteryid = " + refid + ",add relayuserid = " + sceneuserid + " from scene");

    }
    else
    {
      console.log("no scene" );
    }

  
    if (!this.lotteryid||this.lotteryid == 0)
    {
      this.lotteryid = options.lotteryid ? parseInt(options.lotteryid) : 0;
      console.log("get lotteryid  without scene  value = " + this.lotteryid);
    }

    if (!this.relayuserid ||this.relayuserid == 0)
    {
      this.relayuserid = options.relayuserid ? parseInt(options.relayuserid) : 0;
      console.log("get  relayuseid without scene value = " + this.relayuserid);
    }
    

    var selfmanage = options.selfmanage ? parseInt(options.selfmanage) :0

    
    this.setData({
      relayuserid: this.relayuserid,
      selfmanage: selfmanage
    });

    this.is_onload = 1;

    var self = this;
    var userinfo = app.globalData.userInfo;

    this.setData({
      userinfo: userinfo,
      
    });


    util.checkNet({
      success: function () {
        util.succNetCon(self);
        self.getData();
       
      },
      error: function () {
        util.notNetCon(self);
      }
    });


    this.imgLoader = new ImgLoader(this)


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

  showshare: function () {
    this.setData({
      shareshow: true
      
    });
  },

  shareclose: function () {
    this.setData({
      shareshow: false

    });
  },

  generateshareimg: function () {

    var that = this
    var userinfo = app.globalData.userInfo;
    if (!(userinfo != undefined && userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0 )) {

      this.setData({ "userinfoshow": 1 })
    }
    else{

      var relay = false;

      var type =1;

      



      if (this.data.lottery.mode == 3 && this.data.participate && this.data.participate.status == 2) {
        relay = true;

        type = 2;
      }

      if(relay)
      {
        var composemsg = {
          "composeshowimageurl": this.data.lottery.goods_picture,
          "composetitle": "抽奖奖品:" + this.data.lottery.goods_name,
          "composeinfo": this.data.lottery.modestr,
          "composeleftshare1": "邀请你帮忙助力赢大奖",
          "composeleftshare2": "快帮我助力赢大奖",
          "composerightshare1": "长按小程序码",
          "composerightshare2": "祝TA一臂之力",
          "composerightqr": this.data.lottery.qrpic,
        }
      }
      else
      {
        var composemsg = {
          "composeshowimageurl": this.data.lottery.goods_picture,
          "composetitle": "抽奖奖品：" + this.data.lottery.goods_name,
          "composeinfo": this.data.lottery.modestr,
          "composeleftshare1": "邀请你来参加免费抽奖",
          "composeleftshare2": "你也来试试手气吧",
          "composerightshare1": "长按小程序码",
          "composerightshare2": "参与免费抽奖",
          "composeqr": this.data.lottery.qrpic,
        }
      }

      

      wx.setStorageSync("composemsg", composemsg);
      wx.navigateTo({
        url: '../wximagecompose/wximagecompose?type=' + type + "&&refid=" + this.lotteryid,
      })
    }
    this.setData({
      shareshow: false

    });

    
  },

  alreadynotice: function() {
    Toast('已经参与过喽');
  },
  refresh: function () {
    var self = this;
    util.checkNet({
      success: function () {
        util.succNetCon(self); //恢复网络访问
        self.getData();
        



      },
      error: function () {
        util.notNetCon(self, 0);
      }
    });
  },
  bindchange: function (e) {
    var current = e.detail.current + 1;
    this.setData({
      current: current
    });
  },
  onReady: function () {

    // 页面渲染完成
  },
  onShow: function () {
    if (!this.is_onload) {
      //this.goodsGroups(this.goods_id);
    } else {
      this.is_onload = 0;
    }


    // 页面显示
  },


  onPageScroll: function (res) {
    if(res.scrollTop >180)
    {
      if (this.data.showparticipatetip)
      {
        this.setData({
          showparticipatetip:false
        })
      }
    }
    

    },

  showparticipatetip:function() {
    Toast("请向下滑动屏幕");


  },


  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
    
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
    util.loadding(this, 1);

    wx.stopPullDownRefresh();
  },




  loadding: function () {
    util.loadding(this);
    //this.setData({page : {load : 0}});
  },
  loaded: function () {
    util.loaded(this);
    //this.setData({page : {load : 1}});
  },
  //错误处理函数
  error: function (data) {
    this.loaded();
    if (data['result'] == 'fail') {
      util.toast(this, data.error_info);
    }
  },
  cusImageLoad: function (e) {
    var that = this;
    console.log(util.wxAutoImageCal(e));
    that.setData(util.wxAutoImageCal(e));
  },


  onShareAppMessage: function () {

    var lottery = this.data.lottery;

  
    var usr = app.globalData.userInfo;
    var whoname = ""

    if (usr && usr.nickname) {
      whoname =  usr.nickname;

    }

    

    

    var shareimg = null;

    if (this.data.lottery.goodsCover)
    {
      if (this.data.lottery.goodsCover.pictureurl) {
        shareimg = this.data.lottery.goodsCover.pictureurl;

      }
      else if (this.data.lottery.goodsCover.bannerurl) {
        shareimg = this.data.lottery.goodsCover.bannerurl;
      }
    }

    else
    {
      if (this.data.lottery.goods_picture)
      {
        shareimg = this.data.lottery.goods_picture;
      }
      else
      {
        shareimg = "/images/giftcut.png";
      }
      
    }

    var path = "pages/lottery/lottery?lotteryid=" + this.lotteryid;

    

    if (lottery && lottery.mode == 3 && lottery.sharemode == 1) {

      var userinfo = app.globalData.userInfo;

      if (userinfo)
      {
        path = path + "&&relayuserid=" + userinfo.id
      }
      else
      {
        Toast('获取用户信息失败');
      }

      var title = whoname + "正在参加助力抽奖 - " + "邀请你祝TA一臂之力。"
         
    }

    else
    {
      var title = whoname + "邀您参加免费抽奖。" 
    }
    return getApp().share({
      title: title,
      imageUrl: shareimg,
      path: path
    });
  },
  toIndex: function (e) {
    wx.switchTab({
      url: '../index/index'
    })
  },

  show_service_detail: function (e) {
    var self = this;
    this.setData({
      "service_detail": 1
    });
    setTimeout(function () {
      self.setData({
        "service_detail": 2
      });
    }, 150)
  },

  makephonecall: function (e) {
    wx.makePhoneCall({
      phoneNumber: this.data.lottery.ownerphone,
    })
  },

  

  getData: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getlotterydetails?";

    url += "session=";
    url += app.globalData.session

    url += "&&lotteryid=";
    url += this.lotteryid

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {

        
       
        
        if (data.returncode == 0) {
          var lottery = data.message.giftActivity;
          lottery.start_time = util.formatTimeWithyrsf(lottery.start_time);
          lottery.end_time = util.formatTimeWithyrsf(lottery.endtime);


          if (lottery.giftfrom == 1) {

            


            

            if (self.checklotteryrecommend) { 

              var recommenderinfo = wx.getStorageSync("recommenderinfo");

              
              if (recommenderinfo) {
                var recommendertime = recommenderinfo.recommendertime;
                var now = new Date().getTime();
                var spantime = (now - recommendertime) / 1000;

                if (spantime > 3600 * 24) {


                  var recommenderinfo = {
                    "recommenderid": lottery.ownerid,
                    "recommendertime": now
                  }

                  wx.setStorageSync("recommenderinfo", recommenderinfo);
                  console.log("set recommenderinfo info from lottery sponsor  = " + lottery.ownerid);
                }

              }
              else {
                var now = new Date().getTime();
                var recommenderinfo = {
                  "recommenderid": lottery.ownerid,
                  "recommendertime": now
                }

                wx.setStorageSync("recommenderinfo", recommenderinfo);

                console.log("set recommenderinfo info from lottery sponsor  = " + lottery.ownerid);

              }
              self.checklotteryrecommend = false;
            }
          }

          var user_propagate = lottery.user_propagate;

          if (user_propagate != undefined && user_propagate != null && user_propagate.length > 0) {
            var user_propagate_json = JSON.parse(user_propagate);

            lottery.drawmode = user_propagate_json.drawmode
            self.setData({
              "lotterydrawindex": lottery.drawmode
            })

            lottery.drawvalue = user_propagate_json.drawvalue
            lottery.propagatesetting = user_propagate_json.propagatesetting
            lottery.ownerphone = user_propagate_json.ownerphone

            if (lottery.drawmode == 0) {
              lottery.drawmodestr = "线上配送"
            }
            else if (lottery.drawmode == 1) {
              lottery.drawmodestr = "同城送达"
            }
            else if (lottery.drawmode == 2) {
              lottery.drawmodestr = "中奖者自取"
            }
            
            if (lottery.propagatesetting )
            {
              if (lottery.propagatesetting.type == 0)
              {
                lottery.propagatesetting.typestr = "添加微信"
              }
              else if (lottery.propagatesetting.type == 1) {
                lottery.propagatesetting.typestr = "关注公众号"
              }
              else if (lottery.propagatesetting.type == 2) {
                lottery.propagatesetting.typestr = "店铺地址"
              }

              

            }


          }

          if (lottery.mode == 1)
          {
            lottery.modestr = "定时开奖:开奖时间-" + lottery.end_time;
          
          }

          else if (lottery.mode == 2 || lottery.mode == 3 ) {
            var parms = JSON.parse(lottery.parms);

            lottery.chance = parms.chance

            if (lottery.mode == 2 )
            {
              lottery.modestr = "手气抽奖:中奖概率-1/" + parms.chance;
            }
            else
            {
              lottery.modestr = "助力抽奖:中奖概率-1/" + parms.chance;
            }
            
          }
          else if (lottery.mode == 4 )
          {
            var parms = JSON.parse(lottery.parms);

            lottery.peoplenum = parms.num

            lottery.modestr = "满人开奖:" + lottery.peoplenum + "人";
          }

          else if (lottery.mode == 5) {
            lottery.modestr = "发起人手动开奖" ;
            
          }
          

          if (lottery.status == 4) {
            lottery.status_lang = "即将开始";
          } else if (lottery.status == 5) {
            lottery.status_lang = "正在进行";
          } else if (lottery.status > 5) {
            lottery.status_lang = "已经结束";


          }

          var personas = data.message.personas;

          if (personas && personas.length > 0) {
            lottery.personas = personas;
          } else {
            lottery.personas = [];
          }
          lottery.participate = data.message.people;


          var result =  lottery.result;

          if(result && result.length>0)
          {
            lottery.result = JSON.parse(result);
          }
          else
          {
            lottery.result = [];
          }

          if (lottery.status == 6)
          {
            lottery.showmode = 2;
          }
          else
          {
            lottery.showmode = 1;
          }
        

          

          self.setData({
            "lottery": lottery
          });
          self.getParticipate();
        } else {
          setTimeout(function () {
            self.setData({

              "pageInit": 1
            });
          }, 200)
          self.loaded();
          Toast(data.errormsg);
        }
      }
    });
  },


  getParticipate: function () {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getparticipatedetails?";

    url += "session=";
    url += app.globalData.session

    url += "&&lotteryid=";
    url += this.lotteryid

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function (data) {
        self.loaded();
        if (data.returncode == 0) {

          self.setData({

            "pageinitoverclass": "fade_out_fast"
          });


          setTimeout(function () {
            self.setData({

              "pageInit": 1
            });
          }, 200)
          var participate = data.message;

          if (participate) {
            self.setData({
              "participate": participate
            });

            
          } else {

            self.setData({
              "participate": false
            });
           
          }


          var lottery = self.data.lottery;
         
          if (lottery) {

            if (lottery.mode == 3) {
              if (self.data.relayuserid) {
                if (lottery.status == 5) {
                  var userinfo = app.globalData.userInfo;
                  if (self.data.relayuserid != userinfo.id) {
                    lottery.showmode = 3;

                  }
                  else {
                    lottery.showmode = 1;
                    if (participate && participate.status == 2) {
                      lottery.sharemsg = "邀请助力"
                      lottery.sharemode = 1
                    }
                  }


                }
                else if (lottery.status > 5) {
                  lottery.showmode = 2;
                }
                else {
                  lottery.showmode = 1;
                }

              }
              else {

                if (participate && participate.status == 2) {
                  lottery.sharemsg = "邀请助力"
                  lottery.sharemode = 1
                }

                if (lottery.status > 5) {
                  lottery.showmode = 2;
                }
                else {
                  lottery.showmode = 1;
                }
              }


            }
            else if (lottery.mode == 2) {
              if (lottery.status > 5 || (lottery.status == 5 && participate && participate.status == 2)) {
                lottery.showmode = 2;
              }
              else {
                lottery.showmode = 1;
              }
            }
            else {

              if (lottery.status > 5) {
                lottery.showmode = 2;
              }
              else {
                lottery.showmode = 1;
              }

            }

            self.setData({
              "lottery": lottery
            });


          }

          



        } else {
         
          self.error(data);
          return false;
        }
      }
    });
  },


  getPirzeToken: function () {

  },


  gotoshop(v) {
    var id = this.data.lottery.ownerid;
    wx.navigateTo({
      url: '../shopdetail/shopdetail?shopid=' + id,
    })
  },

  gotogoods: function (e) {

    
    var id = this.data.lottery.goodsCover.id;
    wx.navigateTo({
      url: '../goods/goods?goods_id=' + id,
    })
  },


  uncoverlottery(v) {
    var self = this;
    Dialog.confirm({
      title: '确认开奖',
      message: '您确认现在开奖吗？',

    }).then(() => {
      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/uncoverlottery?";

      url += "session=";
      url += app.globalData.session

      url += "&&lotteryid=";
      url += this.lotteryid


      


      util.ajax({
        url: url,

        method: "GET",
        success: function (data) {
         
          if (data.returncode == 0) {
            //提示参与成功
            Toast('已开奖,后台正在处理,请稍微刷新');

            setTimeout(function(){
              self.getData();
            },1000)

            
          } else if (data.returncode == 1003) {
            // 参数错误
            Toast('参数错误');
          } else if (data.returncode == 1017) {
            Toast('活动未开始');
          } else if (data.returncode == 1018) {
            Toast('活动已结束');
          } else if (data.returncode == 1019) {
            Toast('已经参与');
          } else {
         
            self.error(data);
            return false;
          }
        }
      });
    }).catch(() => {
      // on cancel
    });
  },
  createlottery(v) {

    var lottey = this.data.lottery;


    wx.navigateTo({
      url: '../sponsor/sponsor?lotteryid=' + 0,
    })

  },

  gotoRewards(v) {

    var lottery = this.data.lottery;

    if (lottery.giftfrom == 1)
    {

      var url = "../giveraddr/giveraddr?type=1&&lotteryid=" + lottery.id ;


      wx.navigateTo({
        url: url,
      })
      
    }
    else if (lottery.giftfrom == 0)
    {

      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getprizetoken?";

      url += "session=";
      url += app.globalData.session

      url += "&&lotteryid=";
      url += this.lotteryid

      var self = this;
      util.ajax({
        url: url,

        method: "GET",
        success: function (data) {
          self.loaded();
          if (data.returncode == 0) {
            var token = JSON.parse(data.extramsg);

            if (token) {
              var orderid = token.oid;
              var token = token.token;
              wx.navigateTo({
                url: "../giver/giver?id=" + orderid + "&&token=" + token,
              })
            } else {

              wx.showToast({
                title: '你没有领取权限',
              })



            }



          } else {
            
            self.error(data);
            return false;
          }
        }
      });
    }



    



  },


  


  gotoMore(v) {

    wx.switchTab({
      url: '../promitionindex/promitionindex',
    })
    
  },

  gotoMine(v) {

    this.setData({
      "relayuserid": false
    });
    this.getData();


  },


  
  onUserinfoClose:function(e)
  {
    this.setData({ "userinfoshow": 0 })
  },

  bindGetUserInfo: function (e) {

    app.bindGetUserInfo(e);

  },

  copytoclips: function (e) {

    var lottery = this.data.lottery;


    wx.setClipboardData({
      data: lottery.propagatesetting.spreadvalue,
      success(res) {

        
        
      }
    })

  },

  participate: function (e) {

    var self = this;


    var userinfo = app.globalData.userInfo;
    if (!(userinfo!=undefined &&  userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0)) 
      {

      this.setData({ "userinfoshow": 1 })
    }
    else {

      var lottery = this.data.lottery;

      if (lottery.giftfrom == 0)
      {
        var messagetip = "您参加的抽奖为平台提供，将享有担保交付和全国包邮服务，请您注意消息提示，以免中奖后错过领奖。"
      }
      else if (lottery.giftfrom == 1)
      {
        var messagetip = "您参加的抽奖是个人用户" + lottery.ownername + "提供。" + "请您注意商品描述和领取方式，如出现兑付问题时，平台将尽力为您协调。"
      }



      var formid = e.detail.formId;


      Dialog.confirm({
        title: '确认参与',
        message: messagetip,
        confirmButtonText:"参加抽奖"

      }).then(() => {
        var url = this.baseApiUrl;
        url += "/ziyoutechan/customer/participategift?";

        url += "session=";
        url += app.globalData.session

        url += "&&giftid=";
        url += this.lotteryid


        url += "&&formid=";
        url += formid


        util.ajax({
          url: url,

          method: "GET",
          success: function (data) {
            self.loaded();
            if (data.returncode == 0) {
              //提示参与成功

              if (lottery.mode == 3)
              {
                Toast('参加成功,快去邀请好友助力吧');
              }
              else
              {
                Toast('参加成功');
              }

            } else if (data.returncode == 1003) {
              // 参数错误
              Toast('参数错误');
            } else if (data.returncode == 1017) {
              Toast('活动未开始');
            } else if (data.returncode == 1018) {
              Toast('活动已结束');
            } else if (data.returncode == 1019) {
              Toast('已经参与');
            }else {
             
              Toast('系统错误');
              
            }

            self.getData();
          }
        });
      }).catch(() => {
        // on cancel
      });

    }


  },

  giftrelay: function (e) {

    var self = this;


    var userinfo = app.globalData.userInfo;
    if (!(userinfo != undefined && userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0)) {

      this.setData({ "userinfoshow": 1 })
    }
    else {

      var formid = e.detail.formId;

      Dialog.confirm({
        title: '确认助力?',
        message: '每个抽奖活动，每人只有一次助力机会哦',

      }).then(() => {
        var url = this.baseApiUrl;
        url += "/ziyoutechan/customer/giftrelay?";

        url += "session=";
        url += app.globalData.session

        url += "&&giftid=";
        url += this.lotteryid

        url += "&&relayuserid=";
        url += this.data.relayuserid

        url += "&&formid=";
        url += formid


        util.ajax({
          url: url,

          method: "GET",
          success: function (data) {
            self.loaded();
            if (data.returncode == 0) {

              var message = data.message;

              if (message.result == 1)
              {
                Toast('太幸运了,帮TA中奖喽,快向好友邀功去吧');
              }
              else
              {
                Toast('没有帮TA中奖,点击-我的助力-参与,也去试试手气吧');
              }
              //提示参与成功
              

              
            } else if (data.returncode == 1003) {
              // 参数错误
              Toast('参数错误');
            } else if (data.returncode == 1017) {
              Toast('活动未开始');
            } else if (data.returncode == 1018) {
              Toast('活动已结束');
            } else if (data.returncode == 1019) {
              Toast('已经助力');
            }else {
             
              Toast('系统错误');
            }

            self.getData();
          }
        });
      }).catch(() => {
        // on cancel
      });

    }


  },


  appointment: function (e) {


    var userinfo = app.globalData.userInfo;
    if (!(userinfo != null && userinfo.nickname != null && userinfo.nickname.length > 0
      && userinfo.headpic != null && userinfo.headpic.length > 0)) {


      this.setData({ "userinfoshow": 1 })

    }
    else {
      var formid = e.detail.formId;
      Dialog.confirm({
        title: '确认预约',
        message: '预约后，系统会在活动开始后及时给您发送通知'
      }).then(() => {

        var url = this.baseApiUrl;
        url += "/ziyoutechan/customer/appointment?";

        url += "session=";
        url += app.globalData.session

        url += "&&giftid=";
        url += this.lotteryid


        url += "&&formid=";
        url += formid

        var self = this;
        util.ajax({
          url: url,

          method: "GET",
          success: function (data) {
            self.loaded();
            if (data.returncode == 0) {
              Toast('预约成功');
              
              self.getData();
              //提示参与成功
            } else if (data.returncode == 1003) {
              // 参数错误
              Toast('参数错误');
            } else if (data.returncode == 1017) {
              Toast('活动未开始');
            } else if (data.returncode == 1018) {
              Toast('活动已结束');
            } else if (data.returncode == 1019) {
              Toast('已经预约');
            }  else {
        
              self.error(data);
              return false;
            }
          }
        });
        // on confirm
      }).catch(() => {
        // on cancel
      });
    }
  },
  gotorule:function(){
    wx.navigateTo({
      url: '../questiondetails/questiondetails?id=22&&cid=1',
    })
  },
  recall: function (e) {
    var self = this;
    var self = this;
    var lottery = this.data.lottery;




    Dialog.confirm({
      title: "操作确认",
      message: "您确定撤回上线申请吗？"
    }).then(() => {

      var url = self.baseApiUrl;
      url += "/ziyoutechan/customer/setuserlotteryapply?";

      url += "session=";
      url += app.globalData.session
      url += "&&lotteryid=";
      url += lottery.id


      url += "&&apply=";
      url += 0
      util.ajax({
        url: url,

        method: "GET",
        success: function (data) {
          self.loaded();
          if (data.returncode == 0) {

            Toast("下架成功")
            

            setTimeout(function () {
              wx.navigateBack({
                
              })
            }, 200)

          } else {
            self.error(data);
            return false;
          }
        }
      });


      // on confirm
    }).catch(() => {
      // on cancel
    });
  },







})
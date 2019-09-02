const util = require('../../utils/util.js')



const app = getApp()


var wxoss = require('../../utils/txoss/wxoss.js');

import Dialog from '../../thirdpartcomponents/vant/dist/dialog/dialog';
import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';



Page({
  data: {

    "lotterymodes": ['定时开奖', '即时开奖', '助力抽奖', '满人开奖', '手动开奖'],
    "lotterymodeindex": 0,
    propagatesettingIndex: 0,

    "lotterydraws": ['发起者配送', '同城送达', '中奖者自取'],

    "lotterydrawindex": 0,

    'modalHidden': true,
    'address': {
      "receive_name": '',
      "mobile": '',
      "address": ''
    },

    'avatarUrl': "",
    "pageName": "我的抽奖"
  },
  onLoad: function(options) {
    var self = this
    app.setRecommender(options);
    app.checkNavbar(this);

    var lotteryid = this.options.lotteryid != undefined ? parseInt(this.options.lotteryid) : 0;
    this.setData({
      "lotteryid": lotteryid
    })
    if (lotteryid == 0) {
      this.setData({
        "isadd": 1
      })
    } else {
      this.setData({
        "isadd": false
      })
    }


    var minDate = new Date().getTime()
    var maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    maxDate = maxDate.getTime();


    var currentDate = new Date().getTime()


    this.setData({
      'minDate': minDate,
      'maxDate': maxDate,
      'currentDate': currentDate,
    });









    util.loadding(this);

    this.options = options;

    var order = wx.getStorageSync("orderrefund");
    this.setData({
      "order": order
    });
    this.setData({
      "options": options
    });
    var self = this;
    this.token = wx.getStorageSync('token');
    this.baseApiUrl = util.baseurl();

    var data_version = wx.getStorageSync('data_version');


    util.checkNet({
      success: function() {
        util.succNetCon(self);

        if (self.data.lotteryid != 0) {
          self.getData(); //token,this.offset,this.size


        } else {
          self.getpropagatesettings();
        }



      },
      error: function() {
        util.notNetCon(self, 1);
      }
    });



  },


  formId: function(options) {},



  loaded: function() {
    util.loaded(this);
  },

  ontimeChoosed(event) {

    var time = event.detail;



    var chooseDateStr = util.formatTime(time);
    this.setData({
      currentDate: event.detail,
      chooseDateStr: chooseDateStr,
      'datetimeshow': false
    });
  },
  timeselect: function(e) {
    this.setData({
      'datetimeshow': true
    });
  },

  onDatetimeClose: function(e) {
    this.setData({
      'datetimeshow': false
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
  modalCancel: function(options) {
    this.setData({
      modalHidden: true
    });
  },


  getpropagatesettings: function() {
    {
      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getpropagatesettings?";

      url += "session=";
      url += app.globalData.session


      var self = this;
      util.ajax({
        "url": url,
        "method": 　 "GET",
        "success": function(data) {
          if (data.returncode == 0) {
            util.loaded(self);
            if (data.lists.length > 0) {

              var propagatesettings = data.lists;

              var propagatesetting = [];


              var propagatesettingsRanges = [];
              for (var i in propagatesettings) {
                propagatesettingsRanges.push(propagatesettings[i]['name'])

              }

              var propagatesettingid = 0;
              if (self.data.lotteryid > 0 && self.data.lottery && self.data.lottery.propagatesetting) {
                propagatesettingid = self.data.lottery.propagatesetting.id ? self.data.lottery.propagatesetting.id : 0;

              }

              propagatesetting = self.propagatesettingSort(propagatesettings, propagatesettingid);


              var propagatesettingindex = propagatesetting.propagatesettingindex;

              self.setData({
                "propagatesettingsRanges": propagatesettingsRanges,
                "propagatesettings": propagatesettings,
                "propagatesetting": propagatesetting,
                propagatesettingIndex: propagatesettingindex
              });


            } else {
              self.setData({
                "propagatesettingsRanges": false,
                "propagatesettings": false,
                propagatesetting: false,
                propagatesettingIndex: 0
              });

              Toast.fail("请首先在推广设置添加推广内容")


            }


          } else {
            self.error(data);
          }
        }
      });
    }
  },


  propagatesettingSort: function(list, propagatesettingIndex) {
    var propagatesetting;
    if (list.length == 1) {
      propagatesetting = list[0];
      propagatesetting.propagatesettingindex = 0;
      return propagatesetting;

    }
    if (list.length <= 0) {
      propagatesetting.propagatesettingindex = 0;
      return null;
    }

    for (var i in list) {
      if (undefined != propagatesettingIndex && propagatesettingIndex != 0) {
        if (list[i]['id'] == propagatesettingIndex) {
          propagatesetting = list[i];
          propagatesetting.propagatesettingindex = i;
          break;
        }
      } else if (list[i]['isdefault'] == 1) {
        propagatesetting = list[i];
        propagatesetting.propagatesettingindex = i;
      } else if (i >= list.length - 1) {
        propagatesetting = list[0];
        propagatesetting.propagatesettingindex = 0;
      }
    }
    return propagatesetting;
  },



  editText: function(e) {

    if (this.data.refundinfo) {
      var text = this.data.refundinfo;
    } else {
      var text = "";
    }

    var url = "../commonedit/commonedit?text=" + text + "&&vname=refundinfo";



    wx.navigateTo({
      url: url,
    })
  },


  gotopropagatesettings: function(e) {



    var url = "../propagatesettings/propagatesettings";



    wx.redirectTo({
      url: url,
    })
  },


  checkInput: function(formData) {


    if (!this.data.propagatesettings) {
      Toast.success('请首先添加推广类型');
      return false;
    }


    if (!formData.name) {

      Toast("请输入抽奖名字")
      return false;

    }


    if (!formData.name) {

      Toast("请输入抽奖名字")
      return false;

    }

    if (!formData.instruction) {

      Toast("请输入奖品描述")
      return false;

    }

    if (!formData.giftnum || formData.giftnum < 1 || formData.giftnum > 10) {

      Toast("请输入正确奖品数量")
      return false;

    }


    if (!formData.instruction) {

      Toast("请输入奖品描述")
      return false;

    }




    if (this.data.lotterymodeindex == 0) {
      if (!formData.opentime) {

        Toast("请输入开奖时间")
        return false;

      }
    } else if (this.data.lotterymodeindex == 1 || this.data.lotterymodeindex == 2) {
      if (!formData.chance) {

        Toast("请输入开奖概率")
        return false;

      }
    } else if (this.data.lotterymodeindex == 3) {

      if (!formData.peoplenum) {

        Toast("请输入开奖人数")
        return false;

      }
    }





    if (!formData.drawvalue) {

      Toast("请输入领取说明")
      return false;

    }

    if (!formData.ownerphone) {

      Toast("请输入联系方式")
      return false;

    }



    return true

  },

  //添加地址 || 或者修改地址
  listenFormSubmit: function(e) {

    var that = this;
    var self = this;
    var formData = e.detail.value;

    if (!this.checkInput(formData)) {
      return false;
    }

    var mode = parseInt(formData.mode);

    var chance = 0;
    var peoplenum = 0;

    if (mode == 0) {

    }

    var parms = {};
    if (mode == 1 || mode == 2) {
      chance = formData.chance;

      parms.chance = chance;
      parms.solution = Math.floor(Math.random() * chance);
    } else if (mode == 3) {
      peoplenum = formData.peoplenum
      parms.num = peoplenum;
    }

    var parms_json = JSON.stringify(parms);

    var drawmode = formData.drawmode

    var drawvalue = formData.drawvalue

    var ownerphone = formData.ownerphone;

    var propagatesettingIndex = formData.propagatesetting

    var propagatesettings = this.data.propagatesettings;

    var propagatesetting = propagatesettings[propagatesettingIndex];



    var user_propagate = {};




    user_propagate.drawmode = drawmode;
    user_propagate.drawvalue = drawvalue;
    user_propagate.ownerphone = ownerphone;
    user_propagate.propagatesetting = propagatesetting


    var user_propagate_str = JSON.stringify(user_propagate);


    var pic = "";

    var pics = this.data.avatarUrl;

    if (pics && pics.length > 0) {
      pic = pics;
    } else {
      pic = ""
    }



    //add check code









    var userInfo = app.globalData.userInfo;

    var lotterydata = {
      id: that.data.lotteryid,

      endtime: util.formatTime(that.data.currentDate),
      days: 30,
      num: formData.giftnum,
      ownerid: 0,
      gift_name: formData.name,

      status: 0,
      goods_name: formData.instruction,

      ownername: userInfo.nickname,
      ownerpic: userInfo.headpic,
      remarks: "",
      mode: mode + 1,
      result: "",
      personas: "",
      parms: parms_json,
      participate: 0,
      count: 0,
      giftfrom: 1,
      appointment: 0,
      user_propagate: user_propagate_str,

    }

    if ((pic == null || pic.length == 0 || pic.indexOf("weiruikj.cn") != -1)) {

      lotterydata.goods_picture = pic;
      var url = that.baseApiUrl;


      if (that.data.isadd) {
        url += "/ziyoutechan/customer/adduserlottery?";
      } else {
        url += "/ziyoutechan/customer/updateuserlottery?";
      }




      url += "session=";
      url += app.globalData.session;






      util.ajax({
        "url": url,
        "data": lotterydata,
        success: function(data) {
          if (data.returncode == 0) {

            Toast.success("操作成功");



            wx.navigateBack({

            })

          }
        }
      })
    } else {

      var filePath = self.data.avatarUrl
      var Key = "tqxj_img_userlottery/" + "u" + userInfo.id + "_" + new Date().getTime()

      // 这里指定上传的文件名

      wxoss.postObject(
        filePath,
        Key,
        function() {
          lotterydata.goods_picture = "https://tqxjbu-1256942653.cos.ap-chengdu.myqcloud.com/" + Key;

          var url = that.baseApiUrl;

          if (that.data.isadd) {
            url += "/ziyoutechan/customer/adduserlottery?";
          } else {
            url += "/ziyoutechan/customer/updateuserlottery?";
          }

          url += "session=";
          url += app.globalData.session;

          util.ajax({
            "url": url,
            "data": lotterydata,
            success: function(data) {
              if (data.returncode == 0) {
                Toast.success("操作成功");

                setTimeout(function() {
                  wx.navigateBack({

                  })
                }, 500)

              }
            }
          })

        })

    }
  },
  bindHideKeyboard: function(e) {
    wx.hideKeyboard()
  },

  bindViewTap: function() {
    var that = this;
    wx.chooseImage({
      // 设置最多可以选择的图片张数，默认9,如果我们设置了多张,那么接收时//就不在是单个变量了,
      count: 1,
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res) {
        // 获取成功,将获取到的地址赋值给临时变量
        var tempFilePaths = res.tempFilePaths;


        var url = "../wxcropper/wxcropper?path=" + tempFilePaths + "&&vname=avatarUrl";



        wx.navigateTo({
          url: url,
        })
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
  },



  cleartext: function(e) {

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


  apply: function(e) {
    var self = this;
    var lottery = this.data.lottery;




    Dialog.confirm({
      title: "操作确认",
      message: "您确定抽奖内容无误并提交上线申请吗？(上线后将无法撤回或修改)"
    }).then(() => {

      var url = self.baseApiUrl;
      url += "/ziyoutechan/customer/setuserlotteryapply?";

      url += "session=";
      url += app.globalData.session
      url += "&&lotteryid=";
      url += lottery.id


      url += "&&apply=";
      url += 1
      util.ajax({
        url: url,

        method: "GET",
        success: function(data) {
          self.loaded();
          if (data.returncode == 0) {

            Toast.success("提交成功")

            setTimeout(function() {
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











  getData: function() {
    var url = this.baseApiUrl;
    url += "/ziyoutechan/customer/getlotterydetails?";

    url += "session=";
    url += app.globalData.session

    url += "&&lotteryid=";
    url += this.data.lotteryid

    var self = this;
    util.ajax({
      url: url,

      method: "GET",
      success: function(data) {
        self.loaded();
        if (data.returncode == 0) {

          var lottery = data.message.giftActivity;
          lottery.start_time = util.formatTime(lottery.start_time);
          lottery.end_time_str = util.formatTime(lottery.endtime);



          self.setData({

            'currentDate': new Date(lottery.endtime).getTime(),
          });

          self.setData({

            "chooseDateStr": lottery.end_time_str
          })

          var user_propagate = lottery.user_propagate;

          if (user_propagate != undefined && user_propagate != null && user_propagate.length > 0) {
            var user_propagate_json = JSON.parse(user_propagate);

            lottery.drawmode = user_propagate_json.drawmode
            self.setData({
              "lotterydrawindex": lottery.drawmode
            })

            lottery.drawvalue = user_propagate_json.drawvalue
            lottery.ownerphone = user_propagate_json.ownerphone
            lottery.propagatesetting = user_propagate_json.propagatesetting


          }


          if (lottery.mode == 2 || lottery.mode == 3) {
            var parms = JSON.parse(lottery.parms);

            lottery.chance = parms.chance
          } else if (lottery.mode == 4) {
            var parms = JSON.parse(lottery.parms);

            lottery.peoplenum = parms.num
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


          var lotterymodeindex = lottery.mode - 1;




          var result = lottery.result;

          if (result && result.length > 0) {
            lottery.result = JSON.parse(result);
          } else {
            lottery.result = [];
          }

          lottery.showmode = 0;

          self.setData({
            "lottery": lottery,
            "avatarUrl": lottery.goods_picture,
            lotterymodeindex: lotterymodeindex
          });

          self.getpropagatesettings();
        } else {
          util.notNetCon(self, 1, 1);
          self.error(data);
          return false;
        }
      }
    });
  },





  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
  tapName: function(e) {},
  onReady: function() {},
  onShow: function() {
    this.setData({
      page: {
        "load": 1
      }
    });
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })


    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },

  lotterymodeChange: function(e) {
    var lotterymodeindex = e.detail.value;
    this.setData({
      lotterymodeindex: lotterymodeindex
    })
  },

  propagatesettingIndexChange: function(e) {
    var propagatesettingIndex = e.detail.value;
    this.setData({
      propagatesettingIndex: propagatesettingIndex
    })
  },

  lotterydrawChange: function(e) {
    var lotterydrawindex = e.detail.value;
    this.setData({
      lotterydrawindex: lotterydrawindex
    })
  },

  lotteryspreadChange: function(e) {
    var lotteryspreadindex = e.detail.value;
    this.setData({
      lotteryspreadindex: lotteryspreadindex
    })
  },

})
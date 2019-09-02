function formatTime(datestr) {

  //考虑兼容 数字 

  if (datestr)
  {

    if (typeof (datestr) == 'string')
    {
      if (datestr.indexOf("-")!=0)
      {
        datestr = datestr.replace(new RegExp("-", "g"), "\/");
      }

      var date = new Date(datestr);

    
    }
    else{
      var date = new Date(datestr);
    }
    
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
  else{
    return "1970-01-01 00:00:00"
  }


  

  
  
}


function getTime(datestr) {

  //考虑兼容 数字 

  if (datestr) {

    if (typeof (datestr) == 'string') {
      if (datestr.indexOf("-") != 0) {
        datestr = datestr.replace(new RegExp("-", "g"), "\/");
      }

      var date = new Date(datestr);

      var datevalue = date.getTime();
    }
    else {
      var date = new Date(datestr);
    }

    


    return date.getTime();
  }
  else {
    return 0
  }






}

function formatTimeWithNyr(datestr) {

  if (datestr) {

    if (typeof (datestr) == 'string') {
      if (datestr.indexOf("-") != 0) {
        datestr = datestr.replace(new RegExp("-", "g"), "\/");
      }

      var date = new Date(datestr);

      
    }
    else {
      var date = new Date(datestr);
    }

    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return year + "年" + month + "月" + day + "日" 
  }
  else {
    return "1970-01-01 00:00:00"
  }

  
  

}


function formatTimeWithyrsf(datestr) {


  if (datestr) {

    if (typeof (datestr) == 'string') {
      if (datestr.indexOf("-") != 0) {
        datestr = datestr.replace(new RegExp("-", "g"), "\/");
      }

      var date = new Date(datestr);

      
    }
    else {
      var date = new Date(datestr);
    }

    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return +month + "月" + day + "日" + ' ' + [hour, minute].map(formatNumber).join(':')
  }
  else {
    return "1970-01-01 00:00:00"
  }

  
  




}

function formatDate(datestr) {

  if (datestr) {

    if (typeof (datestr) == 'string') {
      if (datestr.indexOf("-") != 0) {
        datestr = datestr.replace(new RegExp("-", "g"), "\/");
      }

      var date = new Date(datestr);

      
    }
    else {
      var date = new Date(datestr);
    }

    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()




    return [year, month, day].map(formatNumber).join('-')
  }
  else {
    return "1970-01-01"
  }


  
}

function formatDiff(startData, endData) {}

function deleteqiniupics(pics) {


  
  var url = baseurl();;
  //url += "/ziyoutechan/customer/deleteqiniupics?";
  url += "/ziyoutechan/customer/deletewxosspics?";
  url += "session=";
  url += getApp().globalData.session

  var data = {
    pics: pics
  }


  var self = this;
  ajax({
    "url": url,
    "data": data,
    ContentType: "application/x-www-form-urlencoded",
    method: "POST",

    "success": function(data) {

      if (data.returncode == 0) {

      }
    }
  });
}

/* 毫秒级倒计时 */
function countdown(that, total_micro_second) {

  if (total_micro_second <= 0 || isNaN(total_micro_second)) {
    that.setData({
      clock: [0, 0, 0].map(formatNumber)
    });
    if (that.timer != undefined) {
      clearTimeout(that.timer);
    }
    // timeout则跳出递归
    return;
  } else {
    // 渲染倒计时时钟
    that.setData({
      clock: dateformat(total_micro_second)
    });
  }

  that.timer = setTimeout(function() {
    // 放在最后--
    total_micro_second -= 60;
    countdown(that, total_micro_second);
  }, 60);

}


/* 毫秒级倒计时 */
function countdownWithTimer(that, timer, total_micro_second, clock) {

  if (total_micro_second <= 0 || isNaN(total_micro_second)) {
    that.setData({
      clock: [0, 0, 0].map(formatNumber)
    });
    if (timer != undefined) {
      clearTimeout(timer);
    }
    // timeout则跳出递归
    return;
  } else {
    // 渲染倒计时时钟
    that.setData({
      [clock]: dateformat(total_micro_second)
    });
  }

  timer = setTimeout(function() {
    // 放在最后--
    total_micro_second -= 60;
    countdownWithTimer(that, timer, total_micro_second, clock);
  }, 60);

}

function remove_array(array, index) {
  for (var i = 0; i < array.length; i++) {
    var temp = array[i];
    if (!isNaN(index)) {
      temp = i;
    }
    if (temp == index) {
      for (var j = i; j < array.length; j++) {
        array[j] = array[j + 1];
      }
      array.length = array.length - 1;
    }
  }
  return array;
}

/** 
 *多个定时器
 */
function countdowns(that, total_micro_seconds) {
  var clock = [];
  for (var i = 0; i < total_micro_seconds.length; i++) {
    var total_micro_second = total_micro_seconds[i];
    if (total_micro_second <= 0 || isNaN(total_micro_second)) {
      clock[i] = [0, 0, 0].map(formatNumber);
      // that.setData({
      //   clock:[0, 0, 0].map(formatNumber)
      // });
      if (that.timer != undefined) {
        total_micro_seconds = remove_array(total_micro_seconds, i);
        that.setData({
          groups: {
            "goods_groups": remove_array(that.data.lists, i),
            "groups": that.data.lists.length
          }
        });
      }
      // timeout则跳出递归
      continue;
    } else {
      clock[i] = dateformat(total_micro_second);
    }
  }

  that.setData({
    clock: clock
  });

  if (total_micro_seconds.length < 1) {
    if (that.timer != undefined) {
      clearTimeout(that.timer);
    }
  }


  that.timer = setTimeout(function() {
    var temp_array = [];
    for (var i = 0; i < total_micro_seconds.length; i++) {
      var total_micro_second = total_micro_seconds[i] - 60;
      temp_array[i] = total_micro_second;
    }

    countdowns(that, temp_array);
  }, 60);
}

// 时间格式化输出，如3:25:19 86。每10ms都会调用一次
function dateformat(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);

  // 分钟位
  var min = Math.floor((second - hr * 3600) / 60);

  // 秒位
  var sec = (second - hr * 3600 - min * 60); // equal to => var sec = second % 60;

  // 毫秒位，保留2位
  var micro_sec = Math.floor((micro_second % 1000) / 10);

  return [hr, min, sec].map(formatNumber);
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}


function ajax(obj) {

  checkNet({
    success: function() {
      var endtime = undefined;

      var returnType = {
        'json': "Content-Type': 'application/json",
      };
      if (undefined == obj.returnType) {
        obj.returnType = 'json';
      }
      var returnType = obj.returnType;

      var starttime = new Date().getTime();
      var refreshcall = null;
      var currentpage = null;

      var page = getCurrentPages();

      if (page.length >= 1) {

        currentpage = page[page.length - 1];

        refreshcall = currentpage.refresh;
      } else {

      }
      wx.request({
        url: obj.url,
        data: obj.data || [],
        method: obj.method || "GET",
        header: {
          "Content-Type": obj.ContentType || "application/json"
        },
        success: function(data) {





          endtime = new Date().getTime();
          console.warn('Info : ' + " Url : " + obj.url + " Time : " + (endtime - starttime) / 1000 + "s");
          if (data.statusCode == 200) {
            var data_core = data.data;
            if (config('appLog')) {
              console.log(data_core);
            }

            if (data_core.returncode != 0) {
              var page = getCurrentPages();
              //用户 token过期，自动登录
              if (data_core.returncode == 1001) {
                // 目前只处理session异常，其他需要分别处理
                wx.removeStorageSync('session');




                getApp().login(
                  refreshcall
                );

                return false; //不执行，回调
              }

              //return false;
            }

            obj.success(data_core);
          } else {

            if (currentpage && currentpage.data) {

              currentpage.setData({

                "pageInit": 1,

              });

              wx.showToast({
                title: '获取数据失败',
              })

            }
             
            console.error("Mes : " + "_状态码: " + data.statusCode + ' ERR: Args : ' + JSON.stringify(obj.data) + " Url : " + obj.url + " Time : " + (endtime - starttime) / 1000 + "s");
          }
        },
        fail: function($data) {

          if (currentpage && currentpage.data) {
            currentpage.setData({

              "pageInit": 1,

            });

          }
          endtime = new Date().getTime();
          console.error('ERR: Args : ' + JSON.stringify(obj.data) + " Url : " + obj.url + " Time : " + (endtime - starttime) / 1000 + "s");

          notNetCon(page[(page.length - 1) >= 0 ? (page.length - 1) : 0], 1, 1);

          var info = {
            'result': 'fail',
            'error_info': config('error_text')[0]
          };
          if (typeof obj.error == "function") {
            obj.error(info);
          } else {
            page[(page.length - 1) >= 0 ? (page.length - 1) : 0].error(info);
          }
        }
      })
    },
    error: function() {
      var page = getCurrentPages();
      notNetCon(page[(page.length - 1) >= 0 ? (page.length - 1) : 0], 0);
    }
  });


}

function config(name) {
  var obj = require('../config')
  if (name) {
    return obj.config()[name];
  } else {
    return obj.config();
  }

}

function baseurl() {
  var obj = require('../config')
  if (obj.config()["appDebug"]) {
    return obj.config()["baseDebugApiUrl"];
  } else {
    return obj.config()["baseApiUrl"];
  }

}

function wxpay(self) {




  var url = baseurl();
  url += "/ziyoutechan/pay/prepay";
  var app = require('../app')

  var data = {
    "session": self.session,
    "orderid": self.order_id
  };

  var order_id = self.order_id;

  ajax({
    "url": url,
    "method": "GET",
    "data": data,
    "success": function(data) {
      if (data.returncode == 0) {

        var packageStr = "prepay_id=" + data.message.prepay_id;
        wx.requestPayment({
          'timeStamp': data.message.timeStamp,
          'nonceStr': data.message.nonceStr,
          'package': packageStr,
          'signType': 'MD5',
          'paySign': data.message.paySign,
          'success': function(res) {


            payOk(self.session, self.order_id);



          },
          'fail': function($data) {
            self.setData({
              "btn_order_done": false
            });
            if ($data.errMsg == "requestPayment:fail cancel") {
              //用户取消支付
              if (self.route == "pages/checkout") {
                self.error({
                  "result": 'fail',
                  "error_info": '支付未完成， 请重新支付'
                });
                self.setData({
                  'cancel_pay': 1
                });
              }

            } else {
              self.error({
                "result": 'fail',
                "error_info": $data.errMsg
              });
            }
          }
        })
      } else if (data['result'] == "fail") {
        data.url = 'orders';
        self.error(data);
      } else {
        var data = {
          "result": 'fail',
          "error_info": '支付异常,请联系客服完成订单。'
        };
        self.setData({
          "btn_order_done": false
        });
        self.error(data);
      }
    }
  });
}

function wxlogin(that) {
  if (wx.getStorageSync('token')) {
    return true;
  }
  console.log("auto login");
  if (that.__route__ == "pages/personal") return false;
  wx.login({
    success: function(res) {
      if (res.code) {
        var url = config('baseApiUrl') + "?g=api&m=WeApp&a=login&code=" + res.code;
        ajax({
          "url": url,
          "method": "GET",
          "success": function(data) {
            var token = data.token;
            var value = wx.getStorageSync('token')
            while (!value) wx.setStorageSync('token', token);
            if (typeof(that.refresh) == "function") {
              that.refresh();
            } else {
              that.error({
                "result": "fail",
                "error_info": "登录已经过期,请重新登录。",
                "url": "personal"
              });
            }

          }
        })
      }
    }
  });
}

//util.js 
function imageUtil(e) {
  var imageSize = {};
  var originalWidth = e.detail.width; //图片原始宽 
  var originalHeight = e.detail.height; //图片原始高 
  var originalScale = originalHeight / originalWidth; //图片高宽比 
  //console.log('originalWidth: ' + originalWidth) 
  //console.log('originalHeight: ' + originalHeight) 
  //获取屏幕宽高 
  wx.getSystemInfo({
    success: function(res) {
      var windowWidth = res.windowWidth;
      var windowHeight = res.windowHeight;
      var windowscale = windowHeight / windowWidth; //屏幕高宽比 
      //console.log('windowWidth: ' + windowWidth) 
      //console.log('windowHeight: ' + windowHeight) 
      if (originalScale < windowscale) { //图片高宽比小于屏幕高宽比 
        //图片缩放后的宽为屏幕宽 
        imageSize.imageWidth = windowWidth;
        imageSize.imageHeight = (windowWidth * originalHeight) / originalWidth;
      } else { //图片高宽比大于屏幕高宽比 
        //图片缩放后的高为屏幕高 
        imageSize.imageHeight = windowHeight;
        imageSize.imageWidth = (windowHeight * originalWidth) / originalHeight;
      }

    }
  })
  //console.log('缩放后的宽: ' + imageSize.imageWidth) 
  //console.log('缩放后的高: ' + imageSize.imageHeight) 
  return imageSize;
}


function loadding(self, operate) {
  if (!operate) {
    operate = 0;
  }

  self.setData({
    page: {
      "load": 0,
      "operate": operate
    }
  });
}

function loaded(self) {
  self.setData({
    page: {
      "load": 1,
      "operate": 0
    }
  });
}

function toast(self, mess) {
  self.setData({
    "toast": {
      "toast": 1,
      "mess": mess
    }
  });
  setTimeout(function() {
    self.setData({
      "btn_order_done": false
    });
    self.setData({
      "toast": {
        "toast": 0,
        "mess": ''
      }
    });
  }, 2000);
}

function notNetCon(self, type = 1, is_ajax = 0) {
  if (!type) {
    toast(self, "网络不太顺畅哦,请重新加载");
  } else {
    self.setData({
      'notNetCon': {
        show: 1,
        error: type,
        is_ajax: is_ajax
      }
    });
  }

  loaded(self);
}

function succNetCon(self) {
  if (self.data.notNetCon && self.data.notNetCon.error && self.data.notNetCon.show) loadding(self);

  self.setData({
    'notNetCon': {
      show: 0,
      error: 0
    }
  });
}

function checkNet(obj = {}) {
  wx.getNetworkType({
    success: function(res) {
      var networkType = res.networkType
      if (networkType == "none") {

        if (obj.error != undefined) {
          obj.error();
        }
      } else {
        if (obj.success != undefined)
          obj.success();

      }
    },
    error: function(res) {

      console.log('获取网络类型失败');
    }
  })
}

function redirect(url, isNew = 0) {
  if (!url) {
    wx.navigateBack();
  }

  if (url == 'page/index' || url == 'page/orders' || url == 'page/groups' || url == 'page/personal') {
    wx.switchTab({
      url: url
    })
  } else {
    if (isNew) {
      wx.navigateTo({
        url: url
      })
    } else {
      wx.redirectTo({
        url: url
      })
    }
  }
}

function payOk(session, order_id) {
  var that = this

  var url = baseurl();
  url += "/ziyoutechan/pay/payok?";

  url += "session=";
  url += session;
  url += "&&orderid=";
  url += order_id



  wx.request({

    url: url,
    success: function(res) {
      console.log(res.data)

      wx.showToast({
        title: '支付完成',
        duration: 1500
      })
      setTimeout(function() {
        paySuccessRedirect(session, order_id);
      }, 1000)

    }
  })
}

/**
 *支付完成 回调
 */
function paySuccessRedirect(session, order_id) {
  var that = this

  var url = baseurl();
  url += "/ziyoutechan/customer/getorder?";

  url += "session=";
  url += session;
  url += "&&orderid=";
  url += order_id

  ajax({
    url: url,

    method: "GET",
    success: function(data) {
      if (data.returncode == 0) {
        if (data.message.groupOrderId && data.message.groupOrderId != '0') {
          wx.redirectTo({
            'url': '../order/order?id=' + order_id
          });
        } else {
          wx.redirectTo({
            'url': '../order/order?id=' + order_id
          });
        }
      } else {
        wx.redirectTo({
          'url': '../orders/orders'
        });
      }

    }
  });
}

/***
 * wxAutoImageCal 计算宽高
 * 
 * 参数 e: iamge load函数的取得的值
 * 返回计算后的图片宽高
 * {
 *  imageWidth: 100px;
 *  imageHeight: 100px;
 * }
 */
function wxAutoImageCal(e) {
  //console.dir(e);
  //获取图片的原始长宽
  var originalWidth = e.detail.width;
  var originalHeight = e.detail.height;
  var windowWidth = 0,
    windowHeight = 0;
  var autoWidth = 0,
    autoHeight = 0;
  var results = {};
  wx.getSystemInfo({
    success: function(res) {
      //console.dir(res);
      windowWidth = res.windowWidth;
      windowHeight = res.windowHeight;
      //判断按照那种方式进行缩放
      //console.log("windowWidth"+windowWidth);
      if (originalWidth > windowWidth) { //在图片width大于手机屏幕width时候
        autoWidth = windowWidth;
        // console.log("autoWidth"+autoWidth);
        autoHeight = (autoWidth * originalHeight) / originalWidth;
        // console.log("autoHeight"+autoHeight);
        results.imageWidth = autoWidth;
        results.imageheight = autoHeight;
      } else { //否则展示原来的数据
        results.imageWidth = originalWidth;
        results.imageheight = originalHeight;
      }
    }
  })
  return results;
}

function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

module.exports = {
  formatTime: formatTime,
  formatTimeWithNyr: formatTimeWithNyr,
  formatDate: formatDate,
  ajax: ajax,
  config: config,
  formatDiff: formatDiff,
  countdown: countdown,
  countdownWithTimer: countdownWithTimer,
  wxpay: wxpay,
  wxlogin: wxlogin,
  imageUtil: imageUtil,
  loadding: loadding,
  loaded: loaded,
  toast: toast,
  checkNet: checkNet,
  notNetCon: notNetCon,
  succNetCon: succNetCon,
  redirect: redirect,
  countdowns: countdowns,
  paySuccessRedirect: paySuccessRedirect,
  wxAutoImageCal: wxAutoImageCal,
  baseurl: baseurl,
  deleteqiniupics: deleteqiniupics,
  formatTimeWithyrsf: formatTimeWithyrsf,
  getTime: getTime,
  compareVersion: compareVersion
}
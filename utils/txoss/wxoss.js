var COS = require('cos-wx-sdk-v5');
var util = require('../util.js')
var config = {
  Bucket: 'tqxjbu-1256942653',
  Region: 'ap-chengdu'
};

var baseurl = util.baseurl();


var getAuthorization = function(options, callback) {

  var url = baseurl + "/ziyoutechan/system/gettxosskey"
    // 方法一、后端通过获取临时密钥给到前端，前端计算签名
  util.ajax({
    "url": url,
    "method": "GET",
    "success": function (data) {
      if (data.returncode == 0) {

        var data = JSON.parse(data.extramsg).data;
        callback({
          TmpSecretId: data.credentials && data.credentials.tmpSecretId,
          TmpSecretKey: data.credentials && data.credentials.tmpSecretKey,
          XCosSecurityToken: data.credentials && data.credentials.sessionToken,
          ExpiredTime: data.expiredTime,
        });

      } else {
        wx.showToast({
          title: '获取临时密匙失败',
        })
      }
    }
  });


    // // 方法二、后端通过获取临时密钥，并计算好签名给到前端
    // wx.request({
    //   url: 'https://example.com/server/sts-auth.php',
    //   data: {
    //     method: options.Method,
    //     pathname: options.Key,
    //   },
    //   dataType: 'json',
    //   success: function(result) {
    //     console.log(result);
    //     var data = result.data;
    //     callback({
    //       Authorization: data.Authorization,
    //       XCosSecurityToken: data.XCosSecurityToken, // 如果是临时密钥计算出来的签名，需要提供 XCosSecurityToken
    //     });
    //   }
    // });

    // // 方法三、前端使用固定密钥计算签名（适用于前端调试）
    // var authorization = COS.getAuthorization({
    //     SecretId: 'AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    //     SecretKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    //     Method: options.Method,
    //     Key: options.Key,
    //     Query: options.Query,
    //     Headers: options.Headers,
    //     Expires: 60,
    // });
    // callback(authorization);
};

var cos = new COS({
    getAuthorization: getAuthorization,
});



// 展示的所有接口
var dao = {
    
    // 上传文件
    postObject: function(path,key,callback) {

      cos.postObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        FilePath: path,

        onProgress: function (info) {
          console.log(JSON.stringify(info));
        }
      }, function (err, data) {
        console.log(err || data);
        if (err && err.error) {
          wx.showModal({
            title: '返回错误',
            content: '请求失败：' + (err.error.Message || err.error) + '；状态码：' + err.statusCode,
            showCancel: false
          });
        } else if (err) {
          wx.showModal({
            title: '请求出错',
            content: '请求出错：' + err + '；状态码：' + err.statusCode,
            showCancel: false
          });
        } else {
          if (callback && typeof callback === "function") {
            callback();
          }
        }
      });
        
    }
};

module.exports = dao;
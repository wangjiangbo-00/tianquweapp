var util = require('../../utils/util.js')
var WxParse = require('../../utils/wxParse/wxParse.js');
var app = getApp();
Page({
  data:{
      "URL" : 4,
    "userInfo": util.config('userInfo'),
    "pageName": "问题详情"
        
      
  },
  onLoad:function(options){
    var self = this;
    app.setRecommender(options);
    this.getConfig();
    app.checkNavbar(this);
    var question= wx.getStorageSync("currentquestion");

    wx.removeStorageSync("currentquestion")

    if (question)
    {
      var wxParseData = WxParse.wxParse('answer', 'html', question.answer, this, 0)

      this.setData({ wxParseData: wxParseData, question: question });

      util.loaded(this);
    }
    else
    {
      if(options && options.id)
      {

        var id = options.id;
        var cid = options.cid;

        var questions = wx.getStorageSync('questions');

        this.checkquestions(function(){
          var questions = self.data.questions;

          var bfcid = false;

          for(var i=0;i<questions.length;i++)
          {
            if (questions[i].catid == cid)
            {
              var questionList = questions[i].questionList;
              for (var j = 0; j < questionList.length;j++)
              {
                if (questionList[j].id == id)
                {
                  var question = questionList[j];

                  var wxParseData = WxParse.wxParse('answer', 'html', question.answer, self, 0)

                  self.setData({ wxParseData: wxParseData, question: question });

                  util.loaded(self);
                }
              }
            }
          }





        });



      }
    }


    

    // 页面初始化 options为页面跳转所带来的参数
  },


  checkquestions: function (func) {

    var self = this;

    var data_version = wx.getStorageSync('question_version') ? wx.getStorageSync('question_version'):-1;

    var url = this.baseApiUrl;
    url += "/ziyoutechan/system/getQuestionVerison?";

    url += "session=";
    url += app.globalData.session

    var questions = [];


    util.ajax({
      "url": url,
      "data": {},
      success: function (data) {
        util.loaded(self);
        if (data.returncode == 0) {

          if (data.extramsg != data_version) {
            self.questions(func);
            wx.setStorageSync('question_version', data.extramsg);

          } else {
            questions = wx.getStorageSync('questions');
            if (questions) {

              self.setData({ questions: questions });

              func();

            } else {
              self.questions(func);
              
            }
          }
        }
      },
      error: function (res) {
        //console.log("网络错误");
        util.loaded(self);
      }
    });

  },

  questions: function (func) {
    util.loadding(this);
    var self = this;

    var url = this.baseApiUrl;
    url += "/ziyoutechan/system/getallquestions?";


    util.ajax({
      "url": url,
      "data": {},
      success: function (data) {
        util.loaded(self);
        if (data.returncode == 0) {

          var questions = data.lists;
          self.setData({ questions: questions });

          func();

          wx.setStorageSync('questions', questions);

        }
      },
      error: function (res) {
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

    this.setData({ 'pullload_text': util.config('pullload_text') });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function() {
    
     
  },
 
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  me:function(){
     
     this.baseApiUrl = util.baseurl();
     var self = this;
    
  },
  clearCache:function(){
    wx.clearStorageSync();
  },
  login:function(){
    var self = this;
    var code = '';
    var token = wx.getStorageSync('token');
    getApp().login(token);
    
    self.me(token);
  },
   error:function(data) {
    this.setData({page : {load : 1}});
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    }
  },
 
  scroll : function(data) {
  },
  
  toOrder : function(e) {
    wx.setStorageSync('order_type',e.currentTarget.dataset.type);  
    wx.switchTab({url : "orders"});
  },
  toGroup : function(e) {
    wx.setStorageSync('groups_type',1);  
    wx.switchTab({url : "groups"});
  }
})
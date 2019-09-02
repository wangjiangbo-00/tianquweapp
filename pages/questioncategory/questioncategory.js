var util = require('../../utils/util.js')
var app = getApp();
Page({
  data:{
      "URL" : 4,
    "questions": [],
    "pageName": "问题分类"
        
      
  },
  onLoad:function(options){
    app.setRecommender(options);
    this.getConfig();
    app.checkNavbar(this);
    this.me();

    // 页面初始化 options为页面跳转所带来的参数
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

    var self = this;
     
    var data_version = wx.getStorageSync('question_version');

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
            self.questions();
            wx.setStorageSync('question_version', data.extramsg);
            
          } else {
            questions = wx.getStorageSync('questions');
            if (questions) {
              
              self.setData({ questions: questions });
        
            } else {
              self.questions();
              questions = this.regions_data;
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

  questions: function (e) {
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

          wx.setStorageSync('questions', questions);

        }
      },
      error: function (res) {
      }
    });
  },
  clearCache:function(){
    wx.clearStorageSync();
  },

  toQuestions: function (e) {
    var index = e.currentTarget.dataset.index;
    var questionlist = this.data.questions[index];

    wx.setStorageSync("currentquestionlist", questionlist)
    wx.navigateTo({
      url: '../questions/questions',
    })
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
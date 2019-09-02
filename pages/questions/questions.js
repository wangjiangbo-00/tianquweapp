var util = require('../../utils/util.js')
var app = getApp();
Page({
  data:{
      "URL" : 4,
    "userInfo": util.config('userInfo'),
    "pageName": "问题列表"
        
      
  },
  onLoad:function(options){
    app.setRecommender(options);
    this.getConfig();
    app.checkNavbar(this);
    var questions= wx.getStorageSync("currentquestionlist");

    wx.setNavigationBarTitle({
      title: questions.catname,
    })

    this.setData({ questionlist: questions.questionList });
     
    util.loaded(this);

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
  
  toQuestionDetail : function(e) {

    var index = e.currentTarget.dataset.index;
    var question = this.data.questionlist[index];

    wx.setStorageSync("currentquestion", question)
    wx.navigateTo({
      url: '../questiondetails/questiondetails',
    })
    
  },
  toGroup : function(e) {
    wx.setStorageSync('groups_type',1);  
    wx.switchTab({url : "groups"});
  }
})
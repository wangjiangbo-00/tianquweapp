var util = require('../../utils/util.js')
const app = getApp()
Page({
  data:{
      "URL" : 3,
      "is_over" : false,
      "no_data" : false,
    needrefresh:false,
    "scroll_items": false,
    "pageName": "文章列表",
    "nothing_text": "您还没有添加过文章",

    // text:"这是一个页面"
  },
  onLoad:function(options) {
    this.is_onload = 1;
    app.setRecommender(options);
    this.options = options;

   
    this.getConfig();
    app.checkNavbar(this);

    var viewmode = options.viewmode != undefined ? parseInt(options.viewmode) : 0;
    var goodsid = options.goodsid != undefined ? parseInt(options.goodsid) : 0;

    var shopid = options.shopid != undefined ? parseInt(options.shopid) : 0;

    this.setData({
      
      "viewmode": viewmode,
      "goodsid": goodsid,
      "shopid": shopid,
    });
    


    var self = this;
      util.checkNet({
        success : function() {
        util.succNetCon(self);
      
          var scroll_items = self.getData();//token,this.offset,this.size
      },
      error : function() {
        util.notNetCon(self);
      }
    });

    
  },
  addacticle:function(){

    var url = "../articleedit/articleedit?id=0&&withdraft=0";

    var viewmode = this.data.viewmode;

    url += "&&viewmode="
    url += viewmode

    if (viewmode == 1)
    {
      url += "&&goodsid="
      url += this.data.goodsid
    }
    else
    {
      url += "&&shopid="
      url += this.data.shopid
    }

    

    wx.navigateTo({
      url: url,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })

  },
  //配置方法
  getConfig:function() {
     var token = wx.getStorageSync('token');
     this.baseApiUrl = util.baseurl(); 
     this.size = util.config('page_size');
    this.size = 5;
     this.offset = util.config('page_offset');
     this.token = token;
     this.page = 1;

     this.setData({'pullload_text' : util.config('pullload_text')});
  },
  gotoarticle:function(e){
    
    var id = e.detail.id;


    var url = "../articleshow/articleshow?id=" + id;
    url += "&&previewdraft=0"
    url += "&&viewmode="
    url += this.data.viewmode
    wx.navigateTo({
      url: url,
    })

  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow: function( e ) {
    if(this.data.needrefresh)
    {
      this.setData({
        needrefresh:false
      })
      this.refresh(1);
      
    }

    
  },
  pullDown: function( e ) {
    if (this.data.is_over == 1) return false;
    this.setData({"pullDown" : 1});
    if(!this.data.is_over) {
      this.page = this.page + 1;
      this.getData();  
    }
  },
  pullUpLoad: function(e) {
  },
  getData:function(isclear=0) {
    if(this.data.is_over == 1) return false;


    var offset = (this.page - 1) ;
    var article_status = this.article_status;
    var size = this.size;

    var viewmode = this.data.viewmode
    

    if (viewmode == 0)
    {
      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getcustomerarticles?";
    }
    else if (viewmode == 1)
    {
      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getgoodsarticles?";
    }

    else if (viewmode == 2) {
      var url = this.baseApiUrl;
      url += "/ziyoutechan/customer/getshoparticles?";
    }
    

    url += "session=";
    url += app.globalData.session

    
    var data = {
      "offset" : offset,
      "size" : size,
      
    };

    if (viewmode == 1)
    {
      data.goodsid = this.data.goodsid;
    }
    else if (viewmode == 2)
    {
      data.shopid = this.data.shopid;
    }
    
    var self = this;
     util.ajax({
        url : url,
        data : data,
        method : "GET",
        success : function(data){
            self.loaded();
            if (data.returncode == 0) {

              var article_list = data.lists; 
              
              var articles =  article_list.map(function (article) {
                article.modifytime = util.formatDate(article.modifytime );
                var draft = wx.getStorageSync("draft" + article.id);
                if (draft)
                {
                  article.hasdraft = true
                  article.draft = draft
                }
                else
                {
                  article.hasdraft = false
                  article.draft = null;
                }

                if(viewmode == 0)
                {
                  if (article.ispublic == 1) {
                    article.publicstr = "公开文章"
                  }
                  else {
                    article.publicstr = "私密文章"
                  }
                }
                else{
                  article.publicstr = "";
                }


                
                    return article;
                });

              var allData = '';
              var agoData = isclear ? false : self.data.scroll_items;
              
              if(articles.length != 0) {
                  
                 if(agoData) {
                      allData = agoData;
                      articles.map(function(article) {
                        allData.push(article);
                      });
                 } else {
                   allData = articles;
                 }
                self.setData({
                  "scroll_items" : allData
                });

                
                if(articles.length < self.size) {
                  self.setData({
                    "is_over" : 1,
           
                  });
                }
                
              }  else {
                if (!agoData) {

                  self.setData({
                    scroll_items: []

                  });
                  self.setData({
                    "is_over": 1,
                    "no_data": 1
                  });
                }
                else {
                  self.setData({
                    scroll_items: agoData

                  });
                  self.setData({
                    "is_over": 1,

                  });
                }
              }               
            } else {
               self.error(data);
               return false;
            }
        }
     });
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  
  
  cleardraft: function (e) {
    var self = this;
    var index = e.currentTarget.dataset.index;

    var id = e.currentTarget.dataset.id;

    var draft = wx.getStorageSync("draft" + id);

    this.deletedraftpics(id, draft);

    if (draft) {
      wx.showModal({
        title: '删除草稿',
        content: '请确认您准备放弃草稿内容',
        showCancel: false,
        success: function (e) {

          wx.removeStorageSync("draft" + id);

          self.refresh(1);
          
        }
      })
      
    }
    else
    {
      wx.showToast({
        title: '没有对应草稿',
      })
    }
  },

  previewdraft: function (e) {
    var index = e.currentTarget.dataset.index;

    var id = e.currentTarget.dataset.id;

    var drafts = wx.getStorageSync("drafts");

    var url = "../articleshow/articleshow?id=" + id;

    url +="&&previewdraft=1"
    url += "&&viewmode=0"
    wx.navigateTo({
      url: url,
    })
  },

  editdraft: function (e) {
    var index = e.currentTarget.dataset.index;

    var id = e.currentTarget.dataset.id;

    

    var url = "../articleedit/articleedit?id=" + id;

    url += "&&withdraft=1"

    wx.navigateTo({
      url: url,
    })
  },

  editarticle: function (e) {
    var index = e.currentTarget.dataset.index;

    var id = e.currentTarget.dataset.id;

  
    var self = this;
    var draft = wx.getStorageSync("draft" + id);
    if (draft) {
      wx.showModal({
        title: '删除草稿',
        content: '请确认您准备放弃草稿内容重新编辑',
        
        success:function(e){

          if(e.confirm)
          {
            
            if (draft){

              self.deletedraftpics(id,draft);

              wx.removeStorageSync("draft" + id)

            }
            var url = "../articleedit/articleedit?id=" + id;

            url += "&&withdraft=0"

            wx.navigateTo({
              url: url,
            })
            
          }
          
        }
      })
    }
    else{
      var url = "../articleedit/articleedit?id=" + id;

      url += "&&withdraft=0"

      wx.navigateTo({
        url: url,
      })
    }

    

  },


  deletedraftpics: function (id,draft) {
    
    var self = this;

          if (draft) {
            var pics = [];
            
            if (draft.contents) {
              for (var i = 0; i < draft.contents.length; i++) {
                var content = draft.contents[i];
                if (content.type == 2) {

                  pics.push(content.content)

                }
              }
            }

            if (pics || draft.coverpic)
            {
              var url = self.baseApiUrl;
              url += "/ziyoutechan/customer/deletedraftpics?";

              url += "session=";
              url += app.globalData.session
            
            var data = {
              cover: draft.coverpic,
              articleid:id,
              pics:pics
            }

              util.ajax({
                url: url,
                "data": data,
                ContentType: "application/x-www-form-urlencoded",
                method: "POST",
                
                success: function (data) {
                  self.loaded();
                  if (data.returncode == 0) {

                    

                  } else {
                    self.error(data);
                    return false;
                  }
                }
              });
            }
          }

  },


  deletearticle: function (e) {
    var self = this;
    var index = e.currentTarget.dataset.index;

    var id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '删除文章',
      content: '删除文章后将无法恢复，请确认',
      
      success: function (e) {
        if (e.confirm) {

          //移除所有草稿图片
          var draft = wx.getStorageSync("draft" + id);

          if(draft)
          {
            var pics = [];
            if(draft.coverpic)
            {
              pics.push(draft.coverpic.substring(draft.coverpic.indexOf('.com') + 5, draft.coverpic.length))
            }
            if(draft.contents)
            {
              for(var i=0;i<draft.contents.length;i++)
              {
                var content = draft.contents[i];
                if (content.type == 2) {
                 
                    pics.push(content.content.substring(content.content.indexOf('.com') + 5, content.content.length))
                  
                }
              }
            }

            util.deleteqiniupics(pics);
          }

          wx.removeStorageSync("draft" + id);


          

          var url = self.baseApiUrl;
          url += "/ziyoutechan/customer/deletearticle?";

          url += "session=";
          url += app.globalData.session
          url += "&&articleid=";
          url += id
          
          util.ajax({
            url: url,
            
            method: "GET",
            success: function (data) {
              self.loaded();
              if (data.returncode == 0) {

                wx.showToast({
                  title: '删除成功',
                })
                self.refresh(1);

              } else {
                self.error(data);
                return false;
              }
            }
          });

        }
      }
    })
  },

  setunpublic: function (e) {
    var self = this;
    var index = e.currentTarget.dataset.index;

    var id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '设为私密',
      content: '设为不公开后，别人将无法阅读您的美文喽',
      showCancel: false,
      success: function (e) {
        if (e.confirm) {
          var url = self.baseApiUrl;
          url += "/ziyoutechan/customer/setarticlepublic?";

          url += "session=";
          url += app.globalData.session
          url += "&&articleid=";
          url += id


          url += "&&ispublic=";
          url += 0
          util.ajax({
            url: url,
            
            method: "GET",
            success: function (data) {
              self.loaded();
              if (data.returncode == 0) {

                wx.showToast({
                  title: '设置成功',
                })
                self.refresh(1);

              } else {
                self.error(data);
                return false;
              }
            }
          });

        }
      }
    })
  },


  setpublic: function (e) {
    var self = this;
    var index = e.currentTarget.dataset.index;

    var id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '公开文章',
      content: '公开文章后，记得分享给好友阅读哦',
      showCancel: false,
      success: function (e) {
        if (e.confirm) {
          var url = self.baseApiUrl;
          url += "/ziyoutechan/customer/setarticlepublic?";

          url += "session=";
          url += app.globalData.session
          url += "&&articleid=";
          url += id


          url += "&&ispublic=";
          url += 1
          util.ajax({
            url: url,

            method: "GET",
            success: function (data) {
              self.loaded();
              if (data.returncode == 0) {

                wx.showToast({
                  title: '设置成功',
                })
                self.refresh(1);

              } else {
                self.error(data);
                return false;
              }
            }
          });

        }
      }
    })
  },
  
  loadding:function() {
    util.loadding(this);
 },
 loaded : function() {
    util.loaded(this);
 },
 error:function(data) {
    this.loaded();
    //如果是 查询物流信息出错 不显示弹窗
    if(data.error_code == '41001') {
        this.setData({
          'express' : {
          "loading" : false,"error" : 1,"info" : util.config('error_text')[8]}
        });
        return true;
    }
    
    if(data['result'] == 'fail') {
       util.toast(this,data.error_info);
    } 
  },

  //初始化数据
  refresh:function(isclear=0) {
    var self = this;
    util.checkNet({
      success : function() {
         util.succNetCon(self);
         

        //是否清空已有数据
        if(isclear) {
          util.loadding(self);
          self.setData({ 'is_over': 0,'no_data' : 0,'pullDown' : 0});
          self.page = 1;
          self.setData({'scroll_items' : false});
          self.getData();
        } else {
          //加载数据完毕后，重载新数据
          if(self.page == 1) {
            self.setData({ 'is_over': 0,'no_data' : 0,'pullDown' : 0});
            self.getData(1);
          }
        }

        self.article_id = undefined;
         
      },
      error : function() {
        util.notNetCon(self,0);
      }
    });
  },  
  
})
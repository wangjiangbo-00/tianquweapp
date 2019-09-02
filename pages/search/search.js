var util = require('../../utils/util.js')

const app = getApp()

Page({
    data: {
        load_more_count: 0,
        last_load_more_time: 0,
        is_loading: !1,
        loading_class: "",
        cat_id: !1,
        keyword: !1,
        page: 1,
        limit: 20,
        goods_list: [],
        show_history: !0,
        show_result: !1,
        history_list: [],
      is_search: !0,
      "pageName": "搜索商品"
    },
  onLoad: function (options) {
      this.getConfig();
    app.checkNavbar(this);
    this.setData({
      navH: app.globalData.navHeight
    })
      app.setRecommender(options);
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
    onReady: function() {},
    onShow: function() {
        //app.pageOnShow(this);
        this.setData({
            history_list: this.getHistoryList(!0)
        });
    },

  onShareAppMessage: function () { return getApp().share({ title: "", desc: "", path: "pages/search/search?useless=0" }); },
    inputFocus: function() {
        this.setData({
            show_history: !0,
            show_result: !1
        });
    },
    inputBlur: function() {
        var t = this;
        0 < t.data.goods_list.length && setTimeout(function() {
            t.setData({
                show_history: !1,
                show_result: !0
            });
        }, 300);
    },
    inputConfirm: function(t) {
        var a = this, s = t.detail.value;
        0 != s.length && (a.setData({
            page: 1,
            keyword: s
        }), a.setHistory(s), a.getGoodsList());
    },
    searchCancel: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    historyClick: function(t) {
        var a = t.currentTarget.dataset.value;
        0 != a.length && (this.setData({
            page: 1,
            keyword: a
        }), this.getGoodsList());
    },
    getGoodsList: function() {
        var self = this;
        self.setData({
            show_history: !1,
            show_result: !0,
            is_search: !0
        }), self.setData({
            page: 1,
            scroll_top: 0
          }), self.setData({
            goods_list: []
        });
        
        /*
        a.data.cat_id && (t.cat_id = a.data.cat_id, a.setActiveCat(t.cat_id)), a.data.keyword && (t.keyword = a.data.keyword), 
        a.showLoadingBar(), a.is_loading = !0, app.request({
            url: api.default.goods_list,
            data: t,
            success: function(t) {
                0 == t.code && (a.setData({
                    goods_list: t.data.list
                }), 0 == t.data.list.length ? a.setData({
                    is_search: !1
                }) : a.setData({
                    is_search: !0
                })), t.code;
            },
            complete: function() {
                a.hideLoadingBar(), a.is_loading = !1;
            }
        });

        */

        var offset = 0;
        var size = 100;
        var data = {
          "keyword": self.data.keyword
        };
        var url = this.baseApiUrl;
        url += "/ziyoutechan/system/search?";

        url += "session=";
        url += app.globalData.session
        var self = this;
        util.ajax({
          "url": url,
          "data": data,
          "success": function (data) {

            if (data.returncode == 0) {
              
              self.data.goods_list = data.lists
              self.setData({
                "goods_list": data.lists,
                
              });

              0 == data.lists.length ? self.setData({
                is_search: !1
              }) : self.setData({
                is_search: !0
              })
              

              
            }
          },
          complete: function () {
            self.hideLoadingBar(), self.is_loading = !1;
          }
        });
    },
    onListScrollBottom: function(t) {
        this.getMoreGoodsList();
    },
    getHistoryList: function(t) {
        t = t || !1;
        var a = wx.getStorageSync("search_history_list");
        if (!a) return [];
        if (!t) return a;
        for (var s = [], i = a.length - 1; 0 <= i; i--) s.push(a[i]);
        return s;
    },
    setHistory: function(t) {
        var a = this.getHistoryList();
        for (var s in a.push({
            keyword: t
        }), a) {
            if (a.length <= 20) break;
            a.splice(s, 1);
        }
        wx.setStorageSync("search_history_list", a);
    },
    getMoreGoodsList: function() {
        var i = this, o = {};
        i.data.cat_id && (o.cat_id = i.data.cat_id, i.setActiveCat(o.cat_id)), i.data.keyword && (o.keyword = i.data.keyword), 
        o.page = i.data.page || 1, i.showLoadingMoreBar(), i.setData({
            is_loading: !0
        }), i.setData({
            load_more_count: i.data.load_more_count + 1
        }), o.page = i.data.page + 1, i.setData({
            page: o.page
        }), app.request({
            url: api.default.goods_list,
            data: o,
            success: function(t) {
                if (0 == t.code) {
                    var a = i.data.goods_list;
                    if (0 < t.data.list.length) {
                        for (var s in t.data.list) a.push(t.data.list[s]);
                        i.setData({
                            goods_list: a
                        });
                    } else i.setData({
                        page: o.page - 1
                    });
                }
                t.code;
            },
            complete: function() {
                i.setData({
                    is_loading: !1
                }), i.hideLoadingMoreBar();
            }
        });
    },
    showLoadingBar: function() {
        this.setData({
            loading_class: "active"
        });
    },
    hideLoadingBar: function() {
        this.setData({
            loading_class: ""
        });
    },
    showLoadingMoreBar: function() {
        this.setData({
            loading_more_active: "active"
        });
    },
    hideLoadingMoreBar: function() {
        this.setData({
            loading_more_active: ""
        });
    },
    deleteSearchHistory: function() {
        this.setData({
            history_list: null
        }), wx.removeStorageSync("search_history_list");
    }
});
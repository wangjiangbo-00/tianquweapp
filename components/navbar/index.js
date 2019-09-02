const App = getApp();

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    pageName: String,
    showNav: {
      type: Boolean,
      value: true
    },
    showHome: {
      type: Boolean,
      value: false
 
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  lifetimes: {
    attached: function () {
      this.setData({
        navH: App.globalData.navHeight
      })
    }
  },
  attached: function () {
    this.setData({
      navH: App.globalData.navHeight
    })
  },  
  /**
   * 组件的方法列表
   */
  methods: {

    
    //回退
    navBack: function () {
      var pages = getCurrentPages();

      var len = pages.length;
      wx.navigateBack()
    },
    //回主页
    toIndex: function () {
      

      wx.switchTab({
        url: '/pages/index/index'
      })
    },
  }
})
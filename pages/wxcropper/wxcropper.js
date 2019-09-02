/**
 * wx-cropper 1.1
 */
let SCREEN_WIDTH = 600
let PAGE_X, // 手按下的x位置
  PAGE_Y, // 手按下y的位置
  PR = wx.getSystemInfoSync().pixelRatio, // dpi
  T_PAGE_X, // 手移动的时候x的位置
  T_PAGE_Y, // 手移动的时候Y的位置
  CUT_L,  // 初始化拖拽元素的left值
  CUT_T,  // 初始化拖拽元素的top值
  CUT_R,  // 初始化拖拽元素的
  CUT_B,  // 初始化拖拽元素的
  CUT_W,  // 初始化拖拽元素的宽度
  CUT_H,  //  初始化拖拽元素的高度
  IMG_RATIO,  // 图片比例
  IMG_REAL_W,  // 图片实际的宽度
  IMG_REAL_H,   // 图片实际的高度
  DRAFG_MOVE_RATIO = 750 / wx.getSystemInfoSync().windowWidth,  //移动时候的比例,
  INIT_DRAG_POSITION = 200,   // 初始化屏幕宽度和裁剪区域的宽度之差，用于设置初始化裁剪的宽度
  DRAW_IMAGE_W // 设置生成的图片宽度
const app = getApp()
import Toast from '../../thirdpartcomponents/vant/dist/toast/toast';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 之后可以动态替换
    imageSrc: 'http://www.bing.com/az/hprichbg/rb/BulgariaPerseids_ZH-CN11638911564_1920x1080.jpg',

    // 是否显示图片(在图片加载完成之后设置为true)
    isShowImg: false,

    // 初始化的宽高
    cropperInitW: SCREEN_WIDTH,
    cropperInitH: SCREEN_WIDTH,

    // 动态的宽高
    cropperW: SCREEN_WIDTH,
    cropperH: SCREEN_WIDTH,

    // 动态的left top值
    cropperL: 0,
    cropperT: 0,

    // 图片缩放值
    scaleP: 0,

    // 裁剪框 宽高
    cutL: 0,
    cutT: 325,
    cutB: SCREEN_WIDTH,
    cutR: '100%',
    qualityWidth: DRAW_IMAGE_W,
    innerAspectRadio: DRAFG_MOVE_RATIO,
    "pageName": "截取图片",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.setRecommender(options);
    app.checkNavbar(this);
    var path = options.path;

    var vname = options.vname ? options.vname : "texteditdata";
   
    this.setData({
      imageSrc: path,
      "vname": vname,
    

    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    this.loadImage();

  },

  /**
   * 选择本地图片
   */
  getImage: function () {
    var _this = this
    wx.chooseImage({
      success: function (res) {
        _this.setData({
          imageSrc: res.tempFilePaths[0],
        })
        _this.loadImage();
      },
    })
  },

  /**
   * 初始化图片信息
   * 获取图片内容，并初始化裁剪框
   */
  loadImage: function () {
    var _this = this
    wx.showLoading({
      title: '图片加载中...',
    })

    wx.getImageInfo({
      src: _this.data.imageSrc,
      success: function success(res) {
        DRAW_IMAGE_W = IMG_REAL_W = res.width
        IMG_REAL_H = res.height
        IMG_RATIO = IMG_REAL_W / IMG_REAL_H
        let minRange = IMG_REAL_W > IMG_REAL_H ? IMG_REAL_W : IMG_REAL_H
        INIT_DRAG_POSITION = minRange > INIT_DRAG_POSITION ? INIT_DRAG_POSITION : minRange
        // 根据图片的宽高显示不同的效果   保证图片可以正常显示
        if (IMG_RATIO >= 1) {
          Toast.fail("暂只支持竖版的图片");
        } else {
          _this.setData({
            cropperW: SCREEN_WIDTH,
            cropperH: SCREEN_WIDTH / IMG_RATIO,
            // 初始化left right
            cropperL: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH * IMG_RATIO) / 2),
            cropperT: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH) / 2),

            cutL: 0,
            cutT: 325,
            cutB: Math.ceil((SCREEN_WIDTH - INIT_DRAG_POSITION) / 2),
            cutR: Math.ceil((SCREEN_WIDTH * IMG_RATIO - (SCREEN_WIDTH * IMG_RATIO)) / 2),
            // 图片缩放值
            scaleP: IMG_REAL_W / SCREEN_WIDTH,
            qualityWidth: DRAW_IMAGE_W,
            innerAspectRadio: IMG_RATIO
          })

          _this.setData({
            isShowImg: true
          })
        }
        
        wx.hideLoading()
      }
    })
  },

  /**
   * 拖动时候触发的touchStart事件
   */
  contentStartMove(e) {
    PAGE_X = e.touches[0].pageX
    PAGE_Y = e.touches[0].pageY
  },

  /**
   * 拖动时候触发的touchMove事件
   */
  contentMoveing(e) {
    var _this = this
    //var dragLengthX = (PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
    var dragLengthY = (PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO

    /**
     * 这里有一个小的问题
     * 移动裁剪框 ios下 x方向没有移动的差距
     * y方向手指移动的距离远大于实际裁剪框移动的距离
     * 但是在有些机型上又是没有问题的，小米4测试没有上下移动产生的偏差，模拟器ok，但是iphone8p确实是有的，虽然模拟器也ok
     * 小伙伴有兴趣可以找找原因
     */

    


    // 上移下移
    if (dragLengthY > 0) {

      if (dragLengthY>5)
      {
        if (this.data.cutT - dragLengthY < 0) 
        {
          dragLengthY = this.data.cutT
        }
        else
        {
          PAGE_Y = e.touches[0].pageY
        }
        
        
      }
      

    } else  if(dragLengthY < 0){

      if (dragLengthY < -5) {
        if (this.data.cutT + 300 - dragLengthY > this.data.cropperH) {
          dragLengthY = 0
          
        }
        else
        {
          PAGE_Y = e.touches[0].pageY
        }

        
        
      }
      
    }

    
    this.setData({
      
      cutT: this.data.cutT - dragLengthY,
      
    })

    // console.log('cutL', this.data.cutL)
    // console.log('cutT', this.data.cutT)
    // console.log('cutR', this.data.cutR)
    // console.log('cutB', this.data.cutB)

    //PAGE_X = e.touches[0].pageX
    
  },

  contentTouchEnd() {

  },

  /**
   * 获取图片
   */
  getImageInfo() {
    var _this = this
    wx.showLoading({
      title: '图片生成中...',
    })
    // 将图片写入画布
    const ctx = wx.createCanvasContext('myCanvas')
    ctx.drawImage(_this.data.imageSrc, 0, 0, IMG_REAL_W, IMG_REAL_H);
    ctx.draw(true, () => {
      // 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    保证了在微信小程序中裁剪的图片模糊  位置不对的问题
      var canvasW =  IMG_REAL_W
      var canvasH = IMG_REAL_W/2
      var canvasL = 0
      var canvasT = _this.data.cutT *_this.data.scaleP

      
      // 生成图片
      wx.canvasToTempFilePath({
        x: 0,
        y: canvasT,
        width: canvasW,
        height: canvasH,
        destWidth: canvasW,
        destHeight: canvasH,
        quality: 1,
        canvasId: 'myCanvas',
        success: function (res) {
          wx.hideLoading()

          var pages = getCurrentPages() //获取加载的页面
          let prevPage = pages[pages.length - 2];

          prevPage.setData({ //直接给上移页面赋值
            [_this.data.vname]: res.tempFilePath,
            
          });

          wx.navigateBack({

          })
          // 成功获得地址的地方
          
        }
      })
    })
  },

  /**
   * 设置大小的时候触发的touchStart事件
   * 存数据
   */
  dragStart(e) {
    T_PAGE_X = e.touches[0].pageX
    T_PAGE_Y = e.touches[0].pageY
    CUT_L = this.data.cutL
    CUT_R = this.data.cutR
    CUT_B = this.data.cutB
    CUT_T = this.data.cutT
  },

  /**
   * 设置大小的时候触发的touchMove事件
   * 根据dragType判断类型
   * 4个方向的边线拖拽效果
   * 右下角按钮的拖拽效果
   */
  dragMove(e) {
    var _this = this
    var dragType = e.target.dataset.drag
    switch (dragType) {
      case 'right':
        var dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
        if (CUT_R + dragLength < 0) dragLength = -CUT_R
        this.setData({
          cutR: CUT_R + dragLength
        })
        break;
      case 'left':
        var dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
        if (CUT_L - dragLength < 0) dragLength = CUT_L
        if ((CUT_L - dragLength) > (this.data.cropperW - this.data.cutR)) dragLength = CUT_L - (this.data.cropperW - this.data.cutR)
        this.setData({
          cutL: CUT_L - dragLength
        })
        break;
      case 'top':
        var dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
        if (CUT_T - dragLength < 0) dragLength = CUT_T
        if ((CUT_T - dragLength) > (this.data.cropperH - this.data.cutB)) dragLength = CUT_T - (this.data.cropperH - this.data.cutB)
        this.setData({
          cutT: CUT_T - dragLength
        })
        break;
      case 'bottom':
        var dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
        if (CUT_B + dragLength < 0) dragLength = -CUT_B
        this.setData({
          cutB: CUT_B + dragLength
        })
        break;
      case 'rightBottom':
        var dragLengthX = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
        var dragLengthY = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
        if (CUT_B + dragLengthY < 0) dragLengthY = -CUT_B
        if (CUT_R + dragLengthX < 0) dragLengthX = -CUT_R
        this.setData({
          cutB: CUT_B + dragLengthY,
          cutR: CUT_R + dragLengthX
        })
        break;
      default:
        break;
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
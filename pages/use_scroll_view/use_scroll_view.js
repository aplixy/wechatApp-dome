// pages/use_scroll_view/use_scroll_view.js

var listutil = require('../../utils/list_util.js');
const PAGE_SIZE = 10;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: 1463.2009345794393, 
    menuBarHeight: 100,
    infoType: 'InfoType1'
  },

  searchByInfoType: function (event) {
    var infoType = event.currentTarget.dataset.infoType;

    var currentInfoType = this.data.infoType;
    if (infoType == currentInfoType) {
      return;
    }

    this.setData({
      infoType: infoType
    });
    this.loadData();
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getWindowHeight();
    listutil.init.call(this, {
      itemMaxLength: PAGE_SIZE,
      itemHeight: 2225, // item布局高度 * PAGE_SIZE
      prepareNum: 3
    });

    this.loadData();
  },

  loadData(isNew = true) {
    let obj = {
      qus: '下面哪位是刘发福女朋友?',
      answerA: '刘亦菲',
      answerB: '迪丽热巴',
      answerC: '斋藤飞鸟',
      answerD: '花泽香菜',
    }
    let list = Array(8).fill(obj)

    listutil.deliverListData.call(this, list, isNew);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  toScrollWindowBottom: function () {
    this.loadData(false);

  },

  toScrollWindowTop: function () {

  },

  scroll: function (event) {
    let scrollTop = event.detail.scrollTop;

    listutil.exportObj.scrollFunc.call(this, scrollTop);
  },

  getWindowHeight: function() {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750.0 / clientWidth;
        var calc = clientHeight * rpxR;
        that.setData({
          windowHeight: calc
        });
      }
    });
  }
})
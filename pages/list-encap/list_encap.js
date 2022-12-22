// pages/list-encap/list_encap.js
var listutil = require('../../utils/list_util.js');
const PAGE_SIZE = 10;

var test = 13;

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    listutil.init.call(this, {
      itemMaxLength: PAGE_SIZE,
      itemHeight: 2225, // item布局高度 * PAGE_SIZE
      prepareNum: 3
    });

    let obj = {
      qus: '下面哪位是刘发福女朋友?',
      answerA: '刘亦菲',
      answerB: '迪丽热巴',
      answerC: '斋藤飞鸟',
      answerD: '花泽香菜',
    }
    let list = Array(8).fill(obj)
    this.setData({
      [`listData[0].itemList`]: list,
    })
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
    // test变量用于观察最后一组数据显示情况
    if (test-- >= 0) {
      let list = this.data.listData[0].itemList;
      listutil.deliverListData.call(this, list);
    }
    
  },

  onPageScroll: listutil.onPageScroll, 

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})


var data = {
  listData:[{
    itemIndex:0,
    isDisplay:true, // wxml中使用该参数作为wx:if参数，以决定组件是否显示
    itemList:[]
  }],

  itemMaxLength: 20, // 每组itemList长度
  itemIndex:1, // 可用于在wxml中显示，无需显示则不用理会
  itemHeight:4520.0,// 每一组的高度，单位为rpx
  itemPxHeight:'',// 转化为px高度
  aboveShowIndex:0,// 展示区域的上部的Index
  belowShowNum:0,// 显示区域下方隐藏的条数
  oldSrollTop:0, // 用于判断滚动方向
  prepareNum:5, // 显示余量，滚动出屏幕范围以外还额外显示几组
  throttleTime:200, // 滚动过程中，每隔throttleTime毫秒计算一次需要显示或隐藏的条数
  blankHeight: 0, // 如果没填完一组，空白部分高度应该在wxml中减去
  smallItemHeight: 0 // 用于计算blankHeight
};

var exportObj = {
  /**
   * 请在滚动组件的滚动事件中调用scrollFunc函数，并传入scrollTop参数，单位px（一般js中默认单位都是px，无需转换）
   */
  scrollFunc: getScrollFunc()
};

/**
 * 初始化虚拟列表参数，在onLoad中调用，会默认创建listData列表，wxml中应使用该列表作为第一层for循环数据，listData中的itemList作为第二层for循环。第一层for循环用isDisplay作为wx:if判断依据。wxml组件中要指定一个class为content的组件，content可不实现，单纯为了在初始化时计算rpx与px的比值，以便后续滚动过程中计算隐藏条数。
 * @param {obj} obj 可选初始化参数，obj = {
 *  itemMaxLength: 二级for循环长度，默认每组20条数据, 
 *  itemHeight: 每组UI组件高度，单位rpx，目前只能写死，请根据wxml中每个列表项高度乘以itemMaxLength，默认4520, 
 *  prepareNum: 预加载组数，默认预加载屏幕以外5组数据, 
 *  throttleTime: 每隔多少毫秒计算一次需要隐藏的列表项，默认是200毫秒，必须在页面的onPageScroll中使用该组件封装的onPageScroll，或者在<scroll-view>的scroll(event)回调中调用该组件的exprotObj: scrollFunc函数，并传入scrollTop参数
 * }
 */
var init = function(obj) {
  if (obj) {
    if ((obj.itemMaxLength)) {
      data.itemMaxLength = obj.itemMaxLength;
    }
    if ((obj.itemHeight)) {
      data.itemHeight = obj.itemHeight;
    }
    if ((obj.prepareNum)) {
      data.prepareNum = obj.prepareNum;
    }
    if ((obj.throttleTime)) {
      data.throttleTime = obj.throttleTime;
    }
  }

  this.setData(data);

  let query = wx.createSelectorQuery();
  // 此处.content是自定义名称，应该与wxml中设置class名称对应
  query.select('.content').boundingClientRect(rect=>{
    let clientWidth = rect.width;
    let ratio = 750.0 / clientWidth;
    this.setData({
      itemPxHeight:Math.floor(this.data.itemHeight/ratio),
    })
    //console.log("itemPxHeight--->" + (this.data.itemPxHeight))
  }).exec();

  let smallItemHeight = this.data.itemHeight / this.data.itemMaxLength;
  this.setData({
    smallItemHeight: smallItemHeight
  });
    
};


/**
 * 将服务器返回的单层列表分成一组一组并加入listData，以便虚拟列表加载
 * @param {list} list 服务器返回的列表
 * @param {reset} reset 是否清空已展示列表，重新加载，默认为false，可不传
 * @returns changedIndexList 加入到listData中的位置和实体，{bigIndex: listData中的位置, smallIndex: itemList中的位置, item: 加入到列表中的实体}
 */
var deliverListData = function(list, reset = false) {
  if (!list || list.length == 0) {
    return;
  }

  let listData = this.data.listData;
  if (reset || !listData) {
    listData = [];
    
    this.setData({
      listData: listData, 
      oldSrollTop: 0, 
      aboveShowIndex: 0, 
      belowShowNum: 0,
      blankHeight: 0
    });
  }

  let ITEM_MAX_LENGTH = this.data.itemMaxLength;
  let bigLength = listData.length;
  let count = 0;

  let nextBigIndex = 0;

  let obj = null;

  // 如果原来列表不为空，取最后一条数据
  if (bigLength > 0) {
    nextBigIndex = bigLength - 1;
    obj = listData[nextBigIndex];
  }

  // 如果原来列表为空，或者原来列表最后一条数据已满
  if (!obj || obj.itemList.length >= ITEM_MAX_LENGTH) {
    nextBigIndex = bigLength;
    obj = {
      itemIndex: nextBigIndex, 
      isDisplay: true, 
      itemList: []
    };
  }

  let changedIndexList = [];

  let changeData = {}; // 用于减少setData次数

  for(let i = 0, len = list.length; i < len; i++) {
    let item = list[i];
    obj.itemList.push(item);

    count = obj.itemList.length;

    changedIndexList.push({
      bigIndex: nextBigIndex, 
      smallIndex: count - 1, 
      item: item
    });

    if (count >= ITEM_MAX_LENGTH) {
      listData[nextBigIndex] = obj;
      changeData[[`listData[${nextBigIndex}]`]] = obj;

      nextBigIndex = listData.length;
      // console.log("加一次");
      obj = {
        itemIndex:nextBigIndex,
        isDisplay:true,
        itemList:[]
      };
    }
    
  }

  let blankHeight = 0;
  if (count < ITEM_MAX_LENGTH) {
    // console.log("不足一次，也要加");
    listData[nextBigIndex] = obj;
    changeData[[`listData[${nextBigIndex}]`]] = obj;

    // 不满一组时，组件高度需要减去空白部分
    blankHeight = (ITEM_MAX_LENGTH - count) * this.data.smallItemHeight;
    if (blankHeight > this.data.itemHeight) {
      blankHeight = 0;
    }
  }

  changeData[['blankHeight']] = blankHeight;

  
  // 加入新数据前，blankHeight一定要先设置成0，恢复已加载列表的高度为最大高度，这样才能使新加入的列表项不至于显示异常
  this.setData({
    blankHeight: 0
  });

  this.setData(changeData);

  // 返回值可用于后续处理
  return changedIndexList;

};

/**
 * 获取列表最后一项，例如需要根据最后一项时间戳加载更多数据时就要用到该函数
 */
var getLastItem = function() {
  let listData = this.data.listData;
  if (!listData || listData.length == 0) {
    return null;
  }

  for(let len = listData.length, i = len - 1; i >= 0; i--) {
    let item = listData[i];
    if (!item) {
      continue;
    }

    let itemList = item.itemList;
    if (!itemList || itemList.length == 0) {
      continue;
    }

    let lastItem = itemList[itemList.length - 1];
    return lastItem;
  }
};

/**
 * 如果列表组件是直接嵌入page，要把onPageScroll直接设置成该值，该函数中会调用onListPageScroll函数（如果page中有该函数的话）
 */
var onPageScroll = throttle(function (e) {
  // console.log(e)
  let scrollTop = e[0].scrollTop;

  onScrollCalc.call(this, scrollTop);

});


var onScrollCalc = function(scrollTop) {
  // console.log('滚动条高度==='+scrollTop)
  let itemNum = Math.floor(scrollTop / this.data.itemPxHeight);
  // console.log('可视区的itemIndex==='+itemNum)
  let clearindex = itemNum - this.data.prepareNum + 1;
  // if(clearindex>0&&clearindex==this.data.aboveShowIndex){
  //   return
  // }
  let oldSrollTop = this.data.oldSrollTop; //滚动前的scrotop,用于判断滚动的方向
  // console.log(clearindex)
  //向下滚动
  let aboveShowIndex = this.data.aboveShowIndex
  let listDataLen = this.data.listData.length;
  let changeData = {}
  if (scrollTop - oldSrollTop > 0) {
    if (clearindex > 0) {
      for (let i = aboveShowIndex; i < clearindex; i++) {
        changeData[[`listData[${i}].isDisplay`]] = false;
        let belowShowIndex = i + 2 * this.data.prepareNum;
        if (i + 2 * this.data.prepareNum < listDataLen) {
          changeData[[`listData[${belowShowIndex}].isDisplay`]] = true;
        }
      }
    }
  } else { //向上滚动
    if (clearindex >= 0) {
      //  let changeData={}
      for (let i = aboveShowIndex - 1; i >= clearindex; i--) {
        let belowShowIndex = i + 2 * this.data.prepareNum
        if (i + 2 * this.data.prepareNum <= listDataLen - 1) {
          changeData[[`listData[${belowShowIndex}].isDisplay`]] = false;
        }
        changeData[[`listData[${i}].isDisplay`]] = true;
      }
    } else {
      if (aboveShowIndex > 0) {
        for (let i = 0; i < aboveShowIndex; i++) {
          this.setData({
            [`listData[${i}].isDisplay`]: true,
          })
        }
      }
    }
  }
  clearindex = clearindex > 0 ? clearindex : 0

  if (clearindex >= 0 && !(clearindex > 0 && clearindex == this.data.aboveShowIndex)) {
    changeData.aboveShowIndex = clearindex;
    let belowShowNum = this.data.listData.length - (2 * this.data.prepareNum + clearindex)
    belowShowNum = belowShowNum > 0 ? belowShowNum : 0
    if (belowShowNum >= 0) {
      changeData.belowShowNum = belowShowNum
    }

    this.setData(changeData)
  }

  this.setData({
    oldSrollTop: scrollTop
  })

  if (this.onListPageScroll) {
    this.onListPageScroll(scrollTop);
  }
};

function throttle(fn){
  let valid = true
  // var context = this;
  
  return function() {
    if(!valid){
        //休息时间 暂不接客
        return false 
    }
    // 工作时间，执行函数并且在间隔期内把状态位设为无效
    valid = false
    setTimeout(() => {
      fn.call(this, arguments);
      valid = true;
    }, this.data.throttleTime)
  }
}

/**
 * 获取滚动过程中要调用的函数，该函数用于计算在滚动过程中哪些分组需要隐藏，哪些分组需要显示，滚动出屏幕可视范围的列表项将被隐藏，具体余量可通过prepareNum参数在init时设置。之所以将要调用的函数套在该函数中，是为了隐藏用于控制每200毫秒调用的参数valid，返回的函数在调用时需要传入scrollTop参数
 */
function getScrollFunc(){
  let valid = true
  return function(scrollTop) {
    if(!valid){
        return false 
    }
    valid = false
    setTimeout(() => {
      onScrollCalc.call(this, scrollTop);
      valid = true;
    }, this.data.throttleTime)
  }
}



module.exports = {
  data: data,
  init: init,
  onPageScroll: onPageScroll,
  deliverListData: deliverListData, 
  getLastItem: getLastItem, 
  getScrollFunc: getScrollFunc, 
  exportObj: exportObj
}
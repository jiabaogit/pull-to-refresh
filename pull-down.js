; (function (undefined) {
  var _global;
  // 对象合并
  function extend (o, n, override) {
    for (var key in n) {
      if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
        o[key] = n[key];
      }
    }
    return o;
  }
  function hasClass (ele, cls) {
    return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
  }
  //为指定的dom元素添加样式
  function addClass (ele, cls) {
    if (!hasClass(ele, cls)) ele.className += ' ' + cls;
  }
  //删除指定dom元素的样式
  function removeClass (ele, cls) {
    if (hasClass(ele, cls)) {
      var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      ele.className = ele.className.replace(reg, ' ');
    }
  }
  function insertHtml (opt) {
    var htmlCont = '<div class="pull-img-box"><img id="pullImg" src="' + opt.loadImg + '" class="pull-down-img"></div><span id="pullWord" class="pull-down-word font-36">' + opt.pendingWord + '</span>';
    var eleParent = document.getElementById(opt.eleID).parentNode;
    var node = document.createElement('div');
    node.id = 'pullHeader';
    node.className = 'pull-down-box';
    node.innerHTML = htmlCont;
    eleParent.insertBefore(node, eleParent.childNodes[0]);
  }
  function returnPromise () {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, 2000);
    })
  }
  function PullDown (opt) {
    this._initial(opt);
  };
  var startPageY, startClientY, offY;
  var clientHeight = document.documentElement.clientHeight; // 屏幕高度
  PullDown.prototype = {
    constructor: this,
    _initial: function (opt) {
      var defOpt = {
        loadImg: 'assets/img/verify.png',
        pendingWord: '下拉即可刷新',
        pendedWord: '释放即可刷新',
        loadingWord: '加载中...',
        eleID: '',
        pendingCallback: returnPromise,
        loadingCallback: returnPromise,
        minHeight: 200 // 最小显示loading的高度
      };
      this.def = extend(defOpt, opt, true);
      insertHtml(this.def);
      this._addEvent(this.def.eleID);
    },
    _start: function (e) {
      offY = null;
      var touch = (e.touches && e.touches[0]) || e;
      startPageY = touch.pageY;
      startClientY = touch.clientY;
    },
    _move: function (e) {
      var touch = (e.touches && e.touches[0]) || e;
      console.log(startPageY, clientHeight, touch.clientY);
      if (startPageY && startPageY < clientHeight && startPageY - touch.clientY < 0) { // 在已经到顶部的时候拉动才有效果
        this.status = 'pending';
        this._changeStatus();
        offY = touch.clientY - startClientY;
        var moveHeight = offY;
        if (offY > this.def.minHeight) { // 要显示 释放 字样 阶段
          this.status = 'pended';
          this._changeStatus();
        }
        this._transform(moveHeight);
        e.stopPropagation();
        e.preventDefault();
      }
    },
    _end: function () {
      var _this = this;
      startPageY = null;
      if (offY && offY >= this.def.minHeight) {
        this.status = 'loading';
        this._transform(this.def.minHeight);
        this._changeStatus();
        this.def.loadingCallback().then(function (result) {
          _this.status = 'end';
          _this._transform(0);
          removeClass(document.getElementById('pullImg'), 'pull-down-img-shake');
        });
      } else {
        this.status = 'end';
        this._transform(0);
        removeClass(document.getElementById('pullImg'), 'pull-down-img-shake');
      }
    },
    _addEvent: function (eleId) {
      this.content = document.getElementById(eleId);
      var content = this.content;
      var _this = this;
      content.addEventListener('touchstart', function (e) {
        _this._start(e);
      }, true);
      content.addEventListener('mousedown', function (e) {
        _this._start(e || window.event);
      }, true);
      content.addEventListener('touchmove', function (e) {
        _this._move(e);
      }, true);
      content.addEventListener('mousemove', function (e) {
        _this._move(e || window.event);
      }, true);
      content.addEventListener('touchend', function (e) {
        _this._end();
      }, true);
      content.addEventListener('mouseup', function (e) {
        _this._end();
      }, true);
    },
    _transform: function (translate) {
      if (translate > 0) {
        var speed = 0.8;
        var fontSize = document.documentElement.style.fontSize.replace('px', '');
        var num = Math.pow(translate, speed) / fontSize;
        this.content.style.cssText = 'transform:translate3d(0,' + num + 'rem,0);transition:all 0 ease 0';
        document.getElementById('pullHeader').style.cssText = 'height:' + num + 'rem;transition:all 0 ease 0';
      } else if (translate == 0) {
        this.content.style.cssText = 'transform:translate3d(0,0,0);transition:transform 0.5s';
        document.getElementById('pullHeader').style.cssText = 'height:0;transition:height 0.5s';
      }
    },
    _changeStatus: function () {
      if (document.getElementById('pullHeader')) {
        var pullword = document.getElementById('pullWord');
        switch (this.status) {
          case 'pending': pullword.innerHTML = this.def.pendingWord;
            break;
          case 'pended': pullword.innerHTML = this.def.pendedWord;
            break;
          case 'loading': pullword.innerHTML = this.def.loadingWord;
            addClass(document.getElementById('pullImg'), 'pull-down-img-shake');
            break;
        }
      }
    }
  };
  _global = (function () {
    return (this || (0, eval)('this'));
  }())
  if (typeof module !== "undefined" && module.exports) {
    module.exports = PullDown;
  } else if (typeof define === "function" && define.amd) {
    define(function () { return PullDown; });
  } else {
    !('PullDown' in _global) && (_global.PullDown = PullDown);
  }
}());
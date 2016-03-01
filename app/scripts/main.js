console.log('\'Allo \'Allo!');

var app = app || {};

var AppModel = Backbone.Model.extend({
  defaults: {
    'url': 'images/street4.jpg'
  },

  initialize: function() {
    console.log('Init AppModel');
  }
});

var AppView = Backbone.View.extend({
  el: '.image-container',

  events: {
    'mousedown'     : 'onMouseDown'
  },

  initialize: function() {
    console.log('init appView');

    this.canvas = document.getElementById('image-canvas');
    this.ctx = this.canvas.getContext('2d');


    this.image = new Image();
    this.image.src = this.model.get('url');
    this.image.onload = function() {
      this.renderImage(this.image, this.canvas, this.ctx)
    }.bind(this);

    this.crop = {
      left: 0,
      top: 0,
      width: this.image.width,
      height: this.image.height
    }
    this.selectBox = $('.select-box');

    this.lastMouseTime = 0;
    this.minFreq = 16;
  },

  render: function() {

  },

  renderImage: function(image, canvas, ctx) {
    var iw = image.width;
    var ih = image.height;

    var cw = canvas.width;
    var ch = canvas.height;

    var cr = cw / ch;
    var ir = iw / ih;

    var sx = 0;
    var sy = 0;

    var sWidth = iw;
    var sHeight = ih;

    if (cr > ir){
      sHeight = iw / cr;
      sy = (ih - sHeight) / 2;
    } else {
      sWidth = ih * cr;
      sx = (iw - sWidth) / 2;
    }

    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
  },

  onMouseDown: function(e) {
    this.selectBox.addClass('select-active');
    this.selectBox.css({
      'margin-left': e.pageX - this.el.offsetLeft,
      'margin-top': e.pageY - this.el.offsetTop,
      'width': 0,
      'height': 0
    });

    this.boxInitialW = e.pageX  - this.el.offsetLeft;
    this.boxInitialH = e.pageY  - this.el.offsetTop;

    this.delegateEvents({
      'mousemove': 'onMouseMove',
      'mouseup': 'onMouseUp'
    })
  },

  onMouseMove: function(e) {
    if (Date.now() > this.lastMouseTime + this.minFreq || true){
      this.lastMouseTime = Date.now();

      var left = Math.min(this.boxInitialW, e.pageX - this.el.offsetLeft);
      var top = Math.min(this.boxInitialH, e.pageY - this.el.offsetTop);
      var width = Math.max(this.boxInitialW, e.pageX - this.el.offsetLeft) - left;
      var height = Math.max(this.boxInitialH, e.pageY - this.el.offsetTop) - top;

      var css = {
        'margin-left': left + 'px',
        'margin-top': top + 'px',
        width: width + 'px',
        height: height + 'px'
      };

      this.selectBox.css(css);
      this.selectionArea = {
        left: left,
        top: top,
        width: width,
        height: height
      }
    }
  },

  onMouseUp: function (e) {
    this.delegateEvents({
      'mousedown': 'onMouseDown'
    });
  },

  hideSelectionBox: function() {
    this.selectBox.removeClass('select-active')
  },

  zoom: function() {
    console.log('zoom');
    this.hideSelectionBox();
    // var croppedCanvas = document.getElementById('cropped-canvas');
    // var croppedCanvasCtx = croppedCanvas.getContext('2d');

    this.ctx.drawImage(this.canvas, this.selectionArea.left, this.selectionArea.top, this.selectionArea.width, this.selectionArea.height, 0, 0, this.canvas.width, this.canvas.height)

  },

  enhance: function() {
    console.log('enhanve');

    var ih = this.image.height - 2 * this.crop.top;
    var iw = this.image.width - 2 * this.crop.left;

    var scale = iw / this.canvas.width;

    var scaledSelction = {
      left: (this.selectionArea.left * scale) + this.crop.left,
      top: (this.selectionArea.top * scale) + this.crop.top,
      width: this.selectionArea.width * scale,
      height: this.selectionArea.height * scale
    };

    this.ctx.drawImage(this.image, scaledSelction.left, scaledSelction.top, scaledSelction.width, scaledSelction.height, 0, 0, this.canvas.width, this.canvas.height);

    this.crop = scaledSelction;
  }
});

var ButtonView = Backbone.View.extend({
  el: '.buttons',

  events: {
    'click .enhance': 'enhance',
    'click .zoom'   : 'zoom'
  },

  enhance: function() {
    appView.enhance();
  },

  zoom: function() {
    appView.zoom();
  }
});

var appModel = new AppModel();
var appView = new AppView({model: appModel});
var buttons = new ButtonView();

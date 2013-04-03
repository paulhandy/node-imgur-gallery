var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

window.ProgressBar = (function() {
  var progressBarRect, progressLayerRect, progressText, roundInsetRect, roundRect;

  function ProgressBar(selector, i, total_width, total_height, initial_x, initial_y) {
    var elem, progress_lingrad;
    this.selector = selector;
    this.i = i;
    this.total_width = total_width;
    this.total_height = total_height;
    this.initial_x = initial_x;
    this.initial_y = initial_y;
    this.draw = __bind(this.draw, this);

    this.value = __bind(this.value, this);

    this.counter = 0;
    this.res = 0;
    this.context = null;
    this.total_width = this.total_width || 300;
    this.total_height = this.total_height || 34;
    this.initial_x = this.inital_x || 10;
    this.initial_y = this.initial_y || 10;
    this.radius = this.total_height / 2;
    elem = typeof this.selector === "string" ? document.querySelector(this.selector) : this.selector;
    if (!elem || !elem.getContext) {
      return;
    }
    this.context = elem.getContext("2d");
    if (!this.context) {
      return;
    }
    this.context.font = "" + (Math.floor(this.total_height * 16 / 34)) + "px Verdana";
    progress_lingrad = this.context.createLinearGradient(0, this.initial_y + this.total_height, 0, 0);
    progress_lingrad.addColorStop(0, "#4DA4F3");
    progress_lingrad.addColorStop(0.4, "#ADD9FF");
    progress_lingrad.addColorStop(1, "#9ED1FF");
    this.context.fillStyle = progress_lingrad;
    if (this.i > 0) {
      this.progress(this.i);
    } else {
      this.draw(0);
    }
  }

  ProgressBar.prototype.value = function(i) {
    if (i * this.total_width / 100 < this.counter || !this.context) {
      return;
    }
    this.end = Math.floor(i * this.total_width / 100);
    return this.draw(this.end);
  };

  ProgressBar.prototype.draw = function(i) {
    this.context.clearRect(this.initial_x - 5, this.initial_y - 5, this.total_width + 15, this.total_height + 15);
    progressLayerRect(this.context, this.initial_x, this.initial_y, this.total_width, this.total_height, this.radius);
    progressBarRect(this.context, this.initial_x, this.initial_y, i, this.total_height, this.radius, this.total_width);
    //return progressText(this.context, this.initial_x, this.initial_y, i, this.total_height, this.radius, this.total_width);
  };

  /*
  	#Draws a rounded rectangle.
  	#@param {CanvasContext} ctx
  	#@param {Number} x The top left x coordinate
  	#@param {Number} y The top left y coordinate
  	#@param {Number} width The width of the rectangle
  	#@param {Number} height The height of the rectangle
  	#@param {Number} radius The corner radius;
  */


  roundRect = function(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + radius, radius, Math.PI / 2, 3 * Math.PI / 2, false);
    ctx.closePath();
    return ctx.fill();
  };

  roundInsetRect = function(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(1000, 1000);
    ctx.lineTo(1000, -1000);
    ctx.lineTo(-1000, -1000);
    ctx.lineTo(-1000, 1000);
    ctx.lineTo(1000, 1000);
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + radius, radius, Math.PI / 2, 3 * Math.PI / 2, false);
    ctx.closePath();
    return ctx.fill();
  };

  progressLayerRect = function(ctx, x, y, width, height, radius) {
    var lingrad;
    ctx.save();
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#666";
    ctx.fillStyle = "rgba(189,189,189,1)";
    roundRect(ctx, x, y, width, height, radius);
    ctx.shadowColor = "rgba(0,0,0,0)";
    lingrad = ctx.createLinearGradient(0, y + height, 0, 0);
    lingrad.addColorStop(0, "rgba(255,255,255, 0.1)");
    lingrad.addColorStop(0.4, "rgba(255,255,255, 0.7)");
    lingrad.addColorStop(1, "rgba(255,255,255,0.4)");
    ctx.fillStyle = lingrad;
    roundRect(ctx, x, y, width, height, radius);
    ctx.fillStyle = "white";
    return ctx.restore();
  };

  /*
  	#Draws a half-rounded progress bar to properly fill rounded under-layer
  	#@param {CanvasContext} ctx
  	#@param {Number} x The top left x coordinate
  	#@param {Number} y The top left y coordinate
  	#@param {Number} width The width of the bar
  	#@param {Number} height The height of the bar
  	#@param {Number} radius The corner radius;
  	#@param {Number} max The under-layer total width;
  */


  progressBarRect = function(ctx, y,x,height,width, radius, max) {
    var offset;
    offset = 0;
    ctx.beginPath();
    if (width < radius) {
      offset = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(radius - width, 2));
      ctx.moveTo(x + width, y + offset);
      ctx.lineTo(x + width, y + height - offset);
      ctx.arc(x + radius, y + radius, radius, Math.PI - Math.acos((radius - width) / radius), Math.PI + Math.acos((radius - width) / radius), false);
    } else if (width + radius > max) {
      offset = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(radius - (max - width), 2));
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width, y);
      ctx.arc(x + max - radius, y + radius, radius, -Math.PI / 2, -Math.acos((radius - (max - width)) / radius), false);
      ctx.lineTo(x + width, y + height - offset);
      ctx.arc(x + max - radius, y + radius, radius, Math.acos((radius - (max - width)) / radius), Math.PI / 2, false);
      ctx.lineTo(x + radius, y + height);
      ctx.arc(x + radius, y + radius, radius, Math.PI / 2, 3 * Math.PI / 2, false);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.arc(x + radius, y + radius, radius, Math.PI / 2, 3 * Math.PI / 2, false);
    }
    ctx.closePath();
    ctx.fill();
    if (width < max - 1) {
      ctx.save();
      ctx.shadowOffsetX = 1;
      ctx.shadowBlur = 1;
      ctx.shadowColor = "#666";
      if (width + radius > max) {
        offset = offset + 1;
      }
      ctx.fillRect(x + width, y + offset, 1, height - offset * 2);
      return ctx.restore();
    }
  };

  /*
  	#Draws properly-positioned progress bar percent text
  	#@param {CanvasContext} ctx
  	#@param {Number} x The top left x coordinate
  	#@param {Number} y The top left y coordinate
  	#@param {Number} width The width of the bar
  	#@param {Number} height The height of the bar
  	#@param {Number} radius The corner radius;
  	#@param {Number} max The under-layer total width;
  */


  progressText = function(ctx, x, y, width, height, radius, max) {
    var text, text_width, text_x;
    ctx.save();
    ctx.fillStyle = "black";
    text = Math.floor(width / max * 100) + "%";
    text_width = ctx.measureText(text).width;
    text_x = x + width - text_width - radius / 2;
    if (width <= radius + text_width) {
      text_x = x + radius / 2;
    }
    ctx.fillText(text, text_x, y + 22);
    return ctx.restore();
  };

  return ProgressBar;

})();

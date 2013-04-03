var ThumbnailCreator = new (function() {
  var c, cx;
  function ThumbnailCreator(stack) {
    this.stack = stack;
    this.index = 0;
  }
  c = document.createElement("canvas");
  cx = c.getContext("2d");
  ThumbnailCreator.prototype.postMessage = function(e) {
    switch (e.cmd) {
      case "start":
        return this.start();
      case "update":
        return this.onmessage(e);
      case "complete":
        return this.onmessage(e);
    }
  };
  
  ThumbnailCreator.prototype.start = function() {
        this.length = this.length + this.stack.length || this.stack.length;
        if (!this.inProgress) {
            return this.load(this.stack.shift());
        }
    };
    ThumbnailCreator.prototype.load = function(img) {
        var objURL, reader, url,
                _this = this;
        if (img) {
                this.inProgress = true;
                url = window.URL || window.webkitURL;
                objURL = url.createObjectURL || false;
                if (objURL) {
                        return this.toImage(url.createObjectURL(img.file), img);
                } else {
                        reader = new FileReader();
                        reader.readAsDataURL(img.file);
                        return reader.onload = function(ev) {
                                return _this.toImage(ev.target.result, img);
                        };
                }
        } else {
                return this.postMessage({
                        cmd: "complete"
                });
        }
    };
    ThumbnailCreator.prototype.toImage = function(file, obj) {
            var img,
                    _this = this;
            img = new Image();
            img.src = file;
            return img.onload = function() {
                    return _this.canvas(obj, img, 100, 100, false, "transparent");
            };
    };
    
    ThumbnailCreator.prototype.canvas = function(obj, img, width, height, crop, background) {
		var dimensions, thumb, url,
			_this = this;
		c.width = width;
		c.height = height;
		dimensions = this.resize(img.width, img.height, width, height);
		if (crop) {
			c.width = dimensions.w;
			c.height = dimensions.h;
			dimensions.x = 0;
			dimensions.y = 0;
		}
		if (background !== "transparent") {
			cx.fillStyle = background;
			cx.fillRect(0, 0, thumbwidth, thumbheight);
		}
		cx.drawImage(img, dimensions.x, dimensions.y, dimensions.w, dimensions.h);
		thumb = {};
		url = (false ? c.toDataURL("image/jpeg", 0.8) : c.toDataURL());
		thumb.src = url;
		thumb.title = Math.round(url.length / 1000 * 100) / 100 + " KB";
		obj.nail = thumb;
		this.index++;
		this.postMessage({
			cmd: "update",
			file: obj,
			per: 100 * this.index / this.length
		});
		return setTimeout((function() {
			return _this.load(_this.stack.shift());
		}), 1, false);
	};
    ThumbnailCreator.prototype.resize = function(imagewidth, imageheight, thumbwidth, thumbheight) {
        var h, maxratio, w;
        maxratio = Math.max(imagewidth / thumbwidth, imageheight / thumbheight);
        w = maxratio > 1 ? imagewidth / maxratio : imagewidth;
        h = maxratio > 1 ? imageheight / maxratio : imageheight;
        return {
            w: w,
            h: h,
            x: (thumbwidth - w) / 2,
            y: (thumbheight - h) / 2
        };
    };
  
  return ThumbnailCreator;
})();
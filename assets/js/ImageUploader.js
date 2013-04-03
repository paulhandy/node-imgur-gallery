var FileDropper, ImageThumb, ImageUploader, ThumbnailerStack, background, crop, jpeg, org, quality, thumbheight, thumbwidth,
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ImageUploader = (function() {
	var uploadKey;

	uploadKey = null;

	function ImageUploader(container) {
		var dropzone, fileDropper, fileInput, output, p, submit, upload, wrapper,
			_this = this;
		this.container = container;
		this.getApiKey = __bind(this.getApiKey, this);

		wrapper = document.createElement("center");
		dropzone = document.createElement("div");
		fileInput = document.createElement("input");
		p = document.createElement("p");
		submit = document.createElement("button");
		output = document.createElement("div");
		upload = document.createElement("ul");
		this.getApiKey("imgur", function() {
			upload.style.listStyle = "none";
			output.classList.add("uploadOutput");
			dropzone.classList.add("dropzone");
			fileInput.setAttribute("type", "file");
			fileInput.setAttribute("name", "files");
			fileInput.setAttribute("multiple", "multiple");
			fileInput.classList.add("FileInput");
			submit.classList.add("blue");
			submit.classList.add("button");
			submit.innerHTML = "Upload";
			wrapper.appendChild(dropzone);
			wrapper.appendChild(fileInput);
			p.appendChild(submit);
			wrapper.appendChild(p);
			wrapper.appendChild(output);
			return _this.container.appendChild(wrapper);
		});
		fileDropper = new FileDropper(dropzone, output, fileInput);
		submit.addEventListener("click", (function() {
			var sendFiles;
			sendFiles = function(files) {
				var img, stream, _i, _len, _results;
				console.log("sending files");
				wrapper.insertBefore(upload, output);
				_results = [];
				for (_i = 0, _len = files.length; _i < _len; _i++) {
					img = files[_i];
					stream = new ImgurUpload({
						image: img,
						info: JSON.parse(_this.getApiKey()),
						parent: upload
					});
					_results.push(stream.send());
				}
				return _results;
			};
			console.log("clickd");
			return _this.getApiKey("imgur", function() {
				return sendFiles(fileDropper.getImages());
			});
		}), false);
	}

	ImageUploader.prototype.getApiKey = function(src, callback) {
		var xhr;
		if (uploadKey) {
			if (callback) {
				callback();
			}
			return uploadKey;
		} else {
			xhr = new XMLHttpRequest();
			xhr.open("GET", "/resources/key/" + src, true);
			xhr.onload = function() {
				var response;
				if (this.responseText.length > 0) {
					response = this.responseText;
					uploadKey = response;
					return callback();
				}
			};
			xhr.send();
			return null;
		}
	};

	return ImageUploader;

})();

FileDropper = (function() {

	function FileDropper(dropzone, output, input) {
		var background, c, crop, cx, fd, images, jpeg, postThumb, quality, removeDragover, removeImage, thumbheight, thumbwidth,
			_this = this;
		this.dropzone = dropzone;
		this.output = output;
		this.input = input;
		this.progressCanvas = document.createElement("canvas");
		this.progressCanvas.setAttribute("width", "340");
		this.progressCanvas.setAttribute("height", "75");
		this.thumber = null;
		images = [];
		this.getImages = function() {
			return images;
		};
		c = document.createElement("canvas");
		cx = c.getContext("2d");
		thumbwidth = thumbheight = 100;
		crop = false;
		background = "white";
		jpeg = false;
		quality = 0.8;
		fd = this;
		if (typeof FileReader !== "undefined") {
			this.dropzone.innerHTML = "Drop images here";
			this.dropzone.addEventListener("dragleave", (function(evt) {
				evt.preventDefault();
				return this.classList.remove('dragover');
			}), false);
			this.dropzone.addEventListener("drop", (function(evt) {
				fd.addFiles(evt.dataTransfer.files || evt.target.files);
				evt.preventDefault();
				return this.classList.remove('dragover');
			}), false);
			document.body.addEventListener("drop", (function(evt) {
				evt.preventDefault();
				return _this.dropzone.classList.remove('dragover');
			}), false);
			this.dropzone.addEventListener("dragover", (function(evt) {
				evt.preventDefault();
				return this.classList.add('dragover');
			}), false);
			this.input.addEventListener("change", (function(evt) {
				return fd.addFiles(this.files);
			}), false);
			this.output.addEventListener("click", (function(evt) {
				var element, i, t, _i, _len, _ref, _results;
				t = evt.target;
				if (t.tagName === "IMG") {
					removeImage(t);
					t.parentNode.removeChild(t);
					if (this.childNodes.length >= 50) {
						i = 0;
						_ref = this.childNodes;
						_results = [];
						for (_i = 0, _len = _ref.length; _i < _len; _i++) {
							element = _ref[_i];
							i++;
							if (i <= 50) {
								_results.push(element.classList.remove('over50'));
							} else {
								_results.push(void 0);
							}
						}
						return _results;
					}
				}
			}), false);
		}
		this.addFiles = function(files) {
			var file, i, sessionStack, temp, _i, _len,
				_this = this;
			this.output.parentNode.insertBefore(this.progressCanvas, this.output);
			this.ProgressBar = new ProgressBar(this.progressCanvas);
			if (files.length > 0) {
				i = files.length;
				sessionStack = [];
				for (_i = 0, _len = files.length; _i < _len; _i++) {
					file = files[_i];
					if (file.type.indexOf("image") === 0) {
						sessionStack.push(new ImageThumb(file));
					}
				}
				images = images.concat(sessionStack);
				console.log(images);
				if (!this.thumber) {
					this.thumber = new ThumbnailerStack(sessionStack.slice(0));
				} else {
					this.thumber.stack = this.thumber.stack.concat(sessionStack);
				}
				temp = document.createElement('div');
				this.output.parentNode.insertBefore(temp, this.output);
				temp.classList.add('uploadOutput');
				this.thumber.onmessage = function(e) {
					if (e.cmd === "update") {
						postThumb(e.thumb);
						return _this.ProgressBar.value(e.per);
					} else if (e.cmd === "complete") {
						temp.parentNode.removeChild(temp);
						_this.ProgressBar.value(100);
						return _this.progressCanvas.parentNode.removeChild(_this.progressCanvas);
					}
				};
				return this.thumber.postMessage({
					cmd: "start"
				});
			}
		};
		postThumb = function(thumb) {
			if (thumb) {
				if (_this.output.childNodes.length >= 50) {
					thumb.classList.add('over50');
				}
				return _this.output.appendChild(thumb);
			}
		};
		removeImage = function(tag) {
			var obj, _i, _len;
			for (_i = 0, _len = images.length; _i < _len; _i++) {
				obj = images[_i];
				if (obj.thumb && obj.thumb === tag) {
					return images.splice(images.indexOf(obj), 1);
				}
			}
		};
	}

	return FileDropper;

})();

ImageThumb = (function() {

	function ImageThumb(file) {
		this.file = file;
	}

	return ImageThumb;

})();

ThumbnailerStack = (function() {
	var c, cx;

	c = document.createElement("canvas");

	cx = c.getContext("2d");

	function ThumbnailerStack(stack) {
		this.stack = stack;
		this.index = 0;
	}

	ThumbnailerStack.prototype.postMessage = function(e) {
		if (e.cmd === "start") {
			this.start();
		}
		if (e.cmd === "update") {
			this.update(e);
		}
		if (e.cmd === "complete") {
			return this.complete();
		}
	};

	ThumbnailerStack.prototype.start = function() {
		this.length = !this.length || this.length === 0 ? this.stack.length : this.length + this.stack.length;
		if (!this.inProgress) {
			return this.load(this.stack.shift());
		}
	};

	ThumbnailerStack.prototype.update = function(e) {
		return this.onmessage(e);
	};

	ThumbnailerStack.prototype.complete = function() {
		this.onmessage({
			cmd: "complete"
		});
		return this.inProgress = false;
	};

	ThumbnailerStack.prototype.load = function(obj) {
		var objURL, reader, url,
			_this = this;
		if (obj) {
			this.inProgress = true;
			url = window.URL || window.webkitURL;
			objURL = url.createObjectURL || false;
			if (objURL) {
				return this.toImage(url.createObjectURL(obj.file), obj);
			} else {
				reader = new FileReader();
				reader.readAsDataURL(obj.file);
				return reader.onload = function(ev) {
					return _this.toImage(ev.target.result, obj);
				};
			}
		} else {
			return this.postMessage({
				cmd: "complete"
			});
		}
	};

	ThumbnailerStack.prototype.toImage = function(file, obj) {
		var img,
			_this = this;
		img = new Image();
		img.src = file;
		return img.onload = function() {
			return _this.canvas(obj, img, thumbwidth, thumbheight, crop, background);
		};
	};

	ThumbnailerStack.prototype.canvas = function(obj, img, width, height, crop, background) {
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
		thumb = new Image();
		url = (jpeg ? c.toDataURL("image/jpeg", quality) : c.toDataURL());
		thumb.src = url;
		thumb.title = Math.round(url.length / 1000 * 100) / 100 + " KB";
		obj.thumb = thumb;
		this.index++;
		this.postMessage({
			cmd: "update",
			thumb: thumb,
			per: 100 * this.index / this.length
		});
		return setTimeout((function() {
			return _this.load(_this.stack.shift());
		}), 1, false);
	};

	ThumbnailerStack.prototype.resize = function(imagewidth, imageheight, thumbwidth, thumbheight) {
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

	return ThumbnailerStack;

})();

thumbwidth = thumbheight = 100;

crop = false;

background = "transparent";

jpeg = false;

quality = 0.8;

org = org || {};

org.shotokai = org.shotokai || {};

org.shotokai.ImageUploader = ImageUploader;

window.org = org;

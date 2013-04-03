var ImgurUpload;

ImgurUpload = (function() {

	function ImgurUpload(upload) {
		var canvas, fd, li, progressbar, req;
		console.log(upload);
		this.send = function() {
			return null;
		};
		if (!upload.image.file || !upload.image.file.type.match(/image.*/) || upload.image.file.type.match(/image\/svg/) || !upload.info) {return;}
		fd = new FormData();
		fd.append("image", upload.image.file);
		fd.append("key", upload.info.key);
		li = document.createElement("li");
		if (upload.image.thumb != null) {li.appendChild(upload.image.thumb);}
		canvas = document.createElement("canvas");
		canvas.setAttribute("width", "250");
		canvas.setAttribute("height", "75");
		canvas.style.margin = "auto";
		canvas.style.opacity = "0.7";
		li.appendChild(canvas);
		progressbar = new ProgressBar(canvas, 0, 200, 30, 10, 10);
		upload.parent.appendChild(li);
		req = new XMLHttpRequest();
		console.log(typeof upload.info);
		req.open("POST", upload.info.url, true);
		req.upload.onprogress = function(e) {
			console.log('progress'+e.loaded);
			if (e.lengthComputable) {
				return progressbar.value(e.loaded * 100 / e.total);
			}
		};
		req.addEventListener('load', (function(e) {
			var ajax, resource;
			progressbar = new ProgressBar(canvas, 0, 200, 30, 10, 10);
			console.log('Uploaded!');
			console.log(req.responseText);
			console.log(JSON.parse(req.responseText));
			ajax = new XMLHttpRequest();
			ajax.open("POST", "/resources", true);
			ajax.upload.onprogress = function(e) {
				if (e.lengthComputable) {
					return progressbar.value(e.loaded * 100 / e.total);
				}
			};
			ajax.onload = function() {
				upload.parent.removeChild(li);
				if (upload["return"]) {
					upload["return"](JSON.parse(ajax.responseText), JSON.parse(req.responseText));
				}
				return console.log(JSON.parse(ajax.responseText));
			};
			resource = new FormData();
			resource.append("url", JSON.parse(req.responseText).upload.links.imgur_page);
			resource.append("type", upload.image.file.type);
			resource.append("source", "imgur");
			resource.append("results", req.responseText);
			return ajax.send(resource);
		}), false);
		this.send = function() {
			return req.send(fd);
		};
	}

	return ImgurUpload;

})();

window.ImgurUpload = ImgurUpload;
function newUpload(thumb){
        var fd = new FormData(),
        xhr = new XMLHttpRequest();
        file = thumb.file;
        console.log(thumb);
        fd.append("image", file);
        fd.append("key", 'fb71ea116451276d28fc36432c1c878a');
        xhr.upload.addEventListener("progress", function(e){
            
            if (e.lengthComputable) {
                console.log('progress'+(e.loaded * 100 / e.total)+'%');
            }else{
                console.log('progress'+e.loaded);
            }
        }, false)
        xhr.addEventListener("load", function(e){
                console.log(xhr.responseText);
                var media = {upload:JSON.parse(xhr.responseText).upload};
                media.source = "imgur";
                media.apiKey = key;
                media.exhibit = $routeParams.exhibitUri;
                Media.save(media,function(m){
                    console.log(m);
                });
                
        }, false)
        //xhr.addEventListener("error", uploadFailed, false)
        //xhr.addEventListener("abort", uploadCanceled, false)
        xhr.open("POST", "http://api.imgur.com/2/upload.json")
        xhr.send(fd)
    }
var app = angular.module('galleryapp', ['exhibit','media']);
var key = undefined || getKey();
app.config(function($routeProvider,$locationProvider, $httpProvider){
        $httpProvider.defaults.headers.common['Authentication'] = key;
        $routeProvider.
                when('/collection',{controller:GalleryCtrl, templateUrl:'/gallery/list.html'}).
                when('/collection/gallery/:galleryId',{controller:ExhibitCtrl,templateUrl:'/gallery/view.html'}).
                when('/collection/gallery/exhibit/:exhibitId/:imageId',{controller:ImageCtrl,templateUrl:'/gallery/image.html'}).
                when('/collection/new',{controller:createExhibit,templateUrl:'/gallery/create.html'}).
                when('/collection/gallery/:exhibitUri/upload',{controller:UploadCtrl,templateUrl:'/gallery/upload.html'}).
                when('/collection/gallery/:id/edit',{controller:EditCtrl,templateUrl:'/gallery/edit.html'}).
                otherwise({redirectTo:'/collection'});
        $locationProvider.html5Mode(true);
});
function navCtrl($scope){
    $scope.login = key? '/logout.html':'/login';
}
function GalleryCtrl($scope, Exhibit){
	$scope.exhibits = Exhibit.query();
}

function ExhibitCtrl($scope,$routeParams,Exhibit,Media){
    Exhibit.get({exhibitId:$routeParams.galleryId},function(e){
        $scope.exhibit = e.exhibit;
    });
    Media.query({exhibitId:$routeParams.galleryId}, function(e){
        $scope.media = e.media
    });
    $scope.small = function(url){
        return url.replace(/(?:.(?!\.))+$/,'s$&')
    }
    $scope.link = function(id){
        return id.replace(/\/exhibit\/([._a-zA-Z0-9-]+)\//g, '');
    }
}

function ImageCtrl($scope,Media,$routeParams){
    var media = Media.get({exhibitId:$routeParams.exhibitUrl,mediaId:$routeParams.imageId},function(){
        $scope.media = media.media
    });
    $scope.large = function(url){
        return url.replace(/(?:.(?!\.))+$/,'l$&')
    }
}
function createExhibit($scope,$location,Exhibit){
	$scope.save = function(){
		var ex = $scope.exhibit;
		Exhibit.save(ex, function(exhibit){
			$location.path('/collection/gallery/'+exhibit.exhibit.id)
		});
	}
}
function EditCtrl($scope,Exhibit,Media,$routeParams,$http,$location){
        var exibit = Exhibit.find({url:$routeParams.exhibitUrl},function(){
            $scope.exhibit = exibit.exhibit[0];
            var media = Media.query({exhibitId:$scope.exhibit.id}, function(){
                $scope.media = media.media
            });
        });
        $scope.remove = function(){
            exibit.$remove({exhibitId:$scope.exhibit.id});
            $location.path('/collection');
        }
        $scope.small = function(url){
            console.log(url);
            return url.replace(/(?:.(?!\.))+$/,'s$&')
        }
        $scope.delete = function(image){
            console.log(image);
            ids = image.id.split('/');
            var durl = "/exhibit/eid/media/mid".replace("eid",ids[1]).replace("mid",ids[2]);
            $http({method:"DELETE",url:durl})
                .success(function(data){
                    $scope.media.splice($scope.media.indexOf(image),1);
                }).error(function(data){
                    console.log(data);
                });
            console.log(image.id);
        }
}
function UploadCtrl($scope,$routeParams,Media,$location){
    var dropbox = document.getElementById('dropbox');
    var stack = {};
    stack.files = []
    $scope.thumbs = [];
    
    $scope.setFile = function(element){
        $scope.$apply(function($scope){
            for(var i=0;i<element.files.length;i++){
                $scope.thumbs.push({file:element.files[i]});
            }
        });
    }
    $scope.upload = function(){
        var len = $scope.thumbs.length;
        for(var i=0;i<len;i++){
            uploadv3($scope.thumbs[i]);
        }
    }
    function uploadv3(thumb){
        var fd = new FormData(),
        xhr = new XMLHttpRequest(),
        keyxhr = new XMLHttpRequest();
        file = thumb.file;
        console.log(thumb);
        fd.append("image", file);
        xhr.upload.addEventListener("progress", function(e){
            
            if (e.lengthComputable) {
                console.log('progress'+(e.loaded * 100 / e.total)+'%');
            }else{
                console.log('progress'+e.loaded);
            }
        }, false)
        xhr.addEventListener("load", function(e){
                console.log(xhr.responseText);
                var media = {data:JSON.parse(xhr.responseText).data};
                media.source = "imgur";
                media.exhibit = $routeParams.exhibitUri;
                Media.save(media,function(m){
                    console.log(m);
                });
                console.log(JSON.parse(xhr.responseText));
                $scope.thumbs.splice($scope.thumbs.indexOf(thumb),1);
                if($scope.thumbs.length === 0){
                    $location.path('/collection/gallery/'+$routeParams.exhibitUri)
                }
        }, false)
        //xhr.addEventListener("error", uploadFailed, false)
        //xhr.addEventListener("abort", uploadCanceled, false)
        xhr.open("POST", "https://api.imgur.com/3/upload.json")
        keyxhr.open("POST","/gallery/uploadKey")
        keyxhr.setRequestHeader("Authentication","Token "+key);
        keyxhr.onload = function(){
            xhr.setRequestHeader('Authorization','Client-ID '+keyxhr.responseText)
            xhr.send(fd)
        }
        keyxhr.send()
        
    }
    
    $scope.remove = function(thumb){
        $scope.thumbs.splice($scope.thumbs.indexOf(thumb),1);
    }
    $scope.log = function(obj){
        console.log(obj);
    }
    function dropControl(evt){
        evt.preventDefault();
            evt.stopPropagation();
            this.classList.remove('dragover');
            var files = evt.dataTransfer.files
            thumbnailFiles(files, function(rstack){
                $scope.$apply(function($scope){
                    $scope.thumbs.push(rstack);
                });
            });
    }


    dropbox.addEventListener("drop",dropControl,false);
    dropbox.addEventListener("dragover",function(evt){this.classList.add('dragover'); evt.preventDefault(); },false);
    dropbox.addEventListener("dragleave",function(evt){this.classList.remove('dragover'); evt.preventDefault()},false);
    dropbox.addEventListener("dragover", (function(evt) {evt.preventDefault()}), false);
    document.body.addEventListener("drop", (function(evt) {evt.preventDefault()}), false);
    function thumbnailFiles(files, callback){
        var i,len,file,
            imageStack = [];
            returnStack = []
        if(files.length>0){
            for(i = 0,len=files.length;i<len;i++){
                file = files[i];
                if(~file.type.indexOf("image")){
                    imageStack.push({file:file});
                }
            }
            var thumber = new ThumbnailCreator(imageStack);
            thumber.onmessage = function(e){
                switch(e.cmd){
                    case "update":
                        callback(e.file);
                        return returnStack.push(e.file);
                    case "complete":
                        return e;
                }
            };
            thumber.postMessage({cmd:"start"});
        }
        
    }
}
function getKey(){
    try{
        if(window.localStorage){
            return localStorage.getItem('sk');
        }
        return undefined;
    }catch(error){
        return undefined;
    }
}
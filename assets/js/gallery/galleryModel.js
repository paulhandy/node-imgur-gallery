angular.module('exhibit',['ngResource']).
    factory('Exhibit',function($resource){
        
        return $resource('/exhibit/:exhibitId',{},{
            update:{method:'PUT'},
            query:{method:'GET',isArray:false},
            images:{method:'GET',url:'/exhibit/:exhibitId/media',isArray:false},
            find:{method:'GET',url:'/exhibit/find',isArray:false}
        });
});

angular.module('media',['ngResource']).
    factory('Media',function($resource){
        return $resource('/exhibit/:exhibitId/media/:mediaId',
        {exhibitId:'@exhibit',mediaId:'@id'},
        {
            update:{method:'PUT'},
            query:{method:'GET',url:'/exhibit/:exhibitId/media',params:{exhibitId:'@id'},isArray:false}
        });
});

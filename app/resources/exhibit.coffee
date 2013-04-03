resourceful = require('resourceful')
request = require 'request'
try
    couch = JSON.parse(process.env.COUCHDBD)
    couch.database = 'akds'
    resourceful.use 'couchdb', couch
catch error
    resourceful.use 'memory'

Exhibit = exports.Exhibit = resourceful.define 'exhibit', ->
    @string 'name'
    @string 'nsname'
    @restful = true
    @strict = true
    @before 'save', (e,c) ->
        e.nsname = e.nsname or (e.name.replace /\s/g,'-' if e.name?)
        c()
    @before 'update', (e,c) -> RestSecure e,c,'upload'


Exhibit::add = (resource) ->
    @resources.push resource

Media = exports.Media = resourceful.define 'media', ->
    @before 'destroy', (pic,c) ->
        MediaArchive.create pic
        rm = (hsh) ->
            deleteUrl = "https://api.imgur.com/3/image/#{hsh}"
            console.log deleteUrl
            request method: "DELETE", uri: deleteUrl, headers:{'Authorization':'Client-ID 0a1553765275609'}, (e,s,b)=>
                console.log 'deleted it!'
        if pic.data and pic.data.deletehash
            rm pic.data.deletehash
            c()
        else
            c()
    @before 'create', (pic,c) ->
        console.log pic
        pic.exhibit = undefined
        c()
    @restful = true
    @strict = true
    @string 'description'
    @string 'source'
    @object 'data'
    @parent 'Exhibit'
MediaArchive = exports.Archive = resourceful.define 'mediaArchive', ->
    @before 'destroy', (pic,c) ->
        rm = (hsh) ->
            deleteUrl = "https://api.imgur.com/3/image/#{hsh}"
            request method: "DELETE", uri: deleteUrl, headers:{'Authorization':'Client-ID 0a1553765275609'}
        if pic.data and pic.data.deletehash
            rm pic.data.deletehash
            c()
        else
            c()
    @restful = true
    @strict = true
    @string 'description'
    @string 'source'
    @object 'data'
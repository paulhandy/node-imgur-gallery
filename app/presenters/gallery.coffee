User = require '../resources/user'
Views = require '../views/gallery'
Cipher = require '../utils/cipher'
plates = require 'plates'
fs = require 'fs'
exports.dir = "#{__dirname}/../views/files/gallery"
# This is for development use.  Production has views in memory.
exports.sendKey = ->
    @res.writeHead 200, 'content-type':'text/plain'
    @res.end process.env.IMGURID
exports.gallery = ->
    @res.writeHead 200, 'content-type':'text/html', "Access-Control-Allow-Origin" : "*"
    fs.readFile "#{exports.dir}/index.html", 'utf8', (error,data) =>
        @res.end data
exports.list = ->
    @res.writeHead 200, 'content-type':'text/html'
    fs.readFile "#{exports.dir}/list.html",'utf8',(error,data)=>
        if @req.session.user and ~@req.session.user.roles.indexOf 'upload'
            @res.end plates.bind data,
                galleryOptions:'<a href="/collection/new"><i class="icon-plus-sign"></i>Create New Exhibit</a>'
                exhibitOptions:'<a href="/collection/gallery/{{exhibit.url}}/edit"><i class="icon-pencil"></i>Edit</a>'
        else
            @res.end data

exports.view = ->
    @res.writeHead 200, "Content-Type":"text/html"
    fs.readFile "#{exports.dir}/view.html",'utf8',(error,data)=>
        if @req.session.user and ~@req.session.user.roles.indexOf 'upload'
            @res.end plates.bind data, 
                upload: '<a href="/collection/gallery/{{exhibit.id}}/upload">Upload</a>',
                edit: '<a href="/collection/gallery/{{exhibit.id}}/edit">Edit</a>'
        else
            @res.end data

exports.create = ->
    @res.writeHead 200, "Content-Type":"text/html"
    fs.readFile "#{exports.dir}/create.html",'utf8',(error,data)=>
        @res.end data

exports.edit = ->
    if @req.session.user and ~@req.session.user.roles.indexOf 'upload'
        @res.writeHead 200, "Content-Type":"text/html"
        fs.readFile "#{exports.dir}/edit.html",'utf8',(error,data)=>
            @res.end data
    else
        @res.end ''

exports.image = ->
    @res.writeHead 200, "Content-Type":"text/html"
    fs.readFile "#{exports.dir}/image.html",'utf8',(error,data)=>
        @res.end data
        

exports.galleryjs = ->
    uploader = if @req.session.user then ~@req.session.user.roles.indexOf 'upload' else false
    @res.writeHead 200, 'Content-Type':'application/javascript'
    fs.readFile "#{exports.dir}/js/gallery.js",'utf8',(error,galleryjs)=>
        if uploader
            fs.readFile "#{exports.dir}/js/uploadRoute.js",'utf8',(error,editorRoutes)=>
                fs.readFile "#{exports.dir}/js/uploadControls.js",'utf8',(error,editorController) =>
                    @res.end galleryjs.replace(/\/\/extraRoutes/,editorRoutes).replace(/\/\/extraControllers/,editorController)
        else
            @res.end galleryjs
exports.galleryModel = ->
    @res.writeHead 200, "Content-Type":"application/javascript"
    fs.readFile "#{exports.dir}/js/galleryModel.js",'utf8',(error,gallerymodel)=>
        if @req.session.user
            key = Cipher.encrypt @req.session.user.id
            @res.end gallerymodel.replace /undefined/, "'#{key}'"
        else
            @res.end gallerymodel

exports.upload = ->
    @res.writeHead 200, "Content-Type":"text/html"
    @res.end Views.upload




###  This is the normal version for production use
exports.gallery = ->
    @res.writeHead 200, 'content-type':'text/html'
    @res.end Views.gallery
exports.list = ->
    @res.writeHead 200, 'content-type':'text/html'

    if @req.session.user and ~@req.session.user.roles.indexOf 'upload'
        @res.end plates.bind Views.list,
                galleryOptions:'<a href="/collection/new"><i class="icon-plus-sign"></i>Create New Exhibit</a>'
                exhibitOptions:'<a href="/collection/gallery/{{exhibit.url}}/edit"><i class="icon-pencil"></i>Edit</a>'
    else
        @res.end Views.list

exports.view = ->
    @res.writeHead 200, "Content-Type":"text/html"
    if @req.session.user and ~@req.session.user.roles.indexOf 'upload'
        @res.end plates.bind Views.view, upload:'<a href="/collection/gallery/{{exhibit.id}}/upload">Upload to exhibit</a>'
    else
        @res.end Views.view

exports.create = ->
    @res.writeHead 200, "Content-Type":"text/html"
    @res.end Views.create
exports.upload = ->
    @res.writeHead 200, "Content-Type":"text/html"
    @res.end Views.upload

exports.image = ->
    @res.writeHead 200, "Content-Type":"text/html"
    @res.end Views.image
exports.galleryjs = ->
    if uploader
        @res.end Views.galleryjs.replace(/\/\/extraRoutes/,Views.editorRoutes).replace(/\/\/extraControllers/,Views.editorController)
    else
        @res.end Views.galleryjs
exports.gallerymodel = ->
    if @req.session.user
        key = Cipher.encrypt @req.session.user.id
        @res.end Views.gallerymodel.replace /xkey/, key
    else
        @res.end Views.gallerymodel
###


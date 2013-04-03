fs = require 'fs'
exports.dir = "#{__dirname}/files/gallery"

# html templates
exports.gallery = ''
fs.readFile "#{exports.dir}/index.html", 'utf8', (error,data) ->
	exports.gallery += data

exports.list = ''
fs.readFile "#{exports.dir}/list.html",'utf8',(error,data)->
	exports.list += data

exports.view = ''
fs.readFile "#{exports.dir}/view.html",'utf8',(error,data)->
	exports.view += data

exports.create = ''
fs.readFile "#{exports.dir}/create.html",'utf8',(error,data)->
	exports.create += data

exports.edit = ''
fs.readFile "#{exports.dir}/edit.html",'utf8',(error,data)->
	exports.edit += data

exports.upload = ''
fs.readFile "#{exports.dir}/upload.html",'utf8',(error,data)->
	exports.upload += data

exports.image = ''
fs.readFile "#{exports.dir}/image.html",'utf8',(error,data)->
    exports.image += data

# javascripts

exports.galleryjs = ''
fs.readFile "#{exports.dir}/js/gallery.js",'utf8',(error,data)->
	exports.galleryjs += data

exports.gallerymodel = ''
fs.readFile "#{exports.dir}/js/galleryModel.js",'utf8',(error,data)->
	exports.gallerymodel += data
exports.editorRoutes = ''
fs.readFile "#{exports.dir}/js/uploadRoute.js",'utf8',(error,data)->
	exports.editorRoutes += data
exports.editorController = ''
fs.readFile "#{exports.dir}/js/uploadControls.js",'utf8',(error,data) ->
	exports.editorController += data

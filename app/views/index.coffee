fs = require 'fs'
Views = module.exports
Views.viewsDir = "#{__dirname}/files"

Views.index = ''
indexPage = fs.readFile "#{Views.viewsDir}/index.html", "utf8",(err,data)->
	Views.index += data

Views.login = ''
loginPage = fs.readFile "#{Views.viewsDir}/login.html", "utf8",(err,data)->
	Views.login += data

Views.notFound = ''
notFound = fs.readFile "#{Views.viewsDir}/404.html", 'utf8', (err,data) ->
	Views.notFound += data

Views.gallery = ''
gallery = fs.readFile "#{Views.viewsDir}/gallery.html", 'utf8', (err,data) ->
	Views.gallery += data

fs = require 'fs'
Views = module.exports
Views.viewsDir = "#{__dirname}/files"


Views.login = ''
loginPage = fs.readFile "#{Views.viewsDir}/login.html", "utf8",(err,data)->
	Views.login += data

Views.finished = ''
fs.readFile "#{Views.viewsDir}/authorized.html", "utf8", (err,data) ->
    Views.finished += data
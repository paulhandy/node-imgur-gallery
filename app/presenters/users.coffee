User = require '../resources/user'
Views = require '../views/gallery'
Cipher = require '../utils/cipher'
plates = require 'plates'
fs = require 'fs'
exports.dir = "#{__dirname}/../views/files/user"

exports.index = ->
    @res.writeHead 200, 'content-type':'text/html'
    fs.readFile "#{exports.dir}/index.html",'utf8',(error,data)=>
        if @req.session.user
            key = Cipher.encrypt @req.session.user.id
            data = data.replace /undefined/, "'#{key}'"
        @res.end data
        
exports.list = ->
    @res.writeHead 200, 'content-type':'text/html'
    fs.readFile "#{exports.dir}/list.html",'utf8',(error,data)=>
        @res.end data
        
exports.show = ->
    @res.writeHead 200, 'content-type':'text/html'
    fs.readFile "#{exports.dir}/show.html",'utf8',(error,data)=>
        @res.end data
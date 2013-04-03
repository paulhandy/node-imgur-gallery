User = require('../resources/user').User
cipher = require './cipher'
class Securer
    constructor: (items) ->
        @items = items
        list = "#{item for item of items}".replace /,/g,'|'
        @r = RegExp("/(((#{list})$)|((#{list})/(([._a-zA-Z0-9-]+$)|(([._a-zA-Z0-9-]+)/update$)|(([._a-zA-Z0-9-]+)/destroy$))))")
        
    secure: (req,res) =>
        if req.method is "GET"
            res.emit 'next'
        else
            if req.url.match @r
                @check req,res
            else
                res.emit 'next'
    check: (req,res) =>
        role = (=>            
            for item in (i for i of @items)
                if ~req.url.indexOf(item) is -2
                    console.log item
                    return @items[item]
        )()
        console.log role
        reject = ->
            res.writeHead 401, 'Content-Type':'text/plain'
            res.end JSON.stringify error:'not authorized'
        if req.headers.authentication
            identifier = (->
                    try
                        cipher.decrypt (req.headers.authentication.replace /Token /, '')
                    catch error
                        req.headers.authentication.replace /Token /, ''
                )()
            User.get identifier, (error, user) =>
                console.log user.roles, role if user?
                if error or not user.hasRole role
                    if user is undefined and identifier is process.env.KEY
                        res.emit 'next'
                    else
                        reject()
                else
                    res.emit 'next'
        else
            reject()
            
                    
module.exports = (items) -> new Securer(items)
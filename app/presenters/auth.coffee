openid = require 'openid'
request = require 'request'
Views = require '../views/auth-view'
Umodel = require('../resources/user')
User = Umodel.User
Cipher = require '../utils/cipher'
extensions = [
    new openid.UserInterface()
    new openid.SimpleRegistration
        "nickname" : true
        "email" : true
        "fullname" : true
        "dob" : true
        "gender" : true
        "postcode" : true
        "country" : true
        "language" : true
        "timezone" : true
    new openid.AttributeExchange
        "http://axschema.org/contact/email": "required"
        "http://axschema.org/namePerson/friendly": "required"
        "http://axschema.org/namePerson": "required"
        "http://axschema.org/namePerson/first": "required"
        "http://axschema.org/namePerson/last": "required"
        "http://openid.net/schema/person/guid":"required"
        "http://openid.net/schema/timezone":"required"
    ]

host = process.env.HOST or "http://localhost:3000"
relyingParty = new openid.RelyingParty "#{host}/auth/openid",null,false,false,extensions
exports.login = ->
    @res.writeHead 200, 'Content-Type':'text/html'
    @res.end Views.login

exports.authenticate = ->
    relyingParty.authenticate @req.body.openid_identifier, false, (error,authUrl) =>
        @res.writeHead 200, "Conent-Type":'text/plain' if error or not authUrl?
        if error
            @res.end "Authentication Failed: #{error.message}" 
        else if not authUrl
            @res.end "Authentication Failed" 
        else 
            @res.writeHead 302, Location:authUrl
            @res.end()

exports.verify = ->
    req = @req
    res = @res
    relyingParty.verifyAssertion req, (error,result) ->
        res.writeHead 200, 'Content-Type':'text/html'
        if result and result.authenticated
            if req.session.user and req.session.user.claimedIdentifier is result.claimedIdentifier
                return res.end Views.finished.replace '#info#', "{key: '#{Cipher.encrypt req.session.user.id}'}"
            else
                User.find claimedIdentifier:result.claimedIdentifier, (findError, foundUser) ->
                    if findError
                        res.end Views.finished.replace '#info#', "#{JSON.stringify error}"
                    else if foundUser.length is 0
                        result.authenticated = undefined
                        User.create result, (error, newUser) ->
                            req.session.regenerate ->
                                req.session.user = newUser
                                process.nextTick ->
                                    res.end Views.finished.replace '#info#', "{key: '#{Cipher.encrypt req.session.user.id}'}"
                    else
                        req.session.regenerate ->
                            req.session.user = foundUser[0]
                            process.nextTick ->
                                res.end Views.finished.replace '#info#', "{key: '#{Cipher.encrypt req.session.user.id}'}"
        else
            return res.end Views.finished.replace '#info#', "#{JSON.stringify error}"
exports.logout = ->
    @req.session.destroy =>
        @res.end Views.finished.replace '#info#', ''
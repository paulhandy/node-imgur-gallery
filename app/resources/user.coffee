resourceful = require 'resourceful'
try
    couch = JSON.parse(process.env.COUCHDBD)
    couch.database = 'akds'
    resourceful.use 'couchdb', couch
catch error
    resourceful.use 'memory'

User = exports.User = resourceful.define 'individual', ->
    @restful = true
    @strict = true
    @string 'claimedIdentifier'
    @string 'email'
    @string 'firstName'
    @string 'lastName'
    @string 'phone'
    @string 'club'
    @string 'rank'
    @array 'roles'

User::createRole = (role) ->
    @roles.push role
User::hasRole = (role) ->
    ~@roles.indexOf(role)

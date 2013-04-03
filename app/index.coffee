flatiron = require('flatiron')
path = require('path')
connect = require('connect')
ecstatic = require('ecstatic')
restful = require('restful')
fs = require('fs')
app = module.exports = flatiron.app

Views = require './views'
Auth = require './presenters/auth'
Gallery = require './presenters/gallery'
Users = require './presenters/users'
restsecure =(require './utils/restsecure') exhibit:'upload','exhibit/([._a-zA-Z0-9-]+)/media':'upload', individual:'admin', 'gallery/uploadKey':'upload', mediaArchive:'admin'
app.resources =
    Exhibit: require('./resources/exhibit').Exhibit
    User: require('./resources/user').User

app.use flatiron.plugins.http,
    onError: (err) -> @res.writeHead err.status or 404, 'Content-Type':'text/html';@res.end Views.notFound
    before: [
        ecstatic root: "#{__dirname}/../assets"
        connect.favicon "#{__dirname}/../assets/images/favicon.ico"
        connect.cookieParser "cookie cat"
        connect.logger 'dev'
        (req,res) -> 
            if req.body
                console.log req.body
            res.emit 'next'
        connect.session()
        connect.methodOverride()
        restsecure.secure
    ]

    
    
#app.router.get '/', -> @res.json 'hello': 'world'
app.router.get '/collection', Gallery.gallery
app.router.get '/collection/gallery/:gallery', Gallery.gallery
app.router.get '/collection/gallery/:gallery/image/:imageId', Gallery.gallery
app.router.get '/collection/gallery/:gallery/upload', Gallery.gallery
app.router.get '/collection/gallery/:gallery/edit', Gallery.gallery
app.router.get '/collection/gallery/exhibit/:eid/:mid', Gallery.gallery
app.router.get '/collection/new', Gallery.gallery
app.router.get '/gallery/list.html', Gallery.list
app.router.get '/js/gallery.js', Gallery.galleryjs
app.router.get '/js/galleryModel.js', Gallery.galleryModel
app.router.get '/gallery/view.html', Gallery.view
app.router.get '/gallery/create.html', Gallery.create
app.router.get '/gallery/edit.html', Gallery.edit
app.router.get '/gallery/upload.html', Gallery.upload
app.router.get '/gallery/image.html', Gallery.image
app.router.post '/gallery/uploadKey', Gallery.sendKey

app.router.get '/users', Users.index
app.router.get '/users/:u', Users.index
app.router.get '/user/list', Users.list
app.router.get '/user/show', Users.show

app.router.get '/login', Auth.login
app.router.post '/logout', Auth.logout
app.router.path '/auth/openid', ->
    @post Auth.authenticate
    @get Auth.verify

app.use restful
app.start process.env.PORT or 3000, ->
    app.log.info "started app on port #{process.env.PORT or 3000}"
    

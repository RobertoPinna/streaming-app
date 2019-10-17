

//server on the same index page
// on the server if i print it will print on the console on terminal 
// if  i want to print i have to resend back

const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
var cors = require('cors') // for javascript policy cors cross origin resource sharing ( for localhost in different resource)
const hbs = require('hbs')

var x_init = 0
var x_end = 0
var y_init = 0
var y_end = 0


const {spawn} = require('child_process')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const fetch = require('node-fetch')

var bodyParser = require('body-parser')

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname , '../templates/views')
const pathImage = path.join(__dirname , '../public/img')
//const partialsPath = path.join(__dirname , '../templates/partials')

var flag = 0

var immagine = 0 


app.set('view engine' , 'hbs')
app.set('views' , viewPath)
//hbs.registerPartials(partialsPath)

app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
app.use(express.static(publicDirectoryPath))
app.use(cors())

app.options('*', cors())

app.get('/prova' , (req,res) => {
    res.send({ prova : 'prova' , posx : posx , posy : posy})
})

app.get('/coords1' , (req,res) => {
    res.send({ x_init : x_init , x_end : x_end , y_init : y_init , y_end : y_end })
})


app.get('/super' , (req,res) => {
    //console.log(req.body.canvas_name.toDataURL('image/jpeg'))
    console.log('qui')
    console.log(req.query.posx)
    console.log(req.query.posy)
    console.log(req.body)
    console.log('qua')
    /*fetch('https://streaming-app-roby.herokuapp.com/general').then( (response) => { // qui posso accedere tranquillamente ad heroku https://streaming-app-roby.herokuapp.com/prova
    
        response.json().then( (data) => {
            console.log(data)
            
        }).catch((error) => {
            console.log(error)
        })
        }).catch( (error) => {
        console.log(error)
        })
        */
    res.send( {immagine : 'ciao'})
})


app.post('/image' , (req,res, next) => {
    //console.log(req.body.canvas_name.toDataURL('image/jpeg'))
    console.log('qui')
    //console.log(req.query.posx)
    //console.log(req.query.posy)
    console.log(req.body.immagine)
    console.log('qua')
    immagine = req.body.immagine
    console.log(immagine === req.body.immagine)
    /*
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    */
   //fetch('http://localhost:3000/image1')
   var data = immagine.replace(/^data:image\/\w+;base64,/, '')
    require("fs").writeFile(pathImage + '/image_try.png', data, {encoding: 'base64'}, function(err) {
        console.log(err);
    });
    res.send( {image : req.body.immagine})
})


/*
app.get('/image1' , (req,res, next) => {
    console.log('questo?')
    //req.body.immagine.src = immagine
    res.writeHead(200, {
    //res.status(200).set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    res.write(`data : ${immagine}`)
    res.end()
})*/

var sock = 0

io.on('connection' , (socket) => { // when someone connect to server

    sock = socket

    console.log('New web socket connection')

    /*socket.on('send_h_w' , (window_height , window_width) => { 
        socket.broadcast.emit('receive_h_w' , window_height , window_width )
    })*/
    app.post('/image1' , (req,res, next) => {

        console.log('questo?')
        immagine = req.body.immagine
        socket.broadcast.emit('stream_server', req.body.immagine)
        next()
    })
    app.get('/image1' , (req,res, next) => {

        console.log('codesto?')
        socket.broadcast.emit('stream_server', immagine)
        next()
    })
    /*
    socket.on('stream' , (image) => {
        //console.log('c')
        socket.broadcast.emit('stream_server', image)
        //console.log('d')
    })

    */
    socket.on('send_area_coordinates' , (area_x_init , area_x_end , area_y_init , area_y_end ) => {
        x_init = area_x_init
        x_end = area_x_end
        y_init = area_y_init
        y_end = area_y_end

        socket.broadcast.emit('send_area_coord' , area_x_init , area_x_end , area_y_init , area_y_end )
    })

    socket.on('send_click' , () => {
        socket.broadcast.emit('receive_click')
    })
        
    socket.on('allow_send_area_size' , ( ) => {
        socket.broadcast.emit('u_can_send_area_size')
    })

    socket.on('send_mouse' , (x_pos , y_pos) => {
        posx = x_pos
        posy = y_pos
        console.log(posx+' sono qui')
        console.log(x_pos)
        socket.broadcast.emit('receive_mouse' , x_pos , y_pos)
        
        
        /*fetch('http://localhost:3001/prova1?ip='+x_pos).then( (response) => {
            response.json().then( (data) => {
                console.log(data)
                console.log('si')
            })
            
        }).catch( (error) => {
            console.log(error)
        })
        */
    })

    socket.on('get_ip' , () => {
        console.log('lo getto o no?!?!')
        socket.emit('print_ip' , ('qui sono '+ socket.handshake.address+ ' qua sono') )
    })
   
    socket.on('disconnect' , () => {
        console.log('connection lost')
    })

   
})

server.listen(port , () => {
    console.log(`Listening at port ${port}! `)
    
})






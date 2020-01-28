

//server on the same index page
// on the server if i print it will print on the console on terminal 
// if  i want to print i have to resend back

const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
var cors = require('cors') // for javascript policy cors cross origin resource sharing ( for localhost in different resource)
const hbs = require('hbs')
const remove_device = require('./utils/remove_device')
const print_all_devices_tree = require('./utils/print_devices')
const install_device = require('./utils/install_device')

all_list_devices = [] 


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

var immagine = 0 


app.set('view engine' , 'hbs')
app.set('views' , viewPath)
//hbs.registerPartials(partialsPath)



app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// parse application/json
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(publicDirectoryPath))
app.use(cors())

app.options('*', cors())

app.get('/prova' , (req,res) => {
    res.send({ prova : 'prova' , posx : posx , posy : posy})
})

app.get('/coords1' , (req,res) => {
    res.send({ x_init : x_init , x_end : x_end , y_init : y_init , y_end : y_end })
})



app.get('/install_device' , (req,res) => {
    //here i receive the setting for setting up the device
    
    // here write commands to install the device on the machine : 
    
    //** 
    
        // code here
    
    //** 
        install_device ( req.query.first_size , req.query.second_size , req.query.ppi_size , req.query.browser , req.query.browser_version, req.query.os )
    
        res.send({ phrase : 'sta pagina mi serve per il device setup'})
    
      
    })
    
    app.get('/launching_device' , (req,res) => {
    
        console.log(req.query.first)
    
        res.send({phrase : 'here i launch the device'})
    
    })
    
    // this one go to the index.js file ( remote server )
    
    app.get('/remove_device' , (req,res) => { 
        if(remove_device(req.query.first , req.query.second ,req.query.ppi_size,req.query.browser,req.query.version,req.query.os)  != 0 )
            console.log('device removed successfully')
        else
            console.log("Sorry, the device doesn't exist" )
    
    
        res.send({'this_phrase' : 'This page is for removing a device'})
    })
    
    // this one go to the index.js file ( remote server ) ( or not?! )
    
    
    app.get('/devices_list' , (req,res) => { 
    
        // here instead of printing from array, try to print from the tree object structure
        const{total_elements , total_string } = print_all_devices_tree()
    
        if(total_elements.length > 0 ){
            all_list_devices = total_elements
            res.render('device_list', {
                lista_array : all_list_devices
            })
        }
        else{
            res.render('device_list', {
                no_list : 'No devices found ' 
            })
        }
    })

// ** here start the sockets **


io.on('connection' , (socket) => { // when someone connect to server

    sock = socket

    console.log('New web socket connection')

    /*socket.on('send_h_w' , (window_height , window_width) => { 
        socket.broadcast.emit('receive_h_w' , window_height , window_width )
    })*/
    app.post('/image1' , (req,res, next) => {

        console.log('questo?')
        immagine = req.body.immagine
        //here socket for sure, with fetch don't know how to listen the event and how to pass image
        socket.broadcast.emit('stream_server', req.body.immagine)
        res.send({})
    })

    //****************** */ try with receiving socket event instead on page, receive socket event and send socket

    app.get('/image1' , (req,res, next) => {

        socket.broadcast.emit('stream_server', immagine)
        res.send({})
    })

    /*
    socket.on('stream' , (image) => {
        //console.log('c')
        socket.broadcast.emit('stream_server', image)
        //console.log('d')
    })


    */

    socket.on('send_device_to_remove' , (first , second , ppi , browser , version , os ) => {
        remove_device(first,second,ppi,browser,version,os )
    })


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



    app.get('/coord_new' , (req, res ) => {

        socket.broadcast.emit('receive_mouse' , req.query.x_pos , req.query.y_pos)

        res.send({})
    })
    /*
    socket.on('send_mouse' , (x_pos , y_pos) => {
        posx = x_pos
        posy = y_pos
        console.log(posx+' sono qui')
        console.log(x_pos)
        socket.broadcast.emit('receive_mouse' , x_pos , y_pos)
        
    })*/

    //here with socket

    socket.on("sending_settings" , (first_size , second_size , ppi_size , browser , browser_version , os)  => {
        socket.broadcast.emit("receive_settings" , first_size , second_size , ppi_size , browser , browser_version , os )
        console.log(first_size,second_size,ppi_size ,  browser , browser_version ,  os )
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






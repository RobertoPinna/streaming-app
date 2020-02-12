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

    app.post('/receiving_data' , (req , res) => {
        socket.broadcast.emit('sending_data' , req.body.all_data)
        res.send({})
    })

    app.get('/result_adding' , (req , res) => {
        socket.broadcast.emit('sending_result_adding' , req.query.result_adding )
        res.send({})
    })

    app.get('/refresh_pages' , (req,res ) => {
        socket.broadcast.emit('refresh_page') 
        res.send({})
    })

    app.get('/wait_device', (req,res) => {
        socket.broadcast.emit('wait_device',req.query.wait_value)
        res.send({})
    })

    


    /*
    socket.on('stream' , (image) => {
        //console.log('c')
        socket.broadcast.emit('stream_server', image)
        //console.log('d')
    })
    */

    socket.on('send_device_to_run' , (first , second , ppi , browser , version , os) => {
        socket.broadcast.emit('launching_device' ,first , second , ppi , browser , version , os )
    })

    socket.on('sending_settings' , ( first , second , ppi , browser , version , os ) =>  {

        socket.broadcast.emit('sending_device' , first , second , ppi , browser , version , os  )

    })

    //requesting the data

    socket.on('i_want_list_data' , () => { // u have to go to super_user from here
        socket.broadcast.emit('send_me_the_data')

        /*
        const{total_elements , total_string } = print_all_devices_tree()
        
        if(total_elements.length > 0 )
            socket.emit('receive_print_list' , total_elements)
        else
            socket.emit('receive_print_list' , 'no devices found')*/
    })

    //receiving the data for installing new device (or not new ? )

    // sending the device to delete from the tree
    socket.on('send_device_to_remove' , (first , second , ppi , browser , version , os ) => {
        socket.broadcast.emit('device_to_remove' , first , second , ppi , browser , version , os )
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

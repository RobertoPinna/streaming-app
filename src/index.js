

//server on the same index page
// on the server if i print it will print on the console on terminal 
// if  i want to print i have to resend back

const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const {spawn} = require('child_process')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))



//let count = 0

io.on('connection' , (socket) => { // when someone connect to server
    
    //spawn('chrome')
    console.log(socket.handshake.address)

    http.get({
        hostname: 'localhost',
        port: port,
        path: '/',
        agent: false  // Create a new agent just for this one request
      }, (res) => {
        // Do stuff with response
        //console.log(res)
        console.log('andiamo')
        socket.broadcast.emit('receive_mouse' , 'socket.handshake.address' , ' di andare')
      });


    console.log('New web socket connection')

    socket.on('stream' , (image) => {
        console.log('c')
        socket.broadcast.emit('stream_server', image)
        console.log('d')
    })

    socket.on('send_mouse' , (x_pos , y_pos) => {
        socket.broadcast.emit('receive_mouse' , x_pos , y_pos)
    })
   
    socket.on('disconnect' , () => {
        console.log('connection lost')
    })

   
})

server.listen(port , () => {
    console.log(`Listening at port ${port}! `)
    
})






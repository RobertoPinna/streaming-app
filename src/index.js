

//server on the same index page
// on the server if i print it will print on the console on terminal 
// if  i want to print i have to resend back

const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
var cors = require('cors')


var posx = 0 

var posy = 0 

const {spawn} = require('child_process')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const fetch = require('node-fetch')


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname , '../templates/views')

var flag = 0

app.set('view engine' , 'hbs')
app.set('views' , viewPath)

app.use(express.static(publicDirectoryPath))
app.use(cors())

app.options('*', cors())

//let count = 0

//app.set('porta'  , 5000)


/*
app.get('/prova' , (req,res) => {
    return res.send({prova : 'prova' , ip : (req.query.ip)})
})


fetch('http://localhost:3000/prova?ip=ciaone').then( (response) => {
            response.json().then( (data) => {
                console.log(data)
                console.log('bho')
            })
            
        }).catch( (error) => {
            console.log(error)
        })

*/

app.get('/prova' , (req,res) => {
    res.send({ prova : 'prova' , ip : posx})
})
 


io.on('connection' , (socket) => { // when someone connect to server
    
    //spawn('chrome')
    /*app.get('/prova' , (req,res) => {
        res.send({ip_address : 'ciaone'})
    })*/

    //console.log(app.get('porta'))

 

 
    /*http.get({
        hostname: 'localhost',
        port: port,
        path: '/',
        agent: false  // Create a new agent just for this one request
      }, (res) => {
        // Do stuff with response
        //console.log(res)
        console.log('andiamo')
        //socket.broadcast.emit('receive_mouse' , socket.handshake.address , ' di andare davvero')
      });
*/

    console.log('New web socket connection')

    socket.on('stream' , (image) => {
        //console.log('c')
        socket.broadcast.emit('stream_server', image)
        //console.log('d')
    })

      
        

    socket.on('send_mouse' , (x_pos , y_pos) => {
        socket.broadcast.emit('receive_mouse' , x_pos , y_pos)
        console.log(x_pos+' sono qui')
        posx = x_pos
        posy = y_pos
        
        fetch('http://localhost:3001/prova1?ip='+x_pos).then( (response) => {
            response.json().then( (data) => {
                console.log(data)
                console.log('si')
            })
            
        }).catch( (error) => {
            console.log(error)
        })
        
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






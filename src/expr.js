

//server on the same index page
// on the server if i print it will print on the console on terminal 
// if  i want to print i have to resend back

const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const hbs = require('hbs')
const fetch = require('node-fetch')
var cors = require('cors')
//const robot = require('robotjs')
const d3 = require('d3-scale')
const fs = require('fs')

const install_device = require(__dirname+'/utils/install_device')
const print_devices = require(__dirname+'/utils/print_devices')

const {spawn} = require('child_process')

let rawdata = fs.readFileSync(__dirname+'/utils/devices_database.json')
/*
fs.writeFile(__dirname + "/../../database.json", 'jsonContent', 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
    console.log("JSON file has been saved.");
})
*/

var all_devices_tree = {}

all_list_devices = [] 


try{
    all_devices_tree = JSON.parse(rawdata).all_data
}catch(e){
    console.log('error reading the file ')
}


const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3001
const publicDirectoryPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname , '../templates/views')
const partialsPath = path.join(__dirname , '../templates/partials')

var x_init = 0 
var x_end = 0
var y_init = 0
var y_end = 0

var conta = 0

var scale_x = 0


var scale_y = 0


app.set('view engine' , 'hbs')
app.set('views' , viewPath)
hbs.registerPartials(partialsPath)

app.use(express.static(publicDirectoryPath))
app.use(cors())

app.options('*', cors())

app.get('/prova1',  (req,res) => {
    //robot.moveMouse( scale_x(req.query.x_pos) , scale_y(req.query.y_pos) )
    res.send({speriamo : 'sperem'})
})

app.get('/receiving_device_to_add' , (req,res) => {
//here i receive the setting for setting up the device
// this is the default string to install the new device

// here write commands to install the device on the machine

//
    if (install_device){
        rawdata = fs.readFileSync(__dirname+'/utils/devices_database.json');
        try{
            all_devices_tree = JSON.parse(rawdata).all_data
        }catch(e){
            console.log('error reading the file ')
        }

        fetch('https://streaming-app-roby.herokuapp.com/refresh_pages')

    }


    res.send({ phrase : 'sta pagina mi serve per il device setup'})

  
})

app.get('/launching_device' , (req,res) => {

    console.log(req.query.first)

    res.send({phrase : 'here i launch the device'})

})

// here always reading from the variable all_devices_tree

app.get('/devices_list' , (req,res) => { // this function has to be on the other server, remote one, index.js file

    console.log(all_devices_tree)

    const {total_elements , total_string} = print_devices()

    var jsonObj = {all_data : all_devices_tree}


    console.log(all_devices_tree)

    // here instead of printing from array, try to print from the tree object structure, so much better, so much fun
   
    if(Object.keys(all_devices_tree).length > 0 ){
        console.log(all_list_devices)

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


app.get('/coords' , (req,res) => {

    //fetch('http://localhost:3000/coords1').then( (response) => { 
    //right one
    //next step : try to make this function sync
    fetch('https://streaming-app-roby.herokuapp.com/coords1').then( (response) => { // qui posso accedere tranquillamente ad heroku https://streaming-app-roby.herokuapp.com/prova
    
        response.json().then( (data) => {
           
            // helping with d3 library
            x_init = data.x_init
            x_end = data.x_end
            y_init = data.y_init
            y_end = data.y_end


            scale_x = d3.scaleLinear()
                .domain([ x_init , x_end ])
                .range([ 1490 , 1867 ]) 
            
            scale_y = d3.scaleLinear()
                .domain([ y_init , y_end ])
                .range([ 83 , 759 ])
            
        }).catch((error) => {
            console.log(error)
        })
    }).catch( (error) => {
        console.log(error)
    })
    
    res.send({ phrase : 'sta pagina mi serve per le coordinate'})
})


app.get('/click' , (req,res) => {
    res.send('scriviamo qualcosa')
    //robot.mouseClick()
})
 


app.listen(port , ( ) => {
    console.log('server on port '+port)
})



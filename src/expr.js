

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
const remove_device = require (__dirname+'/utils/remove_devices')
const read_database = require(__dirname+"/utils/reading_database")

const {spawn} = require('child_process')

var all_devices_tree = {}

var all_list_devices = [] 

all_devices_tree = read_database()



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


app.get('/device_to_remove' , (req,res) => {

    const remove_result = remove_device(all_devices_tree , req.query.first_size , req.query.second_size , req.query.ppi_size , req.query.browser , req.query.browser_version , req.query.os )

    if(remove_result != 0 ){

        all_devices_tree = read_database()
        console.log(all_devices_tree)

        let{total_elements , total_string } = print_devices(all_devices_tree)

        console.log(total_elements)

        if(total_elements.length == 0 || total_elements == undefined || total_elements == [] )
            total_elements = 'no devices found'

            console.log(total_elements)

        const options = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify( { all_data : total_elements } )
        }

        fetch('https://streaming-app-roby.herokuapp.com/receiving_data', options)

    }else console.log('cannot delete the device')
    console.log(remove_result)

    res.send({risp : 'per rimuovere il device'})
})

app.get('/receiving_device_to_add' , (req,res) => {
//here i receive the setting for setting up the device
// this is the default string to install the new device

// here write commands to install the device on the machine

//
    const install_result = install_device(all_devices_tree , req.query.first_size , req.query.second_size , req.query.ppi_size, req.query.browser , req.query.browser_version , req.query.os)
    if (install_result != 0 ){

        var path = 'vboxmanage import "C:/Users/Havas Media/AppData/Local/Genymobile/Genymotion/ova/'

        const os_to_import = {
        '5.0' : 'genymotion_vbox86p_5.0_190715_221023.ova',
        '6.0' : 'still to do',
        '7.0' : 'still to do' ,
        '7.1' : 'still to do' ,
        '8.0' : 'still to do' ,
        '9.0' : 'still to do' ,
        '10.0' : 'still to do'
        }

        const full_name = '"'+req.query.first_size+'-'+req.query.second_size+'-'+req.query.ppi_size+'-'+req.query.browser+'-'+req.query.browser_version+req.query.os+'"'
        path += os_to_import[req.query.os]
        path += '" --vsys 0 --vname='+ full_name

        console.log(path)

        //spawn('genymotion_vbox86p_5.0_190715_221023.ova" --vsys 0  --vmname="vbox_5.0"')

        all_devices_tree = read_database()

        const {total_elements , total_string} = print_devices(all_devices_tree)

        all_list_devices = total_elements

        const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify( { all_data : all_list_devices} )
          }
        fetch('https://streaming-app-roby.herokuapp.com/result_adding?result_adding=1' ) 
        fetch('https://streaming-app-roby.herokuapp.com/receiving_data' , options ) 
    
    }else{
        fetch('https://streaming-app-roby.herokuapp.com/result_adding?result_adding=0' ) 
        console.log('Device already exist')
    }

    res.send({ phrase : 'sta pagina mi serve per il device setup'})

  
})

app.get('/launching_device' , (req,res) => {

    //here i have to set the settings for the device on vbox
    const full_name = '"'+req.query.first_size+'-'+req.query.second_size+'-'+req.query.ppi_size+'-'+req.query.browser+'-'+req.query.browser_version+req.query.os+'"'


/*
    if ('there is a file inside a directory of the dev created')
        const base_command = 'VBoxManage modifyvm'+full_name
        spawn(base_command+' --memory 1024 --vram 128')
    VBoxManage modifyvm $VM --memory 1024 --vram 128 ; to change memory hd and ram --memory 1024 --vram 128 ; to change memory hd and ram
        spawn(base_command+' --cpus 4')
    vboxmanage modifyvm genymotion_vbox86p_6.0_190716_010406 --cpus 4 ; to change cpus to 4 
        spawn(base_command+' --nic1 hostonly')
    vboxmanage modifyvm genymotion_vbox86p_6.0_190716_010406 --nic1 hostonly ; to change the network settings
        spawn(base_command+' --hostonlyadapter1 "VirtualBox Host-Only Ethernet Adapter #2"')
    vboxmanage modifyvm "genymotion_vbox86p_6.0_190716_010406" --hostonlyadapter1 "VirtualBox Host-Only Ethernet Adapter #2" ; to change network host only
        spawn('vboxmanage guestproperty set '+full_name+' vbox_graph_mode "'+req.query.first_size+'x'+req.query.second_size+'-'+'16"')
    VBoxManage guestproperty set genymotion_vbox86p_6.0_190716_010406 vbox_graph_mode 840x460-16 ; for screen size resolution
        spawn('vboxmanage guestproperty set '+full_name+' vbox_dpi "'+req.query.ppi_size+'"')
    VBoxManage guestproperty set genymotion_vbox86p_6.0_190716_010406 vbox_dpi 560 ; for dpi ( ppi ) resolution


    // here finished the settings, now begin running it 

    spawn('player --vm-name '+full_name)

*/
    console.log(req.query.first_size)

    res.send({phrase : 'here i launch the device'})

})

// here always reading from the variable all_devices_tree

app.get('/database' , (req,res) => { 

    all_devices_tree = read_database()

    const{total_elements , total_string} = print_devices(all_devices_tree)

    if(JSON.stringify(total_elements) != JSON.stringify({}) )
        all_list_devices = total_elements

    //console.log(all_list_devices)

    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify( { all_data : all_list_devices} )
      }

    fetch('https://streaming-app-roby.herokuapp.com/receiving_data' , options ) 


    res.send({mex : 'here the devices list'})

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



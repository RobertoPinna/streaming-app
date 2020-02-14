

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
const robot = require('robotjs')
const d3 = require('d3-scale')
const fs = require('fs')

const install_device = require(__dirname+'/utils/install_device')
const print_devices = require(__dirname+'/utils/print_devices')
const remove_device = require (__dirname+'/utils/remove_devices')
const read_database = require(__dirname+"/utils/reading_database")

const {spawn} = require('child_process')
const execSync = require('child_process').execSync
const exec = require('child_process').exec
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
    robot.moveMouse( scale_x(req.query.x_pos) , scale_y(req.query.y_pos) )
    res.send({speriamo : 'sperem'})
})


app.get('/device_to_remove' , (req,res) => {

    const remove_result = remove_device(all_devices_tree , req.query.first_size , req.query.second_size , req.query.ppi_size , req.query.browser , req.query.browser_version , req.query.os )

    if(remove_result != 0 ){

        const full_name = req.query.first_size+'-'+req.query.second_size+'-'+req.query.ppi_size+'-'+req.query.browser+'-'+req.query.browser_version+'-'+req.query.os

        var string_script = 'VBoxManage modifyvm "'+full_name+'" --hdb none\n'
        
        string_script += 'VBoxManage modifyvm "'+full_name+'" --hdd none\n'
        
        string_script += 'VBoxManage unregistervm "'+full_name+'" --delete'

        fs.writeFileSync(__dirname + "/../../streaming-app-script/remove_device.bat", string_script, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.")
                return console.log(err);
            }
            console.log("Script file has been saved.")

        })

        spawn(__dirname+'/../../streaming-app-script/remove_device.bat')

        all_devices_tree = read_database()
        console.log(all_devices_tree)

        let{total_elements , total_string } = print_devices(all_devices_tree)

        console.log(total_elements)

        if(total_elements.length == 0 || total_elements == undefined || total_elements == [] )
            total_elements = 'last device removed'

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


        //vboxmanage import "C:\\Users\\HavasMedia\\AppData\\Local\\Genymobile\\Genymotion\\ova\\genymotion_vbox86p_5.0_190715_221023.ova" --vsys 0 --vmname="Google Nexus 9" --cpus 4 --memory 1024 --unit 10 --disk "C:\\Users\\HavasMedia\\AppData\\Local\\Genymobile\\Genymotion\\deployed\\Google Nexus 9\\android_system_disk.vmdk" --unit 11 --disk "C:\\Users\\HavasMedia\\AppData\\Local\\Genymobile\\Genymotion\\deployed\\Google Nexus 9\\android_data_disk.vmdk" --unit 12 --disk "C:\\Users\\HavasMedia\\AppData\\Local\\Genymobile\\Genymotion\\deployed\\Google Nexus 9\\android_sdcard_disk.vmdk"

        var path = 'vboxmanage import "C:/Users/HavasMedia/AppData/Local/Genymobile/Genymotion/ova/'

        const os_to_import = {
        '5.0' : 'genymotion_vbox86p_5.0_190715_221023.ova',
        '5.1' : 'genymotion_vbox86p_5.1_190715_234435.ova',
        '6.0' : 'genymotion_vbox86p_6.0_190716_010406.ova' ,
        '7.0' : 'genymotion_vbox86p_7.0_190716_030217' ,
        '7.1' : 'genymotion_vbox86p_7.1_190716_045110' ,
        '8.0' : 'genymotion_vbox86p_8.0_190716_062924' ,
        '9.0' : 'genymotion_vbox86p_9.0_190715_123003' ,
        '10.0' : 'still to do'
        }

        const full_name = req.query.first_size+'-'+req.query.second_size+'-'+req.query.ppi_size+'-'+req.query.browser+'-'+req.query.browser_version+'-'+req.query.os
        path += os_to_import[req.query.os] +'"'
        path += ' --vsys 0 --vmname="'+ full_name+'" --cpus 4 --memory 1024 --unit 10 --disk "C:/Users/HavasMedia/AppData/Local/Genymobile/Genymotion/deployed/'+full_name+'/android_system_disk.vmdk" --unit 11 --disk "C:/Users/HavasMedia/AppData/Local/Genymobile/Genymotion/deployed/'+full_name+'/android_data_disk.vmdk" --unit 12 --disk "C:/Users/HavasMedia/AppData/Local/Genymobile/Genymotion/deployed/'+full_name+'/android_sdcard_disk.vmdk"'

        console.log(path)

        fs.writeFileSync(__dirname + "/../../streaming-app-script/import.bat", path, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.")
                return console.log(err);
            }
            console.log("Script file has been saved.")

        })

        spawn(__dirname+'/../../streaming-app-script/import.bat')

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
    const full_name = req.query.first_size+'-'+req.query.second_size+'-'+req.query.ppi_size+'-'+req.query.browser+'-'+req.query.browser_version+'-'+req.query.os

     //building the settings for device

    
    const path_to_check = 'C:/Users/HavasMedia/VirtualBox VMs/'+full_name+'/'+full_name+'.vbox'
    console.log(path_to_check)

    try {
        if (fs.existsSync(path_to_check)) {
            //file exists

            var script_text = 'vboxmanage storageattach "'+full_name+'" --storagectl IDEController --port 1 --device 0 --medium none\n'
            script_text += 'vboxmanage createhd --filename "C:/Users/HavasMedia/VirtualBox VMs/'+full_name+'/sdcard.vdi" --size 8192 --format VDI\n'
            script_text += 'vboxmanage storageattach "'+full_name+'" --storagectl IDEController --port 1 --device 0 --type hdd --medium "C:/Users/HavasMedia/VirtualBox VMs/'+full_name+'/sdcard.vdi"\n'
            script_text += 'vboxmanage setproperty machinefolder "C:/Users/HavasMedia/VirtualBox VMs"\n'
            script_text += 'vboxmanage modifyvm "'+full_name+'" --nic1 hostonly\n'
            script_text += 'vboxmanage modifyvm "'+full_name+'" --hostonlyadapter1 "VirtualBox Host-Only Ethernet Adapter #3"\n'
            script_text += 'vboxmanage modifyvm "'+full_name+'" --nictype1 virtio\n'
            script_text += 'vboxmanage modifyvm "'+full_name+'" --cableconnected1 on\n'
            script_text += 'vboxmanage modifyvm "'+full_name+'" --nic2 nat\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" genymotion_player_version 1\n'
            script_text += 'vboxmanage guestproperty enumerate "'+full_name+'"\n'
            script_text += 'vboxmanage showvminfo --machinereadable "'+full_name+'"\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" datadisk_size 8192\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" sensor_camera 1\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" sensor_gyro 1\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" genymotion_platform p\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" android_version 5.0.0\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" genymotion_version 2.14.0\n'
            // and here custom settings
            script_text += 'vboxmanage guestproperty set "'+full_name+'" vbox_graph_mode '+req.query.first_size+'x'+req.query.second_size+'-16\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" vbox_dpi "'+req.query.ppi_size+'"\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" genymotion_force_navbar 1\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" genymotion_full_screen no\n'
            script_text += 'vboxmanage guestproperty set "'+full_name+'" vkeyboard_mode 0'

            //write this text to this script file

            fs.writeFileSync(__dirname + "/../../streaming-app-script/settings.bat", script_text, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.")
                    return console.log(err);
                }
                console.log("Script file has been saved.")

            })

            spawn(__dirname+'/../../streaming-app-script/settings.bat')

            console.log(script_text)
            fetch('https://streaming-app-roby.herokuapp.com/wait_device?wait_value=1')
            //exec('player --vm-name "'+full_name+'"')
            

            fs.writeFileSync(__dirname + "/../../streaming-app-script/launch_device.bat", 'start player --vm-name "'+full_name +'"', 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.")
                    return console.log(err);
                }
                console.log("Script file has been saved.")
    
            })
            
            //spawn(__dirname+'/../../streaming-app-script/launch_device.bat')

            const adb_string = 'adb uninstall com.android.chrome\nadb install "C:/Users/HavasMedia/Documents/browsers_apk/com.android.chrome_50.0.2661.89-266108911_minAPI21(x86)(nodpi).apk"'

            fs.writeFileSync(__dirname + "/../../streaming-app-script/adb_install.bat", adb_string, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.")
                    return console.log(err);
                }
                console.log("Script file has been saved.")
    
            })
    


            // installing the browser 

            //spawn(__dirname+'/../../streaming-app-script/adb_install.bat')
            //spawn('cmd' , ['"C:/Users/HavasMedia/Documents/nodejs-apps/streaming-app-script/adb_install.bat"'])

            //spawn(__dirname+'/../../streaming-app-script/remove_device.bat')

            const process = spawn(__dirname+'/../../streaming-app-script/launch_device.bat')

            setTimeout(() => {
                const prova = spawn(__dirname+'/../../streaming-app-script/new_prova.bat')
                console.log('mbhe?')
            }, 10000);
            

            process.on('exit', (code) => {
                console.log("Child exited");
            })
            //console.log(spawn_res)
        }
        else
        { 
            console.log('device not ready yet, try again in a bit')
            fetch('https://streaming-app-roby.herokuapp.com/wait_device?wait_value=0')

        }

    } catch(err) {
        console.error(err)
    }


/*
    spawn('player --vm-name '+full_name)

*/
    //console.log(req.query.first_size)

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
    robot.mouseClick()
})
 


app.listen(port , ( ) => {
    console.log('server on port '+port)
})



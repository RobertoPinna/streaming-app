

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
const fs = require('fs');

const {spawn} = require('child_process')

let rawdata = fs.readFileSync(__dirname+'/../devices_database.json');


var all_devices_tree = {}

all_list_devices = [] 


try{
    all_devices_tree = JSON.parse(rawdata).all_data
}catch(e){
    console.log('error reading the file ')
}





// here to create object , i need it to insert it into all_device variable easily

var create_object = ( first_size , second_size , ppi_size , browser , browser_version , os) => {
    return { value : first_size , next : { value : second_size , next : { value : ppi_size , next : { value : browser , next : { value : browser_version , next : { value : os } } } } } }
}


var add_device = (all , obj , n ) => {

    if(obj != undefined){ // here the condition for exiting from the recursive function (if false) if i go to te end of the object i finished to go throught it
        if(JSON.stringify(all[obj.value]) == JSON.stringify( {} ) || (all[obj.value] == undefined ) )  { // here i add it , if true
            all[obj.value] = {}  
            add_device (all[obj.value] , obj.next , n ) 
            // here is to see if item added (!= 1 ) or not (==1)
            return n + 1 
        }       

        return add_device (all[obj.value] , obj.next , n ) 

    }
   
    return n

}

/*
var remove_device = (the_list , next_value  ) => {
    
    if(next_value.next == undefined){
        if(Object.keys(the_list).includes(next_value.value)){
            delete the_list[next_value.value]
            return 1
        }
        return 0
    }

    if(the_list[next_value.value] == undefined)
        return 0
    
    var result = remove_device(the_list[next_value.value] , next_value.next)

    if( result > 0 ){
        if(result == 2 )
            return result
        if(Object.keys(the_list).length  == 1 ){
            delete the_list[next_value.value]
            return 1
        }
        delete the_list[next_value.value]
        return 2 
        
    }   
    
    return 0

}
*/

var remove_device = ( all_tree , obj ) => {

    if(all_tree[obj.value] == undefined) 
        return 0 

    if( obj.next  == undefined ){
        if( JSON.stringify(all_tree[obj.value]) != JSON.stringify({}) )
        //all_tree == undefined
            return 0
        return 1 
    }
         
    var result = remove_device(all_tree[obj.value] , obj.next) 

    if( result == 1 ) {
        if(Object.keys(all_tree).length > 1) {
                delete all_tree[obj.value]
                return 2
        }
    }
    
    return result 

}



var print_all_devices_tree = (all_list) => {
    const{el, all_elements ,  str_list } = print_partial_all_devices_tree(0 , (x) => {
        if (x == 0)
            return 'first'
        if(x == 1 )
            return 'second'
        if(x == 2 ) 
            return 'ppi_size'
        if(x==3)
            return 'browser'
        if(x==4)
            return 'version'
        if(x==5)
            return 'os'
    } , all_list  , '')
    return { total_elements : all_elements , total_string : 'I devices a disposizione sono : \n' +str_list } 
}


// use this function to print each element

// check this one 
var print_partial_all_devices_tree = (x , callback ,  all_list , stringa  ) => {
  
    var keys = Object.keys(all_list)
    var size_list = keys.length

    var total_string = ''
    var list_elements = [] 
    var one_el = {} 


    for(var i = 0 ; i < size_list ; i++ ) {
        if(JSON.stringify(all_list[keys[i]]) == JSON.stringify( {} ) ){
            total_string = keys[i]
            one_el[callback(x)] = keys[i]
            return {all_elements : [one_el] , str_list : stringa + keys[i] +  '\n' }
        }
        const{all_elements , str_list} =  print_partial_all_devices_tree( x + 1  , callback ,  all_list[keys[i]] , keys[i] + " - " + stringa)
        all_elements.forEach(el => { 
            el[callback(x)] = keys[i]
        })
        if(JSON.stringify(list_elements) == JSON.stringify([]) )
            list_elements = all_elements
        else
            list_elements.push(all_elements)
        total_string = total_string +  str_list
        
    }

    return {all_elements : list_elements , str_list : total_string}    
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
    robot.moveMouse( scale_x(req.query.x_pos) , scale_y(req.query.y_pos) )
    res.send({speriamo : 'sperem'})
})

app.get('/install_device' , (req,res) => {
//here i receive the setting for setting up the device
// this is the default string to install the new device

// here write commands to install the device on the machine

    var obj = create_object ( req.query.first_size , req.query.second_size , req.query.ppi_size , req.query.browser , req.query.browser_version, req.query.os   )

    console.log(obj)
    var number = add_device(all_devices_tree , obj , 0 )
    if(number == 0){
        console.log('Device already added! ')
    }else{
        console.log('Device added appropriarly ! ')
        var jsonContent = JSON.stringify({all_data : all_devices_tree})
        console.log(jsonContent)
 
        fs.writeFile("devices_database.json", jsonContent, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
            console.log("JSON file has been saved.");
        });
    }


    console.log('this object : ')
    console.log(all_devices_tree)

    
    const{total_elements , total_string } = print_all_devices_tree(all_devices_tree )

    all_list_devices = total_elements

    console.log(all_list_devices)

    console.log(total_string)



//here it is better launching it thinking about the new settings from VBOX instead of java automation tool UI 
    

    res.send({ phrase : 'sta pagina mi serve per il device setup'})

  
})

app.get('/launching_device' , (req,res) => {

    console.log(req.query.first)

    res.send({phrase : 'here i launch the device'})

})

app.get('/devices_list' , (req,res) => { // this function has to be on the other server, remote one, index.js file

    console.log(all_devices_tree)

    var jsonObj = {all_data : all_devices_tree};

    if(remove_device(all_devices_tree , create_object('201' , '20' ,'120','Chrome','1637.13','5.0'))  != 0 )
        console.log('device removed successfully')
    else
        console.log("Sorry, the device doesn't exist" )

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



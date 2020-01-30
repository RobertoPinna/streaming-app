
const fs = require('fs')
const create_object = require('./create_device')

let rawdata = fs.readFileSync(__dirname+'/devices_database.json');


try{
    var all_devices_tree = JSON.parse(rawdata).all_data
}catch(e){
    console.log('error reading the file ')
}

const remove_and_write = (first , second , ppi , browser , version , os )=> {
    var remove_result = remove_device(first , second , ppi , browser , version , os)
    if ( remove_result != 0 ){
        var jsonContent = JSON.stringify({all_data : all_devices_tree})
        fs.writeFile("./src/utils/devices_database.json", jsonContent, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
            console.log("JSON file has been saved.")
            return 1
        })
    }
    return 0 
    
}

const remove_device = (first , second , ppi , browser , verison , os ) => {
    return remove_device_partial(all_devices_tree , create_object(first , second , ppi , browser , verison , os )  )
}

const remove_device_partial = ( all_tree , obj ) => {

    if(all_tree[obj.value] == undefined)
        return 0 

    if( obj.next  == undefined ){
        if( JSON.stringify(all_tree[obj.value]) != JSON.stringify({}) ) // if i reach the end and meaning the device doesn't exist
            return 0
        return 1 // so i can check if has more than one child 
    }
         
    var result = remove_device_partial(all_tree[obj.value] , obj.next) 

    if( result == 1 ) {
        if(Object.keys(all_tree).length > 1) { // if have more than 1 childreen delete just that key and stop execution
                delete all_tree[obj.value]
                return 2
        }
        delete all_tree[obj.value]

    }
    
    return result 

}

module.exports = remove_and_write 
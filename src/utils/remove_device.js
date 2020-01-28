
const fs = require('fs')
const create_object = require('./create_device')

let rawdata = fs.readFileSync(__dirname+'/devices_database.json');


try{
    all_devices_tree = JSON.parse(rawdata).all_data
}catch(e){
    console.log('error reading the file ')
}

const remove_device = (first , second , ppi , browser , verison , os ) => {
    return remove_device_partial(all_devices_tree , create_object(first , second , ppi , browser , verison , os )  )
}

const remove_device_partial = ( all_tree , obj ) => {

    if(all_tree[obj.value] == undefined) 
        return 0 

    if( obj.next  == undefined ){
        if( JSON.stringify(all_tree[obj.value]) != JSON.stringify({}) )
        //all_tree == undefined
            return 0
        return 1 
    }
         
    var result = remove_device_partial(all_tree[obj.value] , obj.next) 

    if( result == 1 ) {
        if(Object.keys(all_tree).length > 1) {
                delete all_tree[obj.value]
                return 2
        }
    }
    
    return result 

}

module.exports = remove_device 
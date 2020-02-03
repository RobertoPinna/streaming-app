
const fs = require('fs')
const add_device = require('./add_device')
const create_object = require ('./create_device')
const my_fetch = require('./fetch_function')


let rawdata = fs.readFileSync(__dirname+'/devices_database.json');

// here i read the data tree before checking if i can add a device
//based on add_device return , i'll return 0 if already added else 1

var all_devices_tree = {}

try{
    all_devices_tree = JSON.parse(rawdata).all_data
}catch(e){
    console.log('error reading the file ')
}

// here i create ad object so i can use add_device function
const install_device =  ( first , second , ppi , browser , version , os ) => {

    const obj = create_object ( first , second , ppi , browser , version , os   )
    const number = add_device(all_devices_tree , obj , 0 )
    if(number == 0){
        console.log('Device already added! ')
        my_fetch('https://streaming-app-roby.herokuapp.com/result_adding',0, ['result_adding'],[0] ).then( data => console.log(data)).catch(mex => console.log(mex))

        return 0 
    }else{
        console.log('Device added appropriarly ! ')
        my_fetch('https://streaming-app-roby.herokuapp.com/result_adding',0, ['result_adding'],[1] ).then(data => {

            const jsonContent = JSON.stringify({all_data : all_devices_tree})
            fs.writeFileSync(__dirname+'/devices_database.json' , jsonContent, 'utf8', function (err) {
                
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }
            console.log("JSON file has been saved.")
            return 1 
            })
        return 1 
        }).catch (mex => console.log(mex))
    }

}
        //}  , 200 )        
       
// Done ! BC  i write once i receive the result from fetch, so i make it sync


module.exports = install_device


const fs = require('fs')
const add_device = require('./add_device')
const create_object = require ('./create_device')

let rawdata = fs.readFileSync(__dirname+'/devices_database.json');


try{
    all_devices_tree = JSON.parse(rawdata).all_data
}catch(e){
    console.log('error reading the file ')
}


const install_device =  ( first , second , ppi , browser , version , os ) => {

    var obj = create_object ( first , second , ppi , browser , version , os   )

    var number = add_device(all_devices_tree , obj , 0 )
    if(number == 0){
        console.log('Device already added! ')
    }else{
        console.log('Device added appropriarly ! ')
        var jsonContent = JSON.stringify({all_data : all_devices_tree})
        fs.writeFile("./src/utils/devices_database.json", jsonContent, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
            console.log("JSON file has been saved.");
        });
    }

}

module.exports = install_device

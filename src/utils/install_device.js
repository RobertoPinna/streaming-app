
const fs = require('fs')
const add_device = require('./add_device')
const create_object = require ('./create_device')
const fetch = require('node-fetch')
const my_fetch = require('./fetch_function.js')

// here i read the data tree before checking if i can add a device
//based on add_device return , i'll return 0 if already added else 1


// here i create ad object so i can use add_device function
const install_device =  (the_tree ,  first , second , ppi , browser , version , os ) => {

    const obj = create_object ( first , second , ppi , browser , version , os   )
    const number = add_device(the_tree , obj , 0 )
    if(number == 0){
        console.log('Device already added! ')
        //my_fetch('https://streaming-app-roby.herokuapp.com/result_adding',0, ['result_adding'],[0] ).then( data => console.log('data')).catch(mex => console.log(mex))
        fetch('https://streaming-app-roby.herokuapp.com/?result_adding=1')
        return 0 
    }else{
        console.log('Device added appropriarly ! ')
        //my_fetch('https://streaming-app-roby.herokuapp.com/result_adding',0, ['result_adding'],[1] ).then (data => {

            const jsonContent = JSON.stringify({all_data : the_tree})
            fs.writeFileSync(__dirname + "/../../../database.json", jsonContent, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.")
                    return console.log(err);
                }
                console.log("JSON file has been saved.")
                
                return 1 

            })
        
        return 1 
        //}).catch (mex => console.log(mex))
    }

}
       
// Done ! BC  i write once i receive the result from fetch, so i make it sync


module.exports = install_device
const fs = require('fs')

const read_database = () => {
        
    let rawdata = {}

    try{
        rawdata = fs.readFileSync(__dirname+'/../../../database.json')
    }catch(e){
        fs.writeFile(__dirname + "/../../../database.json", JSON.stringify({all_data : {} } ) , 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
            console.log("JSON file has been saved.");
        })
    }

    let all_devices_tree = {}

    try{
        all_devices_tree = JSON.parse(rawdata).all_data
    }catch(e){
        console.log('error reading the file ')

        fs.writeFile(__dirname + "/../../../database.json", JSON.stringify({all_data : {} } ) , 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
            console.log("JSON file has been saved.");
        })

    }
    return all_devices_tree

}

module.exports = read_database

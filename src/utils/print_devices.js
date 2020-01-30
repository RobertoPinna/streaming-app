
const fs = require('fs')

let rawdata = fs.readFileSync(__dirname+'/devices_database.json')


try{
    all_devices_tree = JSON.parse(rawdata).all_data
}catch(e){
    console.log('error reading the file ')
}

const print_all_devices_tree = () => {
    return print_all_devices(all_devices_tree)
}

const print_all_devices = (all_list) => {
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

const print_partial_all_devices_tree = (x , callback ,  all_list , stringa  ) => {
  
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
            list_elements = list_elements.concat(all_elements)
        total_string = total_string +  str_list
        
    }

    return {all_elements : list_elements , str_list : total_string}    
}


module.exports = print_all_devices_tree

const fetch = require('node-fetch')


// 0 -> get ; else -> post


const my_fetch = (url_string , get_post , parameter , parameter_value ) => {

    var build_string = url_string 

    if ( get_post == 0 ){
        if(parameter.length > 0 ){
            build_string += '?'
            for ( var i = 0 ; i < parameter.length - 1 ; i ++ ) {
                build_string += parameter[i] + '=' + parameter_value[i] + '&'
            }
            build_string += parameter[parameter.length - 1 ] + '=' + parameter_value[parameter_value.length -1 ]

        }

        return fetch(build_string)

    }

    // here with post method .. parameter = options

    return fetch ( build_string , parameter)

}

module.exports = my_fetch 
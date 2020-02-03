

var socket = io()

const $messages = document.querySelector('#messages') // the div content  ( location to render )


const messageTemplate = document.querySelector('#list').innerHTML // here the template in she script

socket.emit('i_want_list_data')

socket.on('sending_data' , (list) => {
    console.log(list)
    const html = Mustache.render(messageTemplate , {
        message :  list    
    })
    $messages.insertAdjacentHTML('beforeend' , html)
})

socket.on('refresh_page', () => {
    reload_page()
})


var reload_page = () => {
        setTimeout( () => {
            location.reload()
        } , 200 )
}







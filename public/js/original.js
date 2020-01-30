

//client side on the same index page
// on the client console.log print on the index page

const socket = io()


// Elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messageFormLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $messageLocationTemplate = document.querySelector('#message-template-location').innerHTML


//Templates

const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('countUpdated' , (conta) => {
    console.log('The count has been updated!' + conta)
})

socket.on('message' , (message)  => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message : message
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    

})


$messageForm.addEventListener('submit' , (e) => { // e = event
    e.preventDefault() // prevent from default behaviour of browser

    $messageFormButton.setAttribute('disabled' , 'disabled')

    const message = e.target.elements.message.value // to grab the value on html file of message name of input form

    socket.emit('sendMessage' , message , (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error)
           return console.log(error)
        console.log('Message delivered')
    })
})

/*
document.querySelector('#increment').addEventListener('click' , () => {
    console.log('Clicked')
    socket.emit('increment')
})
*/

$messageFormLocation.addEventListener('click' , () => {
    
    if(!navigator.geolocation)
        return alert('Geolocation is not supported by ur browser.')

        $messageFormLocation.setAttribute('disabled' , 'disabled')

        navigator.geolocation.getCurrentPosition ( (position) => {
            console.log(position.coords)
            socket.emit('sendLocation' ,  {
                latitude : position.coords.latitude , 
                longitude : position.coords.longitude,
                position : position 
             } //'The latitude is ' + position.coords.latitude + ' and the longitude is ' + position.coords.longitude)
             , (call_back_mex) => {
                 console.log(call_back_mex)
                 $messageFormLocation.removeAttribute('disabled')
                 $messageFormLocation.value = ''
                 $messageFormLocation.focus()
             } )

            
        } )

       // socket.emit('try' , navigator.geolocation.getCurrentPosition ( ( ) => {}  ) ) 


})

socket.on('locationMessage' , (url) => {
    console.log(url)
    const htmlLocation = Mustache.render($messageLocationTemplate , {
        url : url
    })
    $messages.insertAdjacentHTML('beforeend' , htmlLocation)
    

})
const videoElem = document.getElementById("video"); 
const logElem = document.getElementById("log"); 
const startElem = document.getElementById("start"); 
const stopElem = document.getElementById("stop"); 

var canvas = document.getElementById('preview')
var context = canvas.getContext('2d')

canvas.width = 750 
canvas.height = 500
context.width = canvas.width 
context.height = canvas.height

// Options for getDisplayMedia()

var displayMediaOptions = {
    video: { 
        cursor: "never" 
        }, 
        audio: false ,
        displaySurface: "monitor"
       
}; 
    // Set event listeners for the start and stop buttons 
    startElem.addEventListener("click", function(evt) {
         startCapture();
    },
    false); 
    stopElem.addEventListener("click", function(evt) {
         stopCapture();
     }, false);
     
    console.log = msg => logElem.innerHTML += `${msg}<br>`;
    console.error = msg => logElem.innerHTML += `<span class="error">${msg}</span><br>`; 
    console.warn = msg => logElem.innerHTML += `<span class="warn">${msg}<span><br>`; 
    console.info = msg => logElem.innerHTML += `<span class="info">${msg}</span><br>`;

    function viewVideo(video , context){

        context.drawImage(video , 0 , 0 , context.width , context.height)
        socket.emit('stream' , canvas.toDataURL('image/webp'))
    }
    
    async function startCapture() { 
        logElem.innerHTML = ""; 
        try { 
            const videoTry = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions); 
            videoElem.srcObject = videoTry

            //here first try
            //here console.log of informations
            /*navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
                devices.forEach(function(device) {
                    console.log(device.kind + ": " + device.label +
                    " id = " + device.deviceId);
                });
            })
            .catch(function(err) {
                 console.log(err.name + ": " + err.message);
            });*/
            setInterval( () => {
                viewVideo(video, context )
            } , 1 )

            let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
            for(e in supportedConstraints)
                console.log(e)

            dumpOptionsInfo(); 
        } catch(err) { 
            console.error("Error: " + err); 
        } 
    }
    
    function stopCapture(evt) { 
        let tracks = videoElem.srcObject.getTracks(); 
        tracks.forEach(track => track.stop()); 
        videoElem.srcObject = null; 
    }
    
    function dumpOptionsInfo() { 
        const videoTrack = videoElem.srcObject.getVideoTracks()[0]; 
        console.log(videoElem.srcObject)
        console.log(videoTrack) 
        console.info(videoTrack) 
        console.info("Track settings:"); 
        console.info(JSON.stringify(videoTrack.getSettings(), null, 2)); 
        videoTrack.getSettings().deviceId = "window:132224:0"
        console.info("Track constraints:"); 
        console.info(JSON.stringify(videoTrack.getConstraints(), null, 2)); 
    }



    function prova(){
        if(videoElem.srcObject){
            console.log('ciaooooooooooooooooooooo')
            return true
         }
    }

    const tryIt = document.getElementById('tryIt')

    tryIt.addEventListener("click", () => {
        if(prova()){
            console.log(videoElem.srcObject)
            socket.broadcast.emit('pass-video' , videoElem.srcObject )
        }
    })






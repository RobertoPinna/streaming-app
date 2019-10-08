

//client side on the same index page
// on the client console.log print on the index page

const socket = io()

var ip = ''


socket.on('receive_mouse' , (x_pos , y_pos) => {
    console.log(x_pos + " ;ciao; " + y_pos)

    fetch('http://localhost:3001/prova1').then( (response) => {
            console.log(response)
            console.log('here')
            response.json().then( (data) => {
                console.log('si')
            })
            
        }).catch( (error) => {
            console.log(error)
        })


})

socket.on('receive_click' , () => {
    console.log('click')
    fetch('http://localhost:3001/click').then( (response) => {
            console.log(response)
            console.log('here')
            response.json().then( (data) => {
                console.log('si')
            })
            
        }).catch( (error) => {
            console.log(error)
        })

})

var flag = 0 

if ( flag == 0 ){
    socket.emit('get_ip' )
}

socket.on('check_ip' , () => {
     socket.emit('get_ip')
})


//make a function here and make another function in another file, pass the image between the two
const videoElem = document.getElementById("video"); 
const logElem = document.getElementById("log"); 
const startElem = document.getElementById("start"); 
const stopElem = document.getElementById("stop"); 
const par = document.getElementById('paragraph')
var canvas = document.getElementById('preview')

var context = canvas.getContext('2d')

socket.on('print_ip' , (ip_address) => {
    if(ip != ip_address){
        console.log(ip_address)
        ip = ip_address
        logElem.innerHTML = ip_address
    }
})


canvas.width = 850 
canvas.height = 600
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
    if(startElem && stopElem){
        startElem.addEventListener("click", function(evt) {
             startCapture();
        },
         false); 
        stopElem.addEventListener("click", function(evt) {
             stopCapture();
        }, false);
     }
     
    console.log = msg => logElem.innerHTML += `${msg}<br>`;
    console.error = msg => logElem.innerHTML += `<span class="error">${msg}</span><br>`; 
    console.warn = msg => logElem.innerHTML += `<span class="warn">${msg}<span><br>`; 
    console.info = msg => logElem.innerHTML += `<span class="info">${msg}</span><br>`; 

    function viewVideo(video , context){

        context.drawImage(video , 0 , 0 , context.width , context.height)
        socket.emit('stream' , canvas.toDataURL('image/jpeg'))
        //console.log('vediamo')
    }
    
    async function startCapture() { 
        logElem.innerHTML = ""; 
        try { 
            const videoTry = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions); 
            videoElem.srcObject = videoTry
            
            const video_constraints = {
                width: 1280 ,
                height:  720
            }
            //videoElem.srcObject.getVideoTracks()[0].applyConstraints(video_constraints)
            
            //const window_height = JSON.stringify(videoElem.srcObject.getVideoTracks()[0].getSettings().height, null , 2 ) 
            //const window_width = JSON.stringify(videoElem.srcObject.getVideoTracks()[0].getSettings().width , null , 2 ) 
           
            //socket.emit('send_h_w' , window_height , window_width)
             

            setInterval( () => {
                //if(context)
                    viewVideo(videoElem , context )
            } , 75 )

            //let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
            //for(e in supportedConstraints)
               // console.log(e)

            dumpOptionsInfo() 
           

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
        console.info("Track constraints:"); 
        console.info(JSON.stringify(videoTrack.getConstraints(), null, 2)); 
    }

   




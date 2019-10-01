

//client side on the same index page
// on the client console.log print on the index page

const socket = io()

socket.on('receive_mouse' , (x_pos , y_pos) => {
    console.log(x_pos + " ;ciao; " + y_pos)
})



//make a function here and make another function in another file, pass the image between the two
const videoElem = document.getElementById("video"); 
const logElem = document.getElementById("log"); 
const startElem = document.getElementById("start"); 
const stopElem = document.getElementById("stop"); 

var canvas = document.getElementById('preview')

var context = canvas.getContext('2d')


socket.on('send_ip' , (ip_address) => {
    console.log(ip_address)
    logElem.innerHTML = ip_address
})

socket.emit('sending_ip' , ' this ' )

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

            setInterval( () => {
                //if(context)
                    viewVideo(videoElem , context )
            } , 75 )

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

   




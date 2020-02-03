

//client side on the same index page
// on the client console.log print on the index page

const socket = io()

var ip = ''

var conta = 0

socket.on('receive_mouse' , (x_pos , y_pos) => {
    console.log(x_pos + " ;ciao; " + y_pos)

    fetch('http://localhost:3001/prova1?x_pos='+x_pos+'&y_pos='+y_pos)


})

socket.on('send_area_coord' , ( area_x_init , area_x_end , area_y_init , area_y_end ) => {
    fetch('http://localhost:3001/coords')
    
})

socket.on('receive_click' , () => {
    console.log('click')
    fetch('http://localhost:3001/click')

})

socket.on('send_me_the_data' , () => {
    console.log('requesting the data')
    fetch('http://localhost:3001/database')
})

socket.on('sending_device' ,  (first_size , second_size , ppi_size , browser , browser_version , os ) => {
    console.log("receiving settings for device ?!")
    console.log( first_size + " , " +  second_size + " , " +  ppi_size + " , " +  browser + " , " +  browser_version + " , " +  os)
    fetch('http://localhost:3001/receiving_device_to_add?first_size='+first_size+'&second_size='+second_size+'&ppi_size='+ppi_size+'&browser='+browser+'&browser_version='+browser_version+'&os='+ os )
})


socket.on('device_to_remove' , (first_size , second_size , ppi_size , browser , browser_version , os ) => {
    fetch('http://localhost:3001/device_to_remove?first_size='+first_size+'&second_size='+second_size+'&ppi_size='+ppi_size+'&browser='+browser+'&browser_version='+browser_version+'&os='+ os )
})




// this is ok from remote to localhost
socket.on('launching_device' ,  (first_size , second_size , ppi_size , browser , browser_version , os ) => {
    fetch('http://localhost:3001/launching_device?first_size='+first_size+'&second_size='+second_size+'&ppi_size='+ppi_size+'&browser='+browser+'&browser_version='+browser_version+'&os='+ os )
})



/*
var flag = 0 

if ( flag == 0 ){
    socket.emit('get_ip' )
}

socket.on('check_ip' , () => {
     socket.emit('get_ip')
})*/


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

        context.drawImage(video , 0 , 0 , context.width  , context.height )
        //socket.emit('stream' , canvas.toDataURL('image/jpeg')) // that was too slow
        
        const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify( { immagine : canvas.toDataURL('image/jpeg') } )
          }
      
          // with socket too slow? , try again maybe? socket.emit .. so here i try with fetch..

          //fetch('http://localhost:3000/image1', options)
          //right one
          fetch('https://streaming-app-roby.herokuapp.com/image1', options)
          //fetch('http://localhost:3000/general')

        //console.log('vediamo')

        //fetch('http://localhost:3000/?image='+ canvas.toDataURL('image/jpeg') )


    }
    
    async function startCapture() { 
        logElem.innerHTML = ""; 
        try { 
            const videoTry = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions); 
            videoElem.srcObject = videoTry
            
            /*const video_constraints = {
                width: 200 ,
                height:  200
            }*/
            //videoElem.srcObject.getVideoTracks()[0].applyConstraints(video_constraints)
            
            //canvas.width  = videoElem.offsetWidth
            //canvas.height = videoElem.offsetHeight
            //console.log(videoElem.offsetWidth)
            //canvas.width = videoElem.offsetWidth
            //canvas.height = videoElem.offsetHeight

            context.width = canvas.width 
            context.height = canvas.height
            //context.imageSmoothingEnabled = false

            setInterval( () => {
                //if(context)
                    viewVideo(videoElem , context )
            } , 100 )

            setTimeout ( () => {
                console.log('pa')
                socket.emit('allow_send_area_size')
                
            } , 1000)

            //let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
            //for(e in supportedConstraints)
               // console.log(e)
            /*
            setTimeout( () => {
                const window_height = JSON.stringify(videoElem.srcObject.getVideoTracks()[0].getSettings().height, null , 2 ) 
                const window_width = JSON.stringify(videoElem.srcObject.getVideoTracks()[0].getSettings().width , null , 2 ) 
           
                //socket.emit('send_h_w' , window_height , window_width)
            }, 1000)
            */

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


// try to build a support function that takes 3 parameters like the function below, then make another that takes only 2 parameters // 

const add_device = (all , obj , n ) => {
  
    if(obj != undefined){ // here the condition for exiting from the recursive function (if false) if i go to te end of the object i finished to go throught it
        if(all[obj.value] == undefined)  { // here i add it , if true .. if undefined it means that the object doesn't have the proprieties
            all[obj.value] = {}  
            add_device (all[obj.value] , obj.next , n ) 
            // here is to see if item added (!= 0 ) or not (==0)
            return n + 1 
        }     

        return add_device (all[obj.value] , obj.next , n ) 

    }
   
    return 0

}


module.exports = add_device

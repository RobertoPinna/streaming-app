
const create_object = ( first_size , second_size , ppi_size , browser , browser_version , os) => {
    return { value : first_size , next : { value : second_size , next : { value : ppi_size , next : { value : browser , next : { value : browser_version , next : { value : os } } } } } }
}


module.exports = create_object
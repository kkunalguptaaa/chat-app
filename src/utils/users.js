users=[]    //users is array storing users

//user->{id,username,room}
//----------------addUser()---------------------------
const addUser=({id,username,room})=>{

    //clean the data
   username= username.trim().toLowerCase()
   room= room.trim().toLowerCase()

   //validate the data
   if(!username||!room){
       return({
        error:"Username and Room are required!"
       })       
   }
   //validate that the username shiuld be unique in room
    const existingUser=users.find((user)=>{
        return(user.room===room&&user.username===username)
    })
    
    if(existingUser){
        return({
            error:"Username is in use!"            
        })
    }
    const user={
        id,
        username,
        room
    }
    users.push(user)
    return({user})
}

//-----------------removeUser()-----------------
const removeUser=(id)=>{
    const index=users.findIndex((user)=>{
        return(user.id===id)
    })
    if(index!=-1){
        return users.splice(index,1)[0]
    }
}

//-----------------getUser()-----------------
const getUser=(id)=>{
    const user=users.find((user)=>{
        return(user.id===id)
    }) 
    return(user)
}

//-----------------getUsersInRoom()-----------------
  //clean the data coming from server as our sored data is already sanitized

const getUsersInRoom=(room)=>{
    room= room.trim().toLowerCase()
    const usersArray=users.filter((user)=>{
        return(user.room===room)
    })
    return(usersArray)
}
 module.exports={
     addUser,
     removeUser,
     getUser,
     getUsersInRoom
 }
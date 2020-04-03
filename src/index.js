const http=require('http')
const path=require('path')  //this is a node core module so we do not have any need to install it.
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom,resetFlag}=require('./utils/users')

const app=express()
const server=http.createServer(app)     /*here we created the server and passed our app to it, normally this done
                                        by express behind the scene*/
const io=socketio(server)   /*first we require the socket.io library and it retured a function then called that 
                            function to configure the socket.io to work with a given server*/

/*Note:-1) Web socket protocol provides full duplex communication i.e bi directional communicationwhich means client 
and server any one can initiate the communication while in http protocol only client can initiate the server 
without the request of client, server cannot send the response to client.
2)The connection is persistent between client and server
3)Wb socket is different protocol from http.*/

/*Note:- As it is bi-deirectional communication so setting up only servevr will not work to set up connection
we have to set up client side also in order to set up connection, that can we done by loding in the socket library
in index.html*/

port=process.env.PORT||3000

//settingup the publuc directory path
const publicDirectoryPath=path.join(__dirname,'../public') 

//servingup the public directory
app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{

    console.log('New web socket connection!')
    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        if(error){
           return callback(error)
        }
        socket.join(user.room)

        socket.emit('adminMsg',generateMessage('','Welcome!'))
        socket.broadcast.to(user.room).emit('adminMsg',generateMessage('',`${user.username} has joined!`))
        callback()
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    })

    socket.on('sendMsg',(msg,callback)=>{
        const user=getUser(socket.id)
        user.flag++
        resetFlag(socket.id)
        const filter=new Filter()
        if(filter.isProfane(msg)){            
            io.to(user.room).emit('msg',generateMessage(user.username,"*****",user.flag))
            return callback('Profanity is not allowed!')
        }
        socket.broadcast.to(user.room).emit('msg',generateMessage(user.username,msg,user.flag))
        socket.emit('myMsg',generateMessage(user.username,msg,user.flag))
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('adminMsg',generateMessage('',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation',(url,callback)=>{
        const user=getUser(socket.id)
        user.flag++
        resetFlag(socket.id)
        socket.emit('myLocationMsg',generateLocationMessage(user.username,url,user.flag))
        socket.broadcast.to(user.room).emit('locationMsg',generateLocationMessage(user.username,url,user.flag))
        callback()
       
    })

    // socket.emit('updatedCount',count)

    // socket.on('increament',()=>{
    //     count++
    //     io.emit('updatedCount',count)
    // })

})
server.listen(port,(e)=>{       // now we listen the port on the server we have created.
    if(e){
        console.log("something went wrong!")
    }
    else{
        console.log("yup my port is running on port:",port)
    }
})
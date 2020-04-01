const socket=io()

//selecting elements
const inputForm=document.getElementById('input')
const messageForm=document.getElementById('messageForm')
const messageFormButton=document.getElementById('messageFormButton')
const sendLocation=document.getElementById('send-location')
const msgs=document.getElementById('msgs')
const sidebar=document.getElementById('sidebar')

//selecting templates
const msgTemplate=document.getElementById('msg-template').innerHTML
const locationMsgTemplate=document.getElementById('location-msg-template').innerHTML
const sidebarTemplate=document.getElementById('sidebar-template').innerHTML

//options
const {username,room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

//autoscrolling
const autoscroll=()=>{
    //New message element
    const newMessage=msgs.lastElementChild

    //Height of the new message
    const newMessageStyles=getComputedStyle(newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight=msgs.offsetHeight

    //Height of message container
    const containerHeight=msgs.scrollHeight

    //how far have i scrolled?
    const scrollOffset=msgs.scrollTop+visibleHeight

     if(containerHeight-newMessageHeight<=scrollOffset){
         
        msgs.scrollTop=msgs.scrollHeight
    }
}


socket.on('msg',(msg)=>{
    console.log(msg)
    const html=Mustache.render(msgTemplate,{
        username:msg.username,
        msg:msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    msgs.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('locationMsg',(msg)=>{
    console.log(msg)
    const html=Mustache.render(locationMsgTemplate,{
        username:msg.username,
        url:msg.url,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    msgs.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    sidebar.innerHTML=html
})

messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    /*prevent sending empty msg .Note:- we can also do same by making input field as required but it is not 
    something we see in today's chatting app*/
    if(!inputForm.value){
        return
    }
    //disabling form util msg deliverd
    messageFormButton.setAttribute('disabled','disabled')
    socket.emit('sendMsg',inputForm.value,(error)=>{
        //enabling form
       messageFormButton.removeAttribute('disabled')
       inputForm.value=""
       inputForm.focus()

        if(error){
            return alert(error)
        }
        console.log('msg deliverd!')
    })
})



sendLocation.addEventListener('click',()=>{
    //disabling button
    sendLocation.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        const location={
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
    }
        socket.emit('sendLocation',`http://google.com/maps?q=${location.latitude},${location.longitude}`,(error)=>{
            sendLocation.removeAttribute('disabled','disabled')
            if(error){
                return console.log(error)
            }
            console.log('location shared!')
        })  
    })

})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})

// socket.on('updatedCount',(count)=>{
//     console.log('count:',count)
   
// })
// function inc(){
//     socket.emit('increament')  
// }

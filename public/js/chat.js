const socket=io()

//selecting elements
const inputForm=document.getElementById('input')
const messageForm=document.getElementById('messageForm')
const messageFormButton=document.getElementById('messageFormButton')
const sendLocation=document.getElementById('send-location')
const msgs=document.getElementById('msgs')
const sidebar=document.getElementById('sidebar')

//selecting templates
const adminMsgTemplate=document.getElementById('admin-msg-template').innerHTML
const msgTemplate=document.getElementById('msg-template').innerHTML
const myMsgTemplate=document.getElementById('my-msg-template').innerHTML
const locationMsgTemplate=document.getElementById('location-msg-template').innerHTML
const myLocationMsgTemplate=document.getElementById('my-location-msg-template').innerHTML
const sidebarTemplate=document.getElementById('sidebar-template').innerHTML

//options
const {username,room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

//-----------------------------autoscrolling---------------------------------

/*                                   Working:-
role of variables:-
1)visibleHeight=msgs.offsetHeight :- takes the height of the visible area or screen
2)msgs.scrollTop:- it takes the value equals to the area we scrolled down i.e. the hidden msg area at top due to
scrolling the screen downward.
3)const scrollOffset=Math.ceil(msgs.scrollTop)+visibleHeight :-the value of area or screen hidden at top due to 
scrolling and the screen visible to us.
4)newMessageHeight=newMessage.offsetHeight+newMessageMargin :- height of new msg that comes as it also has marginDown
so we added this also. note-msgs div dont have any marign a single msg has margin so we added only there.
5)const containerHeight=msgs.scrollHeight :-value of the whole msg screen even it inclued the screen hidden at top or
bottom.

objective:-we want to autoscrolling when the scrollbars is at bottom of the screen otherwise we don't want that
to provide user the ease to search old msgs.

logic :- since we want to run our function when scrollbar is at bottom ,so when new msg comes we want to scroll to 
bottom ,so at this point scroll will at height just above the new msg so if the total height minus new msg height
should equal to(or may be slightly less than) the visible height plus the height hidden due to scrolling if this 
is true than before the new msg comes the scroll bar must at bottom and now after coming of new msg it will be 
scrolled to bottom.
 */
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
    const scrollOffset=Math.ceil(msgs.scrollTop)+visibleHeight  /*used ceil value as after sending some msgs the 
    auto scrolling was not working becoz the scrollTop() lags by some value in points after few msgs when it becomes
    equals to one it reduces the scrollOffset than containerHeight-newMessageHeight and stop perforing the 
    autscrolling. by taking the ceil value it will never legs in poits and scrollOffset remains always greater
    than containerHeight-newMessageHeight*/

     if(containerHeight-newMessageHeight<=(scrollOffset+newMessageHeight)){ /*i added the new msg height with
        scrollMessageHeight as i just realised what if i accediently just scrooled up the scroll bar from bottom
        by a slight amount than it will behave like i want to see some old msg but reality is in that small value 
        i cann't see the old msgs it must be a accident but it will stop our autoscoling user have to set it to 
        bottom by him self so i made that if screen is scrooled up by amount of a single msg than it auto scrolling
        should work just like whats app! */
         
        msgs.scrollTop=msgs.scrollHeight
    }
}

socket.on('adminMsg',(msg)=>{
    console.log(msg)
    const html=Mustache.render(adminMsgTemplate,{
        username:msg.username,
        msg:msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    msgs.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('msg',(msg)=>{
    console.log(msg)
    if(msg.flag===1){
        const html=Mustache.render(msgTemplate,{
            username:msg.username,
            msg:msg.text,
            createdAt: moment(msg.createdAt).format('h:mm a')
        })
        msgs.insertAdjacentHTML('beforeend',html)
    }
    else{
        const html=Mustache.render(msgTemplate,{
            username:"",
            msg:msg.text,
            createdAt: moment(msg.createdAt).format('h:mm a')
        })
        msgs.insertAdjacentHTML('beforeend',html)
    }
    autoscroll()
})
socket.on('myMsg',(msg)=>{
    console.log(msg)
    if(msg.flag===1){
        const html=Mustache.render(myMsgTemplate,{
            username:"me",
            msg:msg.text,
            createdAt: moment(msg.createdAt).format('h:mm a')
        })
        msgs.insertAdjacentHTML('beforeend',html)
    }
    else{
        const html=Mustache.render(myMsgTemplate,{
            username:"",
            msg:msg.text,
            createdAt: moment(msg.createdAt).format('h:mm a')
        })
        msgs.insertAdjacentHTML('beforeend',html)
    }
    autoscroll()
})
socket.on('locationMsg',(msg)=>{
    console.log(msg)
    if(msg.flag===1){
        const html=Mustache.render(locationMsgTemplate,{
            username:msg.username,
            url:msg.url,
            createdAt:moment(msg.createdAt).format('h:mm a')
        })
        msgs.insertAdjacentHTML('beforeend',html)
    }
    else{
        const html=Mustache.render(locationMsgTemplate,{
            username:"",
            url:msg.url,
            createdAt:moment(msg.createdAt).format('h:mm a')
        })
        msgs.insertAdjacentHTML('beforeend',html)
    }
    autoscroll()
})
socket.on('myLocationMsg',(msg)=>{
    console.log(msg)
    if(msg.flag===1){
        const html=Mustache.render(myLocationMsgTemplate,{
            username:"me",
            url:msg.url,
            createdAt:moment(msg.createdAt).format('h:mm a')
        })
        msgs.insertAdjacentHTML('beforeend',html)
    }
    else{
        const html=Mustache.render(myLocationMsgTemplate,{
            username:"",
            url:msg.url,
            createdAt:moment(msg.createdAt).format('h:mm a')
        })
        msgs.insertAdjacentHTML('beforeend',html)
    }
    autoscroll()
})
socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    sidebar.innerHTML=html
    autoscroll()
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

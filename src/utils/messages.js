const generateMessage=(username,text,flag)=>{
    return{
        username,
        text,
        createdAt:new Date().getTime(),
        flag
    }
}
const generateLocationMessage=(username,url,flag)=>{
    return{
        username,
        url,
        createdAt:new Date().getTime(),
        flag
    }
}
module.exports={
    generateMessage,
    generateLocationMessage
}
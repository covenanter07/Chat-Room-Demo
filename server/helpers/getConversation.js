const { ConversationModel } = require('../models/ConversationModel');

const getConversation = async(currentUserId) => {
    if(currentUserId){
        const currentUserConversation = await ConversationModel.find({
            "$or" : [
                { sender : currentUserId},
                { receiver : currentUserId },
            ]
        }).sort({ updatedAt : -1 }).populate('messages').populate('sender').populate('receiver')

        const conversation = currentUserConversation.map((conv)=>{
            const counterUnseenMsg = conv?.messages?.reduce((preve,curr) => {
                const msgByuserId = curr?.msgByuserId?.toString()

                if(msgByuserId !== currentUserId){
                    return preve + (curr.seen ? 0 : 1)
                }else{
                    return preve
                }
            },0)
            return {
                _id : conv?._id,
                sender : conv?.sender,
                receiver : conv?.receiver,
                unseenMsg : counterUnseenMsg,
                lastMsg : conv.messages[conv?.messages?.length - 1]
            }
        })

        return conversation
    }else{
        return []
    }
}

module.exports = getConversation
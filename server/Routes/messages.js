const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Message = require('../Models/messageModel');
const User = require('../Models/dbModel');


///List conversations 
router.get('/conversations', auth, async(req, res) => { 
    try { 
        const userId = req.user._id;
        const pipeline = [ 
            { $match: { participants: userId}}, 
            { $sort: { createdAt: -1 }},
            { 
                $group: { 
                    _id: '$conversationId',
                    lastMessage : { $first: '$$ROOT' },  /// get the first document in each group
                    unread: { 
                        $sum: { 
                            $cond: [
                                { $and: [{$eq: ['$receiver', userId]}, {$eq: ['$readAt', null]} ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            }, { $limit : 100 },
        ]; /// what does this pipeline do ? 
        /// it matches all messages where the user is a participant, sorts them by createdAt in descending order, groups them by conversationId, and gets the first message in each group as the lastMessage. It also counts the number of unread messages for the user in each conversation.

        const aggr = await Message.aggregate(pipeline); 
        const result = []; 
        for(const c of aggr) {  
            const ids = c.lastMessage.participants.map(id => id.toString()); 
            const otherId = ids.find(i=>i !== userId.toString());
            const otherUser = await User.findById(otherId).select('firstName lastName type'); 
            result.push({ 
                conversationId: c._id, 
                lastMessage: { 
                    _id: c.lastMessage._id,
                    content: c.lastMessage.content,
                    sender: c.lastMessage.sender,
                    receiver: c.lastMessage.receiver,
                    createdAt: c.lastMessage.createdAt,
                    readAt: c.lastMessage.readAt 
                }, 
                otherUser, 
                unread: c.unread
            }); 
        }
        res.json({  success: true, data: result});
    }
    catch(error) { 
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false,  message: 'Server error' });
    } 
}); 


///Fetch thread 
router.get('/with/:userId', auth, async(req, res) => {
    try{ 
        const otherId = req.params.userId; 
        const lim = Math.min(parseInt(req.query.limit) || 40, 100); /// default limit is 40, max is 100
        const before = req.query.before ? new Date(req.query.before) : new Date(); /// default is now
        const ids = [req.user._id.toString(), otherId].sort(); /// sort the ids to match the conversationId format
        const conversationId = `${ids[0]}-${ids[1]}`;
        const messages = await Message.find({ 
            conversationId, createdAt: { $lt: before } 
        }).sort({ createdAt: -1 }).limit(lim)
        .populate('sender', 'firstName lastName type')
        .populate('receiver', 'firstName lastName type');
        res.json({
            success: true, 
            data: messages.reverse(), /// reverse to get ascending order
            pagination: { 
                fetched: messages.length,
                olderBefore:messages.length ? messages[0].createdAt : null
            }
        }); 
    }
    catch(error) { 
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false,  message: 'Server error' });
    }
}); 


///Unread total
router.get('/unread/count', auth, async(req, res) => {
    try {
        const count = await Message.countDocuments({ 
            receiver: req.user._id,
            readAt: null
        }); 
        res.json({
            success: true,
            message: 'Unread count fetched', 
            data: count
        }); 
    }
    catch(error) { 
        console.error('Error fetching unread count:', error);
        res.status(500).json({ success: false,  message: 'Server error' });
    }
});


/// send a message 
router.post('/:receiverId', auth, async(req, res) => { 
    try { 
        const {content} = req.body; 
        if(!content || !content.trim()) { 
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }
        if(req.params.receiverId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot send message to yourself' }); 
        }

        const receiver = await User.findById(req.params.receiverId).select('_id'); 
        if(!receiver) {
            return res.status(404).json({ success: false, message: 'Receiver not found' });
        }

        const mssg = await Message.create({ 
            sender: req.user._id,
            receiver: receiver._id,
            participants: [req.user._id, receiver._id],
            content: content.trim(),
        }); 
        await mssg.populate('sender', 'firstName lastName type'); 
        res.status(201).json({ success: true, message: 'Message sent', data: mssg });
    }
    catch(error) { 
        console.error('Error sending message:', error);
        res.status(500).json({ success: false,  message: 'Server error' });
    }
});

/// mark single message as read
router.post('/:messageId/read', auth, async(req, res) => { 
    try { 
        const updated = await Message.findOneAndUpdate(
            { _id: req.params.messageId, receiver: req.user._id, readAt: null}, 
            { $set: { readAt: new Date()}}, 
            { new: true} 
        ); 
        if(!updated) { 
            return res.status(404).json({ success: false, message: 'Message not found'}); 
        }
        res.json({
            success: true, 
            message: 'Message marked as read', 
            data: updated
        });
    }
    catch(error) { 
        console.error('Error marking message as read:', error);
        res.status(500).json({ success: false,  message: 'Server error' });
    }
}); 


module.exports = router;
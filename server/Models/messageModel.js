const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({ 
    participants: [{type: Schema.Types.ObjectId, ref:'User', required: true} ], /// this is an array of user ids
    conversationId: { type: String, index: true}, 
    sender: { type: Schema.Types.ObjectId, ref:'User', required:true, index: true}, /// Index for faster queries
    receiver: { type: Schema.Types.ObjectId, ref:'User', required:true, index: true},
    content: { type: String, required: true, trim:true, maxlength: 4000 },
    readAt: { type: Date}
}, { timestamps: true });


messageSchema.pre('validate', function(next) { 
    if(!this.participants || this.participants.length !== 2) { 
        this.participants = [this.sender, this.receiver];
    }
    const sorted = this.participants.map(i => i.toString()).sort(); /// this sorts the ids in ascending order
    this.conversationId = `${sorted[0]}-${sorted[1]}`; /// create a unique conversation id based on the two user ids
    next(); /// call the next middleware
}); 


module.exports = mongoose.model('Message', messageSchema); /// export the model
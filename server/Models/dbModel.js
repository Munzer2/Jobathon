const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true},
    lastName: { type : String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    city: String,
    state: String,
    country: String,
    age: Number,
    gender: String, 
    phone: String, 
    type: { type:String, enum: ['Seeker', 'Employer', 'Recruiter'], required: true},
    photo: String,
    companyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    hobbies: [String] 
}, {
    timestamps: true
}); 

// hash password before saving
userSchema.pre('save', async function(next) { 
    if(!this.isModified('password')) return next(); 
    this.password = await bcrypt.hash(this.password, 10); 
    next();
});


// compare password method
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}; 

module.exports = mongoose.model('User', userSchema ); 
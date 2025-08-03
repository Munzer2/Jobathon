

const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./Models/dbModel.js');

require('dotenv').config(); /// Load environment variables from .env file


async function populateDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI) ; // Connect to MongoDB
        console.log('Connected to MongoDB for population');

        await User.deleteMany({}); // Clear existing users
        console.log('Existing users cleared');

        const res = await axios.get('https://randomuser.me/api/?results=100'); // Fetch random users

        console.log(`Fetched ${res.data.results.length} random users`);

        const hobbies = ['Reading', 'Traveling', 'Cooking', 'Gaming', 'Hiking', 'Photography', 'Music', 'Art', 'Sports', 'Writing', 'Gardening', 'Crafting', 'Dancing', 'Fishing', 'Cycling', 'Yoga', 'Meditation', 'Volunteering', 'Coding', 'Designing' , 'Learning Languages', 'Playing Instruments', 'Cooking', 'Baking', 'Knitting', 'Sewing', 'Woodworking', 'Pottery', 'Calligraphy', 'Origami', 'Model Building', 'Bird Watching', 'Astronomy', 'Collecting', 'Journaling', 'Blogging', 'Podcasting', 'Video Editing', 'Graphic Design', 'Web Development', 'App Development', 'Data Analysis', 'Machine Learning'];

        for( const u of res.data.results) {
            const userTypes = ['Seeker', 'Recruiter', 'Employer']; 

            const rand = userTypes[Math.floor(Math.random() * userTypes.length)];

            const userData = {
                firstName: u.name.first,
                lastName: u.name.last,
                email: u.email,
                password: u.login.password, // will be hashed
                city : u.location.city,
                state: u.location.state,
                country: u.location.country,
                age: u.dob.age,
                gender: u.gender,
                phone: u.phone,
                type: rand,
                photo: u.picture.medium, 
                hobbies: [hobbies[Math.floor(Math.random() * hobbies.length)]],
            }; 
            const newUser = new User(userData);
            await newUser.save(); // Save user to database
            console.log(`User ${userData.firstName} ${userData.lastName} saved`);
        }

        console.log('Database populated with random users');
    }
    catch (error) {
        console.error('Error populating database:', error);
    }
    finally {
        await mongoose.connection.close(); // Close the database connection
    }
}


populateDatabase().then(() => {
    console.log('Population script completed');
});
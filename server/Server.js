const express = require('express'); 
const mongoose = require('mongoose');

const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const app = express(); 


app.use(cors(
    {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials : true
    }
)); 
/// the above code allows cross-origin requests from the specified client URL

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB'); 
            console.log('Database: Jobathon');
        })
        .catch(err => {
            console.error('Error connecting to MongoDB:', err);
        });

/// health check endpoint 
app.get('/api/health', (req,res) => {
    res.json({
        status: 'OK',
        message: 'Jobathon API is running',
        database: 'Jobathon',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    })
});


///test route to verify database connection
app.get('/api/test' , async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',    
            3: 'Disconnecting'
        }; 

        res.json({
            success: true, 
            database: {
                status : states[dbState], 
                name : mongoose.connection.name, 
                host: mongoose.connection.host
            }
        }); 
    } catch(error) {
        res.status(500).json( {
            success: false,
            error: error.message || 'An error occurred while checking the database connection',
        });
    }
});


const authRoutes = require('./Routes/auth');
const jobRoutes = require('./Routes/jobs');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes); 

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,  
        message : 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    }); 
}); 


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
}); 


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
    console.log(`Test database: http://localhost:${PORT}/api/test`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
}); 





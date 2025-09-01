const express = require('express'); 
const mongoose = require('mongoose');

const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

///Imports for socketIO
const Message = require('./Models/messageModel');
const User = require('./Models/dbModel');
const jwt = require('jsonwebtoken');

const app = express(); /// This is the Express application instance

const { Server } = require('socket.io'); /// server is for real-time communication
const http = require('http');
const server = http.createServer(app); /// HTTP server for both Express and Socket.IO
/// server is a raw Node.js HTTP server

/// Handles CORS for websocket connections ( real time messaging )
/// HTTP and Websocket connections are different protocols with different CORS needs
const io = new Server(server, { 
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'], 
    }
}); /// Configure CORS to allow requests from the client URL


/// Middleware to authenticate Socket.IO connections using JWT
io.use((socket,next)=> {
    const token = socket.handshake.auth.token;
    try { 
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        socket.userId = decoded._id; 
        next(); 
    }
    catch(error) {
        next(new Error('Authentication error')); 
    }
}); 

io.on('connection', (socket) => { 
    socket.on('join_conversation', (conversationId) => { 
        socket.join(conversationId);
    });  
    socket.on('send_message', async(data) => {
        try { 

            ///validate the data first
            if(!data.receiver || !data.content || !data.content.trim()) { 
                return socket.emit('message_error', { message: 'Invalid message data' });
            }

            if(socket.userId.toString() === data.receiver.toString()) { 
                return socket.emit('message_error', { message: 'Cannot send message to yourself' });
            }

            const ids = [socket.userId, data.receiver.toString()].sort();
            const conversationId = `${ids[0]}-${ids[1]}`;
            const mssg = await Message.create({
                sender: socket.userId,
                receiver: data.receiver,
                participants: [socket.userId, data.receiver],
                content: data.content, 
                conversationId: conversationId
            }); 

            await mssg.populate('sender', 'firstName lastName type'); 
            io.to(conversationId).emit('receive_message', mssg); 
        }
        catch(error) { 
            console.error('Error saving or emitting message:', error);
            socket.emit('message_error', { message: 'Message could not be sent' });
        }
    }); 

    socket.on('disconnect', () => { 
        console.log(`User disconnected: ${socket.userId}`);
    });
}); 




/// This code below allows cross-origin requests from the specified client URL. For regular HTTP requests
/// REST API routes will use this CORS configuration
app.use(cors(
    {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials : true
    }
)); 

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
const messageRoutes = require('./Routes/messages'); 

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes); 
app.use('/api/messages', messageRoutes); 

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

// app.listen(PORT, () => {
//     console.log(`Server is running on port http://localhost:${PORT}`);
//     console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
//     console.log(`Test database: http://localhost:${PORT}/api/test`);
//     console.log(`Environment: ${process.env.NODE_ENV}`);
// }); 

server.listen(PORT, () => { 
    console.log(`Server is running on port http://localhost:${PORT}`);
    console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
    console.log(`Test database: http://localhost:${PORT}/api/test`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Socket.IO server ready for real-time messaging`);
}); 





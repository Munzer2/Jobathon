import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const Messages = () => {
    const [conversations, setConversations] = useState([]); 
    const [selectedConv, setSelectedConv] = useState(null);
    const [mssgs, setMssgs] = useState([]);
    const [newMssg, setNewMssg] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingMssg, setSendingMssg] = useState(false); 
    const [unreadCnt, setUnreadCnt] = useState(0);
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const mssgEndRef = useRef(null); 
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); 

    useEffect(() => {
        ///check auth
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if(!userData || !token) { 
            navigate("/login"); return; 
        }

        try { 
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchConvos(); 
            fetchUnreadCount();

            /// check if contact id is present in url
            const contactId = searchParams.get("contact");
            if(contactId) { 
                /// find if conversation already exists or create new one
                fetchOrCreateConvos(contactId);
            }
        }
        catch(error) { 
            console.error("Error fetching user data:", error);
            navigate("/login");
        }
    }, [navigate, searchParams]); 

    const scrollToBottom = () => { 
        mssgEndRef.current?.scrollToBottom({ behavior: "smooth" });
    }; 

    const fetchConvos = async() => { 
        try { 
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/messages/conversations`,{ 
                headers: { Authorization: `Bearer ${token}` }
            }); 

            if(res.data.success) { 
                setConversations(res.data.data);
            }
        }
        catch(err) { 
            console.error("Error fetching conversations:", err);
            if(err.status === 401) { 
                navigate("/login");
            }
        } finally { 
            setLoading(false);
        }
    }; 

    const fetchUnreadCount = async() => { 
        try { 
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/messages/unread/count`,{ 
                headers: { Authorization: `Bearer ${token}` }
            }); 

            if(res.data.success) {
                setUnreadCnt(res.data.data);
            }
        }
        catch(err) { 
            console.error("Error fetching unread count:", err);
        }
    }; 

    const fetchAllUsers = async() => {
        if (!user) {
            console.error("Cannot fetch users: user not loaded yet");
            return;
        }
        
        setLoadingUsers(true);
        try {
            const token = localStorage.getItem("token");
            console.log("Fetching users with token:", token ? "Token exists" : "No token");
            console.log("Current user:", user);
            
            // First test if auth routes are working
            // console.log("Testing auth routes...");
            // const testRes = await axios.get(`http://localhost:5000/api/auth/test-users`, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            // console.log("Test route response:", testRes.data);
            
            // Now try to get users
            const res = await axios.get(`http://localhost:5000/api/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("Users API response:", res.data);
            
            if(res.data.success) {
                // Filter out current user
                const otherUsers = res.data.users.filter(u => u._id !== user._id);
                setAllUsers(otherUsers);
                console.log("Loaded users:", otherUsers.length);
            } else {
                console.error("API returned success: false", res.data.message);
                setAllUsers([]);
            }
        }
        catch(err) {
            console.error("Error fetching users:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);
            if (err.response?.status === 401) {
                console.error("Authentication failed - redirecting to login");
                navigate('/login');
            }
            setAllUsers([]);
        }
        finally {
            setLoadingUsers(false);
        }
    }; 


    const fetchMessages = async(userId, limit = 40) => { 
        try { 
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/messages/with/${userId}?limit=${limit}`,{
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.data.success) { 
                setMssgs(res.data.data);
                // markMessagesAsRead(res.data.data);
            }
        }
        catch(err) { 
            console.error("Error fetching messages:", err);
        }
    }; 


    const markMessageAsRead = async(messageList) => { 
        const token  = localStorage.getItem("token");
        const unreadMssgList = messageList.filter( 
            mssg => mssg.receiverId === user._id && !mssg.readAt
        ); 
        for( const m of unreadMssgList) { 
            try { 
                await axios.post(`http://localhost:5000/api/messages/${messageList._id}/read`, { 
                    headers: { Authorization: `Bearer ${token}` }
                }); 
            }
            catch(error) { 
                console.error("Error marking message as read:", error);
            }
        }

        fetchUnreadCount(); 
        fetchConvos();
    }; 

    const fetchOrCreateConvos = async(contactUserId) => { 
        try { 
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/messages/with/${contactUserId}?limit=1`,{ 
                headers: { Authorization: `Bearer ${token}` }
            }); 

            if(res.data.success) { 
                const userRes = await axios.get(`http://localhost:5000/api/auth/profile/${contactUserId}`,{ 
                    headers: { Authorization: `Bearer ${token}` }
                }); 
                if(userRes.data.success) {
                    const otherUser = userRes.data.user; 
                    const conversationId = [user._id, contactUserId].sort().join('-');
                    const newConvo = { 
                        conversationId,
                        otherUser: { 
                            _id: otherUser._id,
                            firstName: otherUser.firstName,
                            lastName: otherUser.lastName,
                            type: otherUser.type
                        }, 
                        lastMessage : res.data.data[0] || null, 
                        unread : 0 
                    }; 

                    setSelectedConv(newConvo);
                    setMssgs(res.data.data); 
                    setConversations(prev => { 
                        const exists = prev.find(c => c.conversationId === conversationId); 
                        if(!exists) { 
                            return [newConvo, ...prev];
                        }
                        return prev; 
                    }); 
                }
            }
        }
        catch(error) { 
            console.error("Error fetching or creating conversation:", error);
        }
    };

    const selectConvo = (conv) => { 
        setSelectedConv(conv);
        const otherId = conv.otherUser._id;
        fetchMessages(otherId);
    }; 

    const startNewConversation = (selectedUser) => {
        const conversationId = [user._id, selectedUser._id].sort().join('-');
        
        const newConvo = {
            conversationId,
            otherUser: {
                _id: selectedUser._id,
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                type: selectedUser.type
            },
            lastMessage: null,
            unread: 0
        };
        
        setSelectedConv(newConvo);
        setMssgs([]);
        setShowNewConversation(false);
        
        // Add to conversations if not already there
        setConversations(prev => {
            const exists = prev.find(c => c.conversationId === conversationId);
            if (!exists) {
                return [newConvo, ...prev];
            }
            return prev;
        });
    }; 

    const handleLogout = () => { 
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    }; 

    const formatTime = (date) => { 
        const now = new Date(); 
        const messageData = new Date(date); 
        const DiffHours = (now-messageData)/(1000*60*60); /// why 1000 ? because js date is in milliseconds
        if(DiffHours < 24) {
            return messageData.toLocaleString([], { hour: '2-digit', minute: '2-digit'}); 
        }
        else if(DiffHours < 168) { /// less than a week
            return messageData.toLocaleString([], { weekday: 'short'});
        }
        else { 
            return messageData.toLocaleString([], { month: 'short', day: 'numeric'});
        }
    }; 

    const sendMssg = async() => { 
        if(!newMssg.trim() || !selectedConv || sendingMssg) return; 
        setSendingMssg(true);
        try { 
            const token = localStorage.getItem("token");
            const receiverId = selectedConv.otherUser._id;
            const res = await axios.post(`http://localhost:5000/api/messages/${receiverId}`, {
                content: newMssg.trim()
            }, { 
                headers: { Authorization: `Bearer ${token}` }
            }); 

            if(res.data.success) { 
                setMssgs(prev => [...prev, res.data.data]);
                setNewMssg("");
                fetchConvos();
            } else {
                console.error("Error sending message:", res.data.message);
                alert("Error sending message. Please try again.");
            }
        }
        catch(error) { 
            console.error("Error sending message:", error);
            alert("Error sending message. Please try again.");
        }
        finally { 
            setSendingMssg(false);
        }
    }; 


    if(loading) { 
        return ( 
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className="text-white mt-4">Loading Messages...</p>
                </div>
            </div>
        )
    }
  return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Navigation header */}
            <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-yellow-400">JOBATHON</h1>
                        <span className="ml-4 text-gray-400">|</span>
                        <span className="ml-4 text-white">Messages</span>
                        {unreadCnt > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCnt}</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-6">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors flex items-center">
                            <i className="fas fa-tachometer-alt mr-2"></i>
                            Dashboard
                        </button>
                        <button onClick={() => navigate('/jobs')} className="text-gray-400 hover:text-white transition-colors flex items-center">
                            <i className="fas fa-briefcase mr-2"></i>
                            Browse Jobs
                        </button>
                        {user && user.type === 'Seeker' && (
                            <button onClick={() => navigate('/my-applications')} className="text-gray-400 hover:text-white transition-colors flex items-center">
                                <i className="fas fa-clipboard mr-2"></i>
                                My Applications
                            </button>
                        )}
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                                <p className="text-gray-400 text-sm">{user?.type}</p>
                            </div>
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-gray-900 font-bold text-lg">
                                    {user?.firstName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors" title="Logout">
                                <i className="fas fa-sign-out-alt text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            {/* Main messaging interface */}
            <div className="flex h-screen">
                {/* Conversations Sidebar */}
                <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-white text-xl font-bold">Conversations</h2>
                                <p className="text-gray-400 text-sm mt-2">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowNewConversation(!showNewConversation);
                                    if (!showNewConversation) {
                                        fetchAllUsers();
                                    }
                                }}
                                className="bg-yellow-400 text-gray-900 px-3 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center"
                                title="Start New Conversation"
                            >
                                <i className="fas fa-plus mr-1"></i>
                                New
                            </button>
                        </div>
                        
                        {/* New Conversation Modal */}
                        {showNewConversation && (
                            <div className="mt-4 bg-gray-700 rounded-lg p-4">
                                <h3 className="text-white font-medium mb-3">Select User to Message</h3>
                                
                                {/* Search Input */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search users by name or type..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-4 py-2 pl-10 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-yellow-400 focus:outline-none"
                                        />
                                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {loadingUsers ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                                            <p className="text-gray-400 text-sm">Loading users...</p>
                                        </div>
                                    ) : (() => {
                                        const filteredUsers = allUsers.filter(u => {
                                            const searchLower = searchQuery.toLowerCase();
                                            const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
                                            const email = u.email?.toLowerCase() || '';
                                            const type = u.type.toLowerCase();
                                            
                                            return fullName.includes(searchLower) || 
                                                   email.includes(searchLower) || 
                                                   type.includes(searchLower);
                                        });

                                        return filteredUsers.length === 0 ? (
                                            <div className="text-center py-4">
                                                {allUsers.length === 0 ? (
                                                    <>
                                                        <i className="fas fa-users text-gray-500 text-2xl mb-2"></i>
                                                        <p className="text-gray-400 text-sm">No users available</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-search text-gray-500 text-2xl mb-2"></i>
                                                        <p className="text-gray-400 text-sm">No users found matching "{searchQuery}"</p>
                                                        <button
                                                            onClick={() => setSearchQuery('')}
                                                            className="mt-2 text-yellow-400 hover:text-yellow-300 text-sm"
                                                        >
                                                            Clear search
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            filteredUsers.map(u => (
                                                <div
                                                    key={u._id}
                                                    onClick={() => startNewConversation(u)}
                                                    className="flex items-center space-x-3 p-3 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors border border-gray-600 hover:border-yellow-400"
                                                >
                                                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-gray-900 font-bold">
                                                            {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium">{u.firstName} {u.lastName}</p>
                                                        <p className="text-gray-400 text-sm">{u.type}</p>
                                                        {u.email && (
                                                            <p className="text-gray-500 text-xs">{u.email}</p>
                                                        )}
                                                    </div>
                                                    <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
                                                </div>
                                            ))
                                        );
                                    })()}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowNewConversation(false);
                                        setSearchQuery('');
                                    }}
                                    className="mt-3 w-full bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center">
                                <i className="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
                                <p className="text-gray-400">No conversations yet</p>
                                <p className="text-gray-500 text-sm mt-2">Start messaging employers or other seekers to see messages here</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div key={conv.conversationId} onClick={() => selectConvo(conv)} className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${selectedConv?.conversationId === conv.conversationId ? 'bg-gray-700 border-l-4 border-yellow-400' : ''}`}>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-gray-900 font-bold">{conv.otherUser.firstName.charAt(0)}{conv.otherUser.lastName.charAt(0)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-white font-medium truncate">{conv.otherUser.firstName} {conv.otherUser.lastName}</p>
                                                {conv.lastMessage && (
                                                    <span className="text-gray-400 text-xs">{formatTime(conv.lastMessage.createdAt)}</span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-sm">{conv.otherUser.type}</p>
                                            {conv.lastMessage && (
                                                <p className="text-gray-400 text-sm truncate mt-1">{conv.lastMessage.content.length > 30 ? conv.lastMessage.content.substring(0, 30) + '...' : conv.lastMessage.content}</p>
                                            )}
                                        </div>
                                        {conv.unread > 0 && (
                                            <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full font-medium">{conv.unread}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                {/* Chat area */}
                <div className="flex-1 flex flex-col"> 
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center space-x-3">
                                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-gray-900 font-bold">{selectedConv.otherUser.firstName.charAt(0)}{selectedConv.otherUser.lastName.charAt(0)}</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{selectedConv.otherUser.firstName} {selectedConv.otherUser.lastName}</h3>
                                    <p className="text-gray-400 text-sm">{selectedConv.otherUser.type}</p>
                                </div>
                            </div>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {mssgs.length === 0 ? (
                                    <div className="text-center py-8">
                                        <i className="fas fa-comments text-4xl text-gray-600 mb-4"></i>
                                        <p className="text-gray-400">No messages yet</p>
                                        <p className="text-gray-500 text-sm">Start the conversation by sending a message</p>
                                    </div>
                                ) : (
                                    mssgs.map((mssg) => (
                                        <div key={mssg._id} className={`flex ${mssg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${mssg.sender._id === user._id ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-white'}`}>
                                                <p className="break-words">{mssg.content}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-xs opacity-70">{formatTime(mssg.createdAt)}</p>
                                                    {mssg.sender._id === user._id && (
                                                        <i className={`fas fa-check text-xs ml-2 ${mssg.readAt ? 'text-blue-600' : 'opacity-50'}`} title={mssg.readAt ? 'Read' : 'Sent'}></i>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={mssgEndRef} />
                            </div>
                            {/* Message Input */}
                            <div className="p-4 bg-gray-800 border-t border-gray-700">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMssg}
                                        onChange={(e) => setNewMssg(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMssg()}
                                        placeholder="Type a message..."
                                        disabled={sendingMssg}
                                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none disabled:opacity-50"
                                    />
                                    <button
                                        onClick={sendMssg}
                                        disabled={sendingMssg || !newMssg.trim()}
                                        className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sendingMssg ? (
                                            <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fas fa-paper-plane"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <i className="fas fa-comments text-6xl text-gray-600 mb-6"></i>
                                <p className="text-white text-xl mb-2">Select a conversation to start messaging</p>
                                <p className="text-gray-400">Choose from your existing conversations or start a new one from the job listings</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Include Font Awesome for icons */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        </div>
  )
}

export default Messages

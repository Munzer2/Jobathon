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


    const fetchMessages = async(userId, limit = 40) => { 
        try { 
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/messages/${userId}?limit=${limit}`,{
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
                const userRes = await axios.get(`http://localhost:5000/api/users/${contactUserId}`,{ 
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
        if(!newMssg.trim() || !selectConvo || sendMssg) return; 
        setSendingMssg(true);
        try { 
            const token = localStorage.getItem("token");
            const receiverId = selectedConv.otherUser._id;
            const res = await axios.post(`http://localhost:5000/api/messages/${receiverId}`, {
                content: newMssg.trim()
            }, { 
                headers: { Authorization: `Bearer ${token}` }
            }); 

            if(res.data.false) { 
                console.error("Error sending message:", res.data.message);
                return;
            }
            setMssgs(prev => [...prev, res.data.data]);
            setNewMssg("");
            fetchConvos();
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
            <div className = "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to gray-900 flex items-center justify-center">
                <div className = "text-center">
                    <div className = "animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className  = "text-white mt-4">Loading Messages...</p>
                </div>
            </div>
        )
    }
  return (
    <div className = "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to gray-900">
        {/* {Navigation header} */}
        <nav className = "bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className = "max-w-7xl mx-auto flex justify-between items-center">
                <div className = "flex items-center">
                    <h1 className = "text-2xl font-bold text-yellow-400">JOBATHON</h1>
                    <span className="ml-4 text-gray-400">|</span>
                    <span className="ml-4 text-white">Messages</span>
                    {unreadCnt > 0 && ( 
                        <span className = "ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCnt}</span>
                    )}
                </div>

                <div className = "flex items-center space-x-6">
                    <button onClick = {()=> navigate('/dashboard')} className = "text-gray-400 hover:text-white transition-colors flex items-center">
                        <i className = "fas fa-tachometer-alt mr-2"></i>
                        DashBoard
                    </button>

                    <button
                    onClick={() => navigate('/jobs')}
                    className = "text-gray-400 hover:text-white transition-colors flex items-center">
                        <i className = "fas fa-briefcase mr-2"></i>
                        Browse Jobs
                    </button>


                    {user && user.type === 'Seeker' &&  ( 
                        <button 
                        onClick = {() => navigate('my-applications')}
                        className = "text-gray-400 hover:text-white transition-colors flex items-center">
                            <i className = "fas fa-clipboard mr-2"></i>
                            My Applications
                        </button>
                    )}
                    <div className = "flex items-center space-x-4">
                        <div className = "text-right">
                            <p className = "text-white font-medium">{user?.firstName} {user?.lastName}</p>
                            <p className = "text-gray-400 text-sm">{user?.type}</p>
                        </div>
                        <div className = "w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className = "text-gray-900 font-bold text-lg">
                                {user?.firstName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <button
                        onClick={() => handleLogout()}
                        className = "text-gray-400 hover:text-white transition-colors"
                        title="Logout">
                            <i className = "fas fa-sign-out-alt text-xl"></i>
                        </button>
                    </div>
                </div>

            </div>
        </nav>

        {/* {Main messaging interface now} */}
        <div className = "flex h-screen">
            { /* Conversations Sidebar */}
            <div className = "w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className = "p-4 border-b border-gray-700">
                    <h2 className = "text-white text-xl  font-bold">Conversations</h2>
                    <p className = "text-gray-400 text-sm mt-2">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
                </div>
                <div className = "flex-1 overflow-y-auto">
                    {conversations.length === 0 ?  ( 
                        <div className = "p-6 text-center">
                            <i className = "fas fa-inbox text-4xl text-gray-600 mb-4"></i>
                            <p className = "text-gray-400">No conversations yet</p>
                            <p className = "text-gray-500 text-sm mt-2">
                                Start messaging employers or other seekers to see messages here
                            </p>
                        </div>
                    ): ( 
                        <div></div>
                    )}
                </div>
            </div>
        </div>
      {/* Include Font Awesome for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
      />
    </div>
  )
}

export default Messages

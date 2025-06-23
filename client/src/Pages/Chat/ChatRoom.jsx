import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar';
import { searchUsersByChannelName } from '../../Api/userSearch';

const API_URL = 'https://videostream-1b43.onrender.com';

const ChatRoom = () => {
  const currentUser = useSelector(state => state.currentuserreducer);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomName, setRoomName] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // --- New state for add member modal ---
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [addMemberResults, setAddMemberResults] = useState([]);
  const [addMemberSelected, setAddMemberSelected] = useState([]);
// Add this useEffect after your existing useEffect for fetching messages
useEffect(() => {
  if (!selectedRoom) return;
  const interval = setInterval(() => {
    axios.get(`${API_URL}/chat/messages/${selectedRoom._id}`, {
      headers: { Authorization: `Bearer ${currentUser.token}` }
    })
      .then(res => setMessages(res.data))
      .catch(err => {});
  }, 3000); // fetch every 3 seconds
  return () => clearInterval(interval);
}, [selectedRoom, currentUser]);
  // Fetch rooms for the current user
  useEffect(() => {
    if (!currentUser) return;
    axios.get(`${API_URL}/chat/rooms/${currentUser.result._id}`, {
      headers: { Authorization: `Bearer ${currentUser.token}` }
    })
      .then(res => setRooms(res.data))
      .catch(err => console.error(err));
  }, [currentUser]);

  // Fetch messages for selected room
  useEffect(() => {
    if (!selectedRoom) return;
    axios.get(`${API_URL}/chat/messages/${selectedRoom._id}`, {
      headers: { Authorization: `Bearer ${currentUser.token}` }
    })
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, [selectedRoom, currentUser]);

  // Search users by channel name
  useEffect(() => {
    if (memberSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    let cancel = false;
    searchUsersByChannelName(memberSearch).then(res => {
      if (!cancel) setSearchResults(res.data);
    });
    return () => { cancel = true; };
  }, [memberSearch]);

  // --- Add member search effect ---
  useEffect(() => {
    if (addMemberSearch.length < 2) {
      setAddMemberResults([]);
      return;
    }
    let cancel = false;
    searchUsersByChannelName(addMemberSearch).then(res => {
      if (!cancel) setAddMemberResults(res.data);
    });
    return () => { cancel = true; };
  }, [addMemberSearch]);

  // Create a new room (by channel name)
  const handleCreateRoom = () => {
    if (!roomName || selectedMembers.length === 0) return alert('Enter room name and add at least one member');
    const members = selectedMembers.map(u => u._id);
    axios.post(`${API_URL}/chat/room`, { name: roomName, members }, {
      headers: { Authorization: `Bearer ${currentUser.token}` }
    })
      .then(res => {
        setRooms([...rooms, res.data]);
        setRoomName('');
        setSelectedMembers([]);
        setMemberSearch('');
        setSearchResults([]);
      })
      .catch(err => alert(err.response?.data?.error || 'Error creating room'));
  };

  // Send a message
  const handleSendMessage = () => {
    if (!newMessage || !selectedRoom) return;
    axios.post(`${API_URL}/chat/message`, {
      roomId: selectedRoom._id,
      senderId: currentUser.result._id,
      text: newMessage
    }, {
      headers: { Authorization: `Bearer ${currentUser.token}` }
    })
      .then(res => {
        setMessages([...messages, { ...res.data, text: newMessage, sender: { name: currentUser.result.name, email: currentUser.result.email } }]);
        setNewMessage('');
      })
      .catch(err => alert(err.response?.data?.error || 'Error sending message'));
  };

  // Add member to room
  const handleAddMember = (user) => {
    if (selectedMembers.find(m => m._id === user._id)) return;
    setSelectedMembers([...selectedMembers, user]);
    setMemberSearch('');
    setSearchResults([]);
  };

  // Remove member from room
  const handleRemoveMember = (user) => {
    setSelectedMembers(selectedMembers.filter(m => m._id !== user._id));
  };

  // --- Handler to add members (admin only) ---
  const handleAddMembers = () => {
    if (!selectedRoom || addMemberSelected.length === 0) return;
    axios.post(`${API_URL}/chat/room/${selectedRoom._id}/add-members`, { members: addMemberSelected.map(u => u._id) }, {
      headers: { Authorization: `Bearer ${currentUser.token}` }
    })
      .then(res => {
        setSelectedRoom(res.data);
        setShowAddMember(false);
        setAddMemberSearch('');
        setAddMemberResults([]);
        setAddMemberSelected([]);
        alert('Members added!');
      })
      .catch(err => alert(err.response?.data?.error || 'Error adding members'));
  };

  // --- Handler to leave room ---
  const handleLeaveRoom = () => {
    if (!selectedRoom) return;
    axios.post(`${API_URL}/chat/room/${selectedRoom._id}/leave`, {}, {
      headers: { Authorization: `Bearer ${currentUser.token}` }
    })
      .then(res => {
        alert('You left the group');
        setSelectedRoom(null);
        // Optionally refresh room list
        setRooms(rooms.filter(r => r._id !== selectedRoom._id));
      })
      .catch(err => alert(err.response?.data?.error || 'Error leaving group'));
  };

  // Delete room
  const handleDeleteRoom = () => {
    if (!selectedRoom) return;
    axios.delete(`${API_URL}/chat/room/${selectedRoom._id}`, {
      headers: { Authorization: `Bearer ${currentUser.token}` }
    })
      .then(res => {
        alert('Group deleted');
        setSelectedRoom(null);
        setRooms(rooms.filter(r => r._id !== selectedRoom._id));
      })
      .catch(err => alert(err.response?.data?.error || 'Error deleting group'));
  };

  return (
    <div style={{ display: 'flex', height: '90vh', backgroundColor: '#f0f0f0' }}>
      <Leftsidebar/>
      {/* Room List */}
      <div style={{ width: 250, borderRight: '1px solid #ccc', padding: 16 }}>
        <h3>Rooms</h3>
        <ul>
          {rooms.map(room => (
            <li key={room._id} style={{ cursor: 'pointer', fontWeight: selectedRoom?._id === room._id ? 'bold' : 'normal' }} onClick={() => setSelectedRoom(room)}>
              {room.name}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 24 }}>
          <input placeholder="Room name" value={roomName} onChange={e => setRoomName(e.target.value)} />
          <input placeholder="Add member by channel name" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
          {searchResults.length > 0 && (
            <ul style={{ background: '#fff', border: '1px solid #ccc', maxHeight: 100, overflowY: 'auto', margin: 0, padding: 0 }}>
              {searchResults.map(user => (
                <li key={user._id} style={{ cursor: 'pointer', padding: 4 }} onClick={() => handleAddMember(user)}>
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          )}
          <div style={{ margin: '8px 0' }}>
            {selectedMembers.map(user => (
              <span key={user._id} style={{ background: '#eee', padding: '2px 6px', margin: 2, borderRadius: 4 }}>
                {user.name} 
                <b onClick={() => handleRemoveMember(user)} style={{ cursor: 'pointer', color: 'red', marginLeft: 4 }}>x</b>
              </span>
            ))}
          </div>
          <button onClick={handleCreateRoom}>Create Room</button>
        </div>
        {selectedRoom && (
          <div style={{ marginTop: 16 }}>
            {/* Admin actions */}
            {selectedRoom.admin === currentUser.result._id && (
              <>
                <button onClick={() => setShowAddMember(true)}>Add Member</button>
                <button onClick={handleDeleteRoom} style={{ color: 'red', marginLeft: 8 }}>Delete Group</button>
              </>
            )}
            {/* All members */}
            <button onClick={handleLeaveRoom} style={{ color: 'orange', marginLeft: 8 }}>Leave Group</button>
          </div>
        )}
      </div>
      {/* Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <h3>{selectedRoom ? selectedRoom.name : 'Select a room'}</h3>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ margin: '8px 0', textAlign: msg.sender?._id === currentUser.result._id ? 'right' : 'left' }}>
              <b>{msg.sender?.name || msg.sender?.email}:</b> {msg.text}
            </div>
          ))}
        </div>
        {selectedRoom && (
          <div style={{ display: 'flex', padding: 8, borderTop: '1px solid #ccc' }}>
            <input style={{ flex: 1 }} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        )}
      </div>
      {/* Add Member Modal */}
      {showAddMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 300 }}>
            <h4>Add Members</h4>
            <input placeholder="Search by channel name" value={addMemberSearch} onChange={e => setAddMemberSearch(e.target.value)} />
            {addMemberResults.length > 0 && (
              <ul style={{ background: '#eee', border: '1px solid #ccc', maxHeight: 100, overflowY: 'auto', margin: 0, padding: 0 }}>
                {addMemberResults.map(user => (
                  <li key={user._id} style={{ cursor: 'pointer', padding: 4 }} onClick={() => {
                    if (!addMemberSelected.find(m => m._id === user._id)) setAddMemberSelected([...addMemberSelected, user]);
                    setAddMemberSearch('');
                    setAddMemberResults([]);
                  }}>{user.name} ({user.email})</li>
                ))}
              </ul>
            )}
            <div style={{ margin: '8px 0' }}>
              {addMemberSelected.map(user => (
                <span key={user._id} style={{ background: '#eee', padding: '2px 6px', margin: 2, borderRadius: 4 }}>{user.name} <b onClick={() => setAddMemberSelected(addMemberSelected.filter(m => m._id !== user._id))} style={{ cursor: 'pointer', color: 'red' }}>x</b></span>
              ))}
            </div>
            <button onClick={handleAddMembers}>Add</button>
            <button onClick={() => setShowAddMember(false)} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;

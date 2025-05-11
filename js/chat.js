// Function to format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Function to add a message to the chat
function addMessage(message, isUser) {
    const chatBody = document.querySelector('.chat-body');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} mb-2`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content p-2 rounded';
    messageContent.style.backgroundColor = isUser ? '#007bff' : '#e9ecef';
    messageContent.style.color = isUser ? 'white' : 'black';
    messageContent.style.maxWidth = '80%';
    messageContent.style.marginLeft = isUser ? 'auto' : '0';
    messageContent.style.marginRight = isUser ? '0' : 'auto';
    
    const messageText = document.createElement('p');
    messageText.className = 'mb-1';
    messageText.textContent = message;
    
    const messageTime = document.createElement('small');
    messageTime.className = 'text-muted';
    messageTime.textContent = formatTime(new Date());
    
    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);
    messageDiv.appendChild(messageContent);
    chatBody.appendChild(messageDiv);
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Function to load chat history
async function loadChatHistory() {
    try {
        const res = await fetch('http://localhost:3000/chat-history');
        if (!res.ok) {
            throw new Error('Failed to load chat history');
        }
        
        const messages = await res.json();
        const chatBody = document.querySelector('.chat-body');
        chatBody.innerHTML = ''; // Clear existing messages
        
        messages.forEach(msg => {
            addMessage(msg.message, msg.isUser);
        });
    } catch (err) {
        console.error('Error loading chat history:', err);
    }
}

// Initialize chat functionality
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.querySelector('.chat-footer form');
    const chatInput = document.querySelector('.chat-footer input');
    const chatBody = document.querySelector('.chat-body');
    
    // Load chat history when chat is opened
    document.querySelector('[data-bs-target="#chatboxContent"]').addEventListener('click', loadChatHistory);
    
    // Handle message submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, true);
        chatInput.value = '';
        
        try {
            const res = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (!res.ok) {
                throw new Error('Failed to send message');
            }
            
            const data = await res.json();
            
            // Add bot response to chat
            addMessage(data.botMessage.message, false);
        } catch (err) {
            console.error('Error sending message:', err);
            addMessage('Sorry, there was an error sending your message. Please try again.', false);
        }
    });
}); 
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Handle form submissions with loading states (non-chat forms)
    const forms = document.querySelectorAll('form[id]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Loading...';
                submitBtn.disabled = true;
            }
        });
    });

    // Chat input: Handle Enter key to send message
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const chatId = getChatIdFromPage(); // Extract chat_id from the page
                if (chatId) {
                    sendMessage(chatId);
                }
            }
        });
        messageInput.focus();  // Auto-focus on load
    }

    // No welcome message - chat starts empty, user initiates
});

// Extract chat_id from the chat page (data attribute fallback)
function getChatIdFromPage() {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        return parseInt(chatContainer.dataset.chatId || 0);
    }
    return null;
}

// Add a message to the chat (user or bot)
function addMessage(sender, content, isLoading = false) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return null;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (isLoading) {
        // Show typing indicator for bot
        content = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        messageDiv.classList.add('loading');
    } else {
        // Escape HTML for safety and replace newlines
        let safeContent = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');  // Preserve line breaks properly
        
        // Truncate very long messages (e.g., verbose GPT replies)
        if (content.length > 500) {
            safeContent = safeContent.substring(0, 500) + '<br><em style="color: #999;">...</em>';
        }
        
        messageDiv.innerHTML = safeContent;
    }

    messagesContainer.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // If loading, return for removal later
    if (isLoading) {
        return messageDiv;
    }
    return null;
}

// Send message to backend and get bot response
async function sendMessage(chatId) {
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('chat-messages');  // Define here to avoid undefined error

    if (!messageInput || !sendBtn || !chatId || !messagesContainer) {
        console.error('Chat elements not found. Refresh the page.');
        alert('Chat not initialized. Please refresh the page.');
        return;
    }

    const userMessage = messageInput.value.trim();
    if (!userMessage) {
        return; // No empty messages
    }

    // Disable input and button during send
    const originalInputValue = messageInput.value;
    const originalBtnText = sendBtn.innerHTML;
    messageInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';

    let botLoadingDiv = null;  // Declare outside try for cleanup

    try {
        // Add user's message immediately
        addMessage('user', userMessage);

        // Clear input
        messageInput.value = '';

        // Show bot typing indicator
        botLoadingDiv = addMessage('bot', '', true);

        // Send to backend API
        const response = await fetch(`/api/chat/${chatId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        // Remove loading and add bot response
        if (botLoadingDiv && botLoadingDiv.parentNode) {
            messagesContainer.removeChild(botLoadingDiv);
        }
        addMessage('bot', data.response || 'Sorry, I could not generate a response.');

    } catch (error) {
        console.error('Chat error:', error);
        
        // Remove loading and show error message
        if (botLoadingDiv && botLoadingDiv.parentNode) {
            messagesContainer.removeChild(botLoadingDiv);
        }
        addMessage('bot', `Oops! Something went wrong: ${error.message}. Please try again.`);

        // Show alert for critical errors
        alert('Failed to send message. Check your connection or try refreshing the page.');
    } finally {
        // Re-enable input and button
        messageInput.disabled = false;
        messageInput.focus();
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalBtnText;
    }
}

// Optional: Add a welcome message initializer (if needed in future)
// Call this if needed, e.g., from chat.html
function initializeChat(chatId) {
    // No-op for now - chat starts empty
}

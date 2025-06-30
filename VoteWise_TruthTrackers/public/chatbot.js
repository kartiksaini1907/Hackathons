document.addEventListener('DOMContentLoaded', () => {
    // This function creates the HTML for the chatbot and adds it to the page
    function initializeChatbot() {
        const chatbotHTML = `
            <div id="chatbot-window">
                <div id="chatbot-header">
                    <div id="chatbot-header-title">
                        <span>🤖</span>
                        <span>VoteWise Assistant</span>
                    </div>
                    <button id="close-chatbot-btn">×</button>
                </div>
                <div id="chatbot-messages">
                    <div class="chat-message bot-message">
                        <div class="content">
                            Hello! How can I help you today? You can ask me questions like "What is the BJP's ideology?" or "Who is the leader of AAP?".
                        </div>
                    </div>
                </div>
                <div id="chatbot-input-area">
                    <input type="text" id="chatbot-input" placeholder="Ask a question..." autocomplete="off">
                    <button id="chatbot-send-btn">➤</button>
                </div>
            </div>
            <button id="chatbot-toggle-button">
                <span>🤖</span>
            </button>
        `;
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    initializeChatbot();

    // Get references to all the chatbot elements
    const chatbotWindow = document.getElementById('chatbot-window');
    const toggleButton = document.getElementById('chatbot-toggle-button');
    const closeButton = document.getElementById('close-chatbot-btn');
    const messagesContainer = document.getElementById('chatbot-messages');
    const inputField = document.getElementById('chatbot-input');
    const sendButton = document.getElementById('chatbot-send-btn');
    
    let conversationHistory = "";

    // Function to open/close the chatbot window
    const toggleChatbot = () => {
        chatbotWindow.classList.toggle('open');
    };

    // Add event listeners to the buttons
    toggleButton.addEventListener('click', toggleChatbot);
    closeButton.addEventListener('click', toggleChatbot);

    // Function to add a message to the chat window
    const addMessage = (sender, text) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content');
        contentDiv.textContent = text;
        messageElement.appendChild(contentDiv);

        messagesContainer.appendChild(messageElement);
        // Automatically scroll to the latest message
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return messageElement;
    };

    // Function to handle sending a message
    const handleSendMessage = async () => {
        const question = inputField.value.trim();
        if (!question) return;

        addMessage('user', question);
        inputField.value = ''; // Clear the input field

        const loadingMessage = addMessage('bot', 'Thinking...');
        loadingMessage.classList.add('loading');

        try {
            // Send the question and history to the server's API
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question, history: conversationHistory })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            
            // Update the loading message with the actual answer
            loadingMessage.querySelector('.content').textContent = data.answer;
            loadingMessage.classList.remove('loading');
            
            // Update conversation history
            conversationHistory += `User: ${question}\nAssistant: ${data.answer}\n`;

        } catch (error) {
            console.error('Error with chatbot:', error);
            loadingMessage.querySelector('.content').textContent = 'Sorry, something went wrong. Please try again.';
            loadingMessage.classList.remove('loading');
        }
    };

    // Add event listeners for sending a message
    sendButton.addEventListener('click', handleSendMessage);
    inputField.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });
});
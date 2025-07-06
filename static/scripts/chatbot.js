const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const fab = document.getElementById('chatbot-fab');
let chatOpen = false;

fab.addEventListener('click', () => {
    chatOpen = !chatOpen;
    chatContainer.style.display = chatOpen ? 'block' : 'none';
});

chatForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;
    appendMessage('Tú', message);
    userInput.value = '';
    // Enviar mensaje al backend
    const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const data = await response.json();
    appendMessage('Bot', data.reply);
});

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    if (sender === 'Tú') {
        msgDiv.classList.add('user');
    } else {
        msgDiv.classList.add('bot');
    }
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

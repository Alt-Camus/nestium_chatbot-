const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const fab = document.getElementById('chatbot-fab');
let chatOpen = false;

const clearBtn = document.getElementById('clear-chat-btn');
const clearModal = document.getElementById('clear-modal');
const confirmClear = document.getElementById('confirm-clear');
const cancelClear = document.getElementById('cancel-clear');

let botTyping = false;

fab.addEventListener('click', () => {
    chatOpen = !chatOpen;
    chatContainer.style.display = chatOpen ? 'block' : 'none';
    // Mostrar saludo solo la primera vez si el chat está vacío
    if (chatOpen && chatBox.children.length === 0) {
        appendMessage('Bot', '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte? Hazme una pregunta sobre incubadoras.', true);
    }
});

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        clearModal.style.display = 'flex';
    });
}
if (cancelClear) {
    cancelClear.addEventListener('click', () => {
        clearModal.style.display = 'none';
    });
}
if (confirmClear) {
    confirmClear.addEventListener('click', () => {
        chatBox.innerHTML = '';
        clearModal.style.display = 'none';
        // Mostrar saludo después de limpiar el chat con efecto de escritura
        appendMessage('Bot', '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte? Hazme una pregunta sobre incubadoras.', true);
    });
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(sender, text, progressive = false, callback = null) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    if (sender === 'Tú') {
        msgDiv.classList.add('user');
        msgDiv.textContent = text;
        chatBox.appendChild(msgDiv);
        scrollToBottom();
    } else {
        msgDiv.classList.add('bot');
        msgDiv.textContent = text;
        chatBox.appendChild(msgDiv);
        scrollToBottom();
        if (progressive) {
            botTyping = true;
            let i = 0;
            function typeWriter() {
                if (i <= text.length) {
                    msgDiv.textContent = text.slice(0, i);
                    i++;
                    scrollToBottom();
                    setTimeout(typeWriter, 10 + Math.random() * 18);
                } else {
                    botTyping = false;
                    if (callback) callback();
                }
            }
            typeWriter();
        } else {
            msgDiv.textContent = text;
            botTyping = false;
            if (callback) callback();
        }
    }
}

// Animación de "escribiendo..."
function showTyping() {
    let typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot', 'typing');
    typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    chatBox.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
}
function removeTyping(typingDiv) {
    if (typingDiv && typingDiv.parentNode) {
        typingDiv.parentNode.removeChild(typingDiv);
    }
}

chatForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (botTyping) return; // Restringir envío mientras el bot escribe
    const message = userInput.value.trim();
    if (!message) return;
    appendMessage('Tú', message);
    userInput.value = '';
    userInput.disabled = true;
    // Mostrar animación de escribiendo
    const typingDiv = showTyping();
    // Esperar un poco más antes de mostrar la respuesta
    await new Promise(res => setTimeout(res, 900)); // 900ms extra
    // Enviar mensaje al backend
    const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const data = await response.json();
    removeTyping(typingDiv);
    appendMessage('Bot', data.reply, true, () => {
        userInput.disabled = false;
        userInput.focus();
    });
});

const socket = io();
const messageInput = document.getElementById('message');
const usernameInput = document.getElementById('username');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');
const onlineCount = document.querySelector('.online-count');

let username = '';

// Анимация появления
document.addEventListener('DOMContentLoaded', () => {
    usernameInput.focus();
    gsap.from('.chat-container', { 
        duration: 0.5, 
        opacity: 0, 
        y: 50, 
        ease: 'power2.out' 
    });
});

// Валидация имени пользователя
usernameInput.addEventListener('input', () => {
    if (usernameInput.value.trim().length >= 3) {
        username = usernameInput.value.trim();
        usernameInput.disabled = true;
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
        socket.emit('new-user', username);
    }
});

// Отправка сообщения
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('send-message', message);
        messageInput.value = '';
        messageInput.focus();
    }
}

// Получение сообщений
socket.on('message', ({ username, text, time }) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', username === 'Чат-бот' ? 'bot' : 'user');
    
    messageElement.innerHTML = `
        <div class="username">${username}</div>
        <div class="content">${text}</div>
        <div class="time">${time}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Анимация сообщения
    gsap.from(messageElement, { 
        opacity: 0, 
        y: 20, 
        duration: 0.3 
    });
});

// Обновление списка пользователей
socket.on('user-connected', (username) => {
    const botMessage = createBotMessage(`${username} присоединился к чату`);
    messagesContainer.appendChild(botMessage);
    updateOnlineCount();
});

socket.on('user-disconnected', (username) => {
    const botMessage = createBotMessage(`${username} покинул чат`);
    messagesContainer.appendChild(botMessage);
    updateOnlineCount();
});

function createBotMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot');
    messageElement.innerHTML = `
        <div class="content">${text}</div>
    `;
    return messageElement;
}

function updateOnlineCount() {
    fetch('/online-count')
        .then(response => response.json())
        .then(data => {
            onlineCount.textContent = data.count;
        });
}

// Пингуем сервер каждые 10 секунд для обновления счетчика
setInterval(updateOnlineCount, 10000);
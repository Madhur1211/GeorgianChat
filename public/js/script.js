const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// get username from URL (room is hardcoded to 'CommonRoom')
const { username } = Qs.parse(location.search, {
   ignoreQueryPrefix: true,
});

const room = 'CommonRoom'; // Hardcoded room name

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// get room and users
socket.on('roomUsers', ({ room, users }) => {
   outputRoomName(room);
   outputUsers(users);
});

// message from server
socket.on('message', (message) => {
   // console.log(message);
   outputMessage(message);

   // scroll down
   chatMessages.scrollTop = chatMessages.scrollHeight;
});

// message submit
chatForm.addEventListener('submit', (e) => {
   e.preventDefault();

   // get message text
   const msg = e.target.elements.msg.value;

   // emit message to server
   socket.emit('chatMessage', msg);

   // clear input
   e.target.elements.msg.value = '';
   e.target.elements.msg.focus();
});

// output msg to DOM
function outputMessage(message) {
   const div = document.createElement('div');
   div.classList.add('message');
   div.innerHTML = ` <p class="meta">${message.username} <span>${message.time}</span></p>
   <p class="text">
      ${message.text}
   </p>`;

   document.querySelector('.chat-messages').appendChild(div);
}

// add room name to DOM
function outputRoomName(room) {
   roomName.innerHTML = room;
}

// add users to DOM
function outputUsers(users) {
   userList.innerHTML = `
      ${users.map((user) => `<li>${user.username}</li>`).join('')}
   `;
}

function togglePassword() {
   const passwordInput = document.getElementById('password');
   const toggleButton = document.querySelector('.toggle-password');
 
   if (passwordInput.type === 'password') {
     passwordInput.type = 'text';
     toggleButton.innerHTML = '<i class="far fa-eye-slash"></i>';
   } else {
     passwordInput.type = 'password';
     toggleButton.innerHTML = '<i class="far fa-eye"></i>';
   }
 }
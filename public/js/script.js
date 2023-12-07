// Get the necessary DOM elements
const chatForm = document.getElementById('chat-form');  // The form for submitting messages
const chatMessages = document.querySelector('.chat-messages');  // The container for displaying chat messages
const roomName = document.getElementById('room-name');  // The element displaying the current chat room name
const userList = document.getElementById('users');  // The list displaying the users in the current chat room

// Get the username from the URL query parameters (using the Qs library)
const { username } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Hardcoded room name
const room = 'CommonRoom';

// Initialize the socket.io connection
const socket = io();

// Emit a 'joinRoom' event to the server to join the chat room with the given username and room
socket.emit('joinRoom', { username, room });

// Listen for 'roomUsers' event from the server to update room information and user list
socket.on('roomUsers', ({ room, users }) => {
   outputRoomName(room);  // Update the displayed room name
   outputUsers(users);  // Update the displayed user list
});

// Listen for 'message' events from the server to display new chat messages
socket.on('message', (message) => {
   outputMessage(message);  // Output the new message to the DOM

   // Automatically scroll down to show the latest message
   chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Listen for form submission to send a chat message to the server
chatForm.addEventListener('submit', (e) => {
   e.preventDefault();

   // Get the message text from the input field
   const msg = e.target.elements.msg.value;

   // Emit a 'chatMessage' event to the server with the message content
   socket.emit('chatMessage', msg);

   // Clear the input field and focus on it for the next message
   e.target.elements.msg.value = '';
   e.target.elements.msg.focus();
});

// Function to display a chat message in the DOM
function outputMessage(message) {
   const div = document.createElement('div');
   div.classList.add('message');
   div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">${message.text}</p>`;

   // Append the new message to the chat container
   document.querySelector('.chat-messages').appendChild(div);
}

// Function to update the displayed room name in the DOM
function outputRoomName(room) {
   roomName.innerHTML = room;
}

// Function to update the displayed user list in the DOM
function outputUsers(users) {
   userList.innerHTML = `${users.map((user) => `<li>${user.username}</li>`).join('')}`;
}

// Function to toggle the visibility of the password input
function togglePassword() {
   const passwordInput = document.getElementById('password');
   const toggleButton = document.querySelector('.toggle-password');
 
   // Toggle between password and text input types
   if (passwordInput.type === 'password') {
     passwordInput.type = 'text';
     toggleButton.innerHTML = '<i class="far fa-eye-slash"></i>';
   } else {
     passwordInput.type = 'password';
     toggleButton.innerHTML = '<i class="far fa-eye"></i>';
   }
}

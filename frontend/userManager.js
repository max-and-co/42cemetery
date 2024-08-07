import { User } from './user.js';

export class UserManager {
	constructor() {
		this.users = [];
		this.localUser = null;
		this.socket = null;
		this.id = Math.random().toString(36).substr(2, 9);
		this.isConnected = false;
  
		window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
	}
  
	createUser(userData) {
	  const user = new User(userData);
	  user.init();
	  return user;
	}
	
	handleBeforeUnload() {
	  if (this.socket) {
		this.socket.close();
	  }
	}
  
	removeUser(userId) {
	  if (this.users[userId]) {
		this.users[userId].remove();
		delete this.users[userId];
	  }
	}
  
	connectWebSocket() {
		console.log('Attempting to connect WebSocket');
		this.socket = new WebSocket('ws://localhost:8080/ws');
  
		this.socket.onopen = () => {
			console.log('WebSocket connected');
			this.isConnected = true;
		};
  
		this.socket.onmessage = (event) => {
		  const messageData = JSON.parse(event.data);
		  const messageString = messageData.message;
		  const data = JSON.parse(messageString);
		  console.log(data.message);
		  if (data.message === 'disconnect') {
			console.log("User disconnected:", data.id);
			this.removeUser(data.id);
			return;
		  }
		if (data.id !== this.id) {
		if (!this.users[data.id])
			this.users[data.id] = this.createUser(data.user);
		this.users[data.id].updatePosition(data.position.x, data.position.y, data.position.z, data.rotation);
		}
	  };
  
		this.socket.onclose = (event) => {
			console.log('WebSocket disconnected:', event.reason);
			this.isConnected = false;
			this.safeSend(JSON.stringify({ id: this.id, message: 'disconnect' }));
			setTimeout(() => this.connectWebSocket(), 15000); // Attempt to reconnect after 5 seconds
		};
  
		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
			this.socket.close();
		};
	}
  
	safeSend(message) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
		  this.socket.send(message);
		}
	}
  
  }
  
import { User } from './user.js';

export class UserManager {
	constructor() {
		this.users = [];
		this.localUser = null;
		this.socket = null;
		this.id = null;
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
		
		switch(messageData.type) {
			case 'connection_info':
				this.handleConnectionInfo(messageData);
				break;
			case 'user_connected':
				this.handleUserConnected(messageData);
				break;
			case 'user_disconnected':
				this.handleUserDisconnected(messageData);
				break;
			default:
				this.handleGameMessage(messageData);
			}
		};
		
		this.socket.onclose = (event) => {
			console.log('WebSocket disconnected:', event.reason);
			this.isConnected = false;
			setTimeout(() => this.connectWebSocket(), 15000); // Attempt to reconnect after 5 seconds
		};
		
		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
			this.socket.close();
		};
	}
			
	handleConnectionInfo(data) {
		this.id = data.client_id;
		console.log(`Connected as client ${this.id}`);
		console.log(`Total connections: ${data.total_connections}`);
	}

	handleUserConnected(data) {
		if (data.client_id !== this.id) {
			console.log(`User ${data.client_id} has connected`);
			// You can add more logic here, like creating a new user object
		}
	}

	handleUserDisconnected(data) {
		console.log(`User ${data.client_id} has disconnected`);
		this.removeUser(data.client_id);
	}

	handleGameMessage(messageData) {
		const messageString = messageData.message;
		const data = JSON.parse(messageString);
		if (data.id !== this.id) {
			if (!this.users[data.id])
				this.users[data.id] = this.createUser(data.user);
			this.users[data.id].updatePosition(data.position.x, data.position.y, data.position.z, data.rotation);
		}  
	}
  
	safeSend(message) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
		  this.socket.send(message);
		}
	}
  }
  
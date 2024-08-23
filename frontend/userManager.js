import * as THREE from 'three';
import { localUserColor, mainCamera, renderer, light} from './main.js';
import { User } from './user.js';
import { GroundThirdPersonControls } from './FirstPersonControls.js';

export let controls;

export class UserManager {
	constructor(localUserData) {
		this.users = [];
		this.localUser = localUserData;
		this.socket = null;
		this.id = null;
		this.isConnected = false;
		this.isConnecting = false;
  
		window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
	}
  
	createUser(userData, isLocalUser = false) {
	  const user = new User(userData, isLocalUser);
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
		if (this.isConnected || this.isConnecting) {
			console.warn('WebSocket connection attempt blocked: already connected or connecting');
			return;
		}
		this.isConnecting = true;
		console.log('Attempting to connect WebSocket');
		this.socket = new WebSocket('ws://localhost:8080/ws');
		
		this.socket.onopen = () => {
			console.log('WebSocket connected');
			this.isConnected = true;
			this.isConnecting = false;
		
			const selectedTitleUser = this.localUser.titles_users.find(obj => obj.selected === true);
			const selectedTitle = this.localUser.titles.find(title => title.id === selectedTitleUser.title_id);
		
			// Send the user data with the correct title name
			this.socket.send(JSON.stringify({ 
				user_data: { 
					...this.localUser, 
					color: localUserColor, 
					title: selectedTitle.name // Include the title name here
				}
			}));
		};
  
		this.socket.onmessage = (event) => {
		const messageData = JSON.parse(event.data);
		
		switch(messageData.type) {
			case 'local_connection_infos':
				this.handleConnectionInfo(messageData);
				break;
			case 'remote_user_connected':
				this.handleRemoteUserConnected(messageData);
				break;
			case 'remote_user_disconnected':
				this.handleRemoteUserDisconnected(messageData.client_id	);
				break;
			default:
				this.handleRemoteUserMessage(messageData);
			}
		};
		
		this.socket.onclose = (event) => {
			console.log('WebSocket disconnected:', event.reason);
			this.isConnected = false;
			this.isConnecting = false;
			// setTimeout(() => this.connectWebSocket(), 15000); // Attempt to reconnect after 5 seconds
		};
		
		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
			this.socket.close();
		};
	}
			
	handleConnectionInfo(data) {
		this.id = data.client_id;
		console.log(this.localUser);
		console.log(`Total connections: ${data.total_connections}`);
		console.log(`Connected as client ${this.id}`);
		console.log('Local user:', this.localUser);
		const selectedTitleUser = this.localUser.titles_users.find(obj => obj.selected === true);
		const selectedTitle = this.localUser.titles.find(title => title.id === selectedTitleUser.title_id);
		this.localUser.title = selectedTitle.name;
		this.localUser.color = localUserColor;
		this.localUser = this.createUser(this.localUser, /* isLocalUser : */ true);
		controls = new GroundThirdPersonControls(this.localUser, renderer.domElement, 1, light);
		for (const user of data.users)
			this.users[user.client_id] = this.createUser(user.user_data);
	}

	handleRemoteUserConnected(data) {
		if (data.client_id !== this.id) {
			console.log(`User ${data.client_id} has connected`);
			this.users[data.client_id] = this.createUser(data.user_data);
		}
	}

	handleRemoteUserDisconnected(id) {
		console.log(`User ${id} has disconnected`);
		this.removeUser(id);
	}

	handleRemoteUserMessage(messageData) {
		const messageString = messageData.message;
		const data = JSON.parse(messageString);
		if (data.id !== this.id) {
			this.users[data.id].updatePosition(data.position.x, data.position.y, data.position.z, data.rotation);
		}  
	}
  
	safeSend(message) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
		  this.socket.send(message);
		}
	}

	updateCameraPosition() {
		if (mainCamera && this.localUser.parent) {
			const offset = new THREE.Vector3(0, 10, 10); // Define the offset vector
			const targetPosition = new THREE.Vector3().copy(this.localUser.parent.position).add(offset);
			
			// Interpolate between current camera position and target position
			mainCamera.position.lerp(targetPosition, 0.1); // The 0.1 factor controls the smoothness
		}
	}
}
  
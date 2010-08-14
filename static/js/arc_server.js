(function(window, document){
	//Helper for JSON html5 localStorage 
	var storage = {
		get: function(k){
			return $.parseJSON(localStorage[k]);
		},
		set: function(k, v){
			return localStorage[k] = JSON.stringify(v);
		}
	};

	if(window.top === window){ return;}
	
	var ArcServer = function(policies){
		var self = this;
		this.client = undefined;
		this.id = undefined;
		this.policies = policies;
		this.policies.discover = discoverPolicy;
		window.addEventListener('message', function(e){
            console.log("msg recieved");
			if(self.client === undefined){  //if client window isn't stored store it
				self.client = e.source;
				self.origin = e.origin;
			}
			self.id = e.data.id;
			if(e.data.call === 'discover'){self.checkQueue();}  //if yo check localStorage for pending messages
			if(self.policies[e.data.callName]){
				self.policies[e.data.callName].call(self, e);
				self.checkQueue();
			}
		},false);   
	};
	
	ArcServer.prototype.checkQueue = function(){
		var allMessages = storage.get('ArcMessages'); 
		this.queuedMessages = allMessages[this.origin];  //only get messages from queue that match the domain of the client
		for(var i = 0, len = this.queuedMessages.length; i<len; i++){
			var qm = this.queuedMessages[i];
			this.respond(qm.callName, qm.id, qm.message);
		}
	};
	
	ArcServer.prototype.respond = function(e, message){	
		this.client.postMessage(JSON.stringify({callName:e.callName, id: e.id, message:message}));  //respond with call, id and any described data
	};
	ArcServer.prototype.addMessage = function(e,message){
		
	};
	ArcServer.prototype.addFunction = function(e,message){
		
	};
	
	window.ArcServer = ArcServer;
	
	//Standard Library
	var discoverPolicy = {
		callName: 'discover',
		onMessage: function(e){
			var callNames = [];
			for(policy in this.policies){
				callNames.push(policy);
			}
			this.addMessage(e,callNames);
		}
	};
	
})(window,document);
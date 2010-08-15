(function(window, document){
	//Helper for JSON html5 localStorage 
	var storage = {
		get: function(k){
			return JSON.parse(localStorage[k]);
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
		
		if(!storage.get('ArcMessages')) storage.set('ArcMessages',[])
		window.addEventListener('message', function(e){
			var data = JSON.parse(e.data);
			if(self.client === undefined){  //if client window isn't stored store it
				self.client = e.source;
				self.origin = e.origin;
			}
			self.id = data.id;
			if(self.policies[data.callName]){
				self.policies[data.callName].onMessage.call(self, e, data);
				self.checkQueue();
			}
		},false);   
	};
	
	ArcServer.prototype.checkQueue = function(e){
		var allMessages = storage.get('ArcMessages'); 
		//only get messages from queue that match the domain of the client
		this.queuedMessages = allMessages[this.origin];  
		for(var i=0, len = this.queuedMessages.length; i<len; i++){
			var qm = this.queuedMessages[i];
			if(qm.fn){
				this.respond(e, qm.fn.call(this,e));
			}else{
				this.respond(e, qm.message);
			}
		}
	};
	
	ArcServer.prototype.respond = function(e, message){	
		//respond with call, id and any described data
		this.client.postMessage(JSON.stringify({callName: e.callName, id: e.id, message: message}),e.source);  
		alert(message)
	};
	
	ArcServer.prototype.addMessage = function(e,message){
		var o = storage.get('ArcMessages');
		if(!o[e.origin]){
			o[e.origin] = [];
		}
		o[e.origin].push({id: e.id, callName: e.callName, message: message });
		storage.set('ArcMessages', o);
		this.checkQueue(e);
	};
	ArcServer.prototype.addFunction = function(e,fn){
		var o = storage.get('ArcMessages');
		if(!o[e.origin]){
			o[e.origin] = [];
		}
		o[e.origin].push({id: e.id, callName: e.callName, fn: fn });
		storage.set('ArcMessages', o);
		this.checkQueue(e);
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
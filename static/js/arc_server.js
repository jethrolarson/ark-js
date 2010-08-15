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
	
	function Policy(options){
		this.callName = options.callName;
		this.messageHandler = options.onMessage;
		return this;
	}
	Policy.prototype.message = function(e, arc){
		var data = JSON.parse(e.data);
		this.id = data.id;
		this.origin = data.origin;
		this.source = data.source;
		this.messageHandler.call(arc, e, data);
	};
	
	var ArcServer = function(policies){
		var self = this;
		this.source = undefined;
		this.id = undefined;
		this.policies = {};
		policies.discover = discoverPolicy;
		for(key in policies){
			this.policies[key] = new Policy(policies[key]);
		}
		
		window.addEventListener('message', function(e){
			var data = JSON.parse(e.data);
			if(self.source === undefined){  //if client window isn't stored store it
				self.source = e.source;
				self.origin = e.origin;
				
				//make sure to init the localStorage for the origin;
				var arcMessages = storage.get('ArcMessages');
				if(!arcMessages || !arcMessages[e.origin]){
					var o = {};
					o[e.origin] = [];
					storage.set('ArcMessages',o);
				}
			}
			self.id = data.id;
			var policy = self.policies[data.callName];
			if(policy){
				policy.message(e,self);
				self.checkQueue();
			}
		},false);   
	};
	
	ArcServer.prototype.checkQueue = function(e){
		var allMessages = storage.get('ArcMessages'); 
		//only get messages from queue that match the domain of the client
		this.queuedMessages = allMessages[this.origin];
		var qm;
		while(qm = this.dequeue()){
			if(qm.fn){
				this.respond(e, qm.fn.call(this,e));
			}else{
				this.respond(e, qm.message);
			}
		}
	};
	
	ArcServer.prototype.respond = function(e, message){	
		//respond with call, id and any described data
		var data = JSON.parse(e.data);
		var postMessage = JSON.stringify({callName: data.callName, id: data.id, message: message});
		
		this.source.postMessage(postMessage, e.origin);  

	};
	
	ArcServer.prototype.addMessage = function(e,message){
		this.enqueue(e, message);
		this.checkQueue(e);
	};
	ArcServer.prototype.addFunction = function(e,fn){
		this.enqueue(e,"",fn);
		this.checkQueue(e);
	};
	
	ArcServer.prototype.enqueue = function(e, message, fn){
			var o = storage.get('ArcMessages'),
			    mo = {};
			if(!o[this.origin]){
				o[this.origin] = [];
			}
			mo = {id: e.id, callName: e.callName };
			if(typeof message !== undefined)  mo.message = message;
			if(typeof fn !== undefined) mo.fn = fn;
			o[e.origin].push(mo);
			storage.set('ArcMessages', o);
	};
	ArcServer.prototype.dequeue = function(){
		var o = storage.get('ArcMessages')[this.origin];
		if(o){
			var m = o.pop();
			storage.set('ArcMessages', o);
		}else{m=undefined;}
		return m;
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
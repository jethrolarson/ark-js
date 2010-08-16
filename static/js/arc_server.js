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
	
//	if(window.top === window){ return;}
	
	function Policy(name, options){
		this.callName = name;
		this.messageHandler = options.onMessage;
		return this;
	};
	
	Policy.prototype.message = function(e, arc){
		var data = JSON.parse(e.data);
		this.callbackId = data.callbackId;
		this.origin = data.origin;
		this.source = data.source;
		this.messageHandler.call(arc, e, data);
	};
	
	var ArcServer = function(policies){
		var self = this;
		this.source = undefined;
		this.callbackId = undefined;
		this.policies = assembleLibrary(policies || {});
		window.addEventListener('message', function(e){
			console.log('added event listner')
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
			self.callbackId = data.callbackId;
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
				this.respond(e, window[qm.fn].call(this,e));
			}else{
				this.respond(e, qm.message);
			}
		}
	};
	
	ArcServer.prototype.respond = function(e, message){	
		//respond with call, callbackId and any described data
		var data = JSON.parse(e.data);
		var postMessage = JSON.stringify({callName: data.callName, callback: data.callbackId, message: message});
		this.source.postMessage(postMessage, '*');
	};
	
	ArcServer.prototype.sendMessage = function(e,message){
		this.enqueue(e, message);
		this.checkQueue(e);
	};
	ArcServer.prototype.addFunction = function(e,fn){
		this.enqueue(e,"",fn);
		this.checkQueue(e);
	};
	
	ArcServer.prototype.enqueue = function(e, message, fn){
		var data = JSON.parse(e.data);
		var o = storage.get('ArcMessages'),
		    mo = {};
		if(!o[this.origin]){
			o[this.origin] = [];
		}
		mo = {callbackId: data.callbackId, callName: data.callName };
		if(typeof message !== undefined)  mo.message = message;
		if(typeof fn !== undefined) mo.fn = fn;
		o[e.origin].push(mo);
		storage.set('ArcMessages', o);
	};
	ArcServer.prototype.dequeue = function(){
		var o = storage.get('ArcMessages')[this.origin];
		if(o){
			var m = o.pop(), ob = {};
			ob[this.origin] = o; 
			storage.set('ArcMessages', ob);
		}else{m = undefined;}
		return m;
	};
	
	window.ArcServer = ArcServer;
	
	//Standard Library
	
	var standardLibrary = {
		'discover': {
			onMessage: function(e){
				var callNames = [];
				for(policy in this.policies){
					callNames.push(policy);
				}
				this.sendMessage(e,callNames);
			}
		},
		'pageRequest': {
			onMessage: function(e){
				var self = this,
					options = JSON.parse(e.data).data;
					request = new XMLHttpRequest(),
					complete = false;

				if (!request) return self.sendMessage(options, 'No request object found');
				
				options.method = options.method.toUpperCase();

				try {
					if (options.method == "GET") {
						request.open(options.method, options.url + "?" + options.params, true);
						options.params = "";
					}
					else {
						request.open(options.method, options.url, true);
						request.setRequestHeader("Method", "POST " + options.url + " HTTP/1.1");
						request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					}
					
					request.onload = function(response) {
						if (request.readyState == 4) {  
							if(request.status == 200 || request.status == 302 || request.status == 304) self.sendMessage(e, [request.responseXML, request.responseText, response]);
							else self.sendMessage(e, 'there was an error');  
						}
					};  
					
					request.send(options.params);
				}
				catch(z) { return self.sendMessage(e, z); }

			}
		}
	}
	
	var assembleLibrary = function(policies){
		for(lib in standardLibrary){ policies[lib] = standardLibrary[lib] }
		for(lib in policies){ policies[lib] = new Policy(lib, policies[lib]) }
		return policies;
	};
	
	
	
})(window,document);
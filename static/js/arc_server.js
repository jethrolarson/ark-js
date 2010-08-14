(function(window, document){
	//Helper for JSON html5 localStorage 
	var storage = {
		get: function(k){
			return $.parseJSON(localStorage[k]);
		},
		set: function(k, v){
			return localStorage[k] = JSON.stringify(v);
		}
	}

	if(window.top === window) return;
	
	var ArcServer = function(){
		var self = this;
		this.client = undefined;
		this.id = undefined;
		
		window.addEventListener('message', function(e){
			if(self.client === undefined){  //if client window isn't stored store it
				self.client = e.source;
				self.origin = e.origin;
			}
			self.id = e.data.id;
			if(e.data.call === 'initialize') self.checkQueue();  //if yo check localStorage for pending messages
			alert('message: ' + e.data.call);
		},false);   
	}
	
	ArcServer.prototype.checkQueue = function(){
		var allMessages = storage.get('ArcMessages'); 
		this.queuedMessages = allMessages[this.origin];  //only get messages from queue that match the domain of the client
	}
	
	ArcServer.prototype.respond = function(call, id, data){	
		this.client.postMessage(JSON.stringify({call:call, id:id, data:data}))  //respond with call, id and any described data
	}
	
	window.ArcServer = ArcServer;
})(window,document);
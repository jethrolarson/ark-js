(function(window, document){

	if(window.top !== window){return;}

	var ArcClient = function(url){
		var self = this;
		
		this.queue = [];
		this.requests = {};
		
		this.iFrame = document.createElement('iframe');
		this.iFrame.src = url;
		this.iFrame.style.cssText = 'visibility: hidden; left:-999999px; position: absolute;';
		this.frameLoaded = false;

		//hide the iFrame
		//put the iFrame in the document
		document.body.appendChild(this.iFrame);
		window.addEventListener("message", this.receiveMessage, false);
		this.iFrame.onload = function(){  //store the host of the iframe so we aren't posting messages to the wrong site.
			self.frameLoaded = true;
			self.host = this.ownerDocument.location.protocol + "//" + this.ownerDocument.location.host;
				 
			self.sendMessage('discover');
		};
		this.iFrame.unload = function(){
			self.frameLoaded = false;
		};
		return this;
	};

	ArcClient.prototype.sendMessage = function(callName, params, callback){
		if(!this.frameLoaded){
			this.queue.push({ 'callName': callName, 'params' :params, 'callback': callback });
			return;
		}
		if(this.queue.length > 0){ 
			var msgParams = this.queue.pop();
			this.sendMessage(msgParams.callName, msgParams.params, msgParams.callback);
		}

		var id = Math.floor(Math.random()*100000+(new Date().getTime()));
		
		var data = {'callName': callName, 'data': params, callbackId: callName + "-" + id };
		
		this.requests[data.callName] = callback || function(){};
		
		this.iFrame.contentWindow.postMessage(JSON.stringify(data), this.host);
		
	};
	
	ArcClient.prototype.receiveMessage = function(event){
		console.log("Receive: "+event)
		if (event.origin !== this.host) return;
		this.requests[event.data.callName]();	 
		//delete this.requests[event.data.callbackId];
	};
	
	ArcClient.prototype.unsubscribe = function(callName){
		delete this.requests[callName];	
		this.sendMessage('unsubscribe', {'callName':callName } );
	};
	
	ArcClient.prototype.subscribe = function(callName,params,callback){
		delete this.requests[callName];	
		params[callName] = callName;
		this.sendMessage('subscribe', params , callback );
	};
	
	ArcClient.prototype.setStyles = function(obj){
		ArcClient.sendMessage('setStyles', obj);
	};
	
	ArcClient.prototype.getElements = function(obj, callback){
		ArcClient.sendMessage('getElements', obj, callback);
	};
	
	ArcClient.prototype.pageCall = function(name, args, callback){
		ArcClient.sendMessage('pageCall', name, args, callback);
	};
	
	window.ArcClient = ArcClient;
	
})(window, document);
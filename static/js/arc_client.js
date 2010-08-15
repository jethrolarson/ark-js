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
		
		this.iFrame.onload = function(){  //store the host of the iframe so we aren't posting messages to the wrong site.
            self.frameLoaded = true;
			self.host = this.ownerDocument.location.protocol + "//" + this.ownerDocument.location.host;
			window.addEventListener("message", this.receiveMessage, false);	 
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
        
		var data = {'callName': callName,'id': id, 'data': params, callbackId: callName + "-" + id };
        
        this.requests[data.callbackId] = callback || function(){};		
		
		this.iFrame.contentWindow.postMessage(JSON.stringify(data), this.host);
		console.log(data)
	};
	
    ArcClient.prototype.receiveMessage = function(event){
        if (event.origin !== this.host) return;
            
        this.requests[event.data.callbackId]();  
		delete this.requests[event.data.callbackId];
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
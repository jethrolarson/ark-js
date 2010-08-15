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
			//console.log("iframe loaded");
            self.frameLoaded = true;
			self.host = this.ownerDocument.location.protocol + "//" + this.ownerDocument.location.host;
            window.addEventListener("message", this.receiveMessage, false);  
			self.sendMessage('discover');
		};
        this.iFrame.unload = function(){
            console.log("iframe unloaded wtf");
            self.frameLoaded = false;            
        };
		return this;
	};
	
	ArcClient.prototype.sendMessage = function(call, params, callback){
        if(!this.frameLoaded){  //console.log("frame not loaded.. Queing " + call);         
            this.queue.push({ 'call': call, 'params' :params, 'callback': callback });
            return;
        }
        if(this.queue.length > 0){  //console.log("sending queued messages");
            var msgParams = this.queue.pop();
            this.sendMessage(msgParams.call, msgParams.params, msgParams.callback);
        }
        
        //console.log("call:"+call+" host:"+this.host);
        
        var id = Math.floor(Math.random()*100000+(new Date().getTime()));
        
		var data = {'call': call,'id': id, 'data': params, callbackId: call + "-" + id };
        
        this.requests[data.callbackId] = callback || function(){};		
		
		this.iFrame.contentWindow.postMessage(JSON.stringify(data), this.host);
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
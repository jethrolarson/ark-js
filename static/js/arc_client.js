(function(window, document){

	if(window.top !== window){return;}

	var ArcClient = function(url){
		
		var self = this;
		this.queue = new Array();
        this.requests = new Object();
		this.iFrame = document.createElement('iframe');
		this.iFrame.src = url;
        this.frameLoaded = false;

		//hide the iFrame
		this.iFrame.style.visibility = 'hidden';
		this.iFrame.style.left = '-999999px';
		this.iFrame.style.position = 'absolute';

		//put the iFrame in the document
		document.body.appendChild(this.iFrame);

		//send a message to the server on every iFrame load
		this.iFrame.onload = function(){
			//store the host of the iframe so we aren't posting messages to the wrong site.  
            console.log("iframe loaded");
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
	//: sendMessage
	//  @options #optional
	ArcClient.prototype.sendMessage = function(call, callbackF, params){
        if(!this.frameLoaded){            
            console.log("frame not loaded.. Queing " + call);
            this.queue.push( { call:call, callback:callbackF, params:params } );
            return;
        }
        if(this.queue.length > 0){
            console.log("sending queued messages");
            var msgParams = this.queue.pop();
            this.sendMessage(msgParams.call, msgParams.callback, msgParams.params);
        }
        console.log("call:"+call+" host:"+this.host);
        
        var id = Math.floor(Math.random()*100000+(new Date().getTime()));
		
        this.requests[data.callbackId] = callbackF || function(){};		
            
		var data = {'call': call,'id':id, callbackId:call + "-" + id };
        
		if(params) data.params = params;        
		this.iFrame.contentWindow.postMessage(JSON.stringify(data), this.host);
	};
    ArcClient.prototype.receiveMessage = function(event){
        if (event.origin !== this.host) { return; }
            
        this.requests[event.data.callbackId]();  
        
    };
    
	window.ArcClient = ArcClient;
	
})(window, document);
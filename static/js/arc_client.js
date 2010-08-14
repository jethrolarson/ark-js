(function(window, document){

	if(window.top !== window){return;}

	var ArcClient = function(url){
		
		var self = this;
		
		this.iFrame = document.createElement('iframe');
		this.iFrame.src = url;

		//hide the iFrame
		this.iFrame.style.visibility = 'hidden';
		this.iFrame.style.left = '-999999px';
		this.iFrame.style.position = 'absolute';

		//put the iFrame in the document
		document.body.appendChild(this.iFrame);

		//send a message to the server on every iFrame load
		this.iFrame.onload = function(){
            self.host = self.iFrame.contentWindow.location.host;
            console.log(self.host);
			self.sendMessage('initialize');
            //self.onDiscovery();
		};
		//console.log(this.iFrame.contentWindow);
		//store the host of the iframe so we aren't posting messages to the wrong site.
        
		
		
		return this;
	};
	//: sendMessage
	//  @options #optional
	ArcClient.prototype.sendMessage = function(call, callback, params){ 
        
        console.log(this);
        console.log("Calling:"+call+" host:" + this.host);
		if(callback){ 
			var id = Math.floor(Math.random()*100000+(new Date().getTime()));
			window.addEventListener('message', function(e){
				e.data.id === id && callback.call(this,e);
			}, false);
		}
		var data = {'call': call,'id':id};
		if(params) data.params = params;
		this.iFrame.contentWindow.postMessage(JSON.stringify(data), this.host);
	};
	window.ArcClient = ArcClient;
	
})(window, document);
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
			//store the host of the iframe so we aren't posting messages to the wrong site.            
			self.host = this.ownerDocument.location.protocol + "//" + this.ownerDocument.location.host;
			self.sendMessage('discover');
		};
		return this;
	};
	//: sendMessage
	//  @options #optional
	ArcClient.prototype.sendMessage = function(callName, callback, params){
		if(callback){ 
			var id = Math.floor(Math.random()*100000+(new Date().getTime()));
			window.addEventListener('message', function(e){
				e.data.id === id && callback.call(this,e);
			}, false);
		}
		var data = {'callName': callName,'id':id};
		if(params) data.params = params;        
		this.iFrame.contentWindow.postMessage(JSON.stringify(data), this.host);
		console.log(data)
	};
	window.ArcClient = ArcClient;
	
})(window, document);
(function(window, document){
  //Helper for JSON html5 localStorage 
  var storage = {
  	get: function(k){
  		return $.parseJSON(localStorage[k]);
  	},
  	set: function(k, v){
  		return localStorage[k] = JSON.stringify(v);
  	}
  };
  
  if(window.top === window){return;}
  var ArkServer = function(){
    this.client = undefined;
    this.id = undefined;
    var that = this;
    window.addEventListener("message",function(e){
      //if client window isn't stored store it
      if(that.client === undefined){
        that.client = e.source;
        that.origin = e.origin;
      }
      that.id = e.data.id;
      //if yo check localStorage for pending messages
      if(e.data.call ==="yo"){
        that.checkQueue();
      }
      alert("message: "+e.data.call);
    },false);        
  };
  ArkServer.prototype.checkQueue = function(){
    var allMessages = storage.get('ArkMessages'); 
    //only get messages from queue that match the domain of the client
    this.queuedMessages = allMessages[this.origin];
  };
  ArkServer.prototype.respond = function(call, id, data){
    //respond with call, id and any described data
    this.client.postMessage(JSON.stringify({call:call, id:id, data:data}))
  };
  window.ArkServer = ArkServer;
})(window,document);
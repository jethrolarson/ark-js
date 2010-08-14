console.log(window.top == window);
if(window.top == window){

var ArkClient = function(options){
    console.log(options);
    this.iFrame = document.getElementById(options.iFrame);
};
ArkClient.prototype.sendMessage = function(call, options, callback){
  var id = Math.floor(Math.Random()*100000);
  window.addEventHandler("message", callback, false);
  var data = {call:options,'id':id};
  this.iFrame.postMessage(JSON.stringify(data), '*');
};

var client = new ArkClient({iframe:'clientPage1'});

    client.sendMessage('test',{},function(data){
    
        console.log(data);
    
    });

}

if(window.top != window){

    var ArkServer = function(){
        document.getElementGetById("pageName").innerHTML = "Server";
        this.receiveMessage = function (event){
            Console.log("Incoming For Server");            
            Console.log("Message for me");        
        };
        window.addEventListener("message",this.receiveMessage,false);        
    };
}
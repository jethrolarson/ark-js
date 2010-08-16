
arc.js - Instant API
====================

Licence
-------
Pick any of the following WTFPL, MIT, or GPL

Client Example
-----

On the page that wants to use the API

    new ArcClient("index.html").sendMessage('subscribePosts', {}, function(data){
      $("#tweets").append("<li>"+data.message+"</li>");
    });

"Server" Example
----

On the page that wants to provide the API

    new ArcServer({
      'subscribePosts':{
        onMessage: function(e){
          self.sendMessage(e,$('.update:first').html());
        }
      }
    });
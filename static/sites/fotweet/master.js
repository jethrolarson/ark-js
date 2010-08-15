$(function(){
  tweetText = $('#tweetText');
  tweets = $('#tweets');
  feed = $('#feed');

  names = ["bob123", "monktacular", "bobbytables", "ManWithHat"];
  messages = ["I love app engine", "Going to the hockey game.", "I'm drunk", "Oh man me too", "Has anyone seen Inception?", "This isn't my status"];

  $('#newTweet').submit(function(){
    appendTweet('@Me '+tweetText.val());
    tweetText.val('');
    return false;
  });

  function appendTweet(text) {
    tweets.html('<div class="update">'+text+'</div>'+tweets.html());
  }

  function createTweet() {
    appendTweet('@'+names[Math.floor(Math.random()*names.length)]+' '+messages[Math.floor(Math.random()*messages.length)]);
    setTimeout(createTweet, Math.floor(Math.random()*15000));
  }
  setTimeout(createTweet, 500);


	
});

new ArcServer({
	'getPosts':{
		callName: 'getPosts',
		onMessage: function(e){
			var posts = [];
			this.addMessage(e,document.getElementById('content').textContent);
		}
	}
});
$(function(){
	new ArcClient("/static/sites/fotweet/index.html").sendMessage('subscribePosts', {}, function(data){
		$("#tweets").append("<li>"+data.message+"</li>");
	});

	//Fodora
	var fodora = new ArcClient("/static/sites/fodora/index.html");
	$(function(){
		var prevKey = -1;
		var keyTimeout = 600;
		var keyTimer;

		fodora.sendMessage('subscribePlay', {}, addAction);

		$(document).keyup(function (e) {
			if(e.target.tagName !== 'textarea' && e.target.tagName !== 'input') {
				if(e.which === 70 || e.which === 80 || e.which === 82) {
					if(e.which === prevKey) {
						var message = 'playpause';
						switch(e.which) {
							case 70: //FF
								message = 'fastforward';
								break;
							case 82: //RR
								message = 'rewind';
								break;
						}
						fodora.sendMessage(message, {}, addAction);
					} else {
						prevKey = e.which;
						setTimeout(clearKey, keyTimeout);
					}
				}
			}
		});

		function addAction(data) {
			if(data.message !== 'Fastforwarding' && data.message !== 'Rewinding'){
				$.gritter.add({
					// (string | mandatory) the heading of the notification
					title: "Fodora",
					// (string | mandatory) the text inside the notification
					text: data.message
				});
			}
		}
		function clearKey() {
			prevKey = -1;
		}
	});
});
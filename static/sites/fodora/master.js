$(function(){
	var tracks = $('audio');
	var trackIndex = 0;
	var len = tracks.length;

	var ffButton = $('#fastforward');
	var rwButton = $('#rewind');
	var pButton = $('#play');

	$('#rewind, #fastforward').click(function(){
		if(!tracks[trackIndex].paused) tracks[trackIndex].pause();
		tracks[trackIndex].currentTime = 0;
		if(this.id === 'rewind')
			if(trackIndex === 0) trackIndex = len-1;
			else trackIndex--;
		else
			if(trackIndex === len-1) trackIndex = 0;
			else trackIndex++;
		tracks[trackIndex].currentTime = 0;
		tracks[trackIndex].play();
		pButton.val('Pause');
	});

	pButton.click(function(){
		if(tracks[trackIndex].paused) {
			tracks[trackIndex].play();
			pButton.val('Pause');
		} else {
			tracks[trackIndex].pause();
			pButton.val('Play');
		}
	});

	$('body').bind('ended', function(){
		tracks[trackIndex].currentTime = 0;
		tracks[trackIndex].pause();
		trackIndex++;
		if(trackIndex === len) trackIndex = 0;
		tracks[trackIndex].play();
	});

	new ArcServer({
		'fastforward': {
			callName: 'fastforward',
			onMessage: function(e) {
				self = this;
				ffButton.click();
				self.sendMessage(e, 'Fastforwarding');
			}
		},
		'rewind':{
			callName: 'rewind',
			onMessage: function(e) {
				self = this;
				rwButton.click();
				self.sendMessage(e, 'Rewinding');
			}
		},
		'playpause':{
			callName:'playpause',
			onMessage: function(e) {
				self = this;
				pButton.click();
				var trackName = $('#playlist li')[trackIndex].textContent;
				self.sendMessage(e, (pButton.val() == 'Play' ? 'Paused: '+trackName : ''));
			}
		},
		'subscribePlay':{
			onMessage: function(e) {
				self = this;
				$(function(){
					$('body').bind('play', function(){
						console.log('Got a play event')
						console.log('Sending '+$('#playlist li')[trackIndex].textContent)
						self.sendMessage(e, 'Playing: '+$('#playlist li')[trackIndex].textContent);
					});
				});
			}
		},
		'unsubscribPlay':{
			onMessage: function(e){
				self = this;
				$(function(){
					$('body').unbind('play');
				});
			}
		}
	});
});
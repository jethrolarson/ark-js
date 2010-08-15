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
				console.log('Server: '+$('#playlist li')[trackIndex].textContent)
				self.sendMessage(e, $('#playlist li')[trackIndex].textContent);
			}
		},
		'rewind':{
			callName: 'rewind',
			onMessage: function(e) {
				self = this;
				rwButton.click();
				console.log('Server: '+$('#playlist li')[trackIndex].textContent)
				self.sendMessage(e, $('#playlist li')[trackIndex].textContent);
			}
		},
		'playpause':{
			callName:'playpause',
			onMessage: function(e) {
				self = this;
				pButton.click();
				console.log('recieved play')
				console.log('Track: '+trackIndex)
				console.log('Server: '+$('#playlist li')[trackIndex].textContent)
				var trackName = $('#playlist li')[trackIndex].textContent;
				self.sendMessage(e, (pButton.val() == 'Play' ? 'Paused' : 'Playing') + ' ' + trackName);
			}
		}
	});
});
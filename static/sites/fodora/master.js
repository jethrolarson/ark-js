$(function(){
	var tracks = $('audio');
	var i = 0;
	var len = tracks.length;


	$('#rewind, #fastforward').click(function(){
		if(!tracks[i].paused) tracks[i].pause();
		tracks[i].currentTime = 0;
		if(this.id === 'rewind')
			if(i === 0) i = len-1;
			else i--;
		else
			if(i === len-1) i = 0;
			else i++;
		tracks[i].currentTime = 0;
		tracks[i].play();
	});

	$('#play').click(function(){
		if(tracks[i].paused) tracks[i].play();
		else tracks[i].pause();
	});

	$('body').bind('ended', function(){
		tracks[i].currentTime = 0;
		tracks[i].pause();
		i++;
		if(i === len) i = 0;
		tracks[i].play();
	});
});
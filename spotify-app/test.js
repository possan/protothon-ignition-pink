exports.init = function(){

	var sp = getSpotifyApi(1);
	console.log('sp',sp);

	var m = sp.require('sp://import/scripts/api/models');
	console.log('m',m);

	var v = sp.require('sp://import/scripts/api/views');
	console.log('v',v);

	var app = m.application;
	console.log('app',app);
	
	var badtime = 15;
	var challengetime = 50;
		
	/*
	app.observe(m.EVENT.LINKSCHANGED, function handleLinks() {
		var links = m.application.links;
		console.log(links);
	*/	
	/* if(links.length) {
		switch(links[0].split(":")[1]) {
		case "user":
			// socialInput(links[0].split(":")[2]);
			break;
		default:
			// Play the given item
			player.play(models.Track.fromURI(links[0]));
			break;
		}		}
	*/
	// });
	
	console.log('query...');
	$.ajax( {
		url: 'http://something.possan.se:1337/latestscore',
		success: function(re) {
			console.log( re );
			// asyncComplete("artistRemoteMetadata");
			// results.artist["Get Remote Metadata for an Artist"] = response;
		}
	} );

	var STATES = {
		INIT: 'init',
		START_GAME: 'start',
		STOP_GAME: 'stop',
		GOOD_LOOP: 'goodloop',
		CHALLENGE: 'chall',
		BAD_LOOP: 'badloop',
		NEW_BAD_LOOP: 'newbad'
	};

	var Game = function( opts ) {
		
		var options = {
			good: opts.good || '',
			bad: opts.bad || '',
			display: opts.display || undefined
		};
		
		var badsong = null;
		var goodsong = null;
		var goodalt1 = null;
		var goodalt2 = null;
		var vote = 0;
		var goodplaylist = null;
		var badplaylist = null;

		m.Playlist.fromURI( options.good, function(pl) {
			console.log('got good playlist',pl);
			goodplaylist = pl;
		} );
		
		m.Playlist.fromURI( options.bad, function(pl) {
			console.log('got bad playlist',pl);
			badplaylist = pl;
		} );
	
		var _state = STATES.INIT;
		
		var _randomSong = function(pl) {
			var t = pl.tracks.length;
			var n = Math.floor( Math.random() * t );
			return pl.tracks[ n ];
		};
		
		var _startAlt = function(alt) {
			console.log('start alt',alt);
			m.player.playTrack(alt);
			_front( { 
				type: 'start', 
				track: alt.name, 
				artist: alt.artists[0].name
			} );
			_state = STATES.GOOD_LOOP;
			vote = 0;
		}
		
		var _changeState = function( newstate ) {
			if( newstate == _state )
				return;

			if( newstate == STATES.START_GAME ) {			
				// börja med att spela random bra låt
				var trk = _randomSong( goodplaylist );
				console.log( 'starting initial track', trk );
				m.player.playTrack(trk);
				_front( { 
					type: 'set-playing', 
					track: trk.name, 
					artist: trk.artists[0].name
				} );
				_front( { 
					type: 'start'
				} );
				_state = STATES.GOOD_LOOP;
				vote = 0;
			}
			else if( newstate == STATES.GOOD_LOOP ) {
			}
			else if( newstate == STATES.STOP_GAME ) {
				// stoppa allt
				_state = STATES.STOP_GAME;
			}
			else if( newstate == STATES.NEW_BAD_LOOP ) {
				// start play random bad song
				setTimeout( function() {
					badsong = _randomSong(badplaylist);
					m.player.playTrack( badsong );
					_front( { 
						type: 'set-playing', 
						track: badsong.name,
						artist: badsong.artists[0].name
					} );
					goodalt1 = _randomSong( goodplaylist );
					goodalt2 = _randomSong( goodplaylist );
					_front( {
						type: 'set-options',
						track1: goodalt1.name,
						artist1: goodalt1.artists[0].name,
						track2: goodalt2.name,
						artist2: goodalt2.artists[0].name
					} );
					_front( { 
						type: 'bad'
					} );
					_state = STATES.BAD_LOOP;
				}, 100 );
			}
			else if( newstate == STATES.BAD_LOOP ) {
				// playing random bad song
			}
 			else if( newstate == STATES.CHALLENGE ) {
				/*
				var trk = _randomSong(goodplaylist);
				var trk2 = _randomSong(goodplaylist);
				console.log('challenge tracks trk='+trk+', trk2='+trk2);
				// play random bad song
				*/
				vote = 0;
				_state = STATES.CHALLENGE;
			}
			else if( newstate == STATES.CHALLENGE_END ) {
				// play random bad song
				_state = STATES.CHALLENGE_END;
			}
		}
		
		var timer = null;
		
		var _front = function( meta ) {
			console.log( 'DISPLAY:', JSON.stringify(meta) );
			if( options.display )
				options.display( meta );
			$.ajax( {
				url: 'http://something.possan.se:1337/postdisplay?event='+escape(JSON.stringify(meta)),
				success: function( re ) {
				}
			});
		};
		
		var _start = function() {
			console.log( 'start game' );
			_changeState( STATES.START_GAME );
			timer = setInterval( function() {
				if( _state == STATES.GOOD_LOOP ) {				
				} 
				else if( _state == STATES.BAD_LOOP ) {
				}
			},1000 );
		};

		var _stop = function() {
			console.log( 'stop game' );	
			_changeState( STATES.STOP_GAME );
			clearInterval(timer);
		};
		
		var _skip = function() {
			console.log( 'pos=', m.player.position );
			console.log( 'dur=', m.player.track.duration );
			m.player.position = m.player.track.duration-10000;
		};
		
		var _reportResult = function(v) {
			console.log( 'report result v='+v );
			vote = v;
		};

		var _reportTime = function( t, te ) {
			console.log( 'report time t='+t+' of te='+te+', state='+_state+', vote='+vote );
			if( _state == STATES.GOOD_LOOP ) {
				// om 30sek innan slutet, gå till challenge-mode
				if( t > te - challengetime ) {
					console.log('30 sek av låten kvar...');
					// välj två låtar och gå till challenge
					badsong = null;
					goodalt1 = _randomSong( goodplaylist );
					goodalt2 = _randomSong( goodplaylist );
					_front( {
						type: 'set-options',
						track1: goodalt1.name,
						artist1: goodalt1.artists[0].name,
						track2: goodalt2.name,
						artist2: goodalt2.artists[0].name
					} );
					_front( {
						type: 'challenge',
					} );
					_changeState( STATES.CHALLENGE );
				}
			}
			else if( _state == STATES.BAD_LOOP ) {
				console.log('30 sek av bieber-låten kvar...');
				// spela som mest 30 sek av en dålig låt
				if( t > badtime || t >= te ) {
					_trackEnded();
				}
			}
		};
		
		var _trackEnded = function() {
			console.log('spåret slut, vote='+vote);
			if( _state == STATES.CHALLENGE || 
				_state == STATES.BAD_LOOP ) {
				setTimeout( function() {
					console.log('vote='+vote)
					if( vote == 0 )
						_changeState(STATES.NEW_BAD_LOOP);
					else if( vote == 1 )
						_startAlt(goodalt1);
					else if( vote == 2 )
						_startAlt(goodalt2);				
				},100 );
			}
		}
		
		_front( { type: 'hello' } );
		
		return {
			start: _start,
			stop: _stop,
			skip: _skip,
			reportResult: _reportResult,
			reportTime: _reportTime,
			trackEnded: _trackEnded
		};
		
	};
	
	console.log($('#goodplaylist').val());
	console.log($('#badplaylist').val());
	var game = new Game({
		good: $('#goodplaylist').val(),
		bad: $('#badplaylist').val()
	});
	
	$('#startbutton').click(function(){ game.start(); });
	$('#stopbutton').click(function(){ game.stop(); });
	$('#skipbutton').click(function(){ game.skip(); });
	$('#vote1').click(function(){ game.reportResult(1); });
	$('#vote2').click(function(){ game.reportResult(2); });
	$('#votenone').click(function(){ game.reportResult(0); });
	$('#reporttime').click(function() { 
		var t0 = parseFloat($('#time').val());
		var te = parseFloat($('#time2').val());
		game.reportTime( t0, te );
	});
	
	setInterval( function() {
		if( m.player.track ) {
			var t0 = m.player.position/1000;
			var t1 = m.player.track.duration/1000;
			$('#time').val( t0.toString() );
			$('#time2').val( t1.toString() );
			game.reportTime( t0, t1 );
		}
	}, 1000 );
	
	setInterval( function() {
		$.ajax( {
			url: 'http://something.possan.se:1337/getscoreandevent',
			success: function( re ) {
				re = JSON.parse( re );
				console.log( 'got score+event: '+ JSON.stringify( re ) );
				if( re.a > re.b && re.a > 0 )
					game.reportResult(1);
				else if( re.b > re.a && re.b > 0 )
					game.reportResult(2);
				else 
					game.reportResult(0);
				if( re.event ) {
					if( re.event.type == 'skip' ){
						game.skip();
					}
				}
			}
		} );
	}, 500 );
	
	m.player.observe(m.EVENT.CHANGE, function (event) {
		if (event.data.curtrack != true)
		 	return;
		console.log(event.data, m.player);
		if( m.player.track ){
			console.log(m.player.track.uri, badsong.uri)
			if( m.player.track.uri == badsong.uri ) {
				return;
			}
		}
		game.trackEnded();
	});
/*	
	var l = m.library;
	// console.log(l.albums);

	var root = document.getElementById('root');
	for(var k=0; k<Math.min(50, l.albums.length); k++){
		var a = l.albums[k];
		console.log(a);
		var d = document.createElement('div');
		d.innerHTML = a.name;
		console.log(a.image, a.uri, a.name);
		root.appendChild(d);

		var img = new v.Image(a.image, a.uri, a.name);
		console.log(img);
		d = document.createElement('div');
		d.style.width = '100px';
		d.style.height = '100px';
		d.appendChild(img.node);
		root.appendChild(d);
	}
*/
};




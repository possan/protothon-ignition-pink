var http = require( 'http' );
var url = require('url');

console.log(url);

var score1 = .0;
var score2 = .0;
var displayqueue = [];
var spotqueue = [];

http.createServer( function (req, res) {
	
	// console.log(req);
	
	var u = new url.parse( req.url, true );
	console.log( u );
	
	if( u.pathname == "/reportscore" ) {
		score1 = parseFloat( u.query.a );
		score2 = parseFloat( u.query.b );
		console.log('got score update: '+score1+', '+score2);
		res.writeHead( 200, { 'Content-Type': 'text/plain' } );
		res.end( 'ok\n' );
	}
	else if( u.pathname == "/getscore" ){
		
		// console.log('got score update: '+score1+', '+score2);
		res.writeHead( 200, { 'Content-Type': 'text/plain' } );
		res.end( '{ \"a\":'+score1+', \"b\":'+score2+' }' );
		
	} else if( u.pathname == "/getscoreandevent" ){
		
		var evt = undefined;
		if( spotqueue.length > 0 ){
			evt = spotqueue[0];
			spotqueue.splice(0,1);
		}
		
		
		// console.log('got score update: '+score1+', '+score2);
		res.writeHead( 200, { 'Content-Type': 'text/plain' } );
		var ret = { a: score1, b: score2 };
		if( evt )
			ret.event = evt;
		res.end( JSON.stringify(ret));
	
	} else if( u.pathname == "/postdisplay" ){
		
		displayqueue.push( JSON.parse( u.query.event ) );
		
		res.writeHead( 200, { 'Content-Type': 'text/plain' } );
		res.end( 'ok\n' );
	
	} else if( u.pathname == "/polldisplay" ){
		
		var evt = undefined;
		if( displayqueue.length > 0 ){
			evt = displayqueue[0];
			displayqueue.splice(0,1);
		}
			
		res.writeHead( 200, { 'Content-Type': 'text/plain' } );
		var ret = { };
		if( evt )
			ret.event = evt;
		res.end( JSON.stringify(ret));
		
	} else if( u.pathname == "/postspotify" ){
		
		if( u.query.event )
		{
			try{
					spotqueue.push( JSON.parse( u.query.event ) );
			}catch(e){}
		}
		res.writeHead( 200, { 'Content-Type': 'text/plain' } );
		res.end( 'ok\n' );
	
	} else if( u.pathname == "/pollspotify" ){
			
		var evt = undefined;
		if( spotqueue.length > 0 ){
			evt = spotqueue[0];
			spotqueue.splice(0,1);
		}

		res.writeHead( 200, { 'Content-Type': 'text/plain' } );
		var ret = { };
		if( evt )
			ret.event = evt;
		res.end( JSON.stringify(ret));
	
	} else {
	
		res.writeHead( 200, { 'Content-Type': 'text/plain' } );
		res.end( 'Hello World\n' );
		
	}
	
} ).listen( 1337, "127.0.0.1" );

console.log( 'Server running at http://127.0.0.1:1337/' );

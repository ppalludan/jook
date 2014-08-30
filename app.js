var http = require('http');
var port = 8080;

var server = http.createServer(function(req, res) {
	if (req.method == 'POST') {

                  console.log('post');
		var payLoad = '';

		req.on('data', function(chunk) {
 console.log('data');
			payLoad += chunk;
		});

		req.on('end', function() {
console.log('end');
			payLoad = JSON.parse(payLoad);

			res.writeHead(200, {'Content-Type':'application/json'});

			res.write((JSON.stringify(payLoad.repository)));
			res.end();			
		});

	} else {
		res.writeHead(200, {'Content-Type':'application/json'});
                res.write('yes hello?');
		res.end();
	}
});

server.listen(8080);

console.log('Server running at http://localhost:' + port);



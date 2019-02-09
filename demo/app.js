var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var os = require('os');
var pty = require('node-pty');

var terminals = {},
    logs = {};

var fileCmdUrl = process.env.XTERM_FILECMD_URL || '/#/p/sysmgr/filesystem/browser';

app.use('/build', express.static(__dirname + '/../build'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/style.css');
});

app.get('/dist/bundle.js', function(req, res){
  res.sendFile(__dirname + '/dist/bundle.js');
});

app.get('/dist/bundle.js.map', function(req, res){
  res.sendFile(__dirname + '/dist/bundle.js.map');
});

app.get('/filecmd', function(req, res) {
    res.redirect(fileCmdUrl);
});

app.post('/terminals', function (req, res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var cols = parseInt(req.query.cols),
      rows = parseInt(req.query.rows),
      entrypoint = process.env.XTERM_ENTRYPOINT || (process.platform === 'win32' ? 'cmd.exe' : 'bash'),
      term = pty.spawn(entrypoint, [], {
        name: 'vt525',
        cols: cols || 80,
        rows: rows || 24,
        cwd: process.env.PWD,
        env: Object.assign (process.env, {
          XTERM_REMOTE_CLIENT: ip
        })
      });

  console.log('Created terminal with PID: ' + term.pid);
  terminals[term.pid] = term;
  logs[term.pid] = '';
  term.on('data', function(data) {
    logs[term.pid] += data;
  });
  res.send(term.pid.toString());
  res.end();
});

app.post('/terminals/:pid/size', function (req, res) {
  var pid = parseInt(req.params.pid),
      cols = parseInt(req.query.cols),
      rows = parseInt(req.query.rows),
      term = terminals[pid];

  term.resize(cols, rows);
  console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
  res.end();
});

app.ws('/terminals/:pid', function (ws, req) {
  var term = terminals[parseInt(req.params.pid)];
  console.log('Connected to terminal ' + term.pid);
  ws.send(JSON.stringify ({body: logs[term.pid]}));

  term.on('data', function(data) {
    try {
      ws.send(JSON.stringify ({body: data}));
    } catch (ex) {
      // The WebSocket is not open, ignore
        console.log ({error: 'send issues', e: ex});
    }
  });
  ws.on('message', function(rawMsg) {
    var msg;
    try { msg = JSON.parse (rawMsg); }
    catch (e) { console.log ({error: 'unable to parse raw message', rawMsg: rawMsg, e: e}); }
    if (msg.frameType === "echoRequest")
      ws.send (JSON.stringify ({frameType: "echoResponse"}));
    else
      term.write (msg.body);
  });
  ws.on('close', function () {
    term.kill();
    console.log('Closed terminal ' + term.pid);
    // Clean things up
    delete terminals[term.pid];
    delete logs[term.pid];
  });
});

var port = process.env.PORT || 3000,
    host = os.platform() === 'win32' ? '127.0.0.1' : '0.0.0.0';

console.log('App listening to http://' + host + ':' + port);
console.log('File Browser URL: ' + fileCmdUrl);
app.listen(port, host);

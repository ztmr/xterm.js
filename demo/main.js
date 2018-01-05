import * as Terminal from '../build/xterm';
import * as attach from '../build/addons/attach/attach';
import * as fit from '../build/addons/fit/fit';
import * as fullscreen from '../build/addons/fullscreen/fullscreen';
import * as search from '../build/addons/search/search';
import * as zmodem from '../build/addons/zmodem/zmodem';
import * as winptyCompat from '../build/addons/winptyCompat/winptyCompat';

Terminal.applyAddon(attach);
Terminal.applyAddon(fit);
Terminal.applyAddon(fullscreen);
Terminal.applyAddon(search);
Terminal.applyAddon(zmodem, window.Zmodem);
Terminal.applyAddon(winptyCompat);


var term,
    protocol,
    socketURL,
    socket,
    pid;

var terminalContainer = document.getElementById('terminal-container');

createTerminal();

function setTerminalSize(cols, rows) {
  var viewportElement = document.querySelector('.xterm-viewport');
  var scrollBarWidth = viewportElement.offsetWidth - viewportElement.clientWidth;
  var width = (cols * term.renderer.dimensions.actualCellWidth + 20 /*room for scrollbar*/).toString() + 'px';
  var height = (rows * term.renderer.dimensions.actualCellHeight).toString() + 'px';
  terminalContainer.style.width = width;
  terminalContainer.style.height = height;
  term.resize(cols, rows);
}

function prepareTheme () {
  var StyleFlags = {
    BOLD      : 1,
    UNDERLINE : 2,
    BLINK     : 4,
    INVERSE   : 8,
    INVISIBLE : 16,
    DIM       : 32
  };

  var StyleColours = {
    WHITE : 15,
    RED   :  9,
    BLUE  : 12
  };

  var themeStyles = {};
  themeStyles[StyleFlags.BOLD]    = { background: StyleColours.WHITE, foreground: StyleColours.RED   };
  themeStyles[StyleFlags.INVERSE] = { background: StyleColours.BLUE,  foreground: StyleColours.WHITE };

  var theme = {
    foreground: '#000000',
    background: '#ffffff',
    cursor: '#000000',
    cursorAccent: '#ffffff',
    selection: 'rgba(193, 226, 234, 0.3)',
    styles: themeStyles,
    black: '#2e3436',
    red: '#cc0000',
    green: '#4e9a06',
    yellow: '#c4a000',
    blue: '#3465a4',
    magenta: '#75507b',
    cyan: '#06989a',
    white: '#d3d7cf',
    brightBlack: '#555753',
    brightRed: '#ef2929',
    brightGreen: '#8ae234',
    brightYellow:'#fce94f',
    brightBlue: '#729fcf',
    brightMagenta: '#ad7fa8',
    brightCyan: '#34e2e2',
    brightWhite: '#eeeeec'
  };
  return theme;
}

function createTerminal() {
  // Clean terminal
  while (terminalContainer.children.length) {
    terminalContainer.removeChild(terminalContainer.children[0]);
  }
  term = new Terminal({
    debug: true,
    cursorBlink: true,
    cols: 80,
    rows: 24,
    scrollback: 2048,
    tabStopWidth: 10,
    fontSize: 18,
    fontSizeAbove100Col: 14,
    fontSizeBelow100Col: 18,
    bellStyle: 'visual', //'both',
    termName: 'IDEAWEBTERM', // This is used by IDEA-System to identify features
    theme: prepareTheme (),
    keyMap: {
      // NOTE: the order of modifiers has to be: Shift, Alt, Ctrl, Meta
      'Home'        : '\x1b[1~',   // Find
      'End'         : '\x1b[4~',   // Select
      'Esc'         : '\x1b[20~',
      'Insert'      : '\x1b[2~',
      'F1'          : '\x1b[28~',  // Help
      'F11'         : '\x1bOP',    // PF1
      'F12'         : '\x1b[4~',   // Select
      'C-F3'        : '\x1b[25~',  // F13
      'C-F4'        : '\x1b[26~',  // F14
      'C-F5'        : '\x1b[28~',  // F15
      'C-F6'        : '\x1b[29~',  // F16
      'C-F7'        : '\x1b[31~',  // F17
      'C-F8'        : '\x1b[32~',  // F18
      'C-F9'        : '\x1b[33~',  // F19
      'C-F10'       : '\x1b[34~',  // F20
      'KP_Divide'   : '\x1bOP',
      'KP_Multiply' : '\x1b[29~',
      'KP_Enter'    : '\x1bOM',
      'KP_Subtract' : '\x1bOm',
      'KP_Add'      : '\x1bOl',
      'KP_Decimal'  : '\x1bOn'
      /*
      KP_0          : '\x1bOp',
      KP_1          : '\x1bOq',
      KP_2          : '\x1bOr',
      KP_3          : '\x1bOs',
      KP_4          : '\x1bOt',
      KP_5          : '\x1bOu'
      */
    }
  });
  window.term = term;  // Expose `term` to window for debugging purposes
  term.on('resize', function (size) {
    if (!pid) {
      return;
    }
    var cols = size.cols,
        rows = size.rows,
        url = 'terminals/' + pid + '/size?cols=' + cols + '&rows=' + rows;

    fetch(url, {method: 'POST'});
  });
  protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
  var pathPrefix = location.pathname === '/' ? '' : location.pathname;
  socketURL = protocol + location.hostname + ((location.port) ? (':' + location.port) : '') + pathPrefix + '/terminals/';

  term.open(terminalContainer);
  term.winptyCompatInit();
  term.fit();
  term.focus();
  //term.on('resize', () => term.fit()); // try to re-fit to DOM element everytime we resize

  // fit is called within a setTimeout, cols and rows need this.
  setTimeout(function () {
    // Set terminal size again to set the specific dimensions on the demo
    setTerminalSize(term.cols, term.rows);

    fetch('terminals?cols=' + term.cols + '&rows=' + term.rows, {method: 'POST'}).then(function (res) {

      res.text().then(function (processId) {
        pid = processId;
        socketURL += processId;
        console.log('Socket URL: ' + socketURL);
        socket = new WebSocket(socketURL);
        socket.onopen = runRealTerminal;
        socket.onclose = runFallbackTerminal;
        socket.onerror = runFallbackTerminal;

        term.zmodemAttach(socket, {
            noTerminalWriteOutsideSession: true
        } );

        term.on("zmodemRetract", () => {
          console.log ('zModemRetract');
          start_form.style.display = "none";
          start_form.onsubmit = null;
        });

        term.on("zmodemDetect", (detection) => {
          console.log ('zModemDetect');
          function do_zmodem() {
            console.log ('do_zmodem');
            term.detach();
            let zsession = detection.confirm();

            var promise;

            if (zsession.type === "receive") {
              console.log ('do_zmodem:receive');
              promise = _handle_receive_session(zsession);
            }
            else {
              console.log ('do_zmodem:send');
              promise = _handle_send_session(zsession);
            }

            promise.catch( console.error.bind(console) ).then( () => {
              console.log ('do_zmodem:error');
              term.attach(socket);
            } );
          }

          if (_auto_zmodem()) {
            do_zmodem();
          }
          else {
            start_form.style.display = "";
            start_form.onsubmit = function(e) {
              start_form.style.display = "none";

              if (document.getElementById("zmstart_yes").checked) {
                do_zmodem();
              }
              else {
                detection.deny();
              }
            };
          }
        });
      });
    });
  }, 0);
}

function runRealTerminal() {
  term.attach(socket);
  term._initialized = true;
}

function runFallbackTerminal() {
  if (term._initialized) {
    return;
  }
  term._initialized = true;
  term.writeln('Connection refused.');
}

//----------------------------------------------------------------------
// UI STUFF

function _show_file_info(xfer) {
    var file_info = xfer.get_details();

    document.getElementById("name").textContent = file_info.name;
    document.getElementById("size").textContent = file_info.size;
    document.getElementById("mtime").textContent = file_info.mtime;
    document.getElementById("files_remaining").textContent = file_info.files_remaining;
    document.getElementById("bytes_remaining").textContent = file_info.bytes_remaining;

    document.getElementById("mode").textContent = "0" + file_info.mode.toString(8);

    var xfer_opts = xfer.get_options();
    ["conversion", "management", "transport", "sparse"].forEach( (lbl) => {
        document.getElementById(`zfile_${lbl}`).textContent = xfer_opts[lbl];
    } );

    document.getElementById("zm_file").style.display = "";
}
function _hide_file_info() {
    document.getElementById("zm_file").style.display = "none";
}

function _save_to_disk(xfer, buffer) {
    return Zmodem.Browser.save_to_disk(buffer, xfer.get_details().name);
}

var skipper_button = document.getElementById("zm_progress_skipper");
var skipper_button_orig_text = skipper_button.textContent;

function _show_progress() {
    skipper_button.disabled = false;
    skipper_button.textContent = skipper_button_orig_text;

    document.getElementById("bytes_received").textContent = 0;
    document.getElementById("percent_received").textContent = 0;

    document.getElementById("zm_progress").style.display = "";
}

function _update_progress(xfer) {
    var total_in = xfer.get_offset();

    document.getElementById("bytes_received").textContent = total_in;

    var percent_received = 100 * total_in / xfer.get_details().size;
    document.getElementById("percent_received").textContent = percent_received.toFixed(2);
}

function _hide_progress() {
    document.getElementById("zm_progress").style.display = "none";
}

var start_form = document.getElementById("zm_start");

function _auto_zmodem() {
  var auto = document.getElementById("zmodem-auto");
  return auto? auto.checked : true;
}

// END UI STUFF
//----------------------------------------------------------------------

function _handle_receive_session(zsession) {
    zsession.on("offer", function(xfer) {
        current_receive_xfer = xfer;

        _show_file_info(xfer);

        var offer_form = document.getElementById("zm_offer");

        function on_form_submit() {
            offer_form.style.display = "none";

            //START
            //if (offer_form.zmaccept.value) {
            if (_auto_zmodem() || document.getElementById("zmaccept_yes").checked) {
                _show_progress();

                var FILE_BUFFER = [];
                xfer.on("input", (payload) => {
                    _update_progress(xfer);
                    FILE_BUFFER.push( new Uint8Array(payload) );
                });
                xfer.accept().then(
                    () => {
                        _save_to_disk(xfer, FILE_BUFFER);
                    },
                    console.error.bind(console)
                );
            }
            else {
                xfer.skip();
            }
            //END
        }

        if (_auto_zmodem()) {
            on_form_submit();
        }
        else {
            offer_form.onsubmit = on_form_submit;
            offer_form.style.display = "";
        }
    } );

    var promise = new Promise( (res) => {
        zsession.on("session_end", () => {
            _hide_file_info();
            _hide_progress();
            res();
        } );
    } );

    zsession.start();

    return promise;
}

function _handle_send_session(zsession) {
    var choose_form = document.getElementById("zm_choose");
    choose_form.style.display = "";

    var file_el = document.getElementById("zm_files");

    var promise = new Promise( (res) => {
        file_el.onchange = function(e) {
            choose_form.style.display = "none";

            var files_obj = file_el.files;

            window.Zmodem.Browser.send_files(
                zsession,
                files_obj,
                {
                    on_offer_response(obj, xfer) {
                        if (xfer) _show_progress();
                        //console.log("offer", xfer ? "accepted" : "skipped");
                    },
                    on_progress(obj, xfer) {
                        _update_progress(xfer);
                    },
                    on_file_complete(obj) {
                        //console.log("COMPLETE", obj);
                        _hide_progress();
                    },
                }
            ).then(_hide_progress).then(
                zsession.close.bind(zsession),
                console.error.bind(console)
            ).then( () => {
                _hide_file_info();
                _hide_progress();
                res();
            } );
        };
    } );

    return promise;
}

//This is here to allow canceling of an in-progress ZMODEM transfer.
var current_receive_xfer;

//Called from HTML directly.
function skip_current_file() {
    current_receive_xfer.skip();

    skipper_button.disabled = true;
    skipper_button.textContent = "Waiting for server to acknowledge skip...";
}

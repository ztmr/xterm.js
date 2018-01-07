import * as Terminal from '../build/xterm';
import * as attach from '../build/addons/attach/attach';
import * as fit from '../build/addons/fit/fit';
import * as fullscreen from '../build/addons/fullscreen/fullscreen';
import * as search from '../build/addons/search/search';
import * as winptyCompat from '../build/addons/winptyCompat/winptyCompat';

Terminal.applyAddon(attach);
Terminal.applyAddon(fit);
Terminal.applyAddon(fullscreen);
Terminal.applyAddon(search);
Terminal.applyAddon(winptyCompat);


var term,
    protocol,
    socketURL,
    socket,
    pid;

var terminalContainer  = document.getElementById('terminal-container');
var terminalStatusLine = document.getElementById('terminal-status-line');

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
  if (terminalStatusLine) term.on('status', status => terminalStatusLine.innerText = status);

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

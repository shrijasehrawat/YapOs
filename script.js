   window.enterDesktop = function() {
    document.getElementById('welcomeModal').classList.add('hide');
    setTimeout(function(){
      document.getElementById('welcomeModal').style.display = 'none';
      document.querySelector('.desktop').classList.add('visible');
    }, 600);
   };

// — BOOT SCREEN —
(function() {
  var steps = [
    { pct: 15,  msg: 'Loading kernel...'         },
    { pct: 30,  msg: 'Starting services...'       },
    { pct: 50,  msg: 'Loading apps...'            },
    { pct: 65,  msg: 'Applying your theme...'     },
    { pct: 80,  msg: 'Almost there...'            },
    { pct: 95,  msg: 'Welcome back, Cutie 💜💜'   },
    { pct: 100, msg: 'Done!'                      },
  ];

  var i = 0;
  var bar    = document.getElementById('bootBar');
  var status = document.getElementById('bootStatus');
  var screen = document.getElementById('bootScreen');

  // Lock page scroll during boot
  document.body.style.overflow = 'hidden';

  function nextStep() {
    if (i >= steps.length) {
      // All done — fade out boot screen
      setTimeout(function() {
        screen.classList.add('fade-out');
        setTimeout(function() {
          screen.style.display = 'none';
          document.body.style.overflow = '';
        }, 800);
      }, 300);
      return;
    }
    var step = steps[i++];
    bar.style.width    = step.pct + '%';
    status.textContent = step.msg;
    // Space steps across ~2.5 seconds total
    setTimeout(nextStep, i === 1 ? 200 : 320);
  }

  // Small delay so page assets load first
  setTimeout(nextStep, 300);
})();


// ── CLOCK ──
function updateClock() {
  var now = new Date();
  var h = String(now.getHours()).padStart(2, '0');
  var m = String(now.getMinutes()).padStart(2, '0');
  var s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = h + ':' + m + ':' + s;
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('date').textContent = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
}
updateClock();
setInterval(updateClock, 1000);

// ── CARD DRAG ──
dragElement(document.getElementById('card'), document.getElementById('titlebar'));

// ── APPS ──
function openApp(id) {
  document.getElementById(id).style.display = 'block';
}
function closeApp(id) {
  document.getElementById(id).style.display = 'none';
}

// ── CALCULATOR ──
var calcValue = '';
function calcInput(val) {
  if (calcValue === '0') calcValue = '';
  calcValue += val;
  document.getElementById('calcDisplay').textContent = calcValue;
}
function calcClear() {
  calcValue = '';
  document.getElementById('calcDisplay').textContent = '0';
}
function calcDelete() {
  calcValue = calcValue.slice(0, -1);
  document.getElementById('calcDisplay').textContent = calcValue || '0';
}
function calcEquals() {
  try {
    calcValue = String(eval(calcValue));
    document.getElementById('calcDisplay').textContent = calcValue;
  } catch(e) {
    document.getElementById('calcDisplay').textContent = 'Error';
    calcValue = '';
  }
}

// ── DRAG FUNCTION ──
function dragElement(elmnt, handle) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (handle) handle.onmousedown = dragMouseDown;
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
    elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Make openApp and closeApp global
window.openApp = openApp;
window.closeApp = closeApp;
window.calcInput = calcInput;
window.calcClear = calcClear;
window.calcDelete = calcDelete;
window.calcEquals = calcEquals;

function minimizeCard() {
  var card = document.getElementById('card');
  card.style.transition = 'all 0.3s ease';
  card.style.transform = 'scale(0.1)';
  card.style.opacity = '0';
  setTimeout(function() { card.style.display = 'none'; }, 300);
}

function maximizeCard() {
  var card = document.getElementById('card');
  card.style.transition = 'all 0.3s ease';
  card.style.width = '90vw';
  card.style.left = '5vw';
  card.style.top = '54px';
}

function closeCard() {
  var card = document.getElementById('card');
  card.style.transition = 'all 0.3s ease';
  card.style.transform = 'scale(0.1)';
  card.style.opacity = '0';
  setTimeout(function() { card.style.display = 'none'; }, 300);
}

// — PAINT —
(function() {
  var canvas, ctx, tool = 'pen', history = [], snap = null;
  var drawing = false, sx, sy, lx, ly;

  var palette = [
    '#ffffff','#94a3b8','#1e293b','#000000',
    '#ef4444','#f97316','#eab308','#22c55e',
    '#06b6d4','#3b82f6','#7b1fa2','#e91e8c',
  ];

  function init() {
    canvas = document.getElementById('paintCanvas');
    ctx    = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(10,10,15,1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveH();

    // Build swatches
    var grid = document.getElementById('paintSwatches');
    palette.forEach(function(c) {
      var s = document.createElement('div');
      s.className = 'paint-swatch' + (c === '#e91e8c' ? ' selected' : '');
      s.style.background = c;
      s.onclick = function() {
        document.getElementById('paintColor').value = c;
        document.querySelectorAll('.paint-swatch')
          .forEach(function(x){ x.classList.remove('selected'); });
        s.classList.add('selected');
      };
      grid.appendChild(s);
    });

    canvas.addEventListener('mousedown',  onDown);
    canvas.addEventListener('mousemove',  onMove);
    canvas.addEventListener('mouseup',    onUp);
    canvas.addEventListener('mouseleave', onUp);
  }

  function saveH() {
    if (history.length >= 30) history.shift();
    history.push(ctx.getImageData(0,0,canvas.width,canvas.height));
  }

  function getColor() { return document.getElementById('paintColor').value; }
  function getSize()  { return +document.getElementById('paintSize').value; }

  function applyStyle() {
    ctx.strokeStyle = getColor();
    ctx.fillStyle   = getColor();
    ctx.lineWidth   = getSize();
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.globalAlpha = 1;
  }

  function pos(e) {
    var r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  function onDown(e) {
    var p = pos(e);
    if (tool === 'fill') { saveH(); floodFill(p[0], p[1]); return; }
    drawing = true;
    sx = lx = p[0]; sy = ly = p[1];
    if (['line','rect','circle'].includes(tool))
      snap = ctx.getImageData(0,0,canvas.width,canvas.height);
    applyStyle();
    ctx.beginPath();
    ctx.moveTo(sx, sy);
  }

  function onMove(e) {
    if (!drawing) return;
    var p = pos(e); var x = p[0], y = p[1];
    applyStyle();
    if (tool === 'pen') {
      ctx.lineTo(x, y); ctx.stroke(); lx=x; ly=y;
    } else if (tool === 'brush') {
      ctx.lineWidth = getSize() * 2.5;
      ctx.shadowBlur = getSize(); ctx.shadowColor = getColor();
      ctx.lineTo(x, y); ctx.stroke();
      ctx.shadowBlur = 0; lx=x; ly=y;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = getSize() * 2;
      ctx.lineTo(x, y); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over'; lx=x; ly=y;
    } else if (tool === 'line') {
      ctx.putImageData(snap,0,0);
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(x,y); ctx.stroke();
    } else if (tool === 'rect') {
      ctx.putImageData(snap,0,0);
      ctx.strokeRect(sx, sy, x-sx, y-sy);
    } else if (tool === 'circle') {
      ctx.putImageData(snap,0,0);
      ctx.beginPath();
      ctx.ellipse(sx+(x-sx)/2, sy+(y-sy)/2,
        Math.abs(x-sx)/2, Math.abs(y-sy)/2, 0, 0, Math.PI*2);
      ctx.stroke();
    }
  }

  function onUp() {
    if (!drawing) return;
    drawing = false; snap = null;
    ctx.beginPath(); saveH();
  }

  // Flood fill
  function floodFill(fx, fy) {
    var img = ctx.getImageData(0,0,canvas.width,canvas.height);
    var d = img.data, W = canvas.width, H = canvas.height;
    var hex = getColor();
    var fr = parseInt(hex.slice(1,3),16),
        fg = parseInt(hex.slice(3,5),16),
        fb = parseInt(hex.slice(5,7),16);
    var si = ((fy|0)*W+(fx|0))*4;
    var tr=d[si],tg=d[si+1],tb=d[si+2],ta=d[si+3];
    if(tr===fr&&tg===fg&&tb===fb) return;
    var stack=[[fx|0,fy|0]];
    while(stack.length){
      var pt=stack.pop(), x=pt[0], y=pt[1];
      if(x<0||x>=W||y<0||y>=H) continue;
      var i=(y*W+x)*4;
      if(Math.abs(d[i]-tr)+Math.abs(d[i+1]-tg)+
         Math.abs(d[i+2]-tb)+Math.abs(d[i+3]-ta)>40) continue;
      d[i]=fr;d[i+1]=fg;d[i+2]=fb;d[i+3]=255;
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
    ctx.putImageData(img,0,0);
  }

  // Expose globals
  window.setPaintTool = function(t) {
    tool = t;
    document.querySelectorAll('.paint-tool')
      .forEach(function(b){ b.classList.remove('active'); });
    var btn = document.querySelector('.paint-tool[onclick*="'+t+'"]');
    if (btn) btn.classList.add('active');
  };
  window.paintUndo = function() {
    if (history.length > 1) { history.pop(); ctx.putImageData(history[history.length-1],0,0); }
  };
  window.paintClear = function() {
    saveH(); ctx.fillStyle='rgba(10,10,15,1)';
    ctx.fillRect(0,0,canvas.width,canvas.height); saveH();
  };
  window.paintSave = function() {
    var a = document.createElement('a');
    a.download = 'yapos-paint.png'; a.href = canvas.toDataURL(); a.click();
  };

  // Init when paint window opens — hook into openApp
  var _origOpen = window.openApp;
  window.openApp = function(id) {
    _origOpen(id);
    if (id === 'paint' && !canvas) init();
  };
})();

dragElement(document.getElementById('paint'),
  document.querySelector('#paint .titlebar'));

  // — MUSIC PLAYER —
(function() {
  var audio       = new Audio();
  var playlist    = [];   // {name, src, type}  type: 'file'|'yt'
  var currentIdx  = -1;
  var audioCtx, analyser, source, animFrame;

  // ── Visualizer ──────────────────────────────────────────────
  function initVisualizer() {
    if (audioCtx) return;
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    analyser  = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source    = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    drawVisualizer();
  }

  function drawVisualizer() {
    var canvas = document.getElementById('musicVisualizer');
    if (!canvas) { animFrame = requestAnimationFrame(drawVisualizer); return; }
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    animFrame = requestAnimationFrame(drawVisualizer);
    ctx.clearRect(0, 0, W, H);
    if (!analyser) return;
    var data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    var barW = (W / data.length) * 2;
    var x = 0;
    for (var i = 0; i < data.length; i++) {
      var h = (data[i] / 255) * H;
      var r = 233, g = 30 + (i * 2), b = 140 + i;
      ctx.fillStyle = 'rgba('+r+','+g+','+b+',0.85)';
      ctx.fillRect(x, H - h, barW - 1, h);
      x += barW;
    }
  }

  // ── Playback ────────────────────────────────────────────────
  function loadTrack(idx) {
    if (idx < 0 || idx >= playlist.length) return;
    currentIdx = idx;
    var t = playlist[idx];
    if (t.type === 'yt') {
      // Open YouTube in new tab — can't bypass embed restrictions
      document.getElementById('musicTitle').textContent  = t.name;
      document.getElementById('musicArtist').textContent = 'YouTube';
      document.getElementById('musicPlayBtn').textContent = '▶';
      window.open(t.src, '_blank');
      updatePlaylistUI();
      return;
    }
    audio.src = t.src;
    audio.load();
    audio.play();
    document.getElementById('musicTitle').textContent  = t.name;
    document.getElementById('musicArtist').textContent = 'Local File';
    document.getElementById('musicPlayBtn').textContent = '⏸';
    initVisualizer();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    updatePlaylistUI();
  }

  audio.ontimeupdate = function() {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('musicProgress').value = pct;
    document.getElementById('musicCurrent').textContent  = fmt(audio.currentTime);
    document.getElementById('musicDuration').textContent = fmt(audio.duration);
  };
  audio.onended = function() { musicNext(); };

  function fmt(s) {
    var m = Math.floor(s/60), sec = Math.floor(s%60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function updatePlaylistUI() {
    var el = document.getElementById('musicPlaylist');
    if (!playlist.length) {
      el.innerHTML = '<div style="color:rgba(255,255,255,0.25);font-size:12px;padding:8px 0;">No tracks yet</div>';
      return;
    }
    el.innerHTML = '';
    playlist.forEach(function(t, i) {
      var d = document.createElement('div');
      d.className = 'music-track' + (i === currentIdx ? ' playing' : '');
      d.textContent = (i === currentIdx ? '▶ ' : '') + t.name;
      d.onclick = function() { loadTrack(i); };
      el.appendChild(d);
    });
  }

  // ── Globals ─────────────────────────────────────────────────
  window.musicToggle = function() {
    if (!playlist.length) return;
    if (currentIdx < 0) { loadTrack(0); return; }
    if (audio.paused) {
      audio.play();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      document.getElementById('musicPlayBtn').textContent = '⏸';
    } else {
      audio.pause();
      document.getElementById('musicPlayBtn').textContent = '▶';
    }
  };

  window.musicNext = function() {
    if (!playlist.length) return;
    loadTrack((currentIdx + 1) % playlist.length);
  };

  window.musicPrev = function() {
    if (!playlist.length) return;
    loadTrack((currentIdx - 1 + playlist.length) % playlist.length);
  };

  window.musicSeek = function(val) {
    if (audio.duration) audio.currentTime = (val / 100) * audio.duration;
  };

  window.musicVolume = function(val) { audio.volume = val / 100; };

  window.musicForward = function() { audio.currentTime = Math.min(audio.currentTime + 10, audio.duration || 0); };
  window.musicRewind  = function() { audio.currentTime = Math.max(audio.currentTime - 10, 0); };

  window.musicAddFiles = function(files) {
    Array.from(files).forEach(function(f) {
      playlist.push({ name: f.name.replace(/\.[^.]+$/, ''), src: URL.createObjectURL(f), type: 'file' });
    });
    updatePlaylistUI();
    if (currentIdx < 0) loadTrack(0);
  };

  window.musicLoadYT = function() {
    var url = document.getElementById('ytInput').value.trim();
    if (!url) return;
    var name = 'YouTube: ' + url.split('v=')[1] || url;
    playlist.push({ name: name, src: url, type: 'yt' });
    document.getElementById('ytInput').value = '';
    updatePlaylistUI();
    loadTrack(playlist.length - 1);
  };

  // Init visualizer idle animation
  drawVisualizer();
})();

dragElement(document.getElementById('music'),
document.querySelector('music .titlebar'));

// — TERMINAL —
(function() {
  var history   = [];
  var histIdx   = -1;
  var fileSystem = {
    'readme.txt': 'Welcome to YAPOS! Built with love by Shrija.',
    'secret.txt': 'You found the secret file! 🎉 You are amazing!',
    'apps.txt':   'Notepad, Calculator, Paint, Music, Terminal'
  };

  var ASCII_YAPOS = [
    ' __  __   ___   ____   ___   ____  ',
    '|  \\/  | / _ \\ |  _ \\ / _ \\ / ___| ',
    '| |\\/| || | | || |_) | | | |\\___ \\ ',
    '| |  | || |_| ||  __/| |_| | ___) |',
    '|_|  |_| \\___/ |_|    \\___/ |____/ ',
  ];

  var commands = {
    help: function() {
      return [
        '<span style="color:#00ff41;font-weight:bold;">── YAPOS Terminal Commands ──</span>',
        '',
        '<span style="color:#7fff00;">  System</span>',
        '  help          Show this list',
        '  clear         Clear the terminal',
        '  whoami        Who are you?',
        '  date          Current date & time',
        '  version       YAPOS version info',
        '  uptime        System uptime',
        '  neofetch      System info + ASCII art',
        '',
        '<span style="color:#7fff00;">  Files</span>',
        '  ls            List files',
        '  cat [file]    Read a file',
        '  echo [text]   Print text',
        '',
        '<span style="color:#7fff00;">  Fun</span>',
        '  joke          Random joke',
        '  matrix        Go matrix mode',
        '  color [name]  Change text color',
        '  cowsay [text] A cow says something',
        '',
        '<span style="color:#7fff00;">  Math</span>',
        '  calc [expr]   Calculate e.g. calc 5*9+2',
      ].join('<br>');
    },

    clear: function() {
      document.getElementById('termOutput').innerHTML = '';
      return null;
    },

    whoami: function() {
      return 'shrija — owner of YAPOS, builder of things 🔥';
    },

    date: function() {
      return new Date().toString();
    },

    version: function() {
      return [
        'YAPOS v1.0.0',
        'Built with: HTML · CSS · JavaScript',
        'Developer: Shrija',
        'Status: <span style="color:#00ff41;">● Running</span>'
      ].join('<br>');
    },

    uptime: function() {
      var s = Math.floor(performance.now() / 1000);
      var m = Math.floor(s / 60); s = s % 60;
      var h = Math.floor(m / 60); m = m % 60;
      return 'Uptime: ' + h + 'h ' + m + 'm ' + s + 's';
    },

    neofetch: function() {
      return [
        '<span style="color:#00ff41;">' + ASCII_YAPOS.join('<br>') + '</span>',
        '',
        '<span style="color:#7fff00;">OS:</span>        YAPOS 1.0',
        '<span style="color:#7fff00;">Shell:</span>     YAPOS Terminal',
        '<span style="color:#7fff00;">Dev:</span>       Shrija',
        '<span style="color:#7fff00;">Built with:</span> HTML · CSS · JS',
        '<span style="color:#7fff00;">Apps:</span>      Notepad, Calculator, Paint, Music, Terminal',
        '<span style="color:#7fff00;">Status:</span>    <span style="color:#00ff41;">✔ All systems go</span>',
      ].join('<br>');
    },

    ls: function() {
      return Object.keys(fileSystem).map(function(f) {
        return '<span style="color:#7fff00;">📄 ' + f + '</span>';
      }).join('<br>');
    },

    echo: function(args) {
      return args.join(' ') || '';
    },

    cat: function(args) {
      if (!args[0]) return 'Usage: cat [filename]';
      var f = args[0];
      if (fileSystem[f]) return fileSystem[f];
      return 'cat: ' + f + ': No such file';
    },

    calc: function(args) {
      if (!args.length) return 'Usage: calc [expression]  e.g. calc 10*5+2';
      try {
        var result = Function('"use strict"; return (' + args.join('') + ')')();
        return '= ' + result;
      } catch(e) { return 'Error: invalid expression'; }
    },

    joke: function() {
      var jokes = [
        'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
        'Why did the developer go broke? Because they used up all their cache! 💸',
        'A SQL query walks into a bar, walks up to two tables and asks... "Can I join you?" 😂',
        'Why do Java developers wear glasses? Because they don\'t C#! 👓',
        'How many programmers does it take to change a lightbulb? None — it\'s a hardware problem! 💡',
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    },

    matrix: function() {
      var out = document.getElementById('termOutput');
      var chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
      var lines = [];
      for (var i = 0; i < 8; i++) {
        var line = '';
        for (var j = 0; j < 40; j++) {
          line += chars[Math.floor(Math.random() * chars.length)] + ' ';
        }
        lines.push(line);
      }
      return '<span style="color:#00ff41;font-size:11px;">'
        + lines.join('<br>') + '</span><br>'
        + '<span style="color:#7fff00;">Wake up, Shrija... 🐇</span>';
    },

    color: function(args) {
      var colors = {
        green:  '#00ff41', red: '#ff4444', blue: '#44aaff',
        pink:   '#e91e8c', yellow: '#ffff00', white: '#ffffff',
        purple: '#b44fff'
      };
      var c = args[0] && args[0].toLowerCase();
      if (!c || !colors[c]) {
        return 'Available colors: ' + Object.keys(colors).join(', ');
      }
      document.getElementById('termOutput').style.color = colors[c];
      document.getElementById('termInput').style.color  = colors[c];
      document.querySelector('#terminal .titlebar + div')
        .querySelectorAll('span')[0].style.color = colors[c];
      return 'Color changed to ' + c + '!';
    },

    cowsay: function(args) {
      var msg = args.join(' ') || 'Moo!';
      var line = '-'.repeat(msg.length + 2);
      return [
        ' ' + line,
        '< ' + msg + ' >',
        ' ' + line,
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '                ||----w |',
        '                ||     ||',
      ].join('<br>');
    },
  };

  function print(html, type) {
    var out   = document.getElementById('termOutput');
    var line  = document.createElement('div');
    if (type === 'input') {
      line.innerHTML = '<span style="color:#7fff00;">shrija@yapos:~$</span> '
        + html.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    } else if (type === 'error') {
      line.innerHTML = '<span style="color:#ff4444;">' + html + '</span>';
    } else {
      line.innerHTML = html;
    }
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  function runCommand(raw) {
    var parts   = raw.trim().split(/\s+/);
    var cmd     = parts[0].toLowerCase();
    var args    = parts.slice(1);
    print(raw, 'input');
    if (!cmd) return;
    if (commands[cmd]) {
      var result = commands[cmd](args);
      if (result !== null && result !== undefined) print(result, 'output');
    } else {
      print('command not found: ' + cmd + '  (type <b>help</b> for commands)', 'error');
    }
  }

  window.termKeyDown = function(e) {
    var input = document.getElementById('termInput');
    if (e.key === 'Enter') {
      var val = input.value;
      if (val.trim()) { history.unshift(val); histIdx = -1; }
      runCommand(val);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      if (histIdx < history.length - 1) histIdx++;
      input.value = history[histIdx] || '';
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (histIdx > 0) histIdx--;
      else histIdx = -1;
      input.value = histIdx >= 0 ? history[histIdx] : '';
      e.preventDefault();
    }
  };

  // Boot message — runs once when terminal first opens
  var booted = false;
  var _origOpen = window.openApp;
  window.openApp = function(id) {
    _origOpen(id);
    if (id === 'terminal' && !booted) {
      booted = true;
      setTimeout(function() {
        print('YAPOS Terminal v1.0.0', 'output');
        print('Type <b>help</b> to see available commands.', 'output');
        print('', 'output');
        document.getElementById('termInput').focus();
      }, 100);
    } else if (id === 'terminal') {
      document.getElementById('termInput').focus();
    }
  };

  // Drag support
  dragElement(document.getElementById('terminal'),
    document.querySelector('#terminal .titlebar'));
})();
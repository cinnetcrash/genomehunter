/* GenomeHunter Arcade — core engine: canvas, loop, input, scenes, save, difficulty */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});

  // Logical resolution (scaled up, pixelated)
  A.W = 480; A.H = 270;

  // ---- difficulty / level planning over 1000 levels ----
  A.MAX_LEVEL = 1000;

  // 8 recurring concept types (the bioinformatics pipeline + extras)
  A.TYPES = [
    { key: "a1", scene: "sample",   color: "#5fd089", mon: "Numune" },
    { key: "a2", scene: "extract",  color: "#d678c8", mon: "Helikon" },
    { key: "a3", scene: "sequence", color: "#f0b65a", mon: "Bazor" },
    { key: "a7", scene: "identify", color: "#46d6c8", mon: "Patojen" },
    { key: "a4", scene: "qc",       color: "#5ad6c0", mon: "Kalitor" },
    { key: "a5", scene: "assembly", color: "#f06a6a", mon: "Kontigon" },
    { key: "a8", scene: "phylo",    color: "#9ad65f", mon: "Filomon" },
    { key: "a6", scene: "gene",     color: "#8a7ef0", mon: "Genix" }
  ];

  // 10 visual zones (biomes), one per 100 levels
  A.ZONES = [
    { name: { tr: "Yeşil Çayır", en: "Green Meadow" },   ground: "grass",  sky: ["#7fd0ff", "#bdeeff"] },
    { name: { tr: "Mavi Kıyı", en: "Blue Shore" },       ground: "water",  sky: ["#5ab0e8", "#a6dcff"] },
    { name: { tr: "Kristal Mağara", en: "Crystal Cave" },ground: "rock",   sky: ["#3a2f5e", "#6b5aa6"] },
    { name: { tr: "Çöl Düzlüğü", en: "Desert Flats" },   ground: "path",   sky: ["#f0c074", "#ffe6b0"] },
    { name: { tr: "Neon Lab", en: "Neon Lab" },          ground: "floor",  sky: ["#101a36", "#1d2c52"] },
    { name: { tr: "Volkan", en: "Volcano" },             ground: "rock",   sky: ["#5a1c1c", "#a83c2c"] },
    { name: { tr: "Buz Tundra", en: "Ice Tundra" },      ground: "rock",   sky: ["#bfe6ff", "#e8f6ff"] },
    { name: { tr: "Spor Ormanı", en: "Spore Forest" },   ground: "grass",  sky: ["#2f6b3c", "#57a868"] },
    { name: { tr: "Derin Uzay", en: "Deep Space" },      ground: "floor",  sky: ["#05060f", "#161a36"] },
    { name: { tr: "Altın Genom", en: "Golden Genome" },  ground: "path",   sky: ["#7a5a10", "#d6a93c"] }
  ];

  A.levelPlan = function (L) {
    var ti = (L - 1) % A.TYPES.length;
    var type = A.TYPES[ti];
    var zoneIndex = Math.min(9, Math.floor((L - 1) / 100));
    var isBoss = (L % 25 === 0);
    return { L: L, type: type, zone: A.ZONES[zoneIndex], zoneIndex: zoneIndex, isBoss: isBoss };
  };

  // Scaling parameters. Each game reads what it needs. Tuned so L1 easy, L1000 brutal.
  A.difficulty = function (L, isBoss) {
    var d = {
      L: L,
      speedMul: 1 + Math.min(2.6, L * 0.012),
      count: Math.min(20, 3 + Math.floor(L / 28)),      // # correct needed
      options: Math.min(9, 3 + Math.floor(L / 35)),     // # of choices on screen
      seqTarget: Math.min(30, 6 + Math.floor(L / 18)),  // bases / items to clear
      steps: Math.min(8, 4 + Math.floor(L / 120)),      // extraction steps
      genes: Math.min(7, 2 + Math.floor(L / 90)),       // genes to find
      qcThresholdJitter: Math.min(10, Math.floor(L / 60)),
      // time in seconds (per game, generous early -> tight late)
      time: Math.max(7, Math.round(34 - L * 0.06 - (L > 200 ? (L - 200) * 0.02 : 0))),
      hearts: 3
    };
    if (isBoss) {
      d.count = Math.round(d.count * 1.4);
      d.seqTarget = Math.round(d.seqTarget * 1.4);
      d.genes = Math.min(8, d.genes + 1);
      d.steps = Math.min(9, d.steps + 1);
      d.time = Math.max(8, Math.round(d.time * 0.85));
      d.speedMul *= 1.15;
      d.hearts = 3;
    }
    return d;
  };

  // ---- save / load ----
  var SAVE_KEY = "gh_arcade_v1";
  A.save = {
    level: 1, best: 1, badges: {}, totalScore: 0,
    seenTutorial: {}, lang: "tr"
  };
  A.load = function () {
    try {
      var s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s) Object.assign(A.save, s);
    } catch (e) {}
    if (GH.i18n) A.save.lang = GH.i18n.lang;
  };
  A.persist = function () {
    A.save.lang = GH.i18n.lang;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(A.save)); } catch (e) {}
  };

  // ---- input ----
  var keyState = {}, prevKey = {};
  A.input = { up:false, down:false, left:false, right:false, confirm:false, back:false };
  A.touch = {};   // set by on-screen buttons
  var prevInput = {};

  var MAP = {
    ArrowUp:"up", KeyW:"up", ArrowDown:"down", KeyS:"down",
    ArrowLeft:"left", KeyA:"left", ArrowRight:"right", KeyD:"right",
    Enter:"confirm", KeyZ:"confirm", Space:"confirm",
    Escape:"back", KeyX:"back", Backspace:"back"
  };
  document.addEventListener("keydown", function (e) {
    if (MAP[e.code]) { keyState[MAP[e.code]] = true; if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].indexOf(e.code) >= 0) e.preventDefault(); }
  });
  document.addEventListener("keyup", function (e) { if (MAP[e.code]) keyState[MAP[e.code]] = false; });

  function syncInput() {
    ["up","down","left","right","confirm","back"].forEach(function (k) {
      A.input[k] = !!(keyState[k] || A.touch[k]);
    });
  }
  A.pressed = function (k) { return A.input[k] && !prevInput[k]; };
  // pointer position in logical coords (for click targeting in encounters)
  A.pointer = { x: -1, y: -1, clicked: false, down: false };

  // ---- scene stack ----
  var stack = [];
  A.push = function (sc) { if (sc.enter) sc.enter(); stack.push(sc); };
  A.pop = function () { var s = stack.pop(); if (s && s.exit) s.exit(); };
  A.replace = function (sc) { A.pop(); A.push(sc); };
  A.top = function () { return stack[stack.length - 1]; };
  A.clearScenes = function () { while (stack.length) A.pop(); };

  // fade transition
  A.fade = { a: 0, dir: 0, cb: null };
  A.transition = function (cb) { A.fade.dir = 1; A.fade.cb = cb; };

  // ---- canvas + loop ----
  var canvas, ctx, last = 0;
  A.ctx = null;

  function resize() {
    var cw = canvas.parentElement.clientWidth;
    var ch = window.innerHeight - canvas.getBoundingClientRect().top - 8;
    var scale = Math.max(1, Math.min(cw / A.W, ch / A.H));
    canvas.style.width = Math.floor(A.W * scale) + "px";
    canvas.style.height = Math.floor(A.H * scale) + "px";
  }
  A.canvasToLogical = function (clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    return { x: (clientX - r.left) / r.width * A.W, y: (clientY - r.top) / r.height * A.H };
  };

  A.boot = function () {
    GH.i18n.init();
    A.load();
    canvas = document.getElementById("game");
    canvas.width = A.W; canvas.height = A.H;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    A.ctx = ctx;
    window.addEventListener("resize", resize);
    resize();

    // pointer
    function setPtr(e, clicked) {
      var pt = (e.touches && e.touches[0]) || e;
      var p = A.canvasToLogical(pt.clientX, pt.clientY);
      A.pointer.x = p.x; A.pointer.y = p.y;
      if (clicked) A.pointer.clicked = true;
    }
    canvas.addEventListener("mousemove", function (e) { setPtr(e, false); });
    canvas.addEventListener("mousedown", function (e) { setPtr(e, true); A.pointer.down = true; });
    canvas.addEventListener("mouseup", function () { A.pointer.down = false; });
    canvas.addEventListener("touchstart", function (e) { setPtr(e, true); A.pointer.down = true; }, { passive: true });
    canvas.addEventListener("touchend", function () { A.pointer.down = false; });

    A.push(new A.TitleScene());
    requestAnimationFrame(loop);
  };

  function loop(ts) {
    var dt = (ts - last) / 1000; last = ts;
    if (!(dt > 0)) dt = 1 / 60;          // guard against 0/NaN frames (prevents stalls)
    if (dt > 0.05) dt = 0.05;            // clamp big gaps (tab switch, etc.)
    syncInput();

    var sc = A.top();
    if (sc && A.fade.dir === 0 && sc.update) sc.update(dt);

    // render
    ctx.clearRect(0, 0, A.W, A.H);
    if (sc && sc.render) sc.render(ctx);

    // fade — fade-out (dir>0) and fade-in (dir<0) handled separately so a
    // dt==0 frame can never cancel an in-progress transition at a==0.
    if (A.fade.dir > 0) {
      A.fade.a = Math.min(1, A.fade.a + dt * 3);
      if (A.fade.a >= 1) { if (A.fade.cb) { var cb = A.fade.cb; A.fade.cb = null; cb(); } A.fade.dir = -1; }
    } else if (A.fade.dir < 0) {
      A.fade.a = Math.max(0, A.fade.a - dt * 3);
      if (A.fade.a <= 0) { A.fade.a = 0; A.fade.dir = 0; }
    }
    if (A.fade.a > 0) {
      ctx.fillStyle = "rgba(8,10,20," + A.fade.a + ")";
      ctx.fillRect(0, 0, A.W, A.H);
    }

    // clear per-frame edges
    for (var k in A.input) prevInput[k] = A.input[k];
    A.pointer.clicked = false;
    requestAnimationFrame(loop);
  }

  A.t = function (k) { return GH.i18n.t(k); };
})(window.GH = window.GH || {});

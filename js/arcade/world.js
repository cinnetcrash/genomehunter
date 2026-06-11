/* GenomeHunter Arcade — free-roam Pokémon-style overworld
   Replaces the linear RouteScene. Walk anywhere; tall grass = wild encounters;
   scientist NPCs give tips; labs are boss gyms. */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});
  var U = A.ui;

  var TILE = 24;

  // tile codes
  var BLOCK = { T: 1, R: 1, W: 1, L: 1 };          // tree, rock, water, lab body
  function isBlock(ch) { return !!BLOCK[ch]; }

  // ---- map builder (deterministic, no RNG so Continue resumes identically) ----
  function buildMap() {
    var W = 32, H = 22;
    var g = [];
    for (var y = 0; y < H; y++) { g[y] = []; for (var x = 0; x < W; x++) g[y][x] = "."; }
    // tree border
    for (x = 0; x < W; x++) { g[0][x] = "T"; g[H - 1][x] = "T"; }
    for (y = 0; y < H; y++) { g[y][0] = "T"; g[y][W - 1] = "T"; }
    function rect(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) if (g[yy] && g[yy][xx] !== undefined) g[yy][xx] = ch; }
    // paths (cross)
    rect(1, 11, W - 2, 11, "p"); rect(15, 1, 15, H - 2, "p");
    // pond
    rect(4, 3, 8, 6, "W"); g[3][4] = "."; // soften corner
    // tall grass patches
    rect(19, 3, 27, 7, ","); rect(3, 14, 9, 19, ","); rect(21, 14, 28, 18, ",");
    rect(2, 2, 3, 3, ",");
    // scattered trees / rocks / flowers (fixed coords)
    [[11,3],[12,3],[11,4],[24,9],[25,9],[6,8],[18,14],[18,15],[10,8],[27,12]].forEach(function (p) { g[p[1]][p[0]] = "T"; });
    [[13,14],[14,14],[5,9],[26,5],[20,9]].forEach(function (p) { g[p[1]][p[0]] = "R"; });
    [[9,12],[10,12],[20,12],[21,12],[6,13],[24,13]].forEach(function (p) { g[p[1]][p[0]] = "f"; });
    // labs (3x3) with door at bottom-center -> boss
    var labs = [];
    function lab(x, y, color, name) {
      rect(x, y, x + 2, y + 2, "L"); g[y + 2][x + 1] = "D";
      labs.push({ x: x, y: y, color: color, name: name, door: { x: x + 1, y: y + 2 } });
    }
    lab(23, 2, "#8a7ef0", "boss");
    lab(3, 16, "#f06a6a", "boss");
    // signs
    g[12][15] = "s"; g[10][16] = "s";
    return { g: g, W: W, H: H, labs: labs };
  }

  // ---- NPC definitions (real scientists from GH.characters + wanderers) ----
  function buildNpcs() {
    var ch = GH.characters;
    function mk(x, y, who, opts, wander) {
      var co = ch[who];
      return { gx: x, gy: y, px: x * TILE, py: y * TILE, dir: 0, moving: false, mt: 0,
        wander: !!wander, wtimer: 1 + Math.random() * 2, opts: opts,
        name: co ? co.name : "?",
        lines: co ? [ (co.role[GH.i18n.lang] || ""), co.fact[GH.i18n.lang] ] : ["..."] };
    }
    var coat = { shirt: "#e8eef7", coat: true };
    return [
      mk(16, 9, "dayhoff", { shirt: "#e8eef7", coat: true, hair: "#cbd3df", bun: true, glasses: true }, false),
      mk(6, 12, "miescher", { shirt: "#dfe6f2", coat: true, hair: "#3a2a1a" }, false),
      mk(26, 10, "franklin", { shirt: "#e6ecf6", coat: true, hair: "#2b2b2b", glasses: true }, false),
      mk(12, 16, "sanger", { shirt: "#e3ebf5", coat: true, hair: "#cfcfcf", glasses: true }, false),
      mk(20, 5, "green", { shirt: "#dde5f1", coat: true, hair: "#4a3520" }, false),
      mk(10, 6, "myers", { shirt: "#e1e9f4", coat: true, hair: "#5a4326" }, false),
      mk(24, 16, "birney", { shirt: "#e4ecf6", coat: true, hair: "#2f2418", glasses: true }, false),
      // wandering kids/trainers
      { gx: 13, gy: 9, px: 13 * TILE, py: 9 * TILE, dir: 0, moving: false, mt: 0, wander: true, wtimer: 1, opts: { shirt: "#f0b65a", hair: "#6b4a2b" }, name: GH.i18n.lang === "tr" ? "Genç Avcı" : "Young Hunter", lines: [GH.i18n.lang === "tr" ? "Uzun otlarda vahşi Genom-mon'lar saklanır! Dikkatli yürü." : "Wild Genome-mon hide in tall grass! Walk carefully."] },
      { gx: 17, gy: 13, px: 17 * TILE, py: 13 * TILE, dir: 0, moving: false, mt: 0, wander: true, wtimer: 2, opts: { shirt: "#7ad67a", hair: "#2b2b2b" }, name: GH.i18n.lang === "tr" ? "Asistan" : "Assistant", lines: [GH.i18n.lang === "tr" ? "Laboratuvarlara (kapılara) girersen güçlü BOSS'larla karşılaşırsın!" : "Enter the labs (doors) to face powerful BOSSES!"] },
      { gx: 22, gy: 12, px: 22 * TILE, py: 12 * TILE, dir: 0, moving: false, mt: 0, wander: true, wtimer: 1.5, opts: { shirt: "#d678c8", hair: "#3a2a1a" }, name: GH.i18n.lang === "tr" ? "Kâşif" : "Explorer", lines: [GH.i18n.lang === "tr" ? "İstediğin yere git! Burası koca bir Genom Bölgesi." : "Go anywhere! This is one big Genome Region."] }
    ];
  }

  A.OverworldScene = function () {
    var m = buildMap();
    this.map = m.g; this.MW = m.W; this.MH = m.H; this.labs = m.labs;
    this.npcs = buildNpcs();
    var sx = (A.save.px != null) ? A.save.px : 15, sy = (A.save.py != null) ? A.save.py : 13;
    this.p = { gx: sx, gy: sy, px: sx * TILE, py: sy * TILE, dir: 0, moving: false, mt: 0 };
    this.cooldown = 0.4;     // no encounter until first step after spawn
    this.bob = 0; this.dlg = null; this.levelUp = 0; this.notice = 0;
  };

  A.OverworldScene.prototype.tileAt = function (x, y) {
    if (x < 0 || y < 0 || x >= this.MW || y >= this.MH) return "T";
    return this.map[y][x];
  };
  A.OverworldScene.prototype.occupied = function (x, y, ignore) {
    if (this.p.gx === x && this.p.gy === y && ignore !== "p") return true;
    for (var i = 0; i < this.npcs.length; i++) { var n = this.npcs[i]; if (n !== ignore && n.gx === x && n.gy === y) return true; }
    return false;
  };
  A.OverworldScene.prototype.walkable = function (x, y, who) {
    return !isBlock(this.tileAt(x, y)) && !this.occupied(x, y, who);
  };

  var DIRV = { 0: [0, 1], 1: [0, -1], 2: [-1, 0], 3: [1, 0] }; // down,up,left,right

  A.OverworldScene.prototype.update = function (dt) {
    this.bob += dt; if (this.cooldown > 0) this.cooldown -= dt;
    if (this.levelUp > 0) this.levelUp -= dt; if (this.notice > 0) this.notice -= dt;

    // dialogue mode
    if (this.dlg) {
      this.dlg.update(dt);
      if (A.pressed("confirm") || A.pressed("back") || A.pointer.clicked) { if (this.dlg.advance()) this.dlg = null; }
      return;
    }

    // NPC wander
    for (var i = 0; i < this.npcs.length; i++) this.stepEntity(this.npcs[i], dt, true);

    // player movement
    var p = this.p;
    this.stepEntity(p, dt, false);
    if (!p.moving) {
      var dir = -1;
      if (A.input.up) dir = 1; else if (A.input.down) dir = 0; else if (A.input.left) dir = 2; else if (A.input.right) dir = 3;
      if (dir >= 0) {
        p.dir = dir;
        var v = DIRV[dir], nx = p.gx + v[0], ny = p.gy + v[1];
        var tile = this.tileAt(nx, ny);
        if (tile === "D") { this.enterLab(nx, ny); return; }
        if (this.walkable(nx, ny, p)) { p.tx = nx; p.ty = ny; p.moving = true; p.mt = 0; }
      }
      // talk
      if (A.pressed("confirm")) this.tryTalk();
    }
  };

  A.OverworldScene.prototype.stepEntity = function (e, dt, isNpc) {
    if (e.moving) {
      e.mt += dt; var dur = isNpc ? 0.24 : 0.16, t = Math.min(1, e.mt / dur);
      e.px = (e.gx + (e.tx - e.gx) * t) * TILE;
      e.py = (e.gy + (e.ty - e.gy) * t) * TILE;
      e.frame = Math.floor(e.mt * 8) % 2;
      if (t >= 1) {
        e.gx = e.tx; e.gy = e.ty; e.px = e.gx * TILE; e.py = e.gy * TILE; e.moving = false; e.frame = 0;
        if (!isNpc) this.onStep();
      }
    } else if (isNpc && e.wander) {
      e.wtimer -= dt;
      if (e.wtimer <= 0) {
        e.wtimer = 1.5 + Math.random() * 3;
        var d = (Math.random() * 4) | 0; e.dir = d;
        var v = DIRV[d], nx = e.gx + v[0], ny = e.gy + v[1];
        if (this.walkable(nx, ny, e) && this.tileAt(nx, ny) === "." || (this.walkable(nx, ny, e) && this.tileAt(nx, ny) === "p")) { e.tx = nx; e.ty = ny; e.moving = true; e.mt = 0; }
      }
    }
  };

  A.OverworldScene.prototype.onStep = function () {
    var t = this.tileAt(this.p.gx, this.p.gy);
    if (t === "," && this.cooldown <= 0) {
      if (Math.random() < 0.14) this.startEncounter(false);
    }
  };

  A.OverworldScene.prototype.tryTalk = function () {
    var v = DIRV[this.p.dir], fx = this.p.gx + v[0], fy = this.p.gy + v[1];
    for (var i = 0; i < this.npcs.length; i++) {
      var n = this.npcs[i];
      if (n.gx === fx && n.gy === fy && !n.moving) {
        n.dir = (this.p.dir + 2) % 4 < 4 ? oppDir(this.p.dir) : n.dir; // face player
        GH.audio.click();
        var lines = [n.name + ":"].concat(n.lines.filter(Boolean));
        this.dlg = new U.Dialogue(lines, n._isProf ? A.profPortrait : null);
        return;
      }
    }
  };
  function oppDir(d) { return d === 0 ? 1 : d === 1 ? 0 : d === 2 ? 3 : 2; }

  A.OverworldScene.prototype.save = function () { A.save.px = this.p.gx; A.save.py = this.p.gy; A.persist(); };

  A.OverworldScene.prototype.startEncounter = function (isBoss) {
    this.save();
    var L = A.save.level;
    var plan;
    if (isBoss) {
      // boss uses a level-appropriate boss plan (force isBoss)
      plan = A.levelPlan(L); plan = { L: L, type: plan.type, zone: plan.zone, zoneIndex: plan.zoneIndex, isBoss: true };
    } else {
      var type = A.TYPES[(Math.random() * A.TYPES.length) | 0];
      var base = A.levelPlan(L);
      plan = { L: L, type: type, zone: base.zone, zoneIndex: base.zoneIndex, isBoss: false };
    }
    var diff = A.difficulty(L, plan.isBoss);
    var self = this;
    var b = new A.BattleScene(plan, diff,
      function () { // WIN — called at fade midpoint, replace directly
        A.save.level = Math.min(A.MAX_LEVEL, A.save.level + (isBoss ? 3 : 1));
        if (A.board) A.board.upsert(A.save.name || "—", A.save.level, A.save.totalScore);
        A.persist();
        if (A.save.level >= A.MAX_LEVEL) A.replace(new A.ChampionScene());
        else { var w = new A.OverworldScene(); w._justWon = true; A.replace(w); }
      },
      function () { // LOSE — return to world, no level change
        var w = new A.OverworldScene(); A.replace(w);
      });
    A.transition(function () { A.replace(b); });
  };

  A.OverworldScene.prototype.enter = function () {
    if (this._justWon) { this.levelUp = 1.6; this.cooldown = 0.6; GH.audio.good(); }
  };

  A.OverworldScene.prototype.enterLab = function (dx, dy) {
    // entering a lab door triggers a boss
    this.startEncounter(true);
  };

  // ---- rendering ----
  A.OverworldScene.prototype.render = function (c) {
    var W = A.W, H = A.H, p = this.p;
    var camX = Math.max(0, Math.min(this.MW * TILE - W, p.px + TILE / 2 - W / 2));
    var camY = Math.max(0, Math.min(this.MH * TILE - H, p.py + TILE / 2 - H / 2));

    // sky/base
    c.fillStyle = "#5fbf63"; c.fillRect(0, 0, W, H);

    // tiles in view
    var x0 = Math.floor(camX / TILE), y0 = Math.floor(camY / TILE);
    var x1 = Math.ceil((camX + W) / TILE), y1 = Math.ceil((camY + H) / TILE);
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var t = this.tileAt(x, y), sx = x * TILE - camX, sy = y * TILE - camY;
      this.drawTile(c, t, sx, sy, x, y);
    }
    // labs (draw once over footprint)
    var self = this;
    this.labs.forEach(function (lb) {
      A.drawLab(c, lb.x * TILE - camX, lb.y * TILE - camY, TILE * 3, TILE * 3, lb.color);
      U.text(c, "BOSS", lb.x * TILE - camX + TILE * 1.5, lb.y * TILE - camY - 3, 10, "#ffd84d", "center");
    });

    // entities sorted by feet y
    var ents = this.npcs.concat([{ __player: true, px: p.px, py: p.py, dir: p.dir, frame: p.frame, opts: null }]);
    ents.sort(function (a, b) { return (a.py) - (b.py); });
    ents.forEach(function (e) {
      var ex = e.px - camX, ey = e.py - camY;
      if (ex < -TILE || ex > W || ey < -TILE || ey > H) return;
      if (e.__player) A.player(c, ex + 4, ey + 2, e.dir, e.frame || 0);
      else {
        A.person(c, ex + 4, ey + 2, e.dir, e.frame || 0, e.opts);
        // talk indicator if adjacent & facing
        var v = DIRV[self.p.dir];
        if (!self.dlg && self.p.gx + v[0] === e.gx && self.p.gy + v[1] === e.gy && Math.floor(self.bob * 2) % 2 === 0)
          U.textO(c, "!", ex + TILE / 2, ey - 2, 12, "#ffd84d", "center");
      }
    });

    // HUD
    U.textO(c, (GH.i18n.lang === "tr" ? "Sv " : "Lv ") + A.save.level + "/1000", 8, 16, 13, "#fff", "left");
    U.textO(c, A.t("sb_score") + " " + A.save.totalScore, W - 8, 16, 12, "#ffd84d", "right");
    if (this.levelUp > 0) U.textO(c, GH.i18n.lang === "tr" ? "★ Seviye " + A.save.level + "!" : "★ Level " + A.save.level + "!", W / 2, 40, 16, "#ffd84d", "center");

    if (this.dlg) this.dlg.render(c);
    else {
      // controls hint (brief)
      U.text(c, GH.i18n.lang === "tr" ? "Ok tuşları: yürü · Z: konuş/onayla" : "Arrows: walk · Z: talk/confirm", W / 2, H - 7, 9, "rgba(255,255,255,0.55)", "center");
    }
  };

  A.OverworldScene.prototype.drawTile = function (c, t, sx, sy, gx, gy) {
    var alt = (gx + gy) % 2 === 0;
    if (t === "W") { A.tiles.water(c, sx, sy, TILE, Math.floor(this.bob * 2) % 2 === 0); return; }
    // ground under everything = grass
    A.tiles.grass(c, sx, sy, TILE, alt);
    if (t === "p") A.tiles.path(c, sx, sy, TILE);
    else if (t === "T") A.tiles.tree(c, sx, sy, TILE);
    else if (t === "R") A.tiles.rock(c, sx, sy, TILE);
    else if (t === "f") A.tiles.flower(c, sx, sy, TILE);
    else if (t === ",") { // tall grass
      c.fillStyle = "#3e9e47";
      for (var i = 0; i < 6; i++) { var bx = sx + 2 + (i * 4 + (gx % 3)) % (TILE - 4), by = sy + TILE - 4 - (i % 2) * 3; c.fillRect(bx, by, 2, 6 + (i % 2) * 2); }
      c.fillStyle = "#4eb858";
      for (i = 0; i < 5; i++) { c.fillRect(sx + 4 + i * 4, sy + TILE - 7, 2, 5); }
    } else if (t === "s") { // sign
      c.fillStyle = "#8a5a2b"; c.fillRect(sx + TILE / 2 - 1, sy + TILE - 8, 2, 8);
      c.fillStyle = "#c89b5a"; U.rr(c, sx + 4, sy + 4, TILE - 8, 9, 2); c.fill();
      c.fillStyle = "#5a3a18"; c.fillRect(sx + 6, sy + 6, TILE - 12, 1.5); c.fillRect(sx + 6, sy + 9, TILE - 14, 1.5);
    }
  };
})(window.GH = window.GH || {});

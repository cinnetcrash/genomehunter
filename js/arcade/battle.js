/* GenomeHunter Arcade — battle/encounter engine (timer, hearts, HP, combo, no hints) */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});
  var U = A.ui;

  A.BattleScene = function (plan, diff, onWin, onLose) {
    this.plan = plan; this.diff = diff; this.onWin = onWin; this.onLose = onLose;
    this.ch = A.CHALLENGES[plan.type.scene];
    this.state = {};
    this.maxHP = Math.max(1, this.ch.hp(diff));
    this.hp = this.maxHP;
    this.maxHearts = diff.hearts; this.hearts = diff.hearts;
    this.timeMax = diff.time; this.time = diff.time;
    this.combo = 0; this.score = 0;
    this.sel = 0; this.bob = 0; this.shake = 0; this.flash = 0; this.monHurt = 0;
    this.phase = "appear";
    this.popups = [];
  };

  A.BattleScene.prototype.enter = function () {
    var monName = A.t(this.plan.type.key + "_mon");
    var lines = [A.t("d3_wild_appeared").replace("{X}", monName)];
    if (!A.save.seenTutorial[this.plan.type.scene]) {
      lines.push(this.ch.tutorial(GH.i18n.lang));
      A.save.seenTutorial[this.plan.type.scene] = true; A.persist();
    }
    this.dlg = new U.Dialogue(lines, A.profPortrait);
    this.newGrid();
  };

  A.BattleScene.prototype.newGrid = function () {
    if (this.ch.init && !this._inited) { this.ch.init(this.diff, this.state); this._inited = true; }
    this.grid = this.ch.makeGrid(this.diff, this.state);
    this.cols = this.grid.cols || this.ch.cols || 4;
    if (this.cols < 1) this.cols = 4;
    this.layout();
    this.sel = 0;
  };

  A.BattleScene.prototype.layout = function () {
    var n = this.grid.tiles.length, cols = this.cols, rows = Math.ceil(n / cols);
    var ax = 8, aw = A.W - 16, ay = 150, ah = A.H - 150 - 6;
    var gap = 4;
    var tw = (aw - gap * (cols - 1)) / cols;
    var th = Math.min(tw, (ah - gap * (rows - 1)) / rows);
    if (cols === 1) th = Math.min(28, (ah - gap * (rows - 1)) / rows);
    var totalH = rows * th + gap * (rows - 1);
    var oy = ay + (ah - totalH) / 2;
    this.rects = this.grid.tiles.map(function (t, i) {
      var col = i % cols, row = (i / cols) | 0;
      var totalRowW = (i >= (rows - 1) * cols && n % cols) ? ((n % cols) * tw + ((n % cols) - 1) * gap) : (cols * tw + (cols - 1) * gap);
      var ox = ax + (aw - totalRowW) / 2;
      return { x: ox + col * (tw + gap), y: oy + row * (th + gap), w: tw, h: th };
    });
  };

  A.BattleScene.prototype.popup = function (txt, color, x, y) {
    this.popups.push({ txt: txt, color: color, x: x, y: y, t: 0 });
  };

  A.BattleScene.prototype.update = function (dt) {
    this.bob += dt; this.shake = Math.max(0, this.shake - dt); this.flash = Math.max(0, this.flash - dt);
    this.monHurt = Math.max(0, this.monHurt - dt);
    this.popups.forEach(function (p) { p.t += dt; p.y -= dt * 20; });
    this.popups = this.popups.filter(function (p) { return p.t < 0.9; });

    if (this.phase === "appear") {
      this.dlg.update(dt);
      if (A.pressed("confirm") || A.pointer.clicked) { if (this.dlg.advance()) this.phase = "play"; }
      return;
    }
    if (this.phase === "win" || this.phase === "lose") {
      this.dlg.update(dt);
      if (A.pressed("confirm") || A.pointer.clicked) {
        if (this.dlg.advance()) {
          var self = this;
          A.transition(function () { self.phase === "win" ? self.onWin(self.score) : self.onLose(self.score); });
        }
      }
      return;
    }

    // play
    this.time -= dt;
    if (this.time <= 0) { this.fail(); return; }

    // keyboard nav
    if (A.pressed("left")) this.move(-1);
    if (A.pressed("right")) this.move(1);
    if (A.pressed("up")) this.move(-this.cols);
    if (A.pressed("down")) this.move(this.cols);
    if (A.pressed("confirm")) this.choose(this.sel);

    // pointer
    if (A.pointer.clicked) {
      for (var i = 0; i < this.rects.length; i++) {
        var r = this.rects[i];
        if (A.pointer.x >= r.x && A.pointer.x <= r.x + r.w && A.pointer.y >= r.y && A.pointer.y <= r.y + r.h) { this.choose(i); break; }
      }
    }
  };

  A.BattleScene.prototype.move = function (d) {
    var n = this.grid.tiles.length;
    var ni = this.sel + d;
    if (ni < 0) ni += Math.ceil(n / this.cols) * this.cols;
    if (ni >= n) ni = ni % this.cols < n ? ni % this.cols : n - 1;
    this.sel = Math.max(0, Math.min(n - 1, ni));
    GH.audio.step();
  };

  A.BattleScene.prototype.choose = function (i) {
    var tile = this.grid.tiles[i]; if (!tile || tile.taken) return;
    var r = this.rects[i];
    if (tile.correct) {
      tile.taken = true;
      this.combo++;
      var timeBonus = 1 + this.time / this.timeMax;
      var gain = Math.round((10 + this.combo * 3) * timeBonus * (this.plan.isBoss ? 1.5 : 1) * (1 + this.diff.L * 0.01));
      this.score += gain;
      this.hp = Math.max(0, this.hp - 1);
      this.monHurt = 0.25; this.flash = 0.12;
      GH.audio.hit();
      this.popup("+" + gain, "#7ad67a", r.x + r.w / 2, r.y);
      if (this.ch.onCorrect) this.ch.onCorrect(this.state);
      if (this.hp <= 0) { this.win(); return; }
      // rebuild grid if no correct tiles remain
      var remain = this.grid.tiles.filter(function (t) { return t.correct && !t.taken; }).length;
      if (remain === 0) this.newGrid();
    } else {
      this.hearts--; this.combo = 0; this.shake = 0.3;
      GH.audio.miss();
      this.popup("✕", "#f06a6a", r.x + r.w / 2, r.y);
      if (this.hearts <= 0) { this.fail(); }
    }
  };

  A.BattleScene.prototype.win = function () {
    this.phase = "win";
    A.save.totalScore += this.score; A.persist();
    var monName = A.t(this.plan.type.key + "_mon");
    var lines = [A.t("d3_caught").replace("{X}", monName)];
    if (this.plan.isBoss) lines.push(A.t("d3_badge_get").replace("{X}", A.t(this.plan.type.key + "_name")));
    this.dlg = new U.Dialogue(lines, A.profPortrait);
    GH.audio.win();
  };

  A.BattleScene.prototype.fail = function () {
    if (this.phase !== "play") return;
    this.phase = "lose";
    this.dlg = new U.Dialogue([A.t("d3_fled")], A.profPortrait);
    GH.audio.fail();
  };

  A.BattleScene.prototype.render = function (c) {
    var plan = this.plan, W = A.W, H = A.H;
    // sky gradient (zone)
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, plan.zone.sky[0]); g.addColorStop(1, plan.zone.sky[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // ground band
    c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(0, 96, W, 24);

    var sx = this.shake > 0 ? (Math.random() - 0.5) * 6 : 0;
    c.save(); c.translate(sx, 0);

    // HUD top line
    U.textO(c, (GH.i18n.lang === "tr" ? "Sv " : "Lv ") + plan.L + (plan.isBoss ? "  ★BOSS" : ""), 8, 18, 13, plan.isBoss ? "#ffd84d" : "#fff", "left");
    U.textO(c, plan.zone.name[GH.i18n.lang], W / 2, 18, 12, "#eaf2ff", "center");
    U.textO(c, A.t("sb_score") + " " + this.score, W - 8, 18, 12, "#ffd84d", "right");

    // monster
    var mon = A.mon[plan.type.mon] || A.mon.Numune;
    var bobY = Math.sin(this.bob * 3) * 3;
    c.save();
    if (this.monHurt > 0) { c.globalAlpha = Math.floor(this.bob * 30) % 2 ? 0.4 : 1; }
    mon(c, W / 2, 52, plan.isBoss ? 30 : 24, bobY);
    c.restore();

    // HP bar
    U.text(c, A.t("a" + plan.type.key.slice(1) + "_mon") || plan.type.mon, W / 2 - 70, 80, 11, "#fff", "left");
    U.bar(c, W / 2 - 70, 84, 140, 8, this.hp / this.maxHP, "#f0556e");
    U.text(c, this.hp + "/" + this.maxHP, W / 2 + 74, 91, 9, "#cdd7ea", "left");

    // hearts + timer + combo
    U.hearts(c, 18, 102, this.hearts, this.maxHearts);
    U.bar(c, 8, 114, W - 16, 6, this.time / this.timeMax, this.time / this.timeMax < 0.3 ? "#f06a6a" : "#46d6c8");
    U.text(c, "⏱ " + Math.ceil(this.time) + "s", W - 8, 110, 11, this.time / this.timeMax < 0.3 ? "#f06a6a" : "#fff", "right");
    if (this.combo > 1) U.textO(c, A.t("d3_combo") + " x" + this.combo, W / 2, 110, 12, "#ffd84d", "center");

    // challenge top info (target base / contig / query)
    if (this.ch.drawTop && this.phase === "play") this.ch.drawTop(c, this.state, W / 2, 134);

    // prompt
    if (this.phase === "play") U.textO(c, this.grid.prompt, W / 2, 148, 12, "#eaf2ff", "center");

    // tiles
    if (this.phase === "play") {
      for (var i = 0; i < this.grid.tiles.length; i++) {
        var t = this.grid.tiles[i], r = this.rects[i];
        var selected = i === this.sel;
        c.fillStyle = t.taken ? "rgba(40,60,90,0.3)" : "rgba(20,32,58,0.92)";
        U.rr(c, r.x, r.y, r.w, r.h, 6); c.fill();
        c.lineWidth = selected ? 3 : 1.5;
        c.strokeStyle = selected ? "#ffd84d" : "rgba(120,150,200,0.5)";
        U.rr(c, r.x, r.y, r.w, r.h, 6); c.stroke();
        if (!t.taken) { c.save(); t.draw(c, r, { selected: selected }); c.restore(); }
        else { U.text(c, "✓", r.x + r.w / 2, r.y + r.h / 2 + 6, 18, "#5fd089", "center"); }
      }
    }

    // popups
    var self = this;
    this.popups.forEach(function (p) { c.globalAlpha = 1 - p.t / 0.9; U.textO(c, p.txt, p.x, p.y, 14, p.color, "center"); c.globalAlpha = 1; });

    // dialogue overlays
    if (this.phase === "appear" || this.phase === "win" || this.phase === "lose") {
      if (this.phase === "win") A.ball(c, W / 2, 52 + bobY, 10);
      this.dlg.render(c);
    }
    c.restore();
  };
})(window.GH = window.GH || {});

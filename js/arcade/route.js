/* GenomeHunter Arcade — overworld route walk between encounters */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});
  var U = A.ui;

  A.RouteScene = function (level) {
    this.level = level;
    this.plan = A.levelPlan(level);
    this.diff = A.difficulty(level, this.plan.isBoss);
    this.scroll = 0; this.px = 40; this.frame = 0; this.frameT = 0; this.bob = 0;
    this.arrived = false; this.wait = 0;
    this.decor = [];
    for (var i = 0; i < 16; i++) this.decor.push({ x: i * 60 + (Math.random() * 30), type: Math.random() });
  };

  A.RouteScene.prototype.enter = function () {
    if (A.save.level < this.level) { A.save.level = this.level; }
    if (A.save.best < this.level) A.save.best = this.level;
    A.persist();
    if (A.board) A.board.upsert(A.save.name || "—", A.save.best, A.save.totalScore);
  };

  A.RouteScene.prototype.startBattle = function () {
    var self = this, level = this.level;
    var b = new A.BattleScene(this.plan, this.diff,
      function () { // win
        A.transition(function () {
          if (level >= A.MAX_LEVEL) A.replace(new A.ChampionScene());
          else A.replace(new A.RouteScene(level + 1));
        });
      },
      function () { // lose -> retry same level
        A.transition(function () { self.startBattle(); });
      });
    A.replace(b);
  };

  A.RouteScene.prototype.update = function (dt) {
    this.bob += dt;
    if (!this.arrived) {
      var sp = 60;
      this.scroll += sp * dt;
      this.frameT += dt; if (this.frameT > 0.15) { this.frameT = 0; this.frame ^= 1; }
      if (this.scroll > 150) { this.arrived = true; this.wait = 0; }
      if (A.pressed("confirm")) { this.arrived = true; }
    } else {
      this.wait += dt;
      if (this.wait > 0.5 || A.pressed("confirm")) {
        var self = this;
        A.transition(function () { self.startBattle(); });
      }
    }
  };

  A.RouteScene.prototype.render = function (c) {
    var W = A.W, H = A.H, plan = this.plan;
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, plan.zone.sky[0]); g.addColorStop(1, plan.zone.sky[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    var groundY = H - 70, s = 16;
    // ground tiles
    var tile = A.tiles[plan.zone.ground] || A.tiles.grass;
    var off = (this.scroll | 0) % s;
    for (var y = groundY; y < H; y += s)
      for (var x = -s; x < W + s; x += s) tile(c, x - off, y, s, ((x / s | 0) + (y / s | 0)) % 2 === 0);

    // decor scrolling
    var self = this;
    this.decor.forEach(function (d) {
      var dx = d.x - self.scroll * 1.2;
      dx = ((dx % (W + 120)) + (W + 120)) % (W + 120) - 60;
      if (d.type < 0.4) A.tiles.tree(c, dx, groundY - 16, 16);
      else if (d.type < 0.7) A.tiles.flower(c, dx, groundY - 4, 16);
      else A.tiles.rock(c, dx, groundY - 4, 16);
    });

    // signpost ahead when arrived
    if (this.arrived) {
      var bx = W - 90, by = groundY - 54;
      U.panel(c, bx, by, 80, 48, { stroke: plan.type.color });
      U.text(c, (GH.i18n.lang === "tr" ? "Sv " : "Lv ") + this.level, bx + 40, by + 16, 13, plan.isBoss ? "#ffd84d" : "#fff", "center");
      U.text(c, A.t(plan.type.key + "_name"), bx + 40, by + 30, 9, "#cdd7ea", "center");
      var mon = A.mon[plan.type.mon]; if (mon) mon(c, bx + 40, by + 40, 7, 0);
      if (plan.isBoss) U.textO(c, "★BOSS", bx + 40, by - 4, 11, "#ffd84d", "center");
    }

    // player walking
    var pbob = Math.abs(Math.sin(this.bob * 8)) * 2;
    A.player(c, this.arrived ? W - 130 : this.px, groundY - 18 - pbob, 3, this.frame);

    // HUD
    U.textO(c, plan.zone.name[GH.i18n.lang] + "  ·  " + A.t("sb_score") + " " + A.save.totalScore, W / 2, 18, 12, "#fff", "center");
    if (this.level === A.save.best && Math.floor(this.bob * 2) % 2 === 0)
      U.textO(c, GH.i18n.lang === "tr" ? "En uzak: Sv " + A.save.best : "Best: Lv " + A.save.best, W / 2, 34, 10, "#ffd84d", "center");
  };
})(window.GH = window.GH || {});

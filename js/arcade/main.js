/* GenomeHunter Arcade — title, intro, champion, name entry, wiring */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});
  var U = A.ui;

  // small framed portrait of Professor Dayhoff for dialogue boxes
  A.profPortrait = function (c, x, y) {
    U.panel(c, x, y, 42, 50, { r: 4, stroke: "#46d6c8" });
    c.save(); c.translate(x + 6, y + 8); c.scale(2.4, 2.4);
    A.sprProfHead(c, 0, 0);
    c.restore();
  };
  A.sprProfHead = function (c, x, y) {
    c.fillStyle = "#f1c9a5"; c.beginPath(); c.arc(x + 7, y + 7, 6, 0, 7); c.fill();
    c.fillStyle = "#cbd3df"; c.beginPath(); c.arc(x + 7, y + 4, 6, Math.PI, 0); c.fill();
    c.beginPath(); c.arc(x + 7, y + 1.5, 3, 0, 7); c.fill();
    c.strokeStyle = "#15203a"; c.lineWidth = 0.7;
    c.strokeRect(x + 3.5, y + 6, 3, 2.4); c.strokeRect(x + 8, y + 6, 3, 2.4);
    c.fillStyle = "#15203a"; c.fillRect(x + 4.6, y + 6.8, 1, 1); c.fillRect(x + 9.1, y + 6.8, 1, 1);
    c.fillStyle = "#e8eef7"; c.fillRect(x + 1, y + 13, 12, 5);
  };

  // ---- name entry via DOM overlay ----
  A.askName = function (cb) {
    var ov = document.getElementById("nameOverlay");
    var inp = document.getElementById("nameInput");
    var btn = document.getElementById("nameBtn");
    var lbl = document.getElementById("nameLabel");
    lbl.textContent = GH.i18n.t("sb_enter_name");
    btn.textContent = GH.i18n.t("sb_submit");
    inp.value = A.save.name || "";
    ov.style.display = "flex";
    inp.focus();
    function done() {
      var v = (inp.value || "").trim().slice(0, 10) || (GH.i18n.lang === "tr" ? "Avcı" : "Hunter");
      A.save.name = v; A.persist();
      ov.style.display = "none";
      btn.removeEventListener("click", done);
      inp.removeEventListener("keydown", onKey);
      cb();
    }
    function onKey(e) { if (e.key === "Enter") done(); }
    btn.addEventListener("click", done);
    inp.addEventListener("keydown", onKey);
  };

  // ===================== TITLE =====================
  A.TitleScene = function () {
    this.t = 0;
    var items = [];
    if (A.save.level > 1) items.push({ k: "continue", label: function () { return A.t("d3_continue") + " (Sv " + A.save.level + ")"; } });
    items.push({ k: "new", label: function () { return A.t("d3_new_game"); } });
    items.push({ k: "board", label: function () { return "🏆 " + A.t("sb_title"); } });
    items.push({ k: "lang", label: function () { return GH.i18n.lang === "tr" ? "Language: English" : "Dil: Türkçe"; } });
    items.push({ k: "classic", label: function () { return A.t("d3_classic"); } });
    this.menu = new U.Menu(items);
  };
  A.TitleScene.prototype.update = function (dt) {
    this.t += dt;
    if (A.pressed("up")) this.menu.move(-1);
    if (A.pressed("down")) this.menu.move(1);
    // pointer hover select
    if (A.pointer.y > 120) {
      var idx = Math.floor((A.pointer.y - 128) / 22);
      if (idx >= 0 && idx < this.menu.items.length) this.menu.sel = idx;
    }
    if (A.pressed("confirm") || A.pointer.clicked) this.choose();
  };
  A.TitleScene.prototype.choose = function () {
    var it = this.menu.items[this.menu.sel]; GH.audio.good();
    if (it.k === "lang") { GH.i18n.set(GH.i18n.lang === "tr" ? "en" : "tr"); A.persist(); return; }
    if (it.k === "classic") { window.location.href = "classic/index.html"; return; }
    if (it.k === "board") { var s = this; A.transition(function () { A.replace(new A.ScoreboardScene(true)); }); return; }
    if (it.k === "continue") { var lv = A.save.level; A.transition(function () { A.replace(new A.RouteScene(lv)); }); return; }
    if (it.k === "new") {
      A.askName(function () {
        A.save.level = 1; A.save.totalScore = 0; A.save.seenTutorial = {}; A.persist();
        A.transition(function () { A.replace(new A.IntroScene()); });
      });
    }
  };
  A.TitleScene.prototype.render = function (c) {
    var W = A.W, H = A.H;
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0a1226"); g.addColorStop(0.5, "#13254a"); g.addColorStop(1, "#0a1226");
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    // floating monsters
    var mons = ["Numune", "Helikon", "Bazor", "Patojen", "Kalitor", "Kontigon", "Filomon", "Genix"];
    for (var i = 0; i < mons.length; i++) {
      var mx = 30 + (i % 4) * (W - 60) / 3;
      var my = (i < 4 ? 50 : H - 40) + Math.sin(this.t * 2 + i) * 6;
      c.globalAlpha = 0.25; A.mon[mons[i]](c, mx, my, 14, 0); c.globalAlpha = 1;
    }

    // title
    var pulse = 1 + Math.sin(this.t * 3) * 0.03;
    c.save(); c.translate(W / 2, 64); c.scale(pulse, pulse);
    U.textO(c, "GenomeHunter", 0, 0, 34, "#46d6c8", "center");
    c.restore();
    U.textO(c, A.t("d3_sub"), W / 2, 84, 13, "#f0b65a", "center");

    // menu
    for (var j = 0; j < this.menu.items.length; j++) {
      var sel = j === this.menu.sel, y = 132 + j * 22;
      if (sel) { c.fillStyle = "rgba(70,214,200,0.18)"; U.rr(c, W / 2 - 110, y - 14, 220, 19, 5); c.fill(); }
      U.textO(c, (sel ? "▶ " : "") + this.menu.items[j].label(), W / 2, y, 14, sel ? "#fff" : "#cdd7ea", "center");
    }
    U.text(c, A.t("d3_controls"), W / 2, H - 10, 9, "#6b7da0", "center");
  };

  // ===================== INTRO =====================
  A.IntroScene = function () {};
  A.IntroScene.prototype.enter = function () {
    var n = A.save.name || (GH.i18n.lang === "tr" ? "Avcı" : "Hunter");
    var L = GH.i18n.lang === "tr" ? [
      "Merhaba! Ben Profesör Margaret Dayhoff, biyoinformatiğin kurucusuyum.",
      "Genom Bölgesi'ne hoş geldin, " + n + "! Burada DNA, vahşi Genom-mon'lar olarak yaşar.",
      "Onları yakalamak için bilim kullanırız: örnek al, DNA çıkar, dizile, kaliteyi kontrol et, birleştir ve genleri bul!",
      "Her seviye biraz daha zor. 1000 seviyeyi geçip GENOM ŞAMPİYONU olabilecek misin? Hadi başlayalım!"
    ] : [
      "Hello! I'm Professor Margaret Dayhoff, founder of bioinformatics.",
      "Welcome to the Genome Region, " + n + "! Here, DNA lives as wild Genome-mon.",
      "To catch them we use science: take a sample, extract DNA, sequence it, check quality, assemble and find genes!",
      "Each level gets harder. Can you clear 1000 levels and become the GENOME CHAMPION? Let's go!"
    ];
    this.dlg = new U.Dialogue(L, A.profPortrait);
  };
  A.IntroScene.prototype.update = function (dt) {
    this.dlg.update(dt);
    if (A.pressed("confirm") || A.pointer.clicked) {
      if (this.dlg.advance()) A.transition(function () { A.replace(new A.RouteScene(1)); });
    }
  };
  A.IntroScene.prototype.render = function (c) {
    var W = A.W, H = A.H;
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#7fd0ff"); g.addColorStop(1, "#bdeeff");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    A.tiles.grass(c, 0, H - 90, W, 0); c.fillStyle = "#5fbf63"; c.fillRect(0, H - 90, W, 90);
    A.professor(c, W / 2 - 30, H - 120, 0); A.player(c, W / 2 + 18, H - 116, 2, Math.floor(this.dlg ? 0 : 0));
    U.textO(c, "GenomeHunter", W / 2, 40, 24, "#fff", "center");
    this.dlg.render(c);
  };

  // ===================== CHAMPION =====================
  A.ChampionScene = function () { this.t = 0; this.conf = []; for (var i = 0; i < 80; i++) this.conf.push({ x: Math.random() * A.W, y: Math.random() * -A.H, v: 20 + Math.random() * 40, c: ["#46d6c8","#f0b65a","#d678c8","#7ad67a","#f06a6a"][i % 5] }); };
  A.ChampionScene.prototype.enter = function () { if (A.board) A.board.upsert(A.save.name || "—", A.MAX_LEVEL, A.save.totalScore); GH.audio.win(); };
  A.ChampionScene.prototype.update = function (dt) {
    this.t += dt;
    this.conf.forEach(function (p) { p.y += p.v * dt; if (p.y > A.H) p.y = -10; });
    if (this.t > 1 && (A.pressed("confirm") || A.pointer.clicked || A.pressed("back")))
      A.transition(function () { A.replace(new A.ScoreboardScene(true)); });
  };
  A.ChampionScene.prototype.render = function (c) {
    var W = A.W, H = A.H;
    c.fillStyle = "#0a1226"; c.fillRect(0, 0, W, H);
    this.conf.forEach(function (p) { c.fillStyle = p.c; c.fillRect(p.x, p.y, 4, 4); });
    A.mon.Genix(c, W / 2, 70, 30, Math.sin(this.t * 3) * 4);
    U.textO(c, "👑 " + A.t("d3_champion"), W / 2, 130, 22, "#ffd84d", "center");
    U.textO(c, (A.save.name || "") + "  ·  " + A.t("sb_score") + " " + A.save.totalScore, W / 2, 158, 14, "#fff", "center");
    U.text(c, A.t("cert_signed"), W / 2, 184, 11, "#9fb3d6", "center");
    if (Math.floor(this.t * 2) % 2 === 0) U.textO(c, GH.i18n.lang === "tr" ? "Devam için tıkla" : "Click to continue", W / 2, H - 16, 12, "#46d6c8", "center");
  };
})(window.GH = window.GH || {});

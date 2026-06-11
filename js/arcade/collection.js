/* GenomeHunter Arcade — G-nome Collection (card / Dex) scene */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});
  var U = A.ui;

  // back: function to return to previous scene
  A.CollectionScene = function (back) {
    this.back = back || function () { A.replace(new A.TitleScene()); };
    this.sel = 0; this.t = 0;
    this.cols = 4;
  };

  A.CollectionScene.prototype.update = function (dt) {
    this.t += dt;
    var n = A.SPECIES.length;
    if (A.pressed("left")) { this.sel = (this.sel + n - 1) % n; GH.audio.step(); }
    if (A.pressed("right")) { this.sel = (this.sel + 1) % n; GH.audio.step(); }
    if (A.pressed("up")) { this.sel = (this.sel + n - this.cols) % n; GH.audio.step(); }
    if (A.pressed("down")) { this.sel = (this.sel + this.cols) % n; GH.audio.step(); }
    // pointer hover over a card
    if (this.rects) for (var i = 0; i < this.rects.length; i++) {
      var r = this.rects[i];
      if (A.pointer.x >= r.x && A.pointer.x <= r.x + r.w && A.pointer.y >= r.y && A.pointer.y <= r.y + r.h) {
        this.sel = i;
        if (A.pointer.clicked) this.setActive();
      }
    }
    if (A.pressed("confirm")) this.setActive();
    if (A.pressed("back")) { var self = this; A.transition(function () { self.back(); }); }
  };

  A.CollectionScene.prototype.setActive = function () {
    var s = A.SPECIES[this.sel];
    if (A.collection.has(s.id)) { A.collection.setActive(s.id); GH.audio.good(); }
    else GH.audio.bad();
  };

  A.CollectionScene.prototype.render = function (c) {
    var W = A.W, H = A.H;
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#101a36"); g.addColorStop(1, "#1d2c52");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    U.textO(c, "🃏 " + A.t("col_title"), 10, 20, 16, "#46d6c8", "left");
    U.text(c, A.t("col_owned") + ": " + A.collection.owned().length + "/" + A.SPECIES.length, W - 10, 18, 11, "#9fb3d6", "right");

    // grid (left)
    var gx = 8, gy = 28, cw = 62, ch = 64, gap = 5, cols = this.cols;
    this.rects = [];
    for (var i = 0; i < A.SPECIES.length; i++) {
      var s = A.SPECIES[i], col = i % cols, row = (i / cols) | 0;
      var x = gx + col * (cw + gap), y = gy + row * (ch + gap);
      this.rects.push({ x: x, y: y, w: cw, h: ch });
      var owned = A.collection.has(s.id);
      var rar = A.RARITY[s.rar], sel = i === this.sel, active = A.save.active === s.id;
      // card bg
      c.fillStyle = owned ? "rgba(20,32,58,0.95)" : "rgba(14,20,38,0.7)";
      U.rr(c, x, y, cw, ch, 6); c.fill();
      c.lineWidth = sel ? 3 : 1.5;
      c.strokeStyle = sel ? "#ffd84d" : rar.color;
      U.rr(c, x, y, cw, ch, 6); c.stroke();
      // rarity strip
      c.fillStyle = rar.color; U.rr(c, x, y, cw, 4, 2); c.fill();
      if (owned) {
        var tcol = A.TYPE_COLORS[s.type];
        A.gnomeAura(c, x + cw / 2, y + 26, 13, tcol, this.t + i);
        A.mon[s.sprite](c, x + cw / 2, y + 26, 13, Math.sin(this.t * 2 + i) * 1.5);
        U.text(c, s.name[GH.i18n.lang], x + cw / 2, y + ch - 14, 9, "#fff", "center");
        U.text(c, "x" + A.collection.count(s.id), x + cw / 2, y + ch - 4, 8, "#9fb3d6", "center");
        if (active) { U.text(c, "● " + A.t("col_active"), x + cw / 2, y + 46, 7, "#ffd84d", "center"); }
      } else {
        U.text(c, "?", x + cw / 2, y + 34, 26, "rgba(255,255,255,0.3)", "center");
        U.text(c, A.t("col_locked"), x + cw / 2, y + ch - 6, 7, "#6b7da0", "center");
      }
    }

    // detail panel (right)
    var dx = gx + cols * (cw + gap) + 4, dy = 28, dw = W - dx - 8, dh = H - dy - 8;
    U.panel(c, dx, dy, dw, dh, { stroke: "#46d6c8" });
    var sp = A.SPECIES[this.sel], owned2 = A.collection.has(sp.id), rar2 = A.RARITY[sp.rar], tcol2 = A.TYPE_COLORS[sp.type];
    var cxp = dx + dw / 2;
    if (owned2) {
      A.gnomeAura(c, cxp, dy + 40, 22, tcol2, this.t);
      A.mon[sp.sprite](c, cxp, dy + 40, 22, Math.sin(this.t * 3) * 3);
      U.textO(c, sp.name[GH.i18n.lang], cxp, dy + 78, 14, "#fff", "center");
      U.typeBadge(c, sp.type, cxp - 18, dy + 84, tcol2);
      U.text(c, rar2.name[GH.i18n.lang] + " " + U.stars(rar2.stars), cxp, dy + 108, 9, rar2.color, "center");
      U.statBar(c, A.t("st_atk"), sp.atk, dx + 14, dy + 118, "#f06a6a");
      U.statBar(c, A.t("st_sta"), sp.sta, dx + 14, dy + 132, "#5fd089");
      U.statBar(c, A.t("st_spd"), sp.spd, dx + 14, dy + 146, "#f0b65a");
      var ab = A.ABILITIES[sp.ability];
      U.text(c, "✦ " + ab.name[GH.i18n.lang], dx + 14, dy + 168, 10, tcol2, "left");
      var lines = U.wrap(c, ab.desc[GH.i18n.lang], 9, dw - 24);
      for (var k = 0; k < lines.length; k++) U.text(c, lines[k], dx + 14, dy + 180 + k * 11, 9, "#cdd7ea", "left");
      U.text(c, A.save.active === sp.id ? "● " + A.t("col_active") : A.t("col_setactive"), cxp, dy + dh - 8, 10, "#ffd84d", "center");
    } else {
      U.text(c, "?", cxp, dy + 50, 40, "rgba(255,255,255,0.3)", "center");
      U.text(c, A.t("col_locked"), cxp, dy + 90, 11, "#9fb3d6", "center");
      U.text(c, rar2.name[GH.i18n.lang] + " " + U.stars(rar2.stars), cxp, dy + 110, 9, rar2.color, "center");
    }

    U.text(c, (GH.i18n.lang === "tr" ? "Ok: seç · Z: aktif · X: geri" : "Arrows: select · Z: active · X: back"), W / 2, H - 2, 8, "rgba(255,255,255,0.5)", "center");
  };
})(window.GH = window.GH || {});

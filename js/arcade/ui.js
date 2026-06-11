/* GenomeHunter Arcade — UI primitives drawn on canvas */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});
  var U = (A.ui = {});

  var FONT = '"Trebuchet MS","Segoe UI",sans-serif';

  U.text = function (c, str, x, y, size, color, align, weight) {
    c.font = (weight || "bold") + " " + size + "px " + FONT;
    c.textAlign = align || "left";
    c.textBaseline = "alphabetic";
    c.fillStyle = color || "#fff";
    c.fillText(str, x, y);
  };
  // text with dark outline (readable on any bg)
  U.textO = function (c, str, x, y, size, color, align) {
    c.font = "bold " + size + "px " + FONT;
    c.textAlign = align || "left";
    c.textBaseline = "alphabetic";
    c.lineJoin = "round"; c.lineWidth = Math.max(2, size * 0.18);
    c.strokeStyle = "rgba(8,12,24,0.85)"; c.strokeText(str, x, y);
    c.fillStyle = color || "#fff"; c.fillText(str, x, y);
  };

  U.panel = function (c, x, y, w, h, opts) {
    opts = opts || {};
    c.fillStyle = opts.fill || "rgba(14,22,40,0.94)";
    U.rr(c, x, y, w, h, opts.r || 6); c.fill();
    c.lineWidth = opts.lw || 2; c.strokeStyle = opts.stroke || "#46d6c8";
    U.rr(c, x, y, w, h, opts.r || 6); c.stroke();
    if (opts.inner) {
      c.lineWidth = 1; c.strokeStyle = "rgba(255,255,255,0.15)";
      U.rr(c, x + 3, y + 3, w - 6, h - 6, (opts.r || 6) - 2); c.stroke();
    }
  };

  U.rr = function (c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  };

  // horizontal bar (HP, time). val 0..1
  U.bar = function (c, x, y, w, h, val, color, bg) {
    c.fillStyle = bg || "#1c2944"; U.rr(c, x, y, w, h, h / 2); c.fill();
    val = Math.max(0, Math.min(1, val));
    if (val > 0) {
      c.fillStyle = color || "#5fd089";
      U.rr(c, x + 1, y + 1, Math.max(h - 2, (w - 2) * val), h - 2, (h - 2) / 2); c.fill();
    }
    c.lineWidth = 1; c.strokeStyle = "rgba(0,0,0,0.4)"; U.rr(c, x, y, w, h, h / 2); c.stroke();
  };

  U.hearts = function (c, x, y, n, max) {
    for (var i = 0; i < max; i++) {
      var hx = x + i * 14, full = i < n;
      c.fillStyle = full ? "#f0556e" : "rgba(255,255,255,0.18)";
      var s = 5;
      c.beginPath();
      c.moveTo(hx, y + s * 0.4);
      c.bezierCurveTo(hx, y - s * 0.2, hx - s, y - s * 0.2, hx - s, y + s * 0.45);
      c.bezierCurveTo(hx - s, y + s, hx, y + s * 1.1, hx, y + s * 1.5);
      c.bezierCurveTo(hx, y + s * 1.1, hx + s, y + s, hx + s, y + s * 0.45);
      c.bezierCurveTo(hx + s, y - s * 0.2, hx, y - s * 0.2, hx, y + s * 0.4);
      c.fill();
    }
  };

  // wrap text into lines for a width
  U.wrap = function (c, str, size, maxW) {
    c.font = "bold " + size + "px " + FONT;
    var words = String(str).split(" "), lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (c.measureText(test).width > maxW && line) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  // typewriter dialogue box at bottom. Returns object with update/render/done/skip.
  U.Dialogue = function (lines, portrait) {
    this.lines = Array.isArray(lines) ? lines : [lines];
    this.portrait = portrait; this.i = 0; this.shown = 0; this.timer = 0; this.done = false;
  };
  U.Dialogue.prototype.advance = function () {
    var full = this.lines[this.i];
    if (this.shown < full.length) { this.shown = full.length; return false; }
    if (this.i < this.lines.length - 1) { this.i++; this.shown = 0; return false; }
    this.done = true; return true;
  };
  U.Dialogue.prototype.update = function (dt) {
    var full = this.lines[this.i];
    if (this.shown < full.length) { this.timer += dt; while (this.timer > 0.02 && this.shown < full.length) { this.timer -= 0.02; this.shown++; } }
  };
  U.Dialogue.prototype.render = function (c) {
    var W = A.W, H = A.H, h = 70, y = H - h - 6, x = 6, w = W - 12;
    U.panel(c, x, y, w, h, { inner: true });
    var tx = x + 12;
    if (this.portrait) { this.portrait(c, x + 8, y + 8); tx = x + 56; }
    var str = this.lines[this.i].slice(0, this.shown);
    var ls = U.wrap(c, str, 14, w - (tx - x) - 16);
    for (var i = 0; i < ls.length && i < 3; i++) U.text(c, ls[i], tx, y + 24 + i * 18, 14, "#eaf2ff");
    // blinking continue arrow when full
    if (this.shown >= this.lines[this.i].length && Math.floor(Date.now() / 400) % 2 === 0)
      U.text(c, "▼", x + w - 16, y + h - 8, 12, "#46d6c8");
  };

  // small type pill (DNA/RNA/PROT/VIRUS/MICROBE/DATA)
  U.typeBadge = function (c, type, x, y, color) {
    c.font = "bold 8px " + FONT; c.textAlign = "left"; c.textBaseline = "alphabetic";
    var w = c.measureText(type).width + 8;
    c.fillStyle = color; U.rr(c, x, y, w, 11, 4); c.fill();
    c.fillStyle = "#0a1226"; c.fillText(type, x + 4, y + 8.5);
    return w;
  };
  // stat bar (label + filled pips out of 5)
  U.statBar = function (c, label, val, x, y, color) {
    U.text(c, label, x, y + 6, 8, "#cdd7ea", "left");
    for (var i = 0; i < 5; i++) {
      c.fillStyle = i < val ? (color || "#46d6c8") : "rgba(255,255,255,0.16)";
      U.rr(c, x + 22 + i * 8, y, 6, 7, 2); c.fill();
    }
  };
  // rarity stars
  U.stars = function (n) { return Array(n + 1).join("★") + Array(6 - n).join("☆"); };

  // selectable button row/list helper state
  U.Menu = function (items) { this.items = items; this.sel = 0; };
  U.Menu.prototype.move = function (d) { this.sel = (this.sel + d + this.items.length) % this.items.length; GH.audio.click(); };
})(window.GH = window.GH || {});

/* GenomeHunter Arcade — procedural pixel-art sprites (no external image assets) */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});

  // round-rect helper
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function eyes(c, x, y, sp, r, look) {
    look = look || 0;
    [-1, 1].forEach(function (s) {
      c.fillStyle = "#fff";
      c.beginPath(); c.arc(x + s * sp, y, r, 0, 7); c.fill();
      c.fillStyle = "#15203a";
      c.beginPath(); c.arc(x + s * sp + look, y + r * 0.3, r * 0.55, 0, 7); c.fill();
      c.fillStyle = "#fff";
      c.beginPath(); c.arc(x + s * sp + look - r * 0.2, y - r * 0.1, r * 0.18, 0, 7); c.fill();
    });
  }
  function outline(c, fn, col, lw) {
    c.save(); c.lineJoin = "round"; c.strokeStyle = col || "#10182c"; c.lineWidth = lw || 2;
    fn(); c.stroke(); c.restore();
  }

  // ---------- TILES (16x16 logical) ----------
  A.tiles = {
    grass: function (c, x, y, s, t) {
      c.fillStyle = "#5fbf63"; c.fillRect(x, y, s, s);
      c.fillStyle = "#54ad58";
      for (var i = 0; i < 5; i++) {
        var gx = x + ((i * 7 + (t ? 1 : 0)) % (s - 3)) + 1, gy = y + ((i * 5) % (s - 4)) + 2;
        c.fillRect(gx, gy, 2, 3);
      }
    },
    path: function (c, x, y, s) {
      c.fillStyle = "#e6c79c"; c.fillRect(x, y, s, s);
      c.fillStyle = "#d8b487"; c.fillRect(x + 2, y + 3, 3, 2); c.fillRect(x + 9, y + 8, 3, 2);
    },
    water: function (c, x, y, s, t) {
      c.fillStyle = "#3aa0e0"; c.fillRect(x, y, s, s);
      c.fillStyle = "#7fc4ef";
      var off = t ? 3 : 0;
      c.fillRect(x + 1 + off, y + 4, 5, 1); c.fillRect(x + 8 - off, y + 10, 5, 1);
    },
    rock: function (c, x, y, s) {
      c.fillStyle = "#7d8aa0"; c.fillRect(x, y, s, s);
      c.fillStyle = "#5f6b80"; c.fillRect(x, y + s - 4, s, 4);
      c.fillStyle = "#98a4ba"; c.fillRect(x + 2, y + 2, 4, 3);
    },
    floor: function (c, x, y, s) {
      c.fillStyle = "#33405e"; c.fillRect(x, y, s, s);
      c.strokeStyle = "#2a3550"; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
    },
    tree: function (c, x, y, s) {
      A.tiles.grass(c, x, y, s);
      c.fillStyle = "#6b4a2b"; c.fillRect(x + s / 2 - 2, y + s - 6, 4, 6);
      c.fillStyle = "#2e8c46"; c.beginPath(); c.arc(x + s / 2, y + s / 2 - 1, s / 2 - 1, 0, 7); c.fill();
      c.fillStyle = "#3aa657"; c.beginPath(); c.arc(x + s / 2 - 2, y + s / 2 - 3, s / 4, 0, 7); c.fill();
    },
    flower: function (c, x, y, s) {
      A.tiles.grass(c, x, y, s);
      var cx = x + s / 2, cy = y + s / 2;
      c.fillStyle = "#ff6fae";
      [[0,-3],[3,0],[0,3],[-3,0]].forEach(function (d){ c.beginPath(); c.arc(cx+d[0],cy+d[1],2,0,7); c.fill(); });
      c.fillStyle = "#ffd84d"; c.beginPath(); c.arc(cx, cy, 1.6, 0, 7); c.fill();
    }
  };

  // building / area gate (drawn over a few tiles)
  A.drawLab = function (c, x, y, w, h, color) {
    c.fillStyle = "#cdd7ea"; rr(c, x, y, w, h, 3); c.fill();
    c.fillStyle = color || "#46d6c8"; c.fillRect(x, y, w, 6); // roof band
    c.fillStyle = "#26456e"; c.fillRect(x + w / 2 - 5, y + h - 12, 10, 12); // door
    c.fillStyle = "#9fd0ff";
    c.fillRect(x + 4, y + 10, 6, 6); c.fillRect(x + w - 10, y + 10, 6, 6); // windows
  };

  // ---------- CHARACTERS ----------
  // generic person sprite. facing 0=down,1=up,2=left,3=right ; frame for walk bob
  // opts: {shirt, hair, cap} colors
  A.person = function (c, x, y, facing, frame, opts) {
    opts = opts || {};
    var shirt = opts.shirt || "#2f7be0", hair = opts.hair || "#46d6c8", legc = opts.leg || "#26456e";
    var legY = frame ? 1 : 0;
    c.fillStyle = shirt;
    outline(c, function () { rr(c, x + 2, y + 6, 8, 8, 2); }, null, 1.5); c.fill();
    if (opts.coat) { c.fillStyle = hair === "#cbd3df" ? "#46d6c8" : "#fff"; c.fillRect(x + 5.2, y + 6, 1.6, 8); }
    c.fillStyle = legc;
    c.fillRect(x + 3, y + 13, 2, 3 - legY); c.fillRect(x + 7, y + 13, 2, 2 + legY);
    c.fillStyle = "#f1c9a5";
    outline(c, function () { c.beginPath(); c.arc(x + 6, y + 4, 4, 0, 7); c.closePath(); }, null, 1.5); c.fill();
    c.fillStyle = hair;
    c.beginPath(); c.arc(x + 6, y + 3, 4, Math.PI, 0); c.fill();
    c.fillRect(x + 2, y + 2, 8, 2);
    if (opts.bun) { c.beginPath(); c.arc(x + 6, y + 1, 2, 0, 7); c.fill(); }
    if (facing === 1) return; // back
    c.fillStyle = "#15203a";
    if (facing === 2) c.fillRect(x + 4, y + 4, 1.4, 1.4);
    else if (facing === 3) c.fillRect(x + 7.5, y + 4, 1.4, 1.4);
    else { c.fillRect(x + 4, y + 4, 1.4, 1.4); c.fillRect(x + 7.5, y + 4, 1.4, 1.4); }
    if (opts.glasses && facing !== 1) {
      c.strokeStyle = "#15203a"; c.lineWidth = 0.7;
      c.strokeRect(x + 3.6, y + 3.4, 2.2, 1.7); c.strokeRect(x + 6.4, y + 3.4, 2.2, 1.7);
    }
  };
  // player wrapper
  A.player = function (c, x, y, facing, frame) {
    A.person(c, x, y, facing, frame, { shirt: "#2f7be0", hair: "#46d6c8", leg: "#26456e" });
  };

  // Professor Dayhoff (NPC, faces down)
  A.professor = function (c, x, y, frame) {
    c.fillStyle = "#e8eef7"; // lab coat
    outline(c, function () { rr(c, x + 2, y + 6, 9, 9, 2); }, null, 1.5); c.fill();
    c.fillStyle = "#46d6c8"; c.fillRect(x + 6, y + 6, 1.5, 9);
    c.fillStyle = "#f1c9a5";
    outline(c, function () { c.beginPath(); c.arc(x + 6.5, y + 4, 4, 0, 7); c.closePath(); }, null, 1.5); c.fill();
    c.fillStyle = "#cbd3df"; // grey hair bun
    c.beginPath(); c.arc(x + 6.5, y + 2.5, 4, Math.PI, 0); c.fill();
    c.beginPath(); c.arc(x + 6.5, y + 1, 2, 0, 7); c.fill();
    // glasses
    c.strokeStyle = "#15203a"; c.lineWidth = 0.8;
    c.strokeRect(x + 4, y + 3.5, 2, 1.6); c.strokeRect(x + 7, y + 3.5, 2, 1.6);
    c.fillStyle = "#15203a"; c.fillRect(x + 4.6, y + 4, 0.8, 0.8); c.fillRect(x + 7.6, y + 4, 0.8, 0.8);
  };

  // GenoBall (catch ball) — teal/white
  A.ball = function (c, cx, cy, r) {
    c.fillStyle = "#fff"; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
    c.fillStyle = "#46d6c8"; c.beginPath(); c.arc(cx, cy, r, Math.PI, 0); c.fill();
    c.strokeStyle = "#10182c"; c.lineWidth = 1.4;
    c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(cx - r, cy); c.lineTo(cx + r, cy); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(cx, cy, r * 0.34, 0, 7); c.fill();
    c.strokeStyle = "#10182c"; c.beginPath(); c.arc(cx, cy, r * 0.34, 0, 7); c.stroke();
  };

  // ---------- GENOM-MON creatures (~r radius, centered cx,cy) ----------
  // Each: distinct biology-themed original monster. bob: small float offset.
  A.mon = {
    // 1 Specimen — green sample slime with a nucleus
    Numune: function (c, cx, cy, r, bob) {
      cy += bob;
      c.fillStyle = "#5fd089";
      outline(c, function () { c.beginPath(); c.arc(cx, cy, r, 0, 7); c.closePath(); }, null, 2.5); c.fill();
      c.fillStyle = "#3fae6a"; c.beginPath(); c.arc(cx, cy + r * 0.4, r * 0.5, 0, Math.PI); c.fill();
      c.fillStyle = "#2a7d49"; c.beginPath(); c.arc(cx + r * 0.3, cy - r * 0.1, r * 0.28, 0, 7); c.fill(); // nucleus
      eyes(c, cx, cy - r * 0.15, r * 0.4, r * 0.22);
      c.strokeStyle = "#10182c"; c.lineWidth = 1.5;
      c.beginPath(); c.arc(cx, cy + r * 0.25, r * 0.3, 0.1, Math.PI - 0.1); c.stroke();
    },
    // 2 Helicon — DNA helix creature
    Helikon: function (c, cx, cy, r, bob) {
      cy += bob;
      var cols = ["#46d6c8", "#f0b65a", "#d678c8", "#7ad67a"];
      for (var i = -3; i <= 3; i++) {
        var yy = cy + i * (r / 3.2);
        var off = Math.sin(i * 0.9) * r * 0.6;
        c.strokeStyle = "#10182c"; c.lineWidth = 1;
        c.beginPath(); c.moveTo(cx - off, yy); c.lineTo(cx + off, yy); c.stroke();
        c.fillStyle = cols[(i + 3) % 4];
        c.beginPath(); c.arc(cx - off, yy, 2.4, 0, 7); c.fill();
        c.fillStyle = cols[(i + 5) % 4];
        c.beginPath(); c.arc(cx + off, yy, 2.4, 0, 7); c.fill();
      }
      eyes(c, cx, cy - r * 0.55, r * 0.34, r * 0.2);
    },
    // 3 Basor — base-pair block creature
    Bazor: function (c, cx, cy, r, bob) {
      cy += bob;
      c.fillStyle = "#f0b65a";
      outline(c, function () { rr(c, cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, 4); }, null, 2.5); c.fill();
      c.fillStyle = "#10182c"; c.font = "bold " + (r * 0.9) + "px monospace";
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("A", cx, cy + r * 0.45);
      eyes(c, cx, cy - r * 0.35, r * 0.42, r * 0.2);
      // little arms
      c.strokeStyle = "#10182c"; c.lineWidth = 2;
      c.beginPath(); c.moveTo(cx - r * 0.8, cy); c.lineTo(cx - r * 1.2, cy + r * 0.3); c.stroke();
      c.beginPath(); c.moveTo(cx + r * 0.8, cy); c.lineTo(cx + r * 1.2, cy + r * 0.3); c.stroke();
    },
    // 4 Qualitor — shield/quality guardian
    Kalitor: function (c, cx, cy, r, bob) {
      cy += bob;
      c.fillStyle = "#5ad6c0";
      outline(c, function () {
        c.beginPath();
        c.moveTo(cx, cy - r); c.lineTo(cx + r * 0.9, cy - r * 0.5);
        c.lineTo(cx + r * 0.7, cy + r * 0.7); c.lineTo(cx, cy + r);
        c.lineTo(cx - r * 0.7, cy + r * 0.7); c.lineTo(cx - r * 0.9, cy - r * 0.5);
        c.closePath();
      }, null, 2.5); c.fill();
      c.fillStyle = "#fff"; c.font = "bold " + (r * 0.7) + "px monospace";
      c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Q", cx, cy + r * 0.45);
      eyes(c, cx, cy - r * 0.35, r * 0.36, r * 0.18);
    },
    // 5 Contigon — puzzle-piece assembler
    Kontigon: function (c, cx, cy, r, bob) {
      cy += bob;
      c.fillStyle = "#f06a6a";
      outline(c, function () { rr(c, cx - r * 0.9, cy - r * 0.7, r * 1.8, r * 1.4, 3); }, null, 2.5); c.fill();
      c.fillStyle = "#f06a6a"; // puzzle knobs
      c.beginPath(); c.arc(cx + r * 0.9, cy, r * 0.3, 0, 7); c.fill();
      outline(c, function () { c.beginPath(); c.arc(cx + r * 0.9, cy, r * 0.3, -1.4, 1.4); }, null, 2);
      c.fillStyle = "#10182c";
      c.beginPath(); c.arc(cx - r * 0.9, cy, r * 0.3, 1.7, 4.6); c.fill();
      eyes(c, cx, cy - r * 0.2, r * 0.4, r * 0.2);
    },
    // 6 Genix — boss gene-ribbon creature
    Genix: function (c, cx, cy, r, bob) {
      cy += bob;
      c.save();
      c.shadowColor = "#8a7ef0"; c.shadowBlur = 8;
      c.fillStyle = "#8a7ef0";
      outline(c, function () { c.beginPath(); c.arc(cx, cy, r, 0, 7); c.closePath(); }, null, 2.5); c.fill();
      c.restore();
      // codon ribbon
      c.fillStyle = "#c8c0ff";
      ["A","T","G"].forEach(function (b, i) {
        c.fillStyle = ["#46d6c8","#f0b65a","#d678c8"][i];
        rr(c, cx - r * 0.7 + i * r * 0.55, cy + r * 0.2, r * 0.45, r * 0.45, 2); c.fill();
      });
      // crown
      c.fillStyle = "#ffd84d";
      c.beginPath();
      c.moveTo(cx - r * 0.6, cy - r * 0.6); c.lineTo(cx - r * 0.3, cy - r);
      c.lineTo(cx, cy - r * 0.6); c.lineTo(cx + r * 0.3, cy - r); c.lineTo(cx + r * 0.6, cy - r * 0.6);
      c.closePath(); c.fill();
      eyes(c, cx, cy - r * 0.2, r * 0.4, r * 0.18);
    },
    // 7 Pathogen — spiky virus
    Patojen: function (c, cx, cy, r, bob) {
      cy += bob;
      c.strokeStyle = "#2aa0b8"; c.lineWidth = 3;
      for (var i = 0; i < 12; i++) {
        var a = (i / 12) * Math.PI * 2;
        c.beginPath(); c.moveTo(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8);
        c.lineTo(cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 1.25); c.stroke();
        c.fillStyle = "#2aa0b8"; c.beginPath(); c.arc(cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r * 1.3, 2.4, 0, 7); c.fill();
      }
      c.fillStyle = "#46d6c8";
      outline(c, function () { c.beginPath(); c.arc(cx, cy, r * 0.85, 0, 7); c.closePath(); }, null, 2.5); c.fill();
      c.fillStyle = "#2aa0b8";
      [[-0.3,-0.2],[0.35,0.1],[0,0.4]].forEach(function (d) { c.beginPath(); c.arc(cx + d[0]*r, cy + d[1]*r, r*0.16, 0, 7); c.fill(); });
      eyes(c, cx, cy - r * 0.15, r * 0.36, r * 0.2);
    },
    // 8 Phylomon — phylogenetic tree creature
    Filomon: function (c, cx, cy, r, bob) {
      cy += bob;
      c.fillStyle = "#9ad65f";
      outline(c, function () { c.beginPath(); c.arc(cx, cy, r, 0, 7); c.closePath(); }, null, 2.5); c.fill();
      c.strokeStyle = "#3e7d22"; c.lineWidth = 2; c.lineCap = "round";
      c.beginPath(); c.moveTo(cx, cy + r * 0.7); c.lineTo(cx, cy); c.stroke();
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx - r * 0.5, cy - r * 0.3); c.stroke();
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + r * 0.5, cy - r * 0.3); c.stroke();
      c.beginPath(); c.moveTo(cx - r * 0.5, cy - r * 0.3); c.lineTo(cx - r * 0.5, cy - r * 0.7); c.stroke();
      c.beginPath(); c.moveTo(cx + r * 0.5, cy - r * 0.3); c.lineTo(cx + r * 0.5, cy - r * 0.7); c.stroke();
      c.fillStyle = "#3e7d22";
      [[-0.5,-0.7],[0.5,-0.7],[0,0]].forEach(function (d){ c.beginPath(); c.arc(cx + d[0]*r, cy + d[1]*r, 2.6, 0, 7); c.fill(); });
      eyes(c, cx, cy + r * 0.25, r * 0.34, r * 0.18);
    }
  };

  // Badge icon for an area color
  A.badge = function (c, cx, cy, r, color, sym) {
    c.save(); c.shadowColor = color; c.shadowBlur = 6;
    c.fillStyle = color;
    c.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2, rr2 = i % 2 ? r * 0.7 : r;
      c[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2);
    }
    c.closePath(); c.fill(); c.restore();
    c.strokeStyle = "#10182c"; c.lineWidth = 1.4; c.stroke();
    c.fillStyle = "#fff"; c.font = "bold " + (r * 0.9) + "px monospace";
    c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(sym || "★", cx, cy + 0.5);
  };
})(window.GH = window.GH || {});

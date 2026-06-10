/* GenomeHunter Arcade — local leaderboard (+ optional global backend hook) */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});
  var U = A.ui;
  var KEY = "gh_board_v1";

  /* ---- Global backend hook ----
   * The site is static (GitHub Pages), so scores are stored on this device by default.
   * To publish a GLOBAL scoreboard, set A.board.endpoint to a tiny REST endpoint
   * (e.g. a free Supabase/Firebase/Cloudflare-Worker URL) that accepts:
   *   POST {name, level, score}   and   GET -> [{name, level, score}, ...]
   * When endpoint is set, upsert() also POSTs and list() merges the remote top list.
   */
  A.board = {
    endpoint: null,
    remote: [],

    _local: function () {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
    },
    _saveLocal: function (arr) { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {} },

    upsert: function (name, level, score) {
      name = (name || "—").slice(0, 10);
      var arr = this._local();
      var found = false;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].name === name) {
          found = true;
          if (score > arr[i].score) { arr[i].score = score; arr[i].level = level; }
          break;
        }
      }
      if (!found) arr.push({ name: name, level: level, score: score });
      arr.sort(function (a, b) { return b.score - a.score; });
      if (arr.length > 50) arr = arr.slice(0, 50);
      this._saveLocal(arr);

      if (this.endpoint) {
        try {
          fetch(this.endpoint, { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, level: level, score: score }) }).catch(function () {});
          this.refresh();
        } catch (e) {}
      }
    },

    refresh: function () {
      if (!this.endpoint) return;
      var self = this;
      fetch(this.endpoint).then(function (r) { return r.json(); })
        .then(function (j) { if (Array.isArray(j)) self.remote = j; }).catch(function () {});
    },

    list: function () {
      var arr = this._local().slice();
      if (this.remote && this.remote.length) {
        // merge remote (dedupe by name keeping higher score)
        var map = {};
        arr.concat(this.remote).forEach(function (e) {
          if (!map[e.name] || e.score > map[e.name].score) map[e.name] = e;
        });
        arr = Object.keys(map).map(function (k) { return map[k]; });
      }
      arr.sort(function (a, b) { return b.score - a.score; });
      return arr.slice(0, 10);
    }
  };

  A.ScoreboardScene = function (fromTitle) { this.fromTitle = fromTitle; this.t = 0; };
  A.ScoreboardScene.prototype.enter = function () { A.board.refresh(); };
  A.ScoreboardScene.prototype.update = function (dt) {
    this.t += dt;
    if (A.pressed("back") || A.pressed("confirm") || A.pointer.clicked) {
      var self = this;
      A.transition(function () { A.replace(new A.TitleScene()); });
    }
  };
  A.ScoreboardScene.prototype.render = function (c) {
    var W = A.W, H = A.H;
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#101a36"); g.addColorStop(1, "#1d2c52");
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    U.textO(c, "🏆 " + A.t("sb_title"), W / 2, 30, 20, "#ffd84d", "center");
    U.text(c, A.t("sb_scoreboard"), W / 2, 48, 12, "#9fb3d6", "center");

    var list = A.board.list();
    var x = 50, y = 70, rowH = 17;
    U.text(c, A.t("sb_rank"), x, y, 11, "#9fb3d6"); U.text(c, A.t("sb_name"), x + 28, y, 11, "#9fb3d6");
    U.text(c, A.t("sb_level"), x + 200, y, 11, "#9fb3d6"); U.text(c, A.t("sb_score"), W - 50, y, 11, "#9fb3d6", "right");
    y += 6;
    if (!list.length) {
      U.text(c, A.t("sb_no_scores"), W / 2, 130, 12, "#cdd7ea", "center");
    } else {
      for (var i = 0; i < list.length; i++) {
        var e = list[i], ry = y + 12 + i * rowH;
        var me = e.name === A.save.name;
        if (me) { c.fillStyle = "rgba(70,214,200,0.14)"; U.rr(c, x - 6, ry - 12, W - 2 * (x - 6), rowH - 2, 4); c.fill(); }
        var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1) + ".";
        U.text(c, medal, x, ry, 12, "#fff");
        U.text(c, e.name, x + 28, ry, 12, me ? "#46d6c8" : "#eaf2ff");
        U.text(c, String(e.level), x + 200, ry, 12, "#cdd7ea");
        U.text(c, String(e.score), W - 50, ry, 12, "#ffd84d", "right");
      }
    }
    U.text(c, A.t("sb_global_note"), W / 2, H - 26, 9, "#6b7da0", "center");
    if (Math.floor(this.t * 2) % 2 === 0) U.textO(c, GH.i18n.lang === "tr" ? "◀ Geri (X)" : "◀ Back (X)", W / 2, H - 10, 11, "#46d6c8", "center");
  };
})(window.GH = window.GH || {});

/* GenomeHunter — core engine: state, screens, level manager */
(function (GH) {
  "use strict";

  var t = function (k) { return GH.i18n.t(k); };

  // ---- Level metadata (mount fns are registered by level files into GH._levelMounts) ----
  var LEVELS = [
    { id: 1, key: "l1", icon: "🧪", mentor: "miescher",  ability: { tr: "Örnekleme Gözü", en: "Sampling Eye" }, color: "#7ad67a" },
    { id: 2, key: "l2", icon: "🧬", mentor: "franklin",  ability: { tr: "Pipet Ustası",  en: "Pipette Master" }, color: "#d678c8" },
    { id: 3, key: "l3", icon: "⚡", mentor: "sanger",    ability: { tr: "Sekans Refleksi", en: "Sequence Reflex" }, color: "#f0b65a" },
    { id: 4, key: "l4", icon: "🛡️", mentor: "green",     ability: { tr: "Kalite Kalkanı", en: "Quality Shield" }, color: "#5ad6c0" },
    { id: 5, key: "l5", icon: "🧩", mentor: "myers",     ability: { tr: "Assembly Dehası", en: "Assembly Genius" }, color: "#f06a6a" },
    { id: 6, key: "l6", icon: "🔎", mentor: "birney",    ability: { tr: "Gen Avcısı",     en: "Gene Hunter" }, color: "#8a7ef0" }
  ];
  GH.LEVELS = LEVELS;
  GH._levelMounts = {}; // id -> mount(root, ctx)

  // ---- Persistent state ----
  var state = {
    organism: null,
    unlocked: 1,      // highest level the player can enter
    scores: {},       // levelId -> best score
    stars: {}         // levelId -> best stars
  };

  function save() {
    try { localStorage.setItem("gh_state", JSON.stringify(state)); } catch (e) {}
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem("gh_state"));
      if (s && typeof s === "object") {
        state.organism = s.organism || null;
        state.unlocked = s.unlocked || 1;
        state.scores = s.scores || {};
        state.stars = s.stars || {};
      }
    } catch (e) {}
  }

  GH.state = state;

  // ---- DOM helpers ----
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  GH.el = el;

  var app;
  function mountScreen(node) {
    app.innerHTML = "";
    app.appendChild(node);
    window.scrollTo(0, 0);
  }

  function totalScore() {
    var s = 0;
    for (var k in state.scores) if (state.scores.hasOwnProperty(k)) s += state.scores[k];
    return s;
  }

  // ---- Top bar (language + mute) ----
  function topBar() {
    var bar = el("div", "gh-topbar");
    var brand = el("div", "gh-brand", "🧬 GenomeHunter");
    brand.onclick = function () { screenHome(); };
    var right = el("div", "gh-topbar-right");

    var langBtn = el("button", "gh-chip", GH.i18n.lang === "tr" ? "EN" : "TR");
    langBtn.title = "Language / Dil";
    langBtn.onclick = function () {
      GH.audio.click();
      GH.i18n.set(GH.i18n.lang === "tr" ? "en" : "tr");
      // re-render current screen
      GH._render && GH._render();
    };

    var muteBtn = el("button", "gh-chip", GH.audio.isMuted() ? "🔇" : "🔊");
    muteBtn.onclick = function () {
      var m = GH.audio.toggle();
      muteBtn.textContent = m ? "🔇" : "🔊";
    };

    right.appendChild(langBtn);
    right.appendChild(muteBtn);
    bar.appendChild(brand);
    bar.appendChild(right);
    return bar;
  }

  // ===================== SCREENS =====================

  function screenHome() {
    GH._render = screenHome;
    var root = el("div", "gh-screen gh-home");
    root.appendChild(topBar());

    var hero = el("div", "gh-hero");
    hero.appendChild(el("div", "gh-dna-strip", dnaStrip()));
    hero.appendChild(el("h1", "gh-title", t("title")));
    hero.appendChild(el("p", "gh-subtitle", t("subtitle")));

    var card = el("div", "gh-mentor-card gh-home-mentor");
    card.innerHTML =
      '<div class="gh-avatar">' + GH.characters.dayhoff.avatar + "</div>" +
      '<div class="gh-mentor-text"><strong>' + GH.characters.dayhoff.name + "</strong>" +
      "<span>" + GH.characters.dayhoff.role[GH.i18n.lang] + "</span>" +
      "<p>" + t("tagline") + "</p></div>";
    hero.appendChild(card);

    var btns = el("div", "gh-btn-row");
    var startBtn = el("button", "gh-btn gh-btn-primary", "🚀 " + t("start"));
    startBtn.onclick = function () { GH.audio.click(); screenOrganism(); };
    btns.appendChild(startBtn);

    if (state.organism && state.unlocked > 1) {
      var contBtn = el("button", "gh-btn", "▶ " + t("continue"));
      contBtn.onclick = function () { GH.audio.click(); screenMap(); };
      btns.appendChild(contBtn);

      var resetBtn = el("button", "gh-btn gh-btn-ghost", "↺ " + t("reset"));
      resetBtn.onclick = function () {
        GH.audio.click();
        state.organism = null; state.unlocked = 1; state.scores = {}; state.stars = {};
        save(); screenHome();
      };
      btns.appendChild(resetBtn);
    }
    hero.appendChild(btns);
    root.appendChild(hero);
    root.appendChild(footer());
    mountScreen(root);
  }

  function screenOrganism() {
    GH._render = screenOrganism;
    var root = el("div", "gh-screen");
    root.appendChild(topBar());
    var wrap = el("div", "gh-content");
    wrap.appendChild(el("h2", "gh-h2", t("choose_organism")));
    wrap.appendChild(el("p", "gh-hint", t("organism_hint")));

    var organisms = [
      { id: "virus", emoji: "🦠", name: "virus", desc: "virus_desc", diff: 1 },
      { id: "bacteria", emoji: "🔬", name: "bacteria", desc: "bacteria_desc", diff: 2 },
      { id: "fungus", emoji: "🍄", name: "fungus", desc: "fungus_desc", diff: 3 },
      { id: "human", emoji: "🧑", name: "human", desc: "human_desc", diff: 4 }
    ];
    var grid = el("div", "gh-org-grid");
    organisms.forEach(function (o) {
      var c = el("button", "gh-org-card");
      c.innerHTML =
        '<div class="gh-org-emoji">' + o.emoji + "</div>" +
        "<h3>" + t(o.name) + "</h3>" +
        '<p>' + t(o.desc) + "</p>" +
        '<div class="gh-diff">' + Array(o.diff + 1).join("★") + Array(5 - o.diff).join("☆") + "</div>";
      c.onclick = function () {
        GH.audio.good();
        state.organism = o.id;
        state.organismDiff = o.diff;
        if (state.unlocked < 1) state.unlocked = 1;
        save();
        screenMap();
      };
      grid.appendChild(c);
    });
    wrap.appendChild(grid);
    root.appendChild(wrap);
    mountScreen(root);
  }

  function screenMap() {
    GH._render = screenMap;
    var root = el("div", "gh-screen");
    root.appendChild(topBar());
    var wrap = el("div", "gh-content");
    wrap.appendChild(el("h2", "gh-h2", t("map_title")));
    wrap.appendChild(el("p", "gh-hint", t("map_hint")));

    var path = el("div", "gh-path");
    LEVELS.forEach(function (lv, i) {
      var unlocked = lv.id <= state.unlocked;
      var done = state.stars[lv.id] != null;
      var node = el("div", "gh-node" + (unlocked ? "" : " gh-node-locked") + (done ? " gh-node-done" : ""));
      node.style.setProperty("--accent", lv.color);
      var stars = state.stars[lv.id] || 0;
      node.innerHTML =
        '<div class="gh-node-icon">' + (unlocked ? lv.icon : "🔒") + "</div>" +
        '<div class="gh-node-body">' +
        '<span class="gh-node-num">' + t("level") + " " + lv.id + "</span>" +
        "<strong>" + t(lv.key + "_name") + "</strong>" +
        '<small>' + t(lv.key + "_mech") + "</small>" +
        (done ? '<div class="gh-stars">' + starStr(stars) + "</div>" : "") +
        "</div>";
      if (unlocked) {
        node.onclick = function () { GH.audio.click(); screenLevelIntro(lv); };
      }
      path.appendChild(node);
      if (i < LEVELS.length - 1) path.appendChild(el("div", "gh-connector" + (lv.id < state.unlocked ? " gh-connector-on" : "")));
    });
    wrap.appendChild(path);

    wrap.appendChild(abilitiesPanel());
    root.appendChild(wrap);
    mountScreen(root);
  }

  function abilitiesPanel() {
    var p = el("div", "gh-abilities");
    p.appendChild(el("h3", "gh-h3", "🏅 " + t("your_abilities")));
    var list = el("div", "gh-ability-list");
    var any = false;
    LEVELS.forEach(function (lv) {
      if (state.stars[lv.id] != null) {
        any = true;
        var chip = el("span", "gh-ability-chip");
        chip.style.setProperty("--accent", lv.color);
        chip.innerHTML = lv.icon + " " + lv.ability[GH.i18n.lang];
        list.appendChild(chip);
      }
    });
    if (!any) list.appendChild(el("span", "gh-hint", t("no_abilities")));
    p.appendChild(list);
    return p;
  }

  function screenLevelIntro(lv) {
    GH._render = function () { screenLevelIntro(lv); };
    var m = GH.characters[lv.mentor];
    var root = el("div", "gh-screen");
    root.appendChild(topBar());
    var wrap = el("div", "gh-content gh-level-intro");
    wrap.appendChild(el("div", "gh-level-badge", lv.icon + " " + t("level") + " " + lv.id));
    wrap.appendChild(el("h2", "gh-h2", t(lv.key + "_name")));

    var card = el("div", "gh-mentor-card");
    card.style.setProperty("--accent", lv.color);
    card.innerHTML =
      '<div class="gh-avatar">' + m.avatar + "</div>" +
      '<div class="gh-mentor-text"><span class="gh-mentor-label">' + t("mentor") + "</span>" +
      "<strong>" + m.name + " <small>(" + m.years + ")</small></strong>" +
      "<em>" + m.role[GH.i18n.lang] + "</em>" +
      "<p>" + m.fact[GH.i18n.lang] + "</p></div>";
    wrap.appendChild(card);

    wrap.appendChild(el("div", "gh-task", "🎯 " + t(lv.key + "_intro")));

    var row = el("div", "gh-btn-row");
    var back = el("button", "gh-btn gh-btn-ghost", "← " + t("back"));
    back.onclick = function () { GH.audio.click(); screenMap(); };
    var go = el("button", "gh-btn gh-btn-primary", t("begin_level") + " →");
    go.onclick = function () { GH.audio.click(); playLevel(lv); };
    row.appendChild(back); row.appendChild(go);
    wrap.appendChild(row);
    root.appendChild(wrap);
    mountScreen(root);
  }

  function playLevel(lv) {
    var root = el("div", "gh-screen gh-play");
    var hud = el("div", "gh-hud");
    hud.innerHTML =
      '<button class="gh-chip gh-back-chip">←</button>' +
      '<span class="gh-hud-title">' + lv.icon + " " + t(lv.key + "_name") + "</span>" +
      '<span class="gh-hud-stat" id="gh-hud-stat"></span>';
    hud.querySelector(".gh-back-chip").onclick = function () { GH.audio.click(); screenMap(); };
    root.appendChild(hud);

    var stage = el("div", "gh-stage");
    root.appendChild(stage);
    mountScreen(root);

    var mount = GH._levelMounts[lv.id];
    if (!mount) {
      stage.appendChild(el("div", "gh-hint", "Level not loaded."));
      return;
    }

    var ctx = {
      lv: lv,
      organism: state.organism,
      diff: state.organismDiff || 2,
      t: t,
      el: el,
      setHud: function (html) { var s = document.getElementById("gh-hud-stat"); if (s) s.innerHTML = html; },
      complete: function (result) { onLevelComplete(lv, result); }
    };
    mount(stage, ctx);
  }

  function onLevelComplete(lv, result) {
    result = result || {};
    var score = Math.max(0, Math.round(result.score || 0));
    var stars = result.stars != null ? result.stars : 1;
    var passed = result.passed !== false;

    if (passed) {
      GH.audio.win();
      if (!state.scores[lv.id] || score > state.scores[lv.id]) state.scores[lv.id] = score;
      if (state.stars[lv.id] == null || stars > state.stars[lv.id]) state.stars[lv.id] = stars;
      if (state.unlocked <= lv.id) state.unlocked = lv.id + 1;
      save();
    } else {
      GH.audio.fail();
    }
    screenResult(lv, score, stars, passed);
  }

  function screenResult(lv, score, stars, passed) {
    // Last level finished => certificate
    if (passed && lv.id === LEVELS.length) { screenCertificate(); return; }

    var root = el("div", "gh-screen");
    root.appendChild(topBar());
    var wrap = el("div", "gh-content gh-result");
    wrap.appendChild(el("div", "gh-result-emoji", passed ? "🎉" : "💪"));
    wrap.appendChild(el("h2", "gh-h2", passed ? t("level_complete") : t("level_failed")));

    if (passed) {
      wrap.appendChild(el("div", "gh-big-stars", starStr(stars)));
      wrap.appendChild(el("div", "gh-score-line", t("score") + ": " + score));

      var ab = el("div", "gh-ability-unlock");
      ab.style.setProperty("--accent", lv.color);
      ab.innerHTML = "🏅 " + t("ability_unlocked") + "<strong>" + lv.icon + " " + lv.ability[GH.i18n.lang] + "</strong>";
      wrap.appendChild(ab);
    } else {
      wrap.appendChild(el("div", "gh-score-line", t("score") + ": " + score));
    }

    var row = el("div", "gh-btn-row");
    var replay = el("button", "gh-btn gh-btn-ghost", "↻ " + t("replay"));
    replay.onclick = function () { GH.audio.click(); playLevel(lv); };
    row.appendChild(replay);

    if (passed) {
      var nextLv = LEVELS[lv.id]; // id is 1-based; next index = lv.id
      var nextBtn = el("button", "gh-btn gh-btn-primary", t("next") + " →");
      nextBtn.onclick = function () { GH.audio.click(); nextLv ? screenLevelIntro(nextLv) : screenMap(); };
      row.appendChild(nextBtn);
    }
    var mapBtn = el("button", "gh-btn", "🗺️");
    mapBtn.title = t("map_title");
    mapBtn.onclick = function () { GH.audio.click(); screenMap(); };
    row.appendChild(mapBtn);

    wrap.appendChild(row);
    root.appendChild(wrap);
    mountScreen(root);
  }

  function screenCertificate() {
    GH._render = screenCertificate;
    GH.audio.win();
    var root = el("div", "gh-screen");
    root.appendChild(topBar());
    var wrap = el("div", "gh-content gh-cert-wrap");

    var cert = el("div", "gh-cert");
    cert.innerHTML =
      '<div class="gh-cert-border">' +
      '<div class="gh-cert-seal">🧬</div>' +
      "<h2>" + t("certificate") + "</h2>" +
      '<div class="gh-cert-org">' + organismName() + "</div>" +
      "<p>" + t("cert_body") + "</p>" +
      '<div class="gh-cert-abilities">' +
        LEVELS.map(function (l) { return '<span class="gh-ability-chip" style="--accent:' + l.color + '">' + l.icon + " " + l.ability[GH.i18n.lang] + "</span>"; }).join("") +
      "</div>" +
      '<div class="gh-cert-score">' + t("cert_total") + ": <strong>" + totalScore() + "</strong></div>" +
      '<div class="gh-cert-sign">' + t("cert_signed") + "</div>" +
      "</div>";
    wrap.appendChild(cert);

    var row = el("div", "gh-btn-row");
    var printBtn = el("button", "gh-btn gh-btn-primary", "🖨️ " + t("print_cert"));
    printBtn.onclick = function () { GH.audio.click(); window.print(); };
    var againBtn = el("button", "gh-btn", "🔁 " + t("play_again"));
    againBtn.onclick = function () { GH.audio.click(); screenMap(); };
    row.appendChild(printBtn); row.appendChild(againBtn);
    wrap.appendChild(row);
    root.appendChild(wrap);
    mountScreen(root);
    confettiBurst();
  }

  // ---- small visuals/util ----
  function organismName() {
    var map = { virus: "virus", bacteria: "bacteria", fungus: "fungus", human: "human" };
    return state.organism ? t(map[state.organism]) : "";
  }
  function starStr(n) {
    n = Math.max(0, Math.min(3, n));
    return Array(n + 1).join("⭐") + Array(4 - n).join("☆");
  }
  GH.starStr = starStr;

  function dnaStrip() {
    var bases = "ATGCTAGCGATCGTACGATCGGCTAACGTAGCTAGGCATCGTAGC";
    var colors = { A: "#46d6c8", T: "#f0b65a", G: "#d678c8", C: "#7ad67a" };
    var html = "";
    for (var i = 0; i < bases.length; i++) {
      var b = bases[i];
      html += '<span class="gh-base" style="color:' + colors[b] + ';animation-delay:' + (i * 40) + 'ms">' + b + "</span>";
    }
    return html;
  }

  function footer() {
    var f = el("div", "gh-footer");
    f.innerHTML = "Margaret Dayhoff · Friedrich Miescher · Rosalind Franklin · Frederick Sanger · Phil Green · Gene Myers · Ewan Birney";
    return f;
  }

  function confettiBurst() {
    var c = el("canvas", "gh-confetti");
    document.body.appendChild(c);
    var dpr = window.devicePixelRatio || 1;
    function size() { c.width = innerWidth * dpr; c.height = innerHeight * dpr; }
    size();
    var g = c.getContext("2d");
    var cols = ["#46d6c8", "#f0b65a", "#d678c8", "#7ad67a", "#f06a6a", "#8a7ef0"];
    var P = [];
    for (var i = 0; i < 140; i++) {
      P.push({ x: Math.random() * c.width, y: -Math.random() * c.height, vy: (2 + Math.random() * 4) * dpr,
        vx: (Math.random() - 0.5) * 3 * dpr, s: (4 + Math.random() * 6) * dpr, col: cols[i % cols.length], r: Math.random() * 6 });
    }
    var frames = 0;
    (function loop() {
      frames++;
      g.clearRect(0, 0, c.width, c.height);
      P.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.r += 0.1;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.col;
        g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); g.restore();
      });
      if (frames < 200) requestAnimationFrame(loop);
      else if (c.parentNode) c.parentNode.removeChild(c);
    })();
  }
  GH.confetti = confettiBurst;

  // ---- boot ----
  GH.boot = function () {
    GH.i18n.init();
    load();
    app = document.getElementById("app");
    screenHome();
  };
})(window.GH = window.GH || {});

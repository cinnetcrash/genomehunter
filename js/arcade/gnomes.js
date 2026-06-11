/* GenomeHunter Arcade — G-nome species: stats, types, abilities, collection */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});

  // ---- abilities (signature powers, like a card game) ----
  // applied to a BattleScene at setup via apply(battle)
  A.ABILITIES = {
    swift:  { name: { tr: "Hızlı",     en: "Swift" },  desc: { tr: "+5 sn süre",            en: "+5s time" },         apply: function (b) { b.timeMax += 5; b.time += 5; } },
    tough:  { name: { tr: "Dayanıklı", en: "Tough" },  desc: { tr: "+1 kalp",               en: "+1 heart" },         apply: function (b) { b.maxHearts += 1; b.hearts += 1; } },
    sharp:  { name: { tr: "Keskin",    en: "Sharp" },  desc: { tr: "Skor +%50",             en: "+50% score" },       apply: function (b) { b.scoreMul = (b.scoreMul || 1) * 1.5; } },
    lucky:  { name: { tr: "Şanslı",    en: "Lucky" },  desc: { tr: "İlk yanlış bedava",     en: "First miss is free" }, apply: function (b) { b.shield = (b.shield || 0) + 1; } },
    healer: { name: { tr: "Onarıcı",   en: "Healer" }, desc: { tr: "1 kalpte iyileşir (1x)", en: "Heal once at 1 HP" }, apply: function (b) { b.healReady = true; } }
  };

  A.RARITY = {
    common:    { stars: 1, name: { tr: "Yaygın",   en: "Common" },    color: "#9fb3d6", weight: 50 },
    uncommon:  { stars: 2, name: { tr: "Sıradışı", en: "Uncommon" },  color: "#7ad67a", weight: 28 },
    rare:      { stars: 3, name: { tr: "Nadir",    en: "Rare" },      color: "#5ab0e8", weight: 14 },
    epic:      { stars: 4, name: { tr: "Destansı", en: "Epic" },      color: "#d678c8", weight: 6 },
    legendary: { stars: 5, name: { tr: "Efsane",   en: "Legendary" }, color: "#ffd84d", weight: 2 }
  };

  // ---- species roster (sprite = A.mon key) ----
  // stats 1..5 : atk (damage/score), sta (toughness/hearts), spd (time)
  A.SPECIES = [
    { id: "helikon",   sprite: "Helikon",   type: "DNA",     rar: "common",    atk: 3, sta: 3, spd: 3, ability: "swift",  name: { tr: "Helikon", en: "Helicon" } },
    { id: "bazor",     sprite: "Bazor",     type: "DNA",     rar: "common",    atk: 2, sta: 4, spd: 2, ability: "tough",  name: { tr: "Bazor", en: "Basor" } },
    { id: "numune",    sprite: "Numune",    type: "MICROBE", rar: "common",    atk: 2, sta: 3, spd: 3, ability: "lucky",  name: { tr: "Numune", en: "Specimen" } },
    { id: "plazmiton", sprite: "Plazmiton", type: "DNA",     rar: "uncommon",  atk: 3, sta: 2, spd: 4, ability: "swift",  name: { tr: "Plazmiton", en: "Plasmiton" } },
    { id: "ribozom",   sprite: "Ribozom",   type: "RNA",     rar: "uncommon",  atk: 2, sta: 3, spd: 3, ability: "sharp",  name: { tr: "Ribozom", en: "Ribosom" } },
    { id: "enzimon",   sprite: "Enzimon",   type: "PROT",    rar: "uncommon",  atk: 4, sta: 2, spd: 3, ability: "sharp",  name: { tr: "Enzimon", en: "Enzymon" } },
    { id: "filomon",   sprite: "Filomon",   type: "MICROBE", rar: "uncommon",  atk: 3, sta: 3, spd: 4, ability: "swift",  name: { tr: "Filomon", en: "Phylomon" } },
    { id: "kalitor",   sprite: "Kalitor",   type: "DATA",    rar: "rare",      atk: 3, sta: 4, spd: 2, ability: "healer", name: { tr: "Kalitor", en: "Qualitor" } },
    { id: "kontigon",  sprite: "Kontigon",  type: "DATA",    rar: "rare",      atk: 4, sta: 3, spd: 3, ability: "lucky",  name: { tr: "Kontigon", en: "Contigon" } },
    { id: "patojen",   sprite: "Patojen",   type: "VIRUS",   rar: "rare",      atk: 5, sta: 2, spd: 4, ability: "sharp",  name: { tr: "Patojen", en: "Pathogen" } },
    { id: "kromozor",  sprite: "Kromozor",  type: "DNA",     rar: "epic",      atk: 4, sta: 5, spd: 2, ability: "tough",  name: { tr: "Kromozor", en: "Chromozor" } },
    { id: "genix",     sprite: "Genix",     type: "PROT",    rar: "legendary", atk: 5, sta: 5, spd: 4, ability: "healer", name: { tr: "Genix", en: "Genix" } }
  ];

  A.speciesById = function (id) { for (var i = 0; i < A.SPECIES.length; i++) if (A.SPECIES[i].id === id) return A.SPECIES[i]; return A.SPECIES[0]; };

  // weighted wild pick; higher level lets rarer species appear
  A.rollWild = function (level, boss) {
    var pool = A.SPECIES.filter(function (s) {
      var st = A.RARITY[s.rar].stars;
      if (boss) return st >= 4 || level >= 100;        // bosses skew strong
      // unlock rarities by level
      if (st === 5) return level >= 200;
      if (st === 4) return level >= 80;
      if (st === 3) return level >= 25;
      return true;
    });
    if (boss) { var strong = pool.filter(function (s) { return A.RARITY[s.rar].stars >= 4; }); if (strong.length) pool = strong; }
    var total = 0, weights = pool.map(function (s) { var w = A.RARITY[s.rar].weight; total += w; return w; });
    var r = Math.random() * total;
    for (var i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  };

  // ---- collection (save.collection: {id:count}, save.active: id) ----
  A.collection = {
    has: function (id) { return A.save.collection && A.save.collection[id] > 0; },
    count: function (id) { return (A.save.collection && A.save.collection[id]) || 0; },
    add: function (id) {
      if (!A.save.collection) A.save.collection = {};
      A.save.collection[id] = (A.save.collection[id] || 0) + 1;
      if (!A.save.active) A.save.active = id;
      A.persist();
    },
    setActive: function (id) { if (A.collection.has(id)) { A.save.active = id; A.persist(); } },
    activeSpecies: function () { return A.speciesById(A.save.active || (A.save.collection && Object.keys(A.save.collection)[0]) || "helikon"); },
    owned: function () { return A.SPECIES.filter(function (s) { return A.collection.has(s.id); }); },
    grantStarter: function () { if (!A.save.collection || !Object.keys(A.save.collection).length) { A.collection.add("helikon"); A.save.active = "helikon"; A.persist(); } }
  };

  // bonuses the ACTIVE g-nome grants in battle (besides its ability)
  A.activeBonuses = function () {
    var s = A.collection.activeSpecies();
    return {
      species: s,
      bonusHearts: Math.floor(s.sta / 3),       // 0..1
      bonusTime: s.spd,                          // +seconds
      scoreMul: 1 + s.atk * 0.12                 // up to ~1.6x
    };
  };
})(window.GH = window.GH || {});

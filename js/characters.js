/* GenomeHunter — Characters (real bioinformatics & molecular biology pioneers) */
(function (GH) {
  "use strict";

  // Simple inline-SVG avatar generator: stylized scientist badge.
  function avatar(skin, hair, coat, accent) {
    return (
      '<svg viewBox="0 0 100 100" class="gh-avatar-svg" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="48" fill="' + accent + '" opacity="0.18"/>' +
      '<circle cx="50" cy="50" r="40" fill="#0c1830"/>' +
      // coat / shoulders
      '<path d="M22 92 Q50 64 78 92 Z" fill="' + coat + '"/>' +
      '<rect x="46" y="68" width="8" height="20" fill="' + accent + '"/>' +
      // head
      '<circle cx="50" cy="48" r="18" fill="' + skin + '"/>' +
      // hair
      '<path d="M32 46 Q34 26 50 26 Q66 26 68 46 Q60 36 50 36 Q40 36 32 46 Z" fill="' + hair + '"/>' +
      // glasses
      '<circle cx="43" cy="48" r="5" fill="none" stroke="' + accent + '" stroke-width="2"/>' +
      '<circle cx="57" cy="48" r="5" fill="none" stroke="' + accent + '" stroke-width="2"/>' +
      '<line x1="48" y1="48" x2="52" y2="48" stroke="' + accent + '" stroke-width="2"/>' +
      // smile
      '<path d="M44 57 Q50 62 56 57" fill="none" stroke="#5a3825" stroke-width="2" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  GH.characters = {
    dayhoff: {
      name: "Margaret Dayhoff",
      years: "1925–1983",
      role: { tr: "Ana Rehber — Biyoinformatiğin Kurucusu", en: "Main Guide — Founder of Bioinformatics" },
      fact: {
        tr: "Biyoinformatiğin annesi sayılır. İlk protein dizisi veritabanını (Atlas) oluşturdu ve protein evrimini ölçmek için PAM matrislerini geliştirdi. Tek harfli amino asit kodunu da o yaygınlaştırdı!",
        en: "Considered the mother of bioinformatics. She built the first protein sequence database (the Atlas) and created the PAM matrices to measure protein evolution. She also popularized the one-letter amino-acid code!"
      },
      avatar: avatar("#f1c9a5", "#6b4a2b", "#e8eef7", "#46d6c8")
    },
    miescher: {
      name: "Friedrich Miescher",
      years: "1844–1895",
      role: { tr: "Ekstraksiyon Mentoru — DNA'yı Keşfeden", en: "Extraction Mentor — Discovered DNA" },
      fact: {
        tr: "1869'da hücre çekirdeğinden ilk kez 'nüklein' adını verdiği maddeyi (DNA) ayırdı. Yani bugün yaptığın DNA ekstraksiyonunun atası odur!",
        en: "In 1869 he first isolated 'nuclein' (DNA) from cell nuclei. He is the ancestor of the DNA extraction you are doing today!"
      },
      avatar: avatar("#f0c6a0", "#3a2a1a", "#dfe6f2", "#7ad67a")
    },
    franklin: {
      name: "Rosalind Franklin",
      years: "1920–1958",
      role: { tr: "Yapı Uzmanı — Foto 51", en: "Structure Expert — Photo 51" },
      fact: {
        tr: "X-ışını kırınımıyla çektiği ünlü 'Foto 51', DNA'nın çift sarmal yapısını çözmenin anahtarıydı. DNA'nın şeklini ona borçluyuz.",
        en: "Her famous X-ray image 'Photo 51' was the key to solving DNA's double-helix structure. We owe the shape of DNA to her."
      },
      avatar: avatar("#f2cdaa", "#2b2b2b", "#e6ecf6", "#d678c8")
    },
    sanger: {
      name: "Frederick Sanger",
      years: "1918–2013",
      role: { tr: "Dizileme Mentoru — Sanger Yöntemi", en: "Sequencing Mentor — Sanger Method" },
      fact: {
        tr: "DNA dizileme yöntemini icat etti (Sanger sekanslama) ve bununla bir Nobel kazandı. Aslında iki kez Nobel kazanan ender bilim insanlarından biridir!",
        en: "He invented DNA sequencing (Sanger sequencing) and won a Nobel for it. He is one of the rare scientists to win the Nobel twice!"
      },
      avatar: avatar("#f3d0ad", "#cfcfcf", "#e3ebf5", "#f0b65a")
    },
    green: {
      name: "Phil Green",
      years: "1952–",
      role: { tr: "Kalite Mentoru — Phred Skoru", en: "Quality Mentor — Phred Score" },
      fact: {
        tr: "Her bazın ne kadar güvenilir okunduğunu söyleyen 'Phred kalite skoru'nu geliştirdi. Q30 demek, bin bazda sadece bir hata olması demektir!",
        en: "He developed the 'Phred quality score' that tells how reliable each base call is. Q30 means just one error in a thousand bases!"
      },
      avatar: avatar("#eebf99", "#4a3520", "#dde5f1", "#5ad6c0")
    },
    myers: {
      name: "Gene Myers",
      years: "1953–",
      role: { tr: "Assembly Mentoru — BLAST & Assembler", en: "Assembly Mentor — BLAST & Assemblers" },
      fact: {
        tr: "Dünyanın en çok kullanılan arama aracı BLAST'in geliştiricilerinden biri ve insan genomunu birleştiren shotgun assembly algoritmalarının mimarı.",
        en: "A co-author of BLAST, the world's most used search tool, and the architect of the shotgun assembly algorithms that pieced together the human genome."
      },
      avatar: avatar("#f1c8a3", "#5a4326", "#e1e9f4", "#f06a6a")
    },
    birney: {
      name: "Ewan Birney",
      years: "1972–",
      role: { tr: "Anotasyon Mentoru — Ensembl", en: "Annotation Mentor — Ensembl" },
      fact: {
        tr: "Genomdaki genleri bulup etiketleyen Ensembl projesinin lideri. Yani ham dizideki 'anlamı' bulmamızı sağlar.",
        en: "Leader of the Ensembl project that finds and labels genes in genomes — he helps us find the 'meaning' in raw sequence."
      },
      avatar: avatar("#f0c6a0", "#2f2418", "#e4ecf6", "#8a7ef0")
    }
  };
})(window.GH = window.GH || {});

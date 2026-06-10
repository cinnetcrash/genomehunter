# GenomeHunter — Tasarım Dokümanı

**Tarih:** 2026-06-10
**Sahibi:** Gültekin Ünal

## Amaç
Çocuklar (yaklaşık 9–14 yaş) için, tarayıcıdan oynanan, biyoinformatik boru hattını
baştan sona eğlenceli ve aksiyon dolu mini-oyunlarla öğreten bir eğitim oyunu.
GitHub Pages üzerinden herkese açık yayınlanacak.

## Pedagojik akış (oyunun seviyeleri)
Gerçek bir genom projesinin adımlarını takip eder:

1. **Örnek Toplama** — doğru organizmadan doğru örneği topla (kan, toprak, sürüntü...).
2. **DNA Ekstraksiyonu** — hücreyi parçala, DNA'yı bağla–yıka–çöz (doğru sırada).
3. **Dizileme (Sequencing)** — baz tamamlama / kromatogram okuma, aksiyonlu eşleştirme.
4. **Kalite Kontrolü (QC)** — düşük kaliteli bazları kırp (Phred skoru kavramı).
5. **Assembly** — örtüşen okumaları (reads) birleştirip contig oluştur.
6. **Anotasyon** — birleşmiş genomda genleri (ORF: start→stop) bul.

Final: Tamamlanmış genom + "Genom Avcısı" sertifikası.

## Karakterler (gerçek bilim insanları)
- **Margaret Dayhoff** — ana rehber; biyoinformatiğin kurucusu, ilk protein veritabanı, PAM matrisi.
- **Friedrich Miescher** — DNA'yı (nüklein) ilk keşfeden — Ekstraksiyon mentoru.
- **Rosalind Franklin** — Foto 51, DNA çift sarmal yapısı — Ekstraksiyon/yapı.
- **Frederick Sanger** — DNA dizileme yöntemi — Dizileme mentoru.
- **Phil Green** — Phred kalite skoru — QC mentoru.
- **Gene Myers** — assembly algoritmaları & BLAST — Assembly mentoru.
- **Ewan Birney** — Ensembl, genom anotasyonu — Anotasyon mentoru.

Her seviyede mentor kısa bir gerçek "bilim kartı" ile tanıtılır.

## Konseptler (organizma seçimi)
Oyuncu başta hedef organizmayı seçer: **Bakteri, Virüs, Mantar, İnsan**.
Seçim, seviyelerdeki örnek tipini, genom uzunluğunu ve zorluğu hafifçe değiştirir
(eğitsel olarak: virüs küçük genom, insan büyük genom).

## İlerleme / Yetenekler
Her seviye geçilince bir yetenek açılır ve kalıcı olarak gösterilir:
- L1 → Örnekleme Gözü, L2 → Pipet Ustası, L3 → Sekans Refleksi,
  L4 → Kalite Kalkanı, L5 → Assembly Dehası, L6 → Gen Avcısı.

İlerleme `localStorage`'da saklanır (kaldığı yerden devam + en yüksek skor).

## Teknik tasarım
- **Vanilla HTML/CSS/JS, build adımı YOK.** Klasik `<script>` etiketleri (ES module değil)
  → `file://` ile çift tıkla da, GitHub Pages'te de çalışır.
- Global ad alanı `window.GH`. Çekirdek: durum, dil, ses, ekran yönetimi, seviye yöneticisi.
- Her seviye `GH.levels[]` içine `{ id, mount(root, ctx) }` arayüzüyle kayıt olur;
  bittiğinde `ctx.complete({score, stars})` çağırır.
- Görseller kod içinde **inline SVG / CSS** ile çizilir (ikili asset yok) → repo hafif.
- Ses: WebAudio ile basit beep/efektler (asset gerekmez), sessize alınabilir.
- Erişilebilirlik: klavye + dokunmatik + fare; mobil uyumlu responsive düzen.

## Dosya yapısı
```
genomehunter/
  index.html
  css/style.css
  js/i18n.js, characters.js, audio.js, game.js
  js/levels/level1..level6.js
  README.md
```

## Başarı ölçütü
- Tarayıcıda baştan sona oynanabiliyor; 6 seviye de tamamlanabiliyor.
- Her seviye ilgili biyoinformatik kavramı kısa ve doğru biçimde öğretiyor.
- GitHub Pages'te statik olarak çalışıyor.
- TR/EN dil desteği.

## Kapsam dışı (YAGNI)
- Sunucu/backend, hesap sistemi, çevrimiçi skor tablosu yok.
- Gerçek dizi verisi işleme yok; kavramlar oyunlaştırılmış temsillerle öğretilir.

/**
 * PRESENTASI: AHLI WARIS LAKI-LAKI DAN PEREMPUAN
 * Interaktivitas, Kontrol Navigasi, Animasi, dan Sistem Download Slide Lengkap
 * Disusun oleh Kelompok 5 - Hukum Kewarisan Islam
 */

document.addEventListener('DOMContentLoaded', () => {
  // State Management
  let currentSlide = 1;
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let isAutoplay = false;
  let autoplayInterval = null;
  let soundEnabled = true;

  // DOM Elements
  const currentSlideNumEl = document.getElementById('current-slide-num');
  const totalSlidesNumEl = document.getElementById('total-slides-num');
  const currentSlideTitleEl = document.getElementById('current-slide-title');
  const progressFillEl = document.getElementById('progress-fill');
  const slideDotsContainer = document.getElementById('slide-dots-container');

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnAutoplay = document.getElementById('btn-autoplay');
  const btnSound = document.getElementById('btn-sound');
  const btnGrid = document.getElementById('btn-grid');
  const btnDownloadModal = document.getElementById('btn-download-modal');
  const btnQuickPptx = document.getElementById('btn-download-quick');
  const btnHelp = document.getElementById('btn-help');

  // Modals
  const downloadModal = document.getElementById('download-modal');
  const overviewModal = document.getElementById('overview-modal');
  const helpModal = document.getElementById('help-modal');
  const overviewGridContent = document.getElementById('overview-thumbnails-grid');

  // Download Action Buttons
  const btnRunPptx = document.getElementById('btn-run-pptx-dl');
  const btnRunPdf = document.getElementById('btn-run-pdf-dl');
  const btnRunPng = document.getElementById('btn-run-png-dl');
  const btnRunHtml = document.getElementById('btn-run-html-dl');
  const targetSlideLabel = document.getElementById('target-slide-label');

  // Audio Context (Web Audio API Synthesizer - Zero External Files)
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playSlideSound(type = 'transition') {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'transition') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'action') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Toast Notification System
  function showToast(message, icon = 'fa-circle-info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon} gold-text"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // 1. Initialize Slide Dots Navigation
  function initDots() {
    slideDotsContainer.innerHTML = '';
    slides.forEach((slide, idx) => {
      const dot = document.createElement('div');
      dot.className = `slide-dot ${idx === 0 ? 'active' : ''}`;
      dot.title = `Slide ${idx + 1}: ${slide.getAttribute('data-title') || ''}`;
      dot.addEventListener('click', () => goToSlide(idx + 1));
      slideDotsContainer.appendChild(dot);
    });
  }

  // 2. Main Navigation: Go To Slide
  function goToSlide(targetIndex) {
    if (targetIndex < 1 || targetIndex > totalSlides) return;
    if (targetIndex === currentSlide) return;

    // Remove active state from current
    slides[currentSlide - 1].classList.remove('active-slide');

    // Set new slide
    currentSlide = targetIndex;
    const activeSlide = slides[currentSlide - 1];
    activeSlide.classList.add('active-slide');

    // Update Header Indicator
    const formattedNum = String(currentSlide).padStart(2, '0');
    currentSlideNumEl.textContent = formattedNum;
    const slideTitle = activeSlide.getAttribute('data-title') || `Slide ${currentSlide}`;
    currentSlideTitleEl.textContent = slideTitle;

    // Update Target Slide Label in Download Modal
    if (targetSlideLabel) targetSlideLabel.textContent = currentSlide;

    // Update Progress Bar
    const progressPercent = (currentSlide / totalSlides) * 100;
    progressFillEl.style.width = `${progressPercent}%`;

    // Update Dots
    const dots = document.querySelectorAll('.slide-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide - 1);
    });

    // Update Overview Selection if open
    updateOverviewActiveState();

    // Play Sound
    playSlideSound('transition');

    // Trigger Confetti on Slide 13
    if (currentSlide === 13 && typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#e6ca65', '#10b981', '#34d399', '#ffffff']
      });
    }
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
    } else if (isAutoplay) {
      goToSlide(1); // loop back
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  }

  // 3. Autoplay Setup
  function toggleAutoplay() {
    isAutoplay = !isAutoplay;
    btnAutoplay.classList.toggle('active', isAutoplay);

    if (isAutoplay) {
      btnAutoplay.querySelector('i').className = 'fa-solid fa-pause';
      btnAutoplay.querySelector('.btn-text').textContent = 'Jeda';
      showToast('Otomatis Putar Aktif (7 detik/slide)', 'fa-play');
      autoplayInterval = setInterval(nextSlide, 7000);
    } else {
      btnAutoplay.querySelector('i').className = 'fa-solid fa-play';
      btnAutoplay.querySelector('.btn-text').textContent = 'Autoplay';
      showToast('Otomatis Putar Dihentikan', 'fa-pause');
      clearInterval(autoplayInterval);
    }
  }

  // 4. Sound Toggle
  function toggleSound() {
    soundEnabled = !soundEnabled;
    btnSound.classList.toggle('active', soundEnabled);
    const icon = btnSound.querySelector('i');
    if (soundEnabled) {
      icon.className = 'fa-solid fa-volume-high';
      showToast('Efek Suara Diaktifkan', 'fa-volume-high');
      playSlideSound('action');
    } else {
      icon.className = 'fa-solid fa-volume-xmark';
      showToast('Efek Suara Dimatikan', 'fa-volume-xmark');
    }
  }

  // 5. Fullscreen Toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        btnFullscreen.querySelector('i').className = 'fa-solid fa-compress';
        showToast('Mode Layar Penuh Aktif', 'fa-expand');
      }).catch(err => {
        showToast('Gagal beralih ke layar penuh: ' + err.message, 'fa-circle-exclamation');
      });
    } else {
      document.exitFullscreen().then(() => {
        btnFullscreen.querySelector('i').className = 'fa-solid fa-expand';
      });
    }
  }

  // 6. Overview Grid Modal
  function buildOverviewGrid() {
    overviewGridContent.innerHTML = '';
    slides.forEach((slide, idx) => {
      const slideIndex = idx + 1;
      const title = slide.getAttribute('data-title') || `Slide ${slideIndex}`;
      const card = document.createElement('div');
      card.className = `overview-card ${slideIndex === currentSlide ? 'current' : ''}`;
      card.innerHTML = `
        <div class="ov-top">
          <span class="ov-num">SLIDE ${String(slideIndex).padStart(2, '0')}</span>
        </div>
        <div class="ov-title">${title}</div>
        <div class="ov-footer"><i class="fa-regular fa-eye"></i> Klik untuk lompat</div>
      `;
      card.addEventListener('click', () => {
        goToSlide(slideIndex);
        closeAllModals();
      });
      overviewGridContent.appendChild(card);
    });
  }

  function updateOverviewActiveState() {
    const cards = overviewGridContent.querySelectorAll('.overview-card');
    cards.forEach((card, idx) => {
      card.classList.toggle('current', idx === currentSlide - 1);
    });
  }

  function openOverview() {
    buildOverviewGrid();
    overviewModal.classList.add('open');
    overviewModal.setAttribute('aria-hidden', 'false');
  }

  // 7. Generic Modal Controls
  function openModal(modalEl) {
    closeAllModals();
    if (modalEl) {
      modalEl.classList.add('open');
      modalEl.setAttribute('aria-hidden', 'false');
      if (targetSlideLabel) targetSlideLabel.textContent = currentSlide;
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.custom-modal, .overview-grid-modal').forEach(m => {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
  }

  // 8. Event Listeners for Nav Buttons
  btnPrev.addEventListener('click', prevSlide);
  btnNext.addEventListener('click', nextSlide);
  btnFullscreen.addEventListener('click', toggleFullscreen);
  btnAutoplay.addEventListener('click', toggleAutoplay);
  btnSound.addEventListener('click', toggleSound);

  btnGrid.addEventListener('click', () => {
    if (overviewModal.classList.contains('open')) {
      closeAllModals();
    } else {
      openOverview();
    }
  });

  btnDownloadModal.addEventListener('click', () => openModal(downloadModal));
  if (btnQuickPptx) btnQuickPptx.addEventListener('click', () => runDownloadPPTX());
  btnHelp.addEventListener('click', () => openModal(helpModal));

  // Close buttons
  document.getElementById('btn-close-download').addEventListener('click', closeAllModals);
  document.getElementById('modal-backdrop-download').addEventListener('click', closeAllModals);
  document.getElementById('btn-close-overview').addEventListener('click', closeAllModals);
  document.getElementById('btn-close-help').addEventListener('click', closeAllModals);
  document.getElementById('modal-backdrop-help').addEventListener('click', closeAllModals);

  // Confetti Button on Slide 13
  const btnConfetti = document.getElementById('btn-confetti');
  if (btnConfetti) {
    btnConfetti.addEventListener('click', () => {
      playSlideSound('action');
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#e6ca65', '#10b981', '#34d399', '#ffffff', '#ffd700']
        });
      }
      showToast('Alhamdulillah, presentasi selesai dengan sukses!', 'fa-wand-magic-sparkles');
    });
  }

  // 9. Keyboard Shortcuts Navigation
  window.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;

      case 'ArrowLeft':
      case 'Backspace':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;

      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;

      case 'End':
        e.preventDefault();
        goToSlide(totalSlides);
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;

      case 'o':
      case 'O':
      case 'g':
      case 'G':
        e.preventDefault();
        if (overviewModal.classList.contains('open')) {
          closeAllModals();
        } else {
          openOverview();
        }
        break;

      case 'd':
      case 'D':
        e.preventDefault();
        if (downloadModal.classList.contains('open')) {
          closeAllModals();
        } else {
          openModal(downloadModal);
        }
        break;

      case 'p':
      case 'P':
        e.preventDefault();
        toggleAutoplay();
        break;

      case 's':
      case 'S':
        e.preventDefault();
        toggleSound();
        break;

      case '?':
        e.preventDefault();
        openModal(helpModal);
        break;

      case 'Escape':
        closeAllModals();
        break;
    }
  });

  // 10. Mobile Touch Swipe Gesture
  let touchStartX = 0;
  let touchEndX = 0;
  const viewport = document.getElementById('presentation-viewport');

  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide(); // swipe left -> next
    } else if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide(); // swipe right -> prev
    }
  }

  // =========================================================================
  // 11. SISTEM DOWNLOAD SLIDE LENGKAP (PPTX, PDF, PNG, HTML)
  // =========================================================================

  // A. Download As Microsoft PowerPoint (.PPTX) via PptxGenJS
  async function runDownloadPPTX() {
    playSlideSound('action');
    showToast('Sedang membuat berkas PowerPoint (.PPTX)...', 'fa-spinner');

    if (typeof PptxGenJS === 'undefined') {
      showToast('Library PowerPoint sedang dimuat. Menyiapkan berkas fisik...', 'fa-circle-exclamation');
      // Direct fallback to ready-made python generated PPTX in directory if available
      window.location.href = 'Ahli_Waris_Laki_Laki_dan_Perempuan.pptx';
      return;
    }

    try {
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'Kelompok 5: Fatiaful Alzahra, Sufyan Tsaury, Wahdan Hamdun';
      pptx.company = 'UIN Siber Syekh Nurjati Cirebon';
      pptx.title = 'Ahli Waris Laki-laki dan Perempuan - Hukum Kewarisan Islam';

      // Master Slide Definition
      const bgDark = '06231C';
      const goldColor = 'E6CA65';
      const emeraldColor = '10B981';
      const textLight = 'F8FAFC';
      const cardBg = '0B382C';

      // Slide 1: Cover
      const s1 = pptx.addSlide();
      s1.background = { color: bgDark };
      s1.addText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', {
        x: 1.0, y: 0.8, w: 11.3, h: 0.8,
        fontSize: 26, color: goldColor, align: 'center', fontFace: 'Arial'
      });
      s1.addText('AHLI WARIS LAKI-LAKI & PEREMPUAN', {
        x: 1.0, y: 1.8, w: 11.3, h: 1.4,
        fontSize: 38, bold: true, color: 'FFFFFF', align: 'center'
      });
      s1.addText('Kajian Kedudukan, Klasifikasi, Dasar Hukum & Pembagian Warisan dalam Syariat Islam dan KHI', {
        x: 1.5, y: 3.3, w: 10.3, h: 0.8,
        fontSize: 16, color: 'CBD5E1', align: 'center'
      });
      s1.addShape(pptx.ShapeType.rect, {
        x: 1.8, y: 4.4, w: 9.7, h: 1.8,
        fill: { color: cardBg }, line: { color: goldColor, width: 1.5 }
      });
      s1.addText('Dosen Pengampu: Prof. Dr. H. Kosim, M.Ag\nKelompok 5: Fatiaful Alzahra (2530311087), Sufyan Tsaury (2530311086), Wahdan Hamdun (2530311003)\nProdi Hukum Keluarga | Fakultas Syari\'ah | UIN Siber Syekh Nurjati Cirebon 2026', {
        x: 2.0, y: 4.6, w: 9.3, h: 1.4,
        fontSize: 13, color: goldColor, align: 'center'
      });

      // Slide 2: Latar Belakang & Urgensi
      const s2 = pptx.addSlide();
      s2.background = { color: bgDark };
      s2.addText('BAB I • PENDAHULUAN: Latar Belakang & Urgensi', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s2.addText('Mengapa identifikasi ahli waris sangat menentukan?', {
        x: 0.8, y: 1.3, w: 11.7, h: 0.5,
        fontSize: 14, color: 'CBD5E1'
      });
      s2.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.0, w: 3.6, h: 4.6, fill: { color: cardBg }, line: { color: goldColor } });
      s2.addText('1. Kerentanan Sengketa\n\n• Kesalahan penentuan ahli waris berpotensi memicu perselisihan keluarga.\n• Tidak semua kerabat otomatis menerima warisan.', {
        x: 1.0, y: 2.3, w: 3.2, h: 4.0, fontSize: 13, color: textLight
      });
      s2.addShape(pptx.ShapeType.roundRect, { x: 4.8, y: 2.0, w: 3.6, h: 4.6, fill: { color: cardBg }, line: { color: emeraldColor } });
      s2.addText('2. Tiga Rukun Pokok\n\n• Al-Muwarrits: Pewaris yang wafat.\n• Al-Waris: Ahli waris yang masih hidup saat pewaris wafat.\n• Al-Mauruts/Tirkah: Harta warisan bersih.', {
        x: 5.0, y: 2.3, w: 3.2, h: 4.0, fontSize: 13, color: textLight
      });
      s2.addShape(pptx.ShapeType.roundRect, { x: 8.8, y: 2.0, w: 3.6, h: 4.6, fill: { color: cardBg }, line: { color: goldColor } });
      s2.addText('3. Keadilan Syariat\n\n• Aturan faraidh dirancang langsung oleh Allah SWT.\n• Memberikan kepastian hukum distributif dan menjaga kehormatan hak laki-laki & perempuan.', {
        x: 9.0, y: 2.3, w: 3.2, h: 4.0, fontSize: 13, color: textLight
      });

      // Slide 3: Rumusan Masalah & Tujuan
      const s3 = pptx.addSlide();
      s3.background = { color: bgDark };
      s3.addText('Rumusan Masalah & Tujuan Penulisan', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s3.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: goldColor } });
      s3.addText('4 RUMUSAN MASALAH\n\n1. Apa pengertian ahli waris dalam hukum Islam?\n2. Siapa sajakah ahli waris golongan laki-laki?\n3. Siapa sajakah ahli waris golongan perempuan?\n4. Bagaimana kedudukan hak masing-masing pihak (Ashhabul Furudh, \'Ashabah, & Hijab)?', {
        x: 1.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 13, color: textLight
      });
      s3.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: emeraldColor } });
      s3.addText('TUJUAN PENULISAN\n\n1. Memahami konsep yuridis & normatif kewarisan Islam.\n2. Mengidentifikasi 15 kelompok ahli waris laki-laki.\n3. Mengidentifikasi 10 kelompok ahli waris perempuan.\n4. Mampu menganalisis sengketa kewarisan di masyarakat secara sistematis sesuai fikih & KHI.', {
        x: 7.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 13, color: textLight
      });

      // Slide 4: Pengertian & Sebab Mewarisi
      const s4 = pptx.addSlide();
      s4.background = { color: bgDark };
      s4.addText('Pengertian, Syarat, dan Sebab-Sebab Mewarisi', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s4.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: goldColor } });
      s4.addText('HAKIKAT AHLI WARIS & SYARAT\n\n• Ahli Waris (Al-Waris): Pihak yang memiliki hak sah syariah menerima harta peninggalan pewaris.\n\n3 Syarat Sah Mewarisi:\n1. Meninggalnya pewaris (haqiqiy/hukmiy).\n2. Hidupnya ahli waris saat pewaris wafat.\n3. Tidak ada faktor penghalang (mani\').', {
        x: 1.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 13, color: textLight
      });
      s4.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: emeraldColor } });
      s4.addText('DUA SEBAB POKOK KEWARISAN\n\n1. Hubungan Nasabiyah (Pertalian Darah):\n• Ushul (Garis Atas: Ayah, Ibu, Kakek, Nenek)\n• Furu\' (Garis Bawah: Anak, Cucu)\n• Hawasyi (Garis Samping: Saudara, Paman, Keponakan)\n\n2. Hubungan Sababiyah (Sebab Legal):\n• Perkawinan yang Sah (Suami/Istri)\n• Al-Wala\' (Memerdekakan budak - Fiqh klasik)', {
        x: 7.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 13, color: textLight
      });

      // Slide 5: Al-Qur'an
      const s5 = pptx.addSlide();
      s5.background = { color: bgDark };
      s5.addText('Dasar Hukum: Landasan Ayat-Ayat Al-Qur\'an', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s5.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.5, w: 5.6, h: 2.4, fill: { color: cardBg }, line: { color: goldColor } });
      s5.addText('QS. An-Nisa Ayat 7\n"Bagi laki-laki ada hak bagian dari harta peninggalan orang tua & kerabat, dan bagi perempuan ada hak bagian (pula)... baik sedikit maupun banyak."', {
        x: 1.0, y: 1.7, w: 5.2, h: 2.0, fontSize: 12, color: textLight
      });
      s5.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.5, w: 5.6, h: 2.4, fill: { color: cardBg }, line: { color: goldColor } });
      s5.addText('QS. An-Nisa Ayat 11\n"Allah mensyariatkan bagimu tentang (warisan) anak-anakmu, yaitu bagian seorang anak laki-laki sama dengan bagian dua orang anak perempuan..."', {
        x: 7.0, y: 1.7, w: 5.2, h: 2.0, fontSize: 12, color: textLight
      });
      s5.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 4.2, w: 5.6, h: 2.4, fill: { color: cardBg }, line: { color: emeraldColor } });
      s5.addText('QS. An-Nisa Ayat 12\n"Dan bagianmu (suami) seperdua jika tidak ada anak; jika ada anak seperempat. Bagian istri seperempat jika tak ada anak; jika ada anak seperdelapan."', {
        x: 1.0, y: 4.4, w: 5.2, h: 2.0, fontSize: 12, color: textLight
      });
      s5.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 4.2, w: 5.6, h: 2.4, fill: { color: cardBg }, line: { color: emeraldColor } });
      s5.addText('QS. An-Nisa Ayat 176\n"Mereka meminta fatwa kepadamu (tentang kalalah)..." Mengatur ketentuan bagian saudara laki-laki dan saudara perempuan.', {
        x: 7.0, y: 4.4, w: 5.2, h: 2.0, fontSize: 12, color: textLight
      });

      // Slide 6: Hadis & KHI
      const s6 = pptx.addSlide();
      s6.background = { color: bgDark };
      s6.addText('Dasar Hukum: Hadis Nabawi & Kompilasi Hukum Islam (KHI)', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s6.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: goldColor } });
      s6.addText('HADIS RIWAYAT BUKHARI & MUSLIM\n\n"Alhiqu al-fara\'idha bi ahliha, fa ma baqiya fa huwa li-awla rajulin dzakarin."\n\nArtinya:\n"Bagikanlah harta warisan kepada orang yang berhak (Ashhabul Furudh), dan apa yang tersisa maka berikanlah kepada kerabat laki-laki yang paling dekat (\'Ashabah)."\n\n-> Prioritas 1: Ashhabul Furudh diselesaikan.\n-> Prioritas 2: Sisa dialokasikan ke \'Ashabah.', {
        x: 1.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 12.5, color: textLight
      });
      s6.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: emeraldColor } });
      s6.addText('KOMPILASI HUKUM ISLAM (KHI) BUKU II\n\n• Pasal 171 Huruf c KHI:\nAhli waris adalah orang yang saat pewaris wafat mempunyai hubungan darah atau perkawinan, beragama Islam, dan tidak terhalang hukum.\n\n• Pasal 174 KHI:\nPengelompokan ahli waris menurut hubungan darah (laki-laki & perempuan) dan hubungan perkawinan (suami / istri).', {
        x: 7.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 12.5, color: textLight
      });

      // Slide 7: 15 Ahli Waris Laki-laki
      const s7 = pptx.addSlide();
      s7.background = { color: bgDark };
      s7.addText('15 Golongan Ahli Waris Laki-Laki (Rijal)', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s7.addText('Catatan: Jika ke-15 hadir bersamaan, hanya 3 yang pasti mewarisi: Anak Laki-laki, Ayah, & Suami.', {
        x: 0.8, y: 1.3, w: 11.7, h: 0.4, fontSize: 13, color: goldColor
      });
      s7.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.8, w: 11.6, h: 4.8, fill: { color: cardBg }, line: { color: goldColor } });
      s7.addText('1. Anak Laki-laki (Ibn) - \'Ashabah Utama\n2. Cucu Laki-laki dari anak laki-laki\n3. Ayah (Ab) - Fardh / \'Ashabah\n4. Kakek shahih dari pihak ayah\n5. Saudara laki-laki sekandung\n6. Saudara laki-laki seayah\n7. Saudara laki-laki seibu (1/6 atau 1/3)\n8. Keponakan laki-laki kandung\n9. Keponakan laki-laki seayah\n10. Paman sekandung\n11. Paman seayah\n12. Sepupu laki-laki kandung\n13. Sepupu laki-laki seayah\n14. Suami (1/2 atau 1/4)\n15. Mu\'tiq (pembebas budak)', {
        x: 1.2, y: 2.1, w: 10.8, h: 4.2, fontSize: 13, color: textLight
      });

      // Slide 8: 10 Ahli Waris Perempuan
      const s8 = pptx.addSlide();
      s8.background = { color: bgDark };
      s8.addText('10 Golongan Ahli Waris Perempuan (Nisa)', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s8.addText('Catatan: Jika ke-10 hadir bersamaan, 5 yang pasti mewarisi: Istri, Anak Pr, Ibu, Cucu Pr, & Saudara Pr Kandung.', {
        x: 0.8, y: 1.3, w: 11.7, h: 0.4, fontSize: 13, color: goldColor
      });
      s8.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.8, w: 11.6, h: 4.8, fill: { color: cardBg }, line: { color: emeraldColor } });
      s8.addText('1. Anak Perempuan (Bint) - 1/2, 2/3, atau \'Ashabah bi Ghairih\n2. Cucu Perempuan dari anak laki-laki\n3. Ibu (Umm) - 1/3 atau 1/6 (Pasti Dapat)\n4. Nenek dari pihak ibu (1/6 jika tak ada ibu)\n5. Nenek dari pihak ayah (1/6 jika tak ada ibu & ayah)\n6. Saudara perempuan sekandung\n7. Saudara perempuan seayah\n8. Saudara perempuan seibu (1/6 atau 1/3)\n9. Istri (Zawjah) - 1/4 (tanpa anak) atau 1/8 (ada anak)\n10. Mu\'tiqah (wanita pembebas budak)', {
        x: 1.2, y: 2.1, w: 10.8, h: 4.2, fontSize: 13.5, color: textLight
      });

      // Slide 9: Ashhabul Furudh vs Ashabah
      const s9 = pptx.addSlide();
      s9.background = { color: bgDark };
      s9.addText('Sistem Hak: Ashhab al-Furudh & \'Ashabah', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s9.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: goldColor } });
      s9.addText('ASHHAB AL-FURUDH (6 Bagian Pasti):\n\n• 1/2 : Suami, 1 Anak Pr, 1 Cucu Pr, 1 Sdr Pr Kandung/Seayah.\n• 1/4 : Suami (ada anak) atau Istri (tanpa anak).\n• 1/8 : Istri (jika pewaris ada anak/cucu).\n• 2/3 : >=2 Anak Pr, >=2 Cucu Pr, >=2 Sdr Pr Kandung/Seayah.\n• 1/3 : Ibu (tanpa anak/saudara), >=2 Sdr Seibu.\n• 1/6 : Ayah/Ibu (ada anak), Kakek/Nenek, 1 Sdr Seibu.', {
        x: 1.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 12.5, color: textLight
      });
      s9.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: emeraldColor } });
      s9.addText('AL-\'ASHABAH (Penerima Sisa Harta):\n\n1. \'Ashabah bi Nafsihi:\nKerabat laki-laki garis nasab murni (Anak lk, ayah, saudara kandung, paman).\n\n2. \'Ashabah bi Ghairihi:\nWanita yang ditarik oleh saudara laki-lakinya (Anak pr + anak lk, 2:1).\n\n3. \'Ashabah ma\'a Ghairihi:\nSaudara perempuan kandung/seayah bersama dengan anak/cucu perempuan.', {
        x: 7.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 12.5, color: textLight
      });

      // Slide 10: Halangan Waris & Hijab
      const s10 = pptx.addSlide();
      s10.background = { color: bgDark };
      s10.addText('Penghalang Waris (Mani\') & Konsep Hijab', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s10.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: 'DC2626' } });
      s10.addText('3 MAWANI\' AL-IRTS (Gugur Total):\n\n1. Pembunuhan (Al-Qatlu):\nAhli waris yang membunuh pewaris tidak berhak mewarisi apa pun.\n\n2. Beda Agama (Ikhtilaf ad-Din):\nMuslim tidak mewarisi non-muslim dan sebaliknya.\n\n3. Perbudakan (Ar-Riqq):\nBudak tidak cakap memiliki harta (konteks historis fikih klasik).', {
        x: 1.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 12.5, color: textLight
      });
      s10.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: emeraldColor } });
      s10.addText('KONSEP AL-HIJAB (Dinding Penghalang):\n\n1. Hijab Nuqshan (Pengurangan Bagian):\nPorsi berkurang karena ada ahli waris lain (cth: Suami dari 1/2 menjadi 1/4 karena ada anak).\n\n2. Hijab Hirman (Tertutup Sepenuhnya):\nHak gugur karena adanya kerabat yang lebih dekat (cth: Kakek terhalang oleh Ayah, Cucu terhalang oleh Anak).', {
        x: 7.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 12.5, color: textLight
      });

      // Slide 11: Komparasi & Keadilan
      const s11 = pptx.addSlide();
      s11.background = { color: bgDark };
      s11.addText('Komparasi & Falsafah Keadilan Proporsional', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s11.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: goldColor } });
      s11.addText('KOMPARASI HAK (TANPA vs BERSAMA ANAK)\n\n• Suami: 1/2 (tanpa anak) -> 1/4 (bersama anak)\n• Istri: 1/4 (tanpa anak) -> 1/8 (bersama anak)\n• Ayah: \'Ashabah penuh -> 1/6 (+ sisa jika anak pr)\n• Ibu: 1/3 -> 1/6 (bersama anak/beberapa saudara)\n• Anak Lk : Anak Pr = 2 : 1', {
        x: 1.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 13, color: textLight
      });
      s11.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.6, w: 5.6, h: 5.0, fill: { color: cardBg }, line: { color: emeraldColor } });
      s11.addText('FILOSOFI KEADILAN ISLAM\n\n• Beban Finansial Mutlak Pria: Menafkahi istri, anak, mahar, dan tempat tinggal.\n• Hak Penuh Perempuan: Warisan wanita adalah miliknya 100% tanpa beban wajib menafkahi keluarga.\n• Dalam Banyak Kasus Sama: Ayah & Ibu sama-sama 1/6 jika ada anak; saudara seibu laki-laki & perempuan setara tanpa pembedaan.', {
        x: 7.1, y: 1.9, w: 5.0, h: 4.4, fontSize: 13, color: textLight
      });

      // Slide 12: Kesimpulan
      const s12 = pptx.addSlide();
      s12.background = { color: bgDark };
      s12.addText('BAB III • PENUTUP: Kesimpulan Makalah', {
        x: 0.8, y: 0.6, w: 11.7, h: 0.7,
        fontSize: 24, bold: true, color: goldColor
      });
      s12.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.6, w: 5.6, h: 2.4, fill: { color: cardBg }, line: { color: goldColor } });
      s12.addText('1. Hakikat Ahli Waris\nPihak sah yang memiliki hubungan darah (nasabiyah) atau perkawinan (sababiyah) yang memenuhi rukun dan syarat.', {
        x: 1.0, y: 1.8, w: 5.2, h: 2.0, fontSize: 12.5, color: textLight
      });
      s12.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.6, w: 5.6, h: 2.4, fill: { color: cardBg }, line: { color: goldColor } });
      s12.addText('2. Klasifikasi 15 Pria & 10 Wanita\nAhli waris inti yang tak pernah gugur mutlak: Ayah, Ibu, Anak (Lk/Pr), dan Pasangan (Suami/Istri).', {
        x: 7.0, y: 1.8, w: 5.2, h: 2.0, fontSize: 12.5, color: textLight
      });
      s12.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 4.2, w: 5.6, h: 2.4, fill: { color: cardBg }, line: { color: emeraldColor } });
      s12.addText('3. Mekanisme & Regulasi KHI\nPembagian tunduk pada Ashhabul Furudh dan \'Ashabah, dipengaruhi Hijab, serta selaras dengan Buku II KHI Indonesia.', {
        x: 1.0, y: 4.4, w: 5.2, h: 2.0, fontSize: 12.5, color: textLight
      });
      s12.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 4.2, w: 5.6, h: 2.4, fill: { color: cardBg }, line: { color: emeraldColor } });
      s12.addText('4. Keadilan Transenden Syariat\nMenjamin hak ekonomi wanita secara adil dan proporsional dengan beban tanggung jawab nafkah dalam peradaban Islam.', {
        x: 7.0, y: 4.4, w: 5.2, h: 2.0, fontSize: 12.5, color: textLight
      });

      // Slide 13: Penutup
      const s13 = pptx.addSlide();
      s13.background = { color: bgDark };
      s13.addText('الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', {
        x: 1.0, y: 1.2, w: 11.3, h: 0.8,
        fontSize: 26, color: goldColor, align: 'center', fontFace: 'Arial'
      });
      s13.addText('TERIMA KASIH & SESI TANYA JAWAB', {
        x: 1.0, y: 2.2, w: 11.3, h: 1.2,
        fontSize: 34, bold: true, color: 'FFFFFF', align: 'center'
      });
      s13.addText('Kelompok 5 • Prodi Hukum Keluarga (HKI) • UIN Siber Syekh Nurjati Cirebon 2026', {
        x: 1.5, y: 3.6, w: 10.3, h: 0.6,
        fontSize: 14, color: goldColor, align: 'center'
      });
      s13.addShape(pptx.ShapeType.rect, {
        x: 2.5, y: 4.6, w: 8.3, h: 1.8,
        fill: { color: cardBg }, line: { color: emeraldColor }
      });
      s13.addText('Referensi Makalah:\n• Al-Qur\'an Surah An-Nisa (Ayat 7, 11, 12, 176)\n• Kitab Sahih Bukhari & Sahih Muslim\n• Kompilasi Hukum Islam (KHI) Buku II\n• Jurnal Riset Hukum Kewarisan Islam', {
        x: 2.8, y: 4.8, w: 7.7, h: 1.4, fontSize: 12, color: 'CBD5E1', align: 'center'
      });

      // Generate and Save PPTX
      await pptx.writeFile({ fileName: 'Makalah_Ahli_Waris_Laki_Laki_dan_Perempuan_Kelompok5.pptx' });
      showToast('Berkas PowerPoint (.PPTX) berhasil diunduh!', 'fa-circle-check');
      closeAllModals();
    } catch (err) {
      console.error('Error generating PPTX:', err);
      showToast('Download PPTX browser gagal, mengunduh berkas alternatif...', 'fa-triangle-exclamation');
      window.location.href = 'Ahli_Waris_Laki_Laki_dan_Perempuan.pptx';
    }
  }

  // B. Download / Cetak Sebagai PDF Landscape
  function runDownloadPDF() {
    playSlideSound('action');
    closeAllModals();
    showToast('Membuka dialog cetak... Pilih "Save as PDF" / "Simpan sebagai PDF"', 'fa-print');
    setTimeout(() => {
      window.print();
    }, 400);
  }

  // C. Download Active Slide as High-Res PNG via html2canvas
  async function runDownloadPNG() {
    playSlideSound('action');
    const activeSlide = slides[currentSlide - 1];
    const slideInner = activeSlide.querySelector('.slide-inner');

    if (!slideInner || typeof html2canvas === 'undefined') {
      showToast('Gagal memproses gambar slide. Silakan coba lagi.', 'fa-triangle-exclamation');
      return;
    }

    showToast(`Mengambil gambar Slide ${currentSlide} (Resolusi Retina 2x)...`, 'fa-camera');

    try {
      const canvas = await html2canvas(slideInner, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#03140f',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Slide-${String(currentSlide).padStart(2, '0')}-Ahli-Waris.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Slide ${currentSlide} berhasil disimpan sebagai PNG!`, 'fa-circle-check');
      closeAllModals();
    } catch (err) {
      console.error('html2canvas error:', err);
      showToast('Gagal mengunduh gambar slide: ' + err.message, 'fa-circle-exclamation');
    }
  }

  // D. Download Standalone HTML Presentation File
  function runDownloadHTML() {
    playSlideSound('action');
    showToast('Menyiapkan file presentasi HTML offline...', 'fa-file-code');

    try {
      const htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'presentasi-ahli-waris-laki-laki-dan-perempuan.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      showToast('File HTML Presentasi berhasil diunduh!', 'fa-circle-check');
      closeAllModals();
    } catch (err) {
      console.error('HTML download error:', err);
      showToast('Gagal mengunduh file HTML: ' + err.message, 'fa-circle-exclamation');
    }
  }

  // Bind Download Action Events
  btnRunPptx.addEventListener('click', runDownloadPPTX);
  btnRunPdf.addEventListener('click', runDownloadPDF);
  btnRunPng.addEventListener('click', runDownloadPNG);
  btnRunHtml.addEventListener('click', runDownloadHTML);

  // Initialize presentation
  initDots();
  totalSlidesNumEl.textContent = String(totalSlides).padStart(2, '0');
  const initialTitle = slides[0].getAttribute('data-title') || 'Cover Presentasi';
  currentSlideTitleEl.textContent = initialTitle;
  progressFillEl.style.width = `${(1 / totalSlides) * 100}%`;

  console.log('Slide Presentasi Hukum Kewarisan Islam berhasil diinisialisasi. Siap digunakan!');
});

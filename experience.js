(() => {
  const moments = [...document.querySelectorAll('.moment')];
  const prologue = document.querySelector('.prologue');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileFlow = matchMedia('(max-width:760px)');
  const scrollCue = document.querySelector('#scroll-cue-fill');
  const stage = document.querySelector('.prologue-stage');
  const header = document.querySelector('.chapter-header');
  const counter = document.querySelector('.proof-stat [data-count-to]');
  let active = 0;
  let frame = false;
  let leaveTimer;
  let mobilePrepared = false;
  let lockedMobileWidth = 0;
  let counterStarted = false;

  function runCounter() {
    if (counterStarted || !counter) return;
    counterStarted = true;
    if (reduceMotion.matches) { counter.textContent = '80'; return; }
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / 850);
      counter.textContent = String(Math.round(80 * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    counter.textContent = '0';
    requestAnimationFrame(tick);
  }

  function updateHandoff() {
    if (mobileFlow.matches && reduceMotion.matches) {
      prologue.classList.remove('is-crossing', 'stage-passed');
      moments[moments.length - 1].style.setProperty('--gap', '0%');
      document.documentElement.classList.add('page-two-ready');
      document.documentElement.classList.add('page-two-header-ready');
      return;
    }
    if (mobileFlow.matches) {
      const gateway = moments[moments.length - 1];
      const end = prologue.offsetTop + prologue.offsetHeight - header.offsetHeight;
      const start = end - gateway.offsetHeight * .62;
      const exit = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
      gateway.style.setProperty('--gap', `${(exit * 50).toFixed(2)}%`);
      gateway.style.setProperty('--exit', exit.toFixed(3));
      prologue.classList.toggle('is-crossing', exit > 0 && exit < 1);
      prologue.classList.toggle('stage-passed', exit >= .99);
      document.documentElement.classList.toggle('page-two-ready', exit > .74);
      document.documentElement.classList.toggle('page-two-header-ready', exit >= .99);
      return;
    }
    const stageHeight = stage.offsetHeight;
    const end = prologue.offsetTop + prologue.offsetHeight - stageHeight;
    const start = end - stageHeight * .62;
    const exit = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
    stage.style.setProperty('--gap', `${(exit * 50).toFixed(2)}%`);
    stage.style.setProperty('--exit', exit.toFixed(3));
    prologue.classList.toggle('is-crossing', exit > 0 && exit < 1);
    prologue.classList.toggle('stage-passed', exit >= .99);
    document.documentElement.classList.toggle('page-two-ready', exit > .74);
    document.documentElement.classList.toggle('page-two-header-ready', exit >= .99);
  }

  function lockMobileSceneHeight() {
    if (!mobileFlow.matches) return;
    const width = document.documentElement.clientWidth;
    if (width === lockedMobileWidth) return;
    lockedMobileWidth = width;
    const height = Math.round(window.visualViewport?.height || innerHeight);
    document.documentElement.style.setProperty('--mobile-scene-height', `${Math.max(560, height)}px`);
    document.documentElement.style.setProperty('--mobile-story-height', `${Math.max(560, height) * (moments.length + 1)}px`);
  }

  function updateMobileScenes() {
    if (!mobilePrepared) {
      moments.forEach(moment => {
        moment.inert = false;
        moment.removeAttribute('aria-hidden');
      });
      mobilePrepared = true;
    }
    const revealLine = innerHeight * .88;
    const copyLines = [.88, .78, .7, .72, .78];
    moments.forEach((moment, index) => {
      const rect = moment.getBoundingClientRect();
      if (rect.top < revealLine) moment.classList.add('mobile-media-visible');
      if (rect.top < innerHeight * copyLines[index]) moment.classList.add('mobile-visible');
      if (!reduceMotion.matches && rect.bottom > -innerHeight && rect.top < innerHeight * 2) {
        const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
        moment.style.setProperty('--parallax-y', `${Math.round((.5 - progress) * 38)}px`);
      }
    });
    if (moments[3].classList.contains('mobile-visible')) runCounter();
  }

  function syncVideo() {
    moments.forEach((moment, index) => {
      const video = moment.querySelector('video');
      if (!video) return;
      const shouldPlay = mobileFlow.matches ? moment.getBoundingClientRect().bottom > 0 && moment.getBoundingClientRect().top < innerHeight : index === active;
      if (shouldPlay && !reduceMotion.matches) {
        if (video.paused) video.play().catch(() => {});
      } else if (!video.paused) video.pause();
    });
  }
  function showMoment(index) {
    index = Math.max(0, Math.min(moments.length - 1, index));
    if (index === active) return;
    clearTimeout(leaveTimer);
    const previous = moments[active];
    moments.forEach(moment => moment.classList.remove('is-leaving'));
    previous.classList.remove('is-active');
    previous.classList.add('is-leaving');
    previous.inert = true;
    previous.setAttribute('aria-hidden', 'true');
    const next = moments[index];
    next.classList.add('is-active');
    if (mobileFlow.matches) next.classList.add('mobile-visible', 'mobile-media-visible');
    next.inert = false;
    next.removeAttribute('aria-hidden');
    active = index;
    if (index === 3) runCounter();
    syncVideo();
    leaveTimer = setTimeout(() => previous.classList.remove('is-leaving'), reduceMotion.matches ? 0 : 1150);
  }
  function updateScroll() {
    frame = false;
    updateHandoff();
    if (mobileFlow.matches) {
      updateMobileScenes();
      syncVideo();
      return;
    }
    if (mobilePrepared) {
      mobilePrepared = false;
      moments.forEach((moment, index) => {
        moment.classList.remove('mobile-visible');
        moment.inert = index !== active;
        if (index !== active) moment.setAttribute('aria-hidden', 'true');
        else moment.removeAttribute('aria-hidden');
      });
    }
    const unit = prologue.offsetHeight / (moments.length + 1);
    const position = Math.max(0, Math.min(moments.length - .001, (scrollY - prologue.offsetTop) / unit));
    showMoment(Math.round(position));
    scrollCue.style.setProperty('--scroll-progress', String(Math.min(1, position / (moments.length - 1))));
    const fraction = position - Math.floor(position);
    moments[active].style.setProperty('--drift', fraction.toFixed(3));
  }
  addEventListener('scroll', () => { if (!frame) { frame = true; requestAnimationFrame(updateScroll); } }, {passive:true});
  addEventListener('resize', () => { lockMobileSceneHeight(); updateScroll(); });
  mobileFlow.addEventListener('change', () => {
    lockMobileSceneHeight();
    updateScroll();
  });
  moments.forEach((moment, index) => { moment.inert = index !== 0; });
  if (mobileFlow.matches && !reduceMotion.matches) moments[0].classList.add('mobile-visible', 'mobile-media-visible');
  lockMobileSceneHeight();
  updateScroll();
  syncVideo();
  reduceMotion.addEventListener('change', () => { updateScroll(); syncVideo(); });
  const introTimer = setTimeout(() => document.documentElement.classList.add('intro-done'), 3900);
  if (mobileFlow.matches && !document.documentElement.classList.contains('skip-opening')) {
    function finishIntroOnScroll() {
      if (scrollY <= 8) return;
      document.documentElement.classList.add('skip-opening', 'intro-done');
      clearTimeout(introTimer);
      removeEventListener('scroll', finishIntroOnScroll);
    }
    addEventListener('scroll', finishIntroOnScroll, {passive:true});
  }

  document.querySelector('#enter-site').addEventListener('click', () => {
    if (mobileFlow.matches && reduceMotion.matches) {
      header.scrollIntoView({behavior:'instant',block:'start'});
    } else {
      const end = mobileFlow.matches
        ? prologue.offsetTop + prologue.offsetHeight - header.offsetHeight
        : prologue.offsetTop + prologue.offsetHeight - stage.offsetHeight;
      scrollTo({top:end + 2,behavior:reduceMotion.matches?'instant':'smooth'});
    }
  });
  if (location.hash === '#academy' && !(mobileFlow.matches && reduceMotion.matches)) {
    addEventListener('load', () => setTimeout(() => {
      const end = mobileFlow.matches
        ? prologue.offsetTop + prologue.offsetHeight - header.offsetHeight
        : prologue.offsetTop + prologue.offsetHeight - stage.offsetHeight;
      if (mobileFlow.matches || Math.abs(scrollY - end) < 110) {
        scrollTo({top:end + 2,behavior:'instant'});
        updateScroll();
      }
    }, 120), {once:true});
  }
  const menuToggle = document.querySelector('.menu-toggle');
  menuToggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  document.querySelectorAll('.header-links a').forEach(link => link.addEventListener('click', () => {
    header.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }), {threshold:.16});
  document.querySelectorAll('.observe').forEach(section => observer.observe(section));

  const seasonData = [
    ['assets/stage1.webp','강촌·지산 시즌 운영 사진'],
    ['assets/stage2.webp','용평·하이원·웰리힐리 시즌 운영 사진'],
    ['assets/stage3.jpg','삿포로 일본 캠프 사진']
  ];
  const seasonImage = document.querySelector('#season-image');
  let imageTimer;
  document.querySelectorAll('[data-season]').forEach(tab => {
    function select() {
      const index = Number(tab.dataset.season);
      document.querySelectorAll('[data-season]').forEach(item => item.setAttribute('aria-selected', String(item === tab)));
      seasonImage.classList.add('changing');
      clearTimeout(imageTimer);
      imageTimer = setTimeout(() => {
        seasonImage.src = seasonData[index][0];
        seasonImage.alt = seasonData[index][1];
        seasonImage.classList.remove('changing');
      }, reduceMotion.matches ? 0 : 150);
    }
    tab.addEventListener('click', select);
    tab.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') select(); });
  });

  const deck = document.querySelector('.coach-deck');
  const cards = [...deck.querySelectorAll('.stack-card')];
  const prev = document.querySelector('#deck-prev');
  const next = document.querySelector('#deck-next');
  let selected = 0;
  let hoverTimer;
  let hoverCandidate = -1;
  let hoverLockedUntil = 0;
  let swipeStart = null;
  let swipeFinishedAt = 0;
  function positionCards() {
    const width = deck.clientWidth;
    const cardWidth = cards[0].offsetWidth;
    const mobile = matchMedia('(max-width:760px)').matches;
    const center = mobile ? Math.max(0, (width - cardWidth) / 2) : Math.max(145, (width - cardWidth) / 2);
    const rightGap = mobile ? 16 : 35;
    const right = mobile ? width * .63 : Math.min(width * .66, width - cardWidth * .93 - (cards.length - 2) * rightGap);
    const left = mobile ? -cardWidth * .8 : 0;
    const leftGap = mobile ? 15 : 35;
    cards.forEach((card, index) => {
      let x, z, scale;
      if (index === selected) { x = center; z = 40; scale = 1; }
      else if (index < selected) {
        x = left + index * leftGap;
        z = 5 + index;
        scale = .91;
      } else {
        x = right + (index - selected - 1) * rightGap;
        z = 25 - (index - selected - 1);
        scale = .93;
      }
      card.style.setProperty('--x', `${Math.round(x)}px`);
      card.style.setProperty('--z', z);
      card.style.setProperty('--scale', scale);
      card.classList.toggle('is-right-stack', index > selected);
    });
  }
  function selectCoach(index) {
    index = Math.max(0, Math.min(cards.length - 1, index));
    if (index === selected) return;
    selected = index;
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === index);
      card.setAttribute('aria-pressed', String(i === index));
    });
    prev.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    positionCards();
    clearTimeout(hoverTimer);
    hoverCandidate = -1;
    hoverLockedUntil = performance.now() + 850;
  }
  cards.forEach(card => {
    const index = Number(card.dataset.coach);
    card.dataset.label = card.querySelector('.card-content strong').textContent;
    card.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || performance.now() < hoverLockedUntil || index === selected || hoverCandidate === index) return;
      clearTimeout(hoverTimer);
      hoverCandidate = index;
      hoverTimer = setTimeout(() => selectCoach(index), 155);
    });
    card.addEventListener('pointerleave', () => { clearTimeout(hoverTimer); if (hoverCandidate === index) hoverCandidate = -1; });
    card.addEventListener('click', event => { if (performance.now() - swipeFinishedAt < 500) { event.preventDefault(); return; } clearTimeout(hoverTimer); hoverCandidate = -1; selectCoach(index); });
  });
  deck.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    swipeStart = {x:event.clientX, y:event.clientY, id:event.pointerId};
  }, {passive:true});
  deck.addEventListener('pointerup', event => {
    if (!swipeStart || swipeStart.id !== event.pointerId) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    swipeFinishedAt = performance.now();
    selectCoach(selected + (dx < 0 ? 1 : -1));
  });
  deck.addEventListener('pointercancel', () => { swipeStart = null; });
  prev.disabled = true;
  prev.addEventListener('click', () => selectCoach(selected - 1));
  next.addEventListener('click', () => selectCoach(selected + 1));
  addEventListener('resize', positionCards);
  positionCards();
})();

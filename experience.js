(() => {
  const moments = [...document.querySelectorAll('.moment')];
  const prologue = document.querySelector('.prologue');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let frame = false;
  let leaveTimer;

  function syncVideo() {
    moments.forEach((moment, index) => {
      const video = moment.querySelector('video');
      if (!video) return;
      if (index === active && !reduceMotion.matches) video.play().catch(() => {});
      else video.pause();
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
    next.inert = false;
    next.removeAttribute('aria-hidden');
    active = index;
    syncVideo();
    leaveTimer = setTimeout(() => previous.classList.remove('is-leaving'), reduceMotion.matches ? 0 : 1150);
  }
  function updateScroll() {
    frame = false;
    const unit = prologue.offsetHeight / moments.length;
    const position = Math.max(0, Math.min(moments.length - .001, (scrollY - prologue.offsetTop) / unit));
    showMoment(Math.round(position));
    const fraction = position - Math.floor(position);
    moments[active].style.setProperty('--drift', fraction.toFixed(3));
  }
  addEventListener('scroll', () => { if (!frame) { frame = true; requestAnimationFrame(updateScroll); } }, {passive:true});
  addEventListener('resize', updateScroll);
  moments.forEach((moment, index) => { moment.inert = index !== 0; });
  updateScroll();
  syncVideo();
  reduceMotion.addEventListener('change', syncVideo);
  setTimeout(() => document.documentElement.classList.add('intro-done'), 3900);

  document.querySelector('#enter-site').addEventListener('click', () => {
    document.querySelector('#academy').scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'start'});
  });
  const header = document.querySelector('.chapter-header');
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
  function positionCards() {
    const width = deck.clientWidth;
    const cardWidth = cards[0].offsetWidth;
    const mobile = matchMedia('(max-width:760px)').matches;
    const center = mobile ? 8 : Math.max(145, (width - cardWidth) / 2);
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
    card.addEventListener('click', () => { clearTimeout(hoverTimer); hoverCandidate = -1; selectCoach(index); });
  });
  prev.disabled = true;
  prev.addEventListener('click', () => selectCoach(selected - 1));
  next.addEventListener('click', () => selectCoach(selected + 1));
  addEventListener('resize', positionCards);
  positionCards();
})();

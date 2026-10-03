(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...document.querySelectorAll('.ed-reveal,.ed-rule,.ed-cta')];
  if ('IntersectionObserver' in window && !reduce.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .15, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(target => observer.observe(target));
  } else targets.forEach(target => target.classList.add('is-visible'));

  const frames = [
    { image:'assets/race-podium.webp', alt:'대회 시상대에 오른 컨피던스스키 학생', title:'춘천시스키협회장배', body:'박OO 학생과 허OO 학생이 각각 2위를 기록했습니다. 아이들이 쌓아 온 기술을 대회 코스에서 보여 준 장면입니다.' },
    { image:'assets/race-alpine.png', alt:'알파인 스키 대회 출전 현장', title:'성북구청장배 전국 알파인 스키 대회', body:'박OO 학생과 허OO 학생이 각각 2위를 기록했습니다. 출발선부터 완주까지의 경험을 살펴보세요.' },
    { image:'assets/race-event.jpg', alt:'2025년 국제 주니어 기술선수권대회 참가 현장', title:'2025년 국제 주니어 기술선수권대회', body:'국제 주니어 기술선수권대회 참가 기록입니다. 대회 출전 준비와 현장 경험을 수업과 연결합니다.' }
  ];
  const frame = document.querySelector('.race-frame');
  const raceButtons = [...document.querySelectorAll('[data-race]')];
  raceButtons.forEach(button => button.addEventListener('click', () => {
    const selected = frames[Number(button.dataset.race)];
    if (!selected || !frame) return;
    raceButtons.forEach(item => item.setAttribute('aria-selected', String(item === button)));
    const photo = frame.querySelector('img');
    photo.src = selected.image;
    photo.alt = selected.alt;
    frame.querySelector('h3').textContent = selected.title;
    frame.querySelector('p').textContent = selected.body;
    frame.classList.remove('is-changing');
    void frame.offsetWidth;
    if (!reduce.matches) frame.classList.add('is-changing');
  }));

  const grades = ['스노우플라우','스노우플라우턴','스템턴','베이직 롱턴','베이직 숏턴','다이나믹 롱턴','다이나믹 숏턴','카빙성 롱턴','카빙성 숏턴','종합활강'];
  const gradeImages = grades.map((_, index) => `assets/grade-${String(index + 1).padStart(2, '0')}.webp`);
  const gradeResult = document.querySelector('.grade-result');
  const gradeMedia = document.querySelector('.grade-media');
  const gradePhoto = document.querySelector('#grade-photo');
  const gradeButtons = [...document.querySelectorAll('[data-grade]')];
  let gradeRequest = 0;
  if (gradeMedia && 'IntersectionObserver' in window) {
    const preload = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      gradeImages.slice(1).forEach(src => { const img = new Image(); img.src = src; });
      preload.disconnect();
    }, { rootMargin: '250px' });
    preload.observe(gradeMedia);
  }
  gradeButtons.forEach(button => button.addEventListener('click', () => {
    const number = Number(button.dataset.grade);
    gradeButtons.forEach(item => item.setAttribute('aria-selected', String(item === button)));
    gradeResult.querySelector('b').textContent = String(number).padStart(2,'0');
    gradeResult.querySelector('span').textContent = grades[number - 1];
    gradeResult.classList.remove('is-changing');
    void gradeResult.offsetWidth;
    if (!reduce.matches) gradeResult.classList.add('is-changing');
    if (!gradePhoto || !gradeMedia) return;
    const request = ++gradeRequest;
    const next = new Image();
    next.onload = () => {
      if (request !== gradeRequest) return;
      gradePhoto.src = gradeImages[number - 1];
      gradePhoto.alt = `${number}급 ${grades[number - 1]} 동작 예시`;
      gradeMedia.setAttribute('aria-labelledby', button.id);
      gradeMedia.classList.remove('is-changing');
      void gradeMedia.offsetWidth;
      if (!reduce.matches) gradeMedia.classList.add('is-changing');
    };
    next.src = gradeImages[number - 1];
  }));
})();

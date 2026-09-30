(() => {
  if (!('IntersectionObserver' in window)) return;
  const targets = [...document.querySelectorAll('.section, .director-quote, .program, .process-row, .route-row, .coach-row, .faq details')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.13, rootMargin:'0px 0px -4% 0px'});
  targets.forEach(target => observer.observe(target));
  requestAnimationFrame(() => document.body.classList.add('motion-ready'));
  const number = document.querySelector('.big-stat [data-count-to]');
  if (number) {
    const countObserver = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      countObserver.disconnect();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { number.textContent = '80'; return; }
      const start = performance.now();
      const count = now => {
        const t = Math.min(1, (now - start) / 850);
        number.textContent = String(Math.round(80 * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(count);
      };
      number.textContent = '0';
      requestAnimationFrame(count);
    }, {threshold:.3});
    countObserver.observe(number);
  }
})();

(() => {
  if (!('IntersectionObserver' in window)) return;
  const targets = [...document.querySelectorAll('.program, .process-row, .route-row, .coach-row')];
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
})();

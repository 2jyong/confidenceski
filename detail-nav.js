(() => {
  document.body.classList.add('has-detail-nav');
  const header = document.createElement('header');
  header.className = 'detail-nav';
  header.innerHTML = '<a class="detail-brand" href="/#academy" aria-label="컨피던스스키 안내로"><img src="assets/logo.png" alt="컨피던스스키"></a><nav aria-label="페이지 메뉴"><a href="/#prologue">홈</a><a href="lesson">수업 안내</a><a href="season">시즌 운영</a><a href="coaches">지도자</a><a href="race">대회·등급</a><a href="blog">이야기</a><a href="contact">문의</a><a class="detail-contact" href="https://pf.kakao.com/_xaxitrX" target="_blank" rel="noopener">상담하기 ↗</a></nav><button type="button" class="detail-menu" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span></button>';
  document.body.prepend(header);
  const current = location.pathname.split('/').pop().replace(/\.html$/, '');
  header.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href').replace(/\.html$/, '') === current) link.setAttribute('aria-current', 'page');
  });
  const button = header.querySelector('.detail-menu');
  button.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
})();

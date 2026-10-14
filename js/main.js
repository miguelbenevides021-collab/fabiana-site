/* Navegação e animações da prévia. Sem backend ou agendamento interno. */
const header = document.querySelector('.header');
const progress = document.querySelector('.progress');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-menu');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollQueued = false;
function updateScroll() {
  header.classList.toggle('scrolled', window.scrollY > 20);
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(window.scrollY / distance, 1) : 0})`;
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();
function closeMenu(returnFocus = false) {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const opening = menu.hidden;
  menu.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
  if (opening && !reduceMotion.matches && window.gsap) {
    gsap.fromTo(menu, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: .3 });
    gsap.fromTo(menu.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: .045, duration: .35 });
  }
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) closeMenu(true); });
document.addEventListener('click', event => { if (!menu.hidden && !menu.contains(event.target) && !header.contains(event.target)) closeMenu(); });
window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro.from('.hero-intro', { opacity: 0, y: 12, duration: .7 })
      .from('h1 .line > span', { yPercent: 110, duration: 1.1, stagger: .14 }, .12)
      .from('.photo-frame', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power3.inOut' }, .15)
      .from('.hero-photo', { scale: 1.13, duration: 1.8 }, .2)
      .from('.hero-description, .hero-actions, .hero-location', { opacity: 0, y: 18, duration: .8, stagger: .12 }, .8)
      .from('.photo-label, .orbit, .photo-vertical', { opacity: 0, y: 14, duration: .8, stagger: .1 }, 1.15)
      .from('.whatsapp', { opacity: 0, y: 20, duration: .6 }, 1.6);
    gsap.utils.toArray('.reveal').forEach(element => {
      gsap.from(element, { opacity: 0, y: 36, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
    });
    gsap.to('.hero-photo', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.fromTo('.about-photo img', { scale: 1.08, yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    return () => { document.querySelectorAll('.treatment-card').forEach(card => { card.style.transform = ''; }); };
  });
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.treatment-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (reduceMotion.matches || !pointer.matches) return;
      const rect = card.getBoundingClientRect();
      gsap.to(card, { rotationY: ((event.clientX - rect.left) / rect.width - .5) * 3, rotationX: -((event.clientY - rect.top) / rect.height - .5) * 3, transformPerspective: 900, duration: .5, overwrite: 'auto' });
    });
    card.addEventListener('pointerleave', () => gsap.to(card, { rotationX: 0, rotationY: 0, duration: .5, overwrite: 'auto' }));
  });
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

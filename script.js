const revealElements = document.querySelectorAll('[data-reveal]');

const observer = new IntersectionObserver(
  (entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      currentObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealElements.forEach((element) => observer.observe(element));

document.querySelector('.gift-cta')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const targetId = button?.dataset?.target;
  const section = targetId ? document.getElementById(targetId) : null;

  button.classList.add('activated');
  setTimeout(() => button.classList.remove('activated'), 320);

  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

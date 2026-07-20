import { useEffect } from 'react';

export function useScrollAnimation() {
  useEffect(() => {
    // Only arm the hidden state when the observer is actually available,
    // so content is never stuck invisible if JS or the observer fails.
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Stop observing once animated
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(el => observer.observe(el));
    document.documentElement.classList.add('scroll-anim-ready');

    return () => {
      elements.forEach(el => observer.unobserve(el));
      document.documentElement.classList.remove('scroll-anim-ready');
    };
  }, []);
}

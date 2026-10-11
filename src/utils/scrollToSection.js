// The navbar is fixed, so a plain anchor jump or scrollIntoView leaves the target
// heading hidden underneath it. Every in-page link goes through here so the
// offset is applied consistently.
const NAV_OFFSET_DESKTOP = 92;
const NAV_OFFSET_MOBILE = 76;

export const getNavOffset = () =>
  window.innerWidth <= 768 ? NAV_OFFSET_MOBILE : NAV_OFFSET_DESKTOP;

export const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const scrollToSection = (href) => {
  if (!href || !href.startsWith('#')) return false;

  const target = document.querySelector(href);
  if (!target) return false;

  const top = target.getBoundingClientRect().top + window.scrollY - getNavOffset();

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth'
  });

  window.history.replaceState(null, '', href);
  return true;
};

// Convenience wrapper for onClick handlers on in-page anchors.
export const handleAnchorClick = (event, href) => {
  const destination = href || event.currentTarget?.getAttribute('href');
  if (!destination || !destination.startsWith('#')) return;

  if (scrollToSection(destination)) {
    event.preventDefault();
  }
};

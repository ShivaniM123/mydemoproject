import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Split footer nav into two rows like sparkdriverapp.com: primary links on one line,
 * then privacy / copyright on the line below.
 * @param {Element} wrapper .default-content-wrapper
 */
function splitFooterNavRows(wrapper) {
  const ul = wrapper.querySelector('ul');
  if (!ul) return;

  const items = [...ul.querySelectorAll(':scope > li')];
  const splitIdx = items.findIndex((li) => {
    const t = (li.textContent || '').trim();
    return /privacy choices|your privacy|opt-out|©\s*\d{4}|walmart,?\s*inc/i.test(t);
  });

  if (splitIdx <= 0) return;

  const ulPrimary = document.createElement('ul');
  ulPrimary.className = 'footer-nav-primary';

  const ulSecondary = document.createElement('ul');
  ulSecondary.className = 'footer-nav-secondary';

  items.slice(0, splitIdx).forEach((li) => ulPrimary.append(li));
  items.slice(splitIdx).forEach((li) => ulSecondary.append(li));

  const stack = document.createElement('div');
  stack.className = 'footer-links-stack';
  stack.append(ulPrimary, ulSecondary);

  ul.replaceWith(stack);
}

/**
 * @param {Element} p
 * @returns {boolean}
 */
function isAppStoreParagraph(p) {
  if (p.tagName !== 'P') return false;
  const h = (p.innerHTML + p.textContent).toLowerCase();
  if (/google play|app store|get it on|play\.google|apps\.apple|itunes\.apple/.test(h)) return true;
  if (p.querySelector('a[href*="play.google"], a[href*="apple.com"], a[href*="apps.apple"], a[href*="itunes"]')) {
    return true;
  }
  const imgs = p.querySelectorAll('img');
  for (let i = 0; i < imgs.length; i += 1) {
    const alt = (imgs[i].alt || '').toLowerCase();
    const src = (imgs[i].src || '').toLowerCase();
    if (/app store|google play|play store|get it on/.test(alt)) return true;
    if (/googleplay|app-store|appstore|play.?badge|apple.?store/.test(src)) return true;
  }
  return false;
}

/**
 * Logo = first paragraph with an image that is not an app-store badge block.
 * @param {Element} p
 * @returns {boolean}
 */
function isLikelyLogoParagraph(p) {
  if (p.tagName !== 'P' || !p.querySelector('img')) return false;
  return !isAppStoreParagraph(p);
}

/**
 * Put both store badges in ONE cell (DA often uses two <p> — was breaking CSS grid).
 * @param {Element} wrapper
 */
function consolidateLogoAndBadges(wrapper) {
  wrapper.querySelectorAll('.spark-footer-logo, .spark-footer-badges').forEach((el) => {
    el.classList.remove('spark-footer-logo', 'spark-footer-badges');
  });

  const paragraphs = [...wrapper.children].filter((c) => c.tagName === 'P');
  const logoP = paragraphs.find(isLikelyLogoParagraph) || paragraphs[0];
  const storePs = paragraphs.filter((p) => p !== logoP && isAppStoreParagraph(p));

  if (logoP) logoP.classList.add('spark-footer-logo');

  if (storePs.length > 1) {
    const host = document.createElement('p');
    host.className = 'spark-footer-badges';
    storePs.forEach((p) => {
      while (p.firstChild) host.append(p.firstChild);
      p.remove();
    });
    wrapper.append(host);
  } else if (storePs.length === 1) {
    storePs[0].classList.add('spark-footer-badges');
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  let footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';

  // local dev: content folder files are served under /content/ prefix
  if (!footerMeta && window.location.pathname.startsWith('/content/')) {
    footerPath = '/content/footer';
  }

  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  footer.querySelectorAll('.default-content-wrapper').forEach((wrapper) => {
    wrapper.classList.add('spark-footer-inner');
    splitFooterNavRows(wrapper);
    consolidateLogoAndBadges(wrapper);
  });

  // footer icons: override lazy loading so they render immediately
  footer.querySelectorAll('span.icon img').forEach((img) => {
    img.loading = 'eager';
  });

  block.append(footer);
}

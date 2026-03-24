import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 1025px)');

function closeAllDropdowns(nav) {
  nav.querySelectorAll('.nav-sections .nav-drop').forEach((drop) => {
    drop.classList.remove('opened');
    drop.setAttribute('aria-expanded', 'false');
  });
}

function toggleDropdown(drop, nav) {
  const wasOpen = drop.classList.contains('opened');
  closeAllDropdowns(nav);
  if (!wasOpen) {
    drop.classList.add('opened');
    drop.setAttribute('aria-expanded', 'true');
  }
}

function toggleMobileMenu(nav) {
  const expanded = nav.getAttribute('aria-expanded') === 'true';
  const linkContainer = nav.querySelector('.nav-link-container');
  const trigger = nav.querySelector('.nav-mobile-trigger');

  if (expanded) {
    nav.setAttribute('aria-expanded', 'false');
    linkContainer.classList.remove('opened');
    trigger.classList.remove('activated');
    document.body.style.overflowY = '';
    nav.classList.remove('fixed');
  } else {
    nav.setAttribute('aria-expanded', 'true');
    linkContainer.classList.add('opened');
    trigger.classList.add('activated');
    document.body.style.overflowY = 'hidden';
    nav.classList.add('fixed');
  }
  closeAllDropdowns(nav);
}

function buildChevron() {
  const span = document.createElement('span');
  span.className = 'chevron-icon';
  span.innerHTML = '<img src="/icons/chevron-down.svg" alt="" aria-hidden="true">';
  return span;
}

function buildDropdownItem(label, children) {
  const li = document.createElement('li');
  li.classList.add('nav-drop');
  li.setAttribute('aria-expanded', 'false');

  const trigger = document.createElement('a');
  trigger.href = '#';
  trigger.className = 'dropdown-trigger';
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.textContent = label;
  trigger.appendChild(buildChevron());
  li.appendChild(trigger);

  const childUl = document.createElement('ul');
  childUl.className = 'nav-child-list';
  children.forEach(({ text, href }) => {
    const childLi = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    childLi.appendChild(a);
    childUl.appendChild(childLi);
  });
  li.appendChild(childUl);

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDropdown(li, li.closest('nav'));
  });

  return li;
}

function buildLinkItem(label, href) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  li.appendChild(a);
  return li;
}

function decorateNavFromFragment(nav) {
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      brandLink.setAttribute('aria-label', 'Spark Driver home');
      const p = brandLink.closest('p');
      if (p) p.className = '';
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const ul = navSections.querySelector(':scope .default-content-wrapper > ul');
    if (ul) {
      ul.querySelectorAll(':scope > li').forEach((li) => {
        const subUl = li.querySelector('ul');
        if (subUl) {
          li.classList.add('nav-drop');
          li.setAttribute('aria-expanded', 'false');

          // Find label text - CMS may wrap it in <p> or leave as text node
          let labelText = '';
          let labelNode = null;
          [...li.childNodes].some((child) => {
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
              labelText = child.textContent.trim();
              labelNode = child;
              return true;
            }
            if (child.tagName === 'P' && !child.querySelector('a')) {
              labelText = child.textContent.trim();
              labelNode = child;
              return true;
            }
            return false;
          });
          if (labelNode) labelNode.remove();

          const trigger = document.createElement('a');
          trigger.href = '#';
          trigger.className = 'dropdown-trigger';
          trigger.setAttribute('role', 'button');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.textContent = labelText;
          trigger.appendChild(buildChevron());

          li.prepend(trigger);
          subUl.classList.add('nav-child-list');

          trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown(li, nav);
          });
        }
      });
    }
  }

  return { navBrand, navSections };
}

function buildInlineNav() {
  // Brand
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandP = document.createElement('p');
  const brandLink = document.createElement('a');
  brandLink.href = '/en_us';
  brandLink.setAttribute('aria-label', 'Spark Driver home');
  const logo = document.createElement('img');
  logo.src = '/icons/spark-driver-logo.svg';
  logo.alt = 'Spark Driver';
  brandLink.appendChild(logo);
  brandP.appendChild(brandLink);
  brand.appendChild(brandP);

  // Sections
  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  const ul = document.createElement('ul');

  ul.appendChild(buildDropdownItem('Earnings', [
    { text: 'Trip earnings', href: '/en_us/earnings#trip-earnings' },
    { text: 'Additional earnings', href: '/en_us/earnings#additional-earnings' },
    { text: 'Get your earnings', href: '/en_us/earnings#get-your-earnings' },
  ]));

  ul.appendChild(buildDropdownItem('Offers', [
    { text: 'Offer types', href: '/en_us/offers#offer-types' },
    { text: 'Additional delivery types', href: '/en_us/offers#additional-delivery-types' },
  ]));

  ul.appendChild(buildDropdownItem('Rewards', [
    { text: 'Spark Driver Rewards Program', href: '/en_us/rewards#sparkdriver-rewards-program' },
    { text: 'Qualifications', href: '/en_us/rewards#qualifications' },
  ]));

  ul.appendChild(buildLinkItem('Blog', '/en_us/blog'));
  ul.appendChild(buildLinkItem('FAQ', '/en_us/faqs'));

  sections.appendChild(ul);

  return { brand, sections };
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Try to load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  let navBrand;
  let navSections;

  if (fragment) {
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
    ({ navBrand, navSections } = decorateNavFromFragment(nav));
  } else {
    // Fallback: build nav inline
    const inline = buildInlineNav();
    navBrand = inline.brand;
    navSections = inline.sections;
  }

  // Build the nav structure
  const navContent = document.createElement('div');
  navContent.className = 'nav-content';
  navContent.appendChild(navBrand);

  // Link container (wraps sections + utility for mobile slide)
  const linkContainer = document.createElement('div');
  linkContainer.className = 'nav-link-container';
  linkContainer.appendChild(navSections);

  // Utility links (login) - visible in mobile menu
  const mobileTools = document.createElement('div');
  mobileTools.className = 'nav-mobile-tools';

  const loginLink = document.createElement('a');
  loginLink.href = 'https://www.sparkdriverapp.com/enroll';
  loginLink.className = 'nav-login-link';
  loginLink.textContent = 'Log in';

  const utilityDiv = document.createElement('div');
  utilityDiv.className = 'nav-utility';
  utilityDiv.appendChild(loginLink);
  mobileTools.appendChild(utilityDiv);

  linkContainer.appendChild(mobileTools);
  navContent.appendChild(linkContainer);

  // Desktop-only login (separate from mobile tools)
  const desktopLogin = document.createElement('a');
  desktopLogin.href = 'https://www.sparkdriverapp.com/enroll';
  desktopLogin.className = 'nav-login-link nav-desktop-only';
  desktopLogin.textContent = 'Log in';
  navContent.appendChild(desktopLogin);

  // CTA button
  const ctaBtn = document.createElement('a');
  ctaBtn.href = 'https://www.sparkdriverapp.com/enroll';
  ctaBtn.className = 'nav-cta-button';
  ctaBtn.textContent = 'Sign up';
  navContent.appendChild(ctaBtn);

  // Mobile trigger (hamburger)
  const mobileTrigger = document.createElement('a');
  mobileTrigger.className = 'nav-mobile-trigger';
  mobileTrigger.setAttribute('role', 'button');
  mobileTrigger.setAttribute('aria-controls', 'nav');
  mobileTrigger.setAttribute('aria-label', 'Open navigation');
  mobileTrigger.innerHTML = `
    <div class="trigger-line"></div>
    <div class="trigger-line"></div>
    <div class="trigger-line"></div>
  `;
  mobileTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMobileMenu(nav);
  });
  navContent.appendChild(mobileTrigger);

  nav.textContent = '';
  nav.appendChild(navContent);

  // Desktop: hover to open/close dropdowns
  nav.querySelectorAll('.nav-sections .nav-drop').forEach((drop) => {
    drop.addEventListener('mouseenter', () => {
      if (isDesktop.matches) {
        closeAllDropdowns(nav);
        drop.classList.add('opened');
        drop.setAttribute('aria-expanded', 'true');
      }
    });
    drop.addEventListener('mouseleave', () => {
      if (isDesktop.matches) {
        drop.classList.remove('opened');
        drop.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      closeAllDropdowns(nav);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns(nav);
      if (nav.getAttribute('aria-expanded') === 'true') {
        toggleMobileMenu(nav);
      }
    }
  });

  // Handle resize
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMobileMenu(nav);
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

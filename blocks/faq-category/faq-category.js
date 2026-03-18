const ICON_MAP = {
  'getting-started': '/icons/faq-getting-started.svg',
  'earnings-rewards': '/icons/faq-earnings-rewards.svg',
  eligibility: '/icons/faq-eligibility.svg',
  general: '/icons/faq-general.svg',
};

export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.className = 'faq-category-nav';
  nav.setAttribute('aria-label', 'FAQ categories');

  const list = document.createElement('ul');
  list.className = 'faq-category-list';

  const categories = [];
  let activeCategory = null;
  let isSearching = false;

  function showCategory(selectedId) {
    categories.forEach(({ targetId }) => {
      const heading = document.getElementById(targetId);
      const section = heading?.closest('.section');
      if (section) {
        section.classList.toggle('faq-category-filtered', targetId !== selectedId);
      }
    });
  }

  [...block.children].forEach((row, index) => {
    const label = row.children[0]?.textContent?.trim();
    const targetId = row.children[1]?.textContent?.trim();
    if (!label || !targetId) return;

    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'faq-category-item';
    button.dataset.target = targetId;

    const iconSrc = ICON_MAP[targetId];
    if (iconSrc) {
      const img = document.createElement('img');
      img.src = iconSrc;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.className = 'faq-category-icon';
      img.width = 64;
      img.height = 64;
      button.append(img);
    }

    const span = document.createElement('span');
    span.textContent = label;
    button.append(span);

    if (index === 0) {
      button.classList.add('faq-category-active');
      activeCategory = targetId;
    }

    button.addEventListener('click', () => {
      if (isSearching) {
        // Clear search when clicking a category
        const searchInput = document.querySelector('.faq-search-input');
        if (searchInput) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
        }
        isSearching = false;
      }

      list.querySelectorAll('.faq-category-item').forEach((btn) => btn.classList.remove('faq-category-active'));
      button.classList.add('faq-category-active');
      activeCategory = targetId;

      showCategory(targetId);
    });

    li.append(button);
    list.append(li);
    categories.push({ button, targetId });
  });

  nav.append(list);
  block.replaceChildren(nav);

  // Re-apply filter whenever FAQ sections finish loading and become visible.
  // Sections start hidden (display:none) and get display:null when loaded,
  // so we watch for attribute changes on main to catch each section load.
  const main = document.querySelector('main');
  if (main) {
    const observer = new MutationObserver(() => {
      if (!isSearching) showCategory(activeCategory);
    });
    observer.observe(main, { attributes: true, attributeFilter: ['data-section-status'], subtree: true });
  }

  // Also apply immediately for any sections already loaded
  showCategory(activeCategory);

  // Listen for search filter events
  document.addEventListener('faq-filter', (e) => {
    const { query } = e.detail;

    if (query) {
      isSearching = true;
      // During search, show all sections (let search handle visibility)
      categories.forEach(({ button, targetId }) => {
        const heading = document.getElementById(targetId);
        const section = heading?.closest('.section');
        if (section) {
          section.classList.remove('faq-category-filtered');
          const hidden = section.classList.contains('faq-section-hidden');
          button.classList.toggle('faq-category-disabled', hidden);
        }
      });

      // Update active to first visible
      let firstVisible = null;
      categories.forEach(({ button }) => {
        button.classList.remove('faq-category-active');
        if (!button.classList.contains('faq-category-disabled') && !firstVisible) {
          firstVisible = button;
        }
      });
      if (firstVisible) firstVisible.classList.add('faq-category-active');
    } else {
      isSearching = false;
      // Search cleared — restore category filter
      categories.forEach(({ button }) => {
        button.classList.remove('faq-category-disabled');
        button.classList.remove('faq-category-active');
      });

      // Restore first category as active
      if (categories.length > 0) {
        categories[0].button.classList.add('faq-category-active');
        activeCategory = categories[0].targetId;
      }
      showCategory(activeCategory);
    }
  });
}

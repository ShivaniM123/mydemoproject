export default function decorate(block) {
  const row = block.children[0];
  const placeholder = row?.textContent?.trim() || 'Search FAQs...';

  const field = document.createElement('div');
  field.className = 'faq-search-field';

  const icon = document.createElement('span');
  icon.className = 'faq-search-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'faq-search-input';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);

  field.append(icon, input);
  block.replaceChildren(field);

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const query = input.value.toLowerCase().trim();
      const items = document.querySelectorAll('.faq .faq-item');
      let visible = 0;

      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        const match = !query || text.includes(query);
        item.classList.toggle('faq-item-hidden', !match);
        if (match) visible += 1;
      });

      // Hide empty category sections
      document.querySelectorAll('.faq').forEach((faq) => {
        const sec = faq.closest('.section');
        if (!sec) return;
        const hasVisible = faq.querySelectorAll('.faq-item:not(.faq-item-hidden)').length > 0;
        sec.classList.toggle('faq-section-hidden', !hasVisible && !!query);
      });

      // No results message
      let msg = block.querySelector('.faq-search-no-results');
      if (visible === 0 && query) {
        if (!msg) {
          msg = document.createElement('p');
          msg.className = 'faq-search-no-results';
          msg.textContent = 'No matching questions found. Try a different search term.';
          block.append(msg);
        }
      } else if (msg) {
        msg.remove();
      }

      // Notify category nav
      document.dispatchEvent(new CustomEvent('faq-filter', { detail: { query, visible } }));
    }, 250);
  });
}

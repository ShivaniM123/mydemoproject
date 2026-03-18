/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: sparkdriver cleanup.
 * Selectors from captured DOM of sparkdriverapp.com.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie/consent overlays, modals, search overlay
    WebImporter.DOMUtils.remove(element, [
      '.privacy-modal',
      '.search-mobile-model',
      '.custom-targeting-buttons',
    ]);

    // Scope to main page content only - remove entire header/nav panel
    WebImporter.DOMUtils.remove(element, [
      '.hide-on-print',
      '#slidenav-overlay',
      '.d4s-header-container',
      'segmentation-timeout > .content-container > div:first-child',
    ]);
  }

  if (hookName === H.after) {
    // Remove non-authorable content: header, footer, breadcrumbs, nav
    WebImporter.DOMUtils.remove(element, [
      '#header-container',
      '.dfs-footer-container',
      '.dfs-footer-content-container',
      '.extended-footer-component',
      '.list-two-component',
      '#skipto-main-footer',
      '.breadcrumbComponent',
      '[class*="breadcrumb"]',
      '#skipto-main-link',
      '#skipto-footer-link',
      '#skipto-main-wrap',
      '.whitespace-component',
      '.d4s-header-container',
      '.d4s-header-content',
      'noscript',
      'link',
      'iframe',
    ]);

    // Remove empty reference/parbase sections that contain scripts/styles placeholders
    element.querySelectorAll('.reference.parbase.section').forEach((ref) => {
      const text = ref.textContent.trim();
      if (text === 'Styles' || text === 'Scripts' || text === '') {
        ref.remove();
      }
    });

    // Wrap CTA button links in <strong> for primary button decoration
    // Skip links inside block tables (already handled by block CSS)
    element.querySelectorAll('a.button-primary, a.button-glms-button').forEach((link) => {
      if (link.closest('table')) return;
      const strong = element.ownerDocument.createElement('strong');
      link.before(strong);
      strong.appendChild(link);
    });

    // Remove leaf-level "Styles" / "Scripts" placeholder divs
    element.querySelectorAll('div').forEach((div) => {
      if (div.children.length === 0) {
        const text = div.textContent.trim();
        if (text === 'Styles' || text === 'Scripts') {
          div.remove();
        }
      }
    });

    // Clean tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
      el.removeAttribute('data-analytics');
    });
  }
}

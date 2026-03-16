/**
 * loads and decorates the cta block
 * @param {Element} block The cta block element
 */
export default function decorate(block) {
  const content = block.querySelector(':scope > div > div');
  if (content) content.classList.add('cta-content');
}

/**
 * loads and decorates the hero block
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  if (cols.length === 2) {
    block.classList.add('hero-split');
    cols[0].classList.add('hero-content');
    cols[1].classList.add('hero-media');
  }
}

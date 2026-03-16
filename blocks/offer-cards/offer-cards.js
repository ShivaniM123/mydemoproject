export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    [...row.children].forEach((col) => {
      if (col.children.length === 1 && (col.querySelector('picture') || col.querySelector('img'))) {
        col.className = 'offer-cards-image';
      } else {
        col.className = 'offer-cards-body';
      }
      li.append(col);
    });
    ul.append(li);
  });

  block.replaceChildren(ul);
}

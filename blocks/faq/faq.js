export default function decorate(block) {
  // Tag block with its category from the nearest section heading
  const section = block.closest('.section');
  const heading = section?.querySelector(':scope > .default-content-wrapper h2');
  if (heading) {
    block.dataset.category = heading.id;
  }

  [...block.children].forEach((row, index) => {
    const question = row.children[0];
    const answer = row.children[1];
    if (!question || !answer) return;

    row.classList.add('faq-item');
    const id = `faq-${block.dataset.category || 'item'}-${index}`;
    const answerId = `${id}-answer`;

    const button = document.createElement('button');
    button.className = 'faq-question';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', answerId);
    button.innerHTML = question.innerHTML;

    const answerDiv = document.createElement('div');
    answerDiv.className = 'faq-answer';
    answerDiv.id = answerId;
    answerDiv.setAttribute('role', 'region');
    answerDiv.setAttribute('aria-hidden', 'true');
    answerDiv.innerHTML = answer.innerHTML;

    row.replaceChildren(button, answerDiv);

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answerDiv.setAttribute('aria-hidden', String(expanded));
      row.classList.toggle('faq-item-active');
    });
  });
}

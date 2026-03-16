export default function decorate(block) {
  [...block.children].forEach((row) => {
    const question = row.children[0];
    const answer = row.children[1];
    if (!question || !answer) return;

    row.classList.add('faq-item');

    const button = document.createElement('button');
    button.className = 'faq-question';
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = question.innerHTML;

    const answerDiv = document.createElement('div');
    answerDiv.className = 'faq-answer';
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

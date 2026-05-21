async function loadDefaultPhrases() {
  const res = await fetch('values.json');
  const data = await res.json();
  return data.phrases;
}

async function getCombinedPhrases() {
  const textarea = document.getElementById('customPhrases').value.trim();

  let custom = [];

  // Custom input (optional)
  if (textarea.length > 0) {
    custom = textarea
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }

  const defaults = await loadDefaultPhrases();

  // Merge + dedupe
  return Array.from(new Set([...custom, ...defaults]));
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateCard(phrases) {
  const card = shuffle(phrases).slice(0, 25);
  card[12] = "FREE";
  return card;
}

function generateMultipleCards(phrases, count) {
  return Array.from({ length: count }, () => generateCard(phrases));
}

function renderCards(cards) {
  return cards.map((card, i) => {
    const cells = card.map(text => `
      <div class="aspect-square flex items-center justify-center text-center p-1 md:p-2 border border-purple-300 bg-white text-[10px] sm:text-xs md:text-sm break-words">
        ${text}
      </div>
    `).join('');

    return `
      <section class="page mb-10 break-after-page">
        <h2 class="text-center text-lg md:text-2xl font-bold text-purple-700 mb-4">
          Summer of Whismy Bingo!
        </h2>

        <div class="grid grid-cols-5 w-full max-w-[500px] md:max-w-[650px] mx-auto bg-purple-100 p-2 rounded-2xl shadow-lg gap-1">
          ${cells}
        </div>
      </section>
    `;
  }).join('');
}

async function buildPrintHTML(cards) {
  // Load external template file
  const res = await fetch('print-template.html');
  let template = await res.text();

  const renderedCards = renderCards(cards);

  return template.replace('<!--CARDS-->', renderedCards);
}

async function generate() {
  const count = parseInt(document.getElementById('count').value, 10) || 1;

  let phrases = await getCombinedPhrases();

  if (phrases.length < 25) {
    alert("You need at least 25 total phrases (custom + default).");
    return;
  }

  const required = 25 * count;

  // Expand pool if needed
  while (phrases.length < required) {
    phrases = phrases.concat(phrases);
  }

  phrases = phrases.slice(0, required);

  const cards = generateMultipleCards(phrases, count);

  const html = await buildPrintHTML(cards);

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();

  win.focus();
  win.print();
}
'use strict';

const query = new URLSearchParams(location.search);
const state = {
  lang: query.get('lang') === 'ru' ? 'ru' : 'en',
  mode: query.get('view') === 'text' ? 'text' : 'deck',
  slide: Math.max(0, Math.min(9, (parseInt(query.get('slide'), 10) || 1) - 1))
};
const $ = id => document.getElementById(id);
const make = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const mailLink = (text, subject, className) => {
  const link = make('a', text, className);
  link.href = `mailto:o.chetrari@gmail.com?subject=${encodeURIComponent(subject)}`;
  return link;
};

function heading(section, slide) {
  section.append(make('p', slide.kicker, 'kicker'));
  const title = make('h2', slide.title);
  title.id = `${slide.key}-title`;
  section.append(title, make('p', slide.lead, 'lead'));
}

function columns(items, className, itemClass) {
  const group = make('div', undefined, className);
  items.forEach(([title, body], index) => {
    const item = make('div', undefined, itemClass);
    if (itemClass === 'pillar') item.append(make('span', String(index + 1).padStart(2, '0'), 'number'));
    item.append(make('h3', title), make('p', body));
    group.append(item);
  });
  return group;
}

function renderSlide(slide, index) {
  const ui = kit[state.lang].ui;
  const section = make('section', undefined, `slide ${slide.type}`);
  section.id = slide.key;
  section.setAttribute('aria-labelledby', `${slide.key}-title`);
  section.tabIndex = -1;
  const meta = make('div', undefined, 'slide-meta');
  meta.append(make('span', 'My Touchpoint', 'slide-brand'), make('span', `${String(index + 1).padStart(2, '0')} / 10`));
  section.append(meta);
  if (slide.type === 'opening') {
    const grid = make('div', undefined, 'opening-grid');
    const copy = make('div');
    const title = make('h1', slide.title);
    title.id = `${slide.key}-title`;
    copy.append(make('p', slide.kicker, 'kicker'), title, make('p', slide.lead, 'lead'), make('p', slide.statement, 'statement'));
    const moment = make('aside', undefined, 'late-moment');
    moment.setAttribute('aria-label', ui.example);
    moment.append(make('p', slide.clock, 'clock'), make('p', slide.notification, 'notification'), make('p', slide.draft, 'draft'));
    grid.append(copy, moment);
    section.append(grid, make('p', slide.note, 'slide-foot'));
    return section;
  }
  heading(section, slide);
  switch (slide.type) {
    case 'comparison': {
      const table = make('table', undefined, 'comparison-table');
      table.setAttribute('aria-label', slide.kicker);
      const head = make('thead');
      const titles = make('tr');
      slide.columns.forEach(title => { const th = make('th', title); th.scope = 'col'; titles.append(th); });
      head.append(titles);
      const body = make('tbody');
      slide.rows.forEach(row => {
        const tr = make('tr');
        row.forEach((value, column) => {
          const cell = make(column === 0 ? 'th' : 'td', value);
          if (column === 0) cell.scope = 'row';
          tr.append(cell);
        });
        body.append(tr);
      });
      table.append(head, body);
      section.append(table, make('p', slide.takeaway, 'takeaway'));
      break;
    }
    case 'product':
      section.append(columns(slide.pillars, 'pillars', 'pillar'), make('p', slide.ribbon, 'ribbon'));
      break;
    case 'steps': {
      const steps = make('div', undefined, 'steps-grid');
      slide.steps.forEach(([title, body], index) => {
        const item = make('div', undefined, 'step');
        item.append(make('span', String(index + 1).padStart(2, '0'), 'step-index'), make('h3', title), make('p', body));
        steps.append(item);
      });
      section.append(steps);
      break;
    }
    case 'moment':
      section.append(columns([slide.before, slide.during, slide.after], 'moment-timeline', 'moment-phase'));
      break;
    case 'habit':
      section.append(columns(slide.loop, 'habit-loop', 'habit-step'), make('p', slide.cadence, 'ribbon'));
      break;
    case 'emotion': {
      const grid = make('div', undefined, 'emotion-grid');
      const list = columns(slide.commitments, 'commitments', 'commitment');
      const quote = make('blockquote', slide.quote, 'emotion-quote');
      quote.append(make('small', slide.foot));
      grid.append(list, quote);
      section.append(grid);
      break;
    }
    case 'partners': {
      const grid = make('div', undefined, 'partner-grid');
      const audiences = columns(slide.segments, 'segments', 'segment');
      const formats = make('div', undefined, 'formats');
      formats.append(make('h3', slide.formatsTitle));
      const list = make('ul');
      slide.formats.forEach(format => list.append(make('li', format)));
      formats.append(list);
      grid.append(audiences, formats);
      section.append(grid);
      break;
    }
    case 'circle':
      section.append(columns(slide.circles, 'pillars', 'pillar'), make('p', slide.ribbon, 'ribbon'));
      break;
    case 'future':
      section.append(columns(slide.columns, 'future-grid', 'future-column'), make('p', slide.principle, 'ribbon'));
      break;
    case 'cta': {
      const actions = make('div', undefined, 'dual-cta');
      slide.panels.forEach(panel => {
        const item = make('div', undefined, 'cta-panel');
        item.append(make('p', panel.label, 'cta-label'), make('h3', panel.title), make('p', panel.body), mailLink(panel.button, panel.subject, 'contact-button'));
        actions.append(item);
      });
      section.append(actions, mailLink('o.chetrari@gmail.com', 'My Touchpoint', 'contact-email'), make('p', slide.closing, 'closing'), make('p', ui.review, 'slide-foot'));
      break;
    }
  }
  if (slide.foot && slide.type !== 'emotion') section.append(make('p', slide.foot, 'slide-foot'));
  return section;
}

function updateUrl() {
  const url = new URL(location.href);
  const values = [['lang', state.lang, 'en'], ['view', state.mode, 'deck'], ['slide', String(state.slide + 1), '1']];
  values.forEach(([key, value, defaultValue]) => value === defaultValue ? url.searchParams.delete(key) : url.searchParams.set(key, value));
  url.searchParams.delete('audience');
  url.hash = '';
  try { history.replaceState(null, '', url); } catch (_) { /* Local previews may restrict the History API. */ }
}

function showSlide(index, updateAddress = true) {
  const slides = getSlides(state.lang);
  const ui = kit[state.lang].ui;
  state.slide = Math.max(0, Math.min(slides.length - 1, index));
  document.querySelectorAll('#slide-stage .slide').forEach((section, position) => {
    section.hidden = position !== state.slide;
    section.setAttribute('aria-hidden', String(section.hidden));
  });
  document.querySelectorAll('.slide-dot').forEach((button, position) => {
    if (position === state.slide) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  $('previous').disabled = state.slide === 0;
  $('next').disabled = state.slide === slides.length - 1;
  $('slide-status').textContent = `${ui.slide} ${state.slide + 1} ${ui.of} ${slides.length}`;
  const slide = slides[state.slide];
  const notes = make('p', slide.speaker);
  $('speaker-copy').replaceChildren(notes);
  if (slide.sources) {
    const sources = make('div', undefined, 'source-list');
    slide.sources.forEach(([label, href]) => { const link = make('a', label); link.href = href; sources.append(link); });
    $('speaker-copy').append(sources);
  }
  if (updateAddress) updateUrl();
}

function renderStory() {
  const ui = kit[state.lang].ui;
  const article = $('full-text');
  article.replaceChildren(make('h1', ui.storyTitle));
  getStory(state.lang).forEach((paragraph, index, paragraphs) => {
    article.append(make('p', paragraph, index === paragraphs.length - 1 ? 'story-closing' : undefined));
  });
  const cta = getSlides(state.lang)[9];
  const contacts = make('div', undefined, 'contact-row');
  cta.panels.forEach(panel => contacts.append(mailLink(panel.button, panel.subject, 'contact-button')));
  article.append(contacts);
}

function render() {
  const ui = kit[state.lang].ui;
  const slides = getSlides(state.lang);
  document.documentElement.lang = state.lang;
  document.title = `${state.lang === 'ru' ? 'Презентация' : 'Pitch Kit'} · My Touchpoint`;
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = ui[element.dataset.i18n]; });
  for (const key of ['lang', 'mode']) {
    document.querySelectorAll(`[data-${key}]`).forEach(button => button.setAttribute('aria-pressed', String(button.dataset[key] === state[key])));
  }
  document.querySelector('.languages').setAttribute('aria-label', ui.language);
  $('slide-dots').setAttribute('aria-label', ui.jump);
  $('previous').setAttribute('aria-label', ui.previous);
  $('next').setAttribute('aria-label', ui.next);
  $('presentation').setAttribute('aria-label', ui.deckDescription);
  $('presentation').hidden = state.mode !== 'deck';
  $('deck-extras').hidden = state.mode !== 'deck';
  $('full-text').hidden = state.mode !== 'text';
  $('fullscreen').hidden = state.mode !== 'deck' || !document.fullscreenEnabled;
  $('copy-status').textContent = '';
  $('copy-fallback').hidden = true;
  $('copy-text').value = '';
  $('slide-stage').replaceChildren(...slides.map(renderSlide));
  $('slide-dots').replaceChildren(...slides.map((slide, index) => {
    const button = make('button', String(index + 1), 'slide-dot');
    button.type = 'button';
    button.setAttribute('aria-label', `${ui.slide} ${index + 1}: ${slide.kicker}`);
    button.addEventListener('click', () => showSlide(index));
    return button;
  }));
  renderStory();
  showSlide(state.slide, false);
}

document.querySelectorAll('[data-lang],[data-mode]').forEach(button => {
  button.addEventListener('click', () => {
    for (const key of ['lang', 'mode']) if (button.dataset[key]) state[key] = button.dataset[key];
    render();
    updateUrl();
  });
});
$('previous').addEventListener('click', () => showSlide(state.slide - 1));
$('next').addEventListener('click', () => showSlide(state.slide + 1));
document.addEventListener('keydown', event => {
  if (state.mode !== 'deck' || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
  const movements = {ArrowLeft:state.slide - 1, ArrowRight:state.slide + 1, Home:0, End:9};
  if (!(event.key in movements)) return;
  event.preventDefault();
  showSlide(movements[event.key]);
});
let touchStart;
$('slide-stage').addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch' && !event.target.closest('a,button')) touchStart = {x:event.clientX, y:event.clientY};
});
$('slide-stage').addEventListener('pointerup', event => {
  if (!touchStart || event.pointerType !== 'touch') return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  touchStart = undefined;
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.6) showSlide(state.slide + (dx < 0 ? 1 : -1));
});
$('slide-stage').addEventListener('pointercancel', () => { touchStart = undefined; });
$('fullscreen').addEventListener('click', async () => {
  try { await $('presentation').requestFullscreen(); }
  catch (_) { $('presentation').focus(); }
});
$('exit-fullscreen').addEventListener('click', () => document.exitFullscreen());
$('print').addEventListener('click', () => window.print());

function deckText() {
  return getSlides(state.lang).map((slide, index) => {
    const lines = [`${index + 1}. ${slide.title.replace(/\n/g, ' ')}`, slide.lead];
    const groups = ['statement','notification','draft','rows','takeaway','pillars','ribbon','steps','before','during','after','loop','cadence','commitments','quote','segments','formats','columns','principle','actions','closing','foot'];
    groups.forEach(key => {
      if (!slide[key]) return;
      if (key === 'columns' && slide.type === 'comparison') return;
      const value = slide[key];
      if (Array.isArray(value)) {
        if (value.every(item => typeof item === 'string') && ['before','during','after'].includes(key)) lines.push(value.join(': '));
        else value.forEach(item => lines.push(Array.isArray(item) ? item.join(' — ') : item));
      } else lines.push(value);
    });
    if (slide.panels) slide.panels.forEach(panel => lines.push(panel.label, panel.title, panel.body, panel.button));
    return lines.join('\n\n');
  }).join('\n\n———\n\n') + '\n\no.chetrari@gmail.com';
}
$('copy').addEventListener('click', async () => {
  const text = state.mode === 'deck' ? deckText() : [kit[state.lang].ui.storyTitle, ...getStory(state.lang)].join('\n\n');
  try {
    await navigator.clipboard.writeText(text);
    $('copy-status').textContent = kit[state.lang].ui.copied;
  } catch (_) {
    $('copy-fallback').hidden = false;
    $('copy-text').value = text;
    $('copy-text').focus();
    $('copy-text').select();
  }
});
render();
updateUrl();

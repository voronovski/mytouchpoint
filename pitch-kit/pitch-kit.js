'use strict';

const labels = {
  en: {
    skip:'Skip to pitch kit', edition:'People · Moments · Words', release:'iPhone · Currently in App Store review',
    taglines:'More ways to say it', format:'Format', deck:'Pitch deck', text:'Full text', audience:'Audience',
    partners:'For partners', users:'For users', language:'Language', contents:'In this kit', copyDeck:'Copy outline',
    copyText:'Copy text', print:'Print / PDF', privacy:'Privacy Policy', support:'Support', source:'Source material', top:'Back to top ↑',
    contactTitle:'Let’s make the next moment count.', contactButton:'Get in touch',
    contactPartners:'Interested in a focused pilot, a seasonal collection, or the product itself? Contact the developer to start a conversation.',
    contactUsers:'My Touchpoint is currently in App Store review. Contact the developer with product questions or feedback.',
    deckCaption:n=>`${n} sections · Product story and presentation notes`,
    textCaption:'A narrative version for an introduction, a website, or a live pitch.',
    notes:'Presentation notes', visual:'Suggested visual', speaker:'Speaker note',
    concept:'Concept / future direction', example:'Illustrative example', partnerBadge:'Partner edition',
    conceptNote:'Ideas for discussion. Availability and timing have not been announced.',
    copied:'Copied to clipboard.', copyHelp:'Copy the selected text with your device’s copy command.',
    copySelect:'Automatic copying is unavailable here. Select and copy the text below.',
    next:'Next step', options:'Pitch kit options', copyArea:'Pitch text to copy'
  },
  ru: {
    skip:'Перейти к материалам', edition:'Люди · Моменты · Слова', release:'iPhone · На модерации в App Store',
    taglines:'Другие формулировки', format:'Формат', deck:'Презентация', text:'Полный текст', audience:'Аудитория',
    partners:'Для партнёров', users:'Для пользователей', language:'Язык', contents:'В этом наборе', copyDeck:'Копировать структуру',
    copyText:'Копировать текст', print:'Печать / PDF', privacy:'Конфиденциальность', support:'Поддержка', source:'Исходный материал', top:'Наверх ↑',
    contactTitle:'Пусть следующий момент станет важным.', contactButton:'Связаться',
    contactPartners:'Хотите обсудить небольшой пилот, сезонную коллекцию или сам продукт? Напишите разработчику, чтобы начать разговор.',
    contactUsers:'My Touchpoint проходит модерацию в App Store. С вопросами о продукте и обратной связью можно написать разработчику.',
    deckCaption:n=>`${n} разделов · История продукта и заметки для презентации`,
    textCaption:'Связный текст для знакомства с продуктом, сайта или устного выступления.',
    notes:'Заметки для презентации', visual:'Идея визуала', speaker:'Спикеру',
    concept:'Концепция / развитие', example:'Иллюстративный пример', partnerBadge:'Для партнёров',
    conceptNote:'Идеи для обсуждения. Доступность и сроки не объявлены.',
    copied:'Скопировано.', copyHelp:'Скопируйте выделенный текст командой копирования на вашем устройстве.',
    copySelect:'Автоматическое копирование здесь недоступно. Выделите и скопируйте текст ниже.',
    next:'Следующий шаг', options:'Настройки материалов', copyArea:'Текст для копирования'
  }
};

const params = new URLSearchParams(location.search);
const state = {
  lang: params.get('lang') === 'ru' ? 'ru' : 'en',
  mode: params.get('view') === 'text' ? 'text' : 'deck',
  audience: params.get('audience') === 'users' ? 'users' : 'partners'
};
const byId = id => document.getElementById(id);
const visibleSlides = () => pitchContent[state.lang].slides.filter(slide => !slide.partners || state.audience === 'partners');

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function pointsFor(slide) {
  if (slide.key === 'join' && state.audience === 'users') return slide.points.slice(0, 3);
  return slide.points;
}

function textFor(slide) {
  if (slide.key === 'join' && state.audience === 'users') {
    return [state.lang === 'en'
      ? 'Start by thinking of the people you most want to make time for. My Touchpoint is currently under App Store review. Contact the developer with product questions or feedback.'
      : 'Начните с людей, для которых хочется находить время. My Touchpoint сейчас проходит модерацию в App Store. С вопросами о продукте и обратной связью можно написать разработчику.'];
  }
  return slide.text;
}

function render() {
  const content = pitchContent[state.lang];
  const ui = labels[state.lang];
  const slides = visibleSlides();
  document.documentElement.lang = state.lang;
  document.title = `${state.lang === 'ru' ? 'Материалы о продукте' : 'Pitch Kit'} · My Touchpoint`;
  document.querySelector('.controls').setAttribute('aria-label', ui.options);
  byId('copy-text').setAttribute('aria-label', ui.copyArea);
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = ui[el.dataset.i18n]; });
  for (const [attribute, value] of [['lang', state.lang], ['mode', state.mode], ['audience', state.audience]]) {
    document.querySelectorAll(`[data-${attribute}]`).forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset[attribute] === value));
    });
  }
  byId('hero-title').textContent = content.title;
  byId('hero-intro').textContent = content.intro;
  byId('principles').replaceChildren(...content.principles.map(([title, text]) => {
    const item = node('div', undefined, 'principle');
    item.append(node('h2', title), node('p', text));
    return item;
  }));
  byId('tagline-list').replaceChildren(...content.taglines.map(text => node('li', text)));
  byId('view-title').textContent = state.mode === 'deck' ? ui.deck : ui.text;
  byId('view-caption').textContent = state.mode === 'deck' ? ui.deckCaption(slides.length) : ui.textCaption;
  byId('copy').textContent = state.mode === 'deck' ? ui.copyDeck : ui.copyText;
  byId('copy-status').textContent = '';
  byId('copy-fallback').hidden = true;
  byId('copy-text').value = '';
  const sections = document.createDocumentFragment();
  const contents = document.createDocumentFragment();
  slides.forEach((slide, index) => {
    const number = String(index + 1).padStart(2, '0');
    const section = node('section', undefined, 'section');
    section.id = slide.key;
    section.setAttribute('aria-labelledby', `${slide.key}-title`);
    const meta = node('div', undefined, 'section-meta');
    meta.append(node('span', number, 'num'), node('span', slide.label));
    if (slide.partners) meta.append(node('span', ui.partnerBadge, 'badge'));
    if (slide.future) meta.append(node('span', ui.concept, 'badge'));
    if (slide.illustration) meta.append(node('span', ui.example, 'badge'));
    const heading = node('h3', slide.title);
    heading.id = `${slide.key}-title`;
    section.append(meta, heading);
    if (slide.future) section.append(node('p', ui.conceptNote, 'concept-note'));
    if (state.mode === 'deck') {
      const list = node('ul');
      list.append(...pointsFor(slide).map(point => node('li', point)));
      section.append(list);
      const notes = node('details', undefined, 'presenter');
      notes.append(node('summary', ui.notes));
      const dl = node('dl');
      dl.append(node('dt', ui.visual), node('dd', slide.visual));
      if (slide.speaker) dl.append(node('dt', ui.speaker), node('dd', slide.speaker));
      notes.append(dl);
      section.append(notes);
    } else {
      section.append(...textFor(slide).map(paragraph => node('p', paragraph)));
    }
    sections.append(section);
    const item = node('li');
    const link = node('a');
    link.href = `#${slide.key}`;
    link.append(node('span', number, 'num'), node('span', slide.label));
    item.append(link);
    contents.append(item);
  });
  byId('sections').replaceChildren(sections);
  byId('contents-list').replaceChildren(contents);
  byId('contact-copy').textContent = state.audience === 'partners' ? ui.contactPartners : ui.contactUsers;
  const subject = state.audience === 'partners' ? 'My Touchpoint Partnership' : 'My Touchpoint Product Question';
  byId('contact-button').href = `mailto:voronovski@outlook.com?subject=${encodeURIComponent(subject)}`;
}

function updateUrl() {
  const url = new URL(location.href);
  for (const [key, value, defaultValue] of [['lang', state.lang, 'en'], ['view', state.mode, 'deck'], ['audience', state.audience, 'partners']]) {
    if (value === defaultValue) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  if (url.hash && !document.getElementById(url.hash.slice(1))) url.hash = '';
  try { history.replaceState(null, '', url); } catch (_) { /* file previews can restrict History API */ }
}

document.querySelectorAll('[data-lang],[data-mode],[data-audience]').forEach(button => {
  button.addEventListener('click', () => {
    for (const key of ['lang', 'mode', 'audience']) if (button.dataset[key]) state[key] = button.dataset[key];
    render();
    updateUrl();
  });
});

function exportText() {
  const content = pitchContent[state.lang];
  const ui = labels[state.lang];
  const blocks = ['My Touchpoint · Pitch Kit', content.title, content.intro, ui.release];
  content.principles.forEach(([title, text]) => blocks.push(`${title}: ${text}`));
  visibleSlides().forEach((slide, index) => {
    blocks.push(`${String(index + 1).padStart(2, '0')} · ${slide.label}\n${slide.title}`);
    if (slide.future) blocks.push(ui.conceptNote);
    if (state.mode === 'deck') {
      blocks.push(pointsFor(slide).map(point => `• ${point}`).join('\n'));
      blocks.push(`${ui.visual}: ${slide.visual}`);
      if (slide.speaker) blocks.push(`${ui.speaker}: ${slide.speaker}`);
    } else blocks.push(...textFor(slide));
  });
  blocks.push(ui.contactTitle, state.audience === 'partners' ? ui.contactPartners : ui.contactUsers, 'voronovski@outlook.com');
  return blocks.join('\n\n');
}

byId('copy').addEventListener('click', async () => {
  const text = exportText();
  try {
    await navigator.clipboard.writeText(text);
    byId('copy-status').textContent = labels[state.lang].copied;
  } catch (_) {
    byId('copy-fallback').hidden = false;
    byId('copy-text').value = text;
    byId('copy-text').focus();
    byId('copy-text').select();
    byId('copy-status').textContent = labels[state.lang].copySelect;
  }
});
byId('print').addEventListener('click', () => window.print());
render();

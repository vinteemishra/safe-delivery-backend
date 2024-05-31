import DraftExporter from '../../server/lib/DraftExporter/main';

const ItemTypes = {
  CARD: 'card',
  HEADER: 'header',
  SUBHEADER: 'subheader',
  PARAGRAPH: 'paragraph',
  IMPORTANT_TEXT: 'important_text',
  ORDERED_LIST: 'ol',
  UNORDERED_LIST: 'ul',
  DIVIDER: 'divider',
  DIVIDER_NOLINE: 'divider_noline',
  IMAGE: 'image',
  TABLE: 'table',
  ALPHABETICAL_HEADER: 'alphabetical',
  FORMULA: 'formula'
};

function draftToHtml(draftjs, type) {
  let exporter = new DraftExporter(draftjs);
  return exporter.export();
}

export function cardToHtml(card, src) {
  // const src = card.translated && card.translated.blocks ? card.translated : (card.adapted && card.adapted.blocks ? card.adapted : null);
  if (src === undefined || src.blocks === undefined) {
    // console.log("Skipping");
    return '';
  }

  if (src && src.blocks && card.type === ItemTypes.PARAGRAPH) {
    const blocksLength = src.blocks.length;
    const blocks_with_linebreaks = src.blocks.map((block, i) => {
      // if (block.type === "unstyled" && block.text.trim() === "") {
      if (blocksLength !== i + 1) {
        block.type = 'paragraph-section';
        // block.type = "line-break";
      }
      return block;
    });

    src.blocks = blocks_with_linebreaks;
  }

  // console.log("cardToHtml", src);
  const cardContent = src ? draftToHtml(src, card.type) : '';

  // Markup without content
  switch (card.type) {
    case ItemTypes.DIVIDER:
      return '<hr>';
    case ItemTypes.DIVIDER_NOLINE:
      return '<hr noshade>';
    case ItemTypes.TABLE:
    case ItemTypes.FORMULA:
      return `${card.translated.html}`;
    case ItemTypes.IMAGE:
      // refs.images.add(card.adapted.src);
      return `[IMAGE]`;
  }

  // Markup that can contain content, leave empty if no content
  if (cardContent === '' || cardContent === '</p><p>')
    return '';

  switch (card.type) {
    case ItemTypes.HEADER:
      return `<h1>${cardContent}</h1>`;
    case ItemTypes.ALPHABETICAL_HEADER:
      return `<h3>${cardContent}</h3>`;
    case ItemTypes.SUBHEADER:
      return `<h2>${cardContent}</h2>`;
    case ItemTypes.IMPORTANT_TEXT:
      return `<important>${cardContent}</important>`;
    case ItemTypes.PARAGRAPH:
      return `<p>${cardContent}</p>`;
    case ItemTypes.ORDERED_LIST:
      return `<ol>${cardContent}</ol>`;
    case ItemTypes.UNORDERED_LIST:
      return `<ul>${cardContent}</ul>`;
    default:
      return `<p>${cardContent}</p>`;
  }
}

export const contentToHtml = (doc) => doc.cards.reduce((html, card) => html + cardToHtml(card, card.content), '');
export const adaptedToHtml = (doc) => doc.cards.reduce((html, card) => html + cardToHtml(card, card.adapted), '');
export const translatedToHtml = (doc) => doc.cards.reduce((html, card) => html + cardToHtml(card, card.translated), '');

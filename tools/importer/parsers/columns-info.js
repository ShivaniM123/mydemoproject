/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-info.
 * Base: columns. Source: https://www.sparkdriverapp.com/en_us/rewards.html
 * Extracts two-column layout: text+button left, illustration image right.
 *
 * Target structure (from block library):
 * Row 1: [text content | image]
 * Each row has same number of columns.
 */
export default function parse(element, { document }) {
  // Find the columns container (.columns-new-component.col-new-6633)
  const columnsContainer = element.querySelector('.columns-new-component') || element;

  // Find the column divs (dv-column)
  const dvColumns = columnsContainer.querySelectorAll(':scope .dv-column');

  // Left column: heading, paragraph, button
  const leftWrapper = document.createElement('div');
  const heading = element.querySelector('h2');
  const paragraph = element.querySelector('.rte-styles p');
  const ctaLink = element.querySelector('a.button-glms-button, a.button-content');

  if (heading) leftWrapper.append(heading);
  if (paragraph) leftWrapper.append(paragraph);
  if (ctaLink) {
    const p = document.createElement('p');
    p.append(ctaLink);
    leftWrapper.append(p);
  }

  // Right column: illustration image
  // Source DOM: img.dv-component.image-width.comp-img inside .image-alignment
  const rightWrapper = document.createElement('div');
  const image = element.querySelector('img.comp-img, img.dv-component, .image-alignment img, .dv-img-component-2-0 img');
  if (image) {
    rightWrapper.append(image);
  }

  const cells = [[leftWrapper, rightWrapper]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (info)', cells });
  element.replaceWith(block);
}

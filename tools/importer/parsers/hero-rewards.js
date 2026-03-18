/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-rewards.
 * Base: hero. Source: https://www.sparkdriverapp.com/en_us/rewards.html
 * Extracts H1 heading and subtitle paragraph from the hero section.
 *
 * Target structure (from block library):
 * Row 1: [background image] (optional)
 * Row 2: [heading, subheading, CTA] (content cell)
 */
export default function parse(element, { document }) {
  // Extract heading (h1 with bold text inside .rte-styles)
  const heading = element.querySelector('h1, h2');

  // Extract subtitle paragraph
  const description = element.querySelector('p');

  // Build cells matching hero block library structure (1 column per row)
  // No background image for this variant, so skip image row
  // Row 1: single cell with heading + subheading together
  const cells = [];

  const contentWrapper = document.createElement('div');
  if (heading) contentWrapper.append(heading);
  if (description) contentWrapper.append(description);
  cells.push([contentWrapper]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero (rewards)', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */

/**
 * Parser for table-rewards.
 * Base: table. Source: https://www.sparkdriverapp.com/en_us/rewards.html
 * Extracts 3-column rewards comparison table (Rewards, Tier 1, Tier 2).
 *
 * Target structure (from block library):
 * Row 1: [Header1 | Header2 | Header3] (header row)
 * Row N: [Data1 | Data2 | Data3] (data rows)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find the source table inside .rewards-table-container
  const sourceTable = element.querySelector('table');
  if (!sourceTable) {
    const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (rewards)', cells: [] });
    element.replaceWith(block);
    return;
  }

  // Extract header row from thead
  const headerRow = sourceTable.querySelector('thead tr');
  if (headerRow) {
    const headerCells = [...headerRow.querySelectorAll('th, td')].map((cell) => cell.textContent.trim());
    cells.push(headerCells);
  }

  // Extract data rows from tbody
  const dataRows = sourceTable.querySelectorAll('tbody tr');
  dataRows.forEach((tr) => {
    const tds = [...tr.querySelectorAll(':scope > td')];
    const rowCells = tds.map((td) => {
      // Clone td content to preserve rich content (logos, links, lists)
      const wrapper = document.createElement('div');
      // Move all child nodes into wrapper
      while (td.firstChild) {
        wrapper.append(td.firstChild);
      }
      return wrapper;
    });
    cells.push(rowCells);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (rewards)', cells });
  element.replaceWith(block);
}

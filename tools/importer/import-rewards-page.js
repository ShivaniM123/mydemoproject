/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroRewardsParser from './parsers/hero-rewards.js';
import tableRewardsParser from './parsers/table-rewards.js';
import columnsInfoParser from './parsers/columns-info.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/sparkdriver-cleanup.js';
import sectionsTransformer from './transformers/sparkdriver-sections.js';

// PARSER REGISTRY — keys match PAGE_TEMPLATE block names
const parsers = {
  'hero-rewards': heroRewardsParser,
  'table-rewards': tableRewardsParser,
  'columns-info': columnsInfoParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'rewards-page',
  urls: [
    'https://www.sparkdriverapp.com/en_us/rewards.html',
  ],
  description: 'Spark Driver rewards program page with tier information and benefits',
  blocks: [
    {
      name: 'hero-rewards',
      instances: [
        '.block-container-component.grid-box .bg-transparent .rte-styles.richtext.table-component.margin-bottom-0',
      ],
    },
    {
      name: 'table-rewards',
      instances: [
        '.rewards-table-container',
      ],
    },
    {
      name: 'columns-info',
      instances: [
        '.columns-new-component.col-new-6633',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: '.block-container-component.grid-box.classic.theme-blue:first-of-type',
      style: null,
      blocks: ['hero-rewards'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Rewards Comparison Table',
      selector: '.block-container-component.full-width.classic.theme-blue',
      style: 'light-blue',
      blocks: ['table-rewards'],
      defaultContent: ['.rte-styles.richtext.table-component.margin-bottom-50 > p'],
    },
    {
      id: 'section-3',
      name: 'Qualification Information',
      selector: '.boxed-wrapper.mobile-reverse',
      style: null,
      blocks: ['columns-info'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Call to Action',
      selector: '.block-container-component.grid-box.classic.theme-blue:last-of-type',
      style: null,
      blocks: [],
      defaultContent: [
        '.rte-styles.richtext.table-component.margin-bottom-30 > h2',
        '.button-component-wrapper.button-glms-alignment.center',
      ],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (section breaks + metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

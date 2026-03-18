/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-rewards-page.js
  var import_rewards_page_exports = {};
  __export(import_rewards_page_exports, {
    default: () => import_rewards_page_default
  });

  // tools/importer/parsers/hero-rewards.js
  function parse(element, { document }) {
    const heading = element.querySelector("h1, h2");
    const description = element.querySelector("p");
    const cells = [];
    const contentWrapper = document.createElement("div");
    if (heading) contentWrapper.append(heading);
    if (description) contentWrapper.append(description);
    cells.push([contentWrapper]);
    const block = WebImporter.Blocks.createBlock(document, { name: "Hero (rewards)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-rewards.js
  function parse2(element, { document }) {
    const cells = [];
    const sourceTable = element.querySelector("table");
    if (!sourceTable) {
      const block2 = WebImporter.Blocks.createBlock(document, { name: "Cards (rewards)", cells: [] });
      element.replaceWith(block2);
      return;
    }
    const headerRow = sourceTable.querySelector("thead tr");
    if (headerRow) {
      const headerCells = [...headerRow.querySelectorAll("th, td")].map((cell) => cell.textContent.trim());
      cells.push(headerCells);
    }
    const dataRows = sourceTable.querySelectorAll("tbody tr");
    dataRows.forEach((tr) => {
      const tds = [...tr.querySelectorAll(":scope > td")];
      const rowCells = tds.map((td) => {
        const wrapper = document.createElement("div");
        while (td.firstChild) {
          wrapper.append(td.firstChild);
        }
        return wrapper;
      });
      cells.push(rowCells);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (rewards)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-info.js
  function parse3(element, { document }) {
    const columnsContainer = element.querySelector(".columns-new-component") || element;
    const dvColumns = columnsContainer.querySelectorAll(":scope .dv-column");
    const leftWrapper = document.createElement("div");
    const heading = element.querySelector("h2");
    const paragraph = element.querySelector(".rte-styles p");
    const ctaLink = element.querySelector("a.button-glms-button, a.button-content");
    if (heading) leftWrapper.append(heading);
    if (paragraph) leftWrapper.append(paragraph);
    if (ctaLink) {
      const p = document.createElement("p");
      p.append(ctaLink);
      leftWrapper.append(p);
    }
    const rightWrapper = document.createElement("div");
    const image = element.querySelector("img.comp-img, img.dv-component, .image-alignment img, .dv-img-component-2-0 img");
    if (image) {
      rightWrapper.append(image);
    }
    const cells = [[leftWrapper, rightWrapper]];
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns (info)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/sparkdriver-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        ".privacy-modal",
        ".search-mobile-model",
        ".custom-targeting-buttons"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".hide-on-print",
        "#slidenav-overlay",
        ".d4s-header-container",
        "segmentation-timeout > .content-container > div:first-child"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "#header-container",
        ".dfs-footer-container",
        ".dfs-footer-content-container",
        ".extended-footer-component",
        ".list-two-component",
        "#skipto-main-footer",
        ".breadcrumbComponent",
        '[class*="breadcrumb"]',
        "#skipto-main-link",
        "#skipto-footer-link",
        "#skipto-main-wrap",
        ".whitespace-component",
        ".d4s-header-container",
        ".d4s-header-content",
        "noscript",
        "link",
        "iframe"
      ]);
      element.querySelectorAll(".reference.parbase.section").forEach((ref) => {
        const text = ref.textContent.trim();
        if (text === "Styles" || text === "Scripts" || text === "") {
          ref.remove();
        }
      });
      element.querySelectorAll("a.button-primary, a.button-glms-button").forEach((link) => {
        if (link.closest("table")) return;
        const strong = element.ownerDocument.createElement("strong");
        link.before(strong);
        strong.appendChild(link);
      });
      element.querySelectorAll("div").forEach((div) => {
        if (div.children.length === 0) {
          const text = div.textContent.trim();
          if (text === "Styles" || text === "Scripts") {
            div.remove();
          }
        }
      });
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("onclick");
        el.removeAttribute("data-analytics");
      });
    }
  }

  // tools/importer/transformers/sparkdriver-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const sections = [...template.sections].reverse();
      sections.forEach((section) => {
        let sectionEl = null;
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) return;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.append(sectionMetadata);
        }
        if (section.id !== template.sections[0].id) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-rewards-page.js
  var parsers = {
    "hero-rewards": parse,
    "table-rewards": parse2,
    "columns-info": parse3
  };
  var PAGE_TEMPLATE = {
    name: "rewards-page",
    urls: [
      "https://www.sparkdriverapp.com/en_us/rewards.html"
    ],
    description: "Spark Driver rewards program page with tier information and benefits",
    blocks: [
      {
        name: "hero-rewards",
        instances: [
          ".block-container-component.grid-box .bg-transparent .rte-styles.richtext.table-component.margin-bottom-0"
        ]
      },
      {
        name: "table-rewards",
        instances: [
          ".rewards-table-container"
        ]
      },
      {
        name: "columns-info",
        instances: [
          ".columns-new-component.col-new-6633"
        ]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: ".block-container-component.grid-box.classic.theme-blue:first-of-type",
        style: null,
        blocks: ["hero-rewards"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Rewards Comparison Table",
        selector: ".block-container-component.full-width.classic.theme-blue",
        style: "light-blue",
        blocks: ["table-rewards"],
        defaultContent: [".rte-styles.richtext.table-component.margin-bottom-50 > p"]
      },
      {
        id: "section-3",
        name: "Qualification Information",
        selector: ".boxed-wrapper.mobile-reverse",
        style: null,
        blocks: ["columns-info"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Call to Action",
        selector: ".block-container-component.grid-box.classic.theme-blue:last-of-type",
        style: null,
        blocks: [],
        defaultContent: [
          ".rte-styles.richtext.table-component.margin-bottom-30 > h2",
          ".button-component-wrapper.button-glms-alignment.center"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_rewards_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_rewards_page_exports);
})();

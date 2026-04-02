/**
 * Dynamically builds breadcrumbs from the URL path.
 * Resolves titles from: query-index.json → page meta name="Title" → <title> tag → slug.
 * @param {Element} block The breadcrumb block element
 */
export default async function decorate(block) {
  let path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  const isLocal = path.startsWith('/content/');

  if (isLocal) {
    path = path.replace('/content/', '/');
  }

  const segments = path.split('/').filter(Boolean);
  if (segments.length < 2) return;

  // Fetch index for title lookups
  let index = [];
  try {
    const resp = await fetch('/query-index.json');
    if (resp.ok) {
      const json = await resp.json();
      index = json.data || [];
    }
  } catch {
    /* index unavailable */
  }

  /**
   * Fetch a page and extract the authored Title from <meta name="Title"> tag,
   * falling back to the <title> tag.
   */
  async function fetchPageTitle(url) {
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        const html = await resp.text();
        // Authored metadata Title (set by EDS from page metadata)
        const metaMatch = html.match(/<meta\s+name=["']Title["']\s+content=["']([^"']*)["']/i);
        if (metaMatch && metaMatch[1].trim()) return metaMatch[1].trim();
        // Fallback: <title> tag
        const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
        if (titleMatch && titleMatch[1].trim() !== 'Page not found') return titleMatch[1].trim();
      }
    } catch {
      /* page unavailable */
    }
    return null;
  }

  /**
   * Resolve a page title: query-index → page meta → slug.
   */
  async function resolveTitle(p) {
    const entry = index.find((e) => e.path === p || e.path === `${p}.html`);
    if (entry) return entry.title;

    const urls = isLocal ? [`/content${p}`, p] : [p];
    const results = await Promise.all(urls.map((url) => fetchPageTitle(url)));
    const found = results.find((t) => t !== null);
    if (found) return found;

    const slug = p.split('/').pop();
    return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Build crumbs: Home, then ancestors, then current page
  const locale = segments[0];
  const crumbs = [{ title: 'Home', path: `/${locale}` }];
  const ancestorSegments = segments.slice(1);
  const cumulative = `/${locale}`;

  const titlePromises = ancestorSegments.map((seg, i) => {
    const segPath = `${cumulative}/${ancestorSegments.slice(0, i + 1).join('/')}`;
    const isLast = i === ancestorSegments.length - 1;
    return isLast ? Promise.resolve(document.title) : resolveTitle(segPath);
  });

  const titles = await Promise.all(titlePromises);

  ancestorSegments.forEach((seg, i) => {
    const segPath = `/${locale}/${ancestorSegments.slice(0, i + 1).join('/')}`;
    const isLast = i === ancestorSegments.length - 1;
    crumbs.push({ title: titles[i], path: segPath, current: isLast });
  });

  // Render
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  crumbs.forEach((crumb, i) => {
    const li = document.createElement('li');

    if (crumb.current) {
      const span = document.createElement('span');
      span.setAttribute('aria-current', 'page');
      span.textContent = crumb.title;
      li.append(span);
    } else {
      const a = document.createElement('a');
      a.href = crumb.path;
      a.textContent = crumb.title;
      li.append(a);
    }

    if (i < crumbs.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'breadcrumb-separator';
      sep.setAttribute('aria-hidden', 'true');
      li.append(sep);
    }

    ol.append(li);
  });

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}

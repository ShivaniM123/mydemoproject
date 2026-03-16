function embedVimeo(container) {
  const link = container.querySelector('a[href*="vimeo"]');
  if (!link) return false;

  const url = new URL(link.href);
  const videoId = url.pathname.split('/').pop();
  const hash = url.searchParams.get('h') || '';

  const params = new URLSearchParams({
    h: hash,
    badge: '0',
    loop: '1',
    controls: '0',
    muted: '1',
    autoplay: '1',
    autopause: '0',
    background: '1',
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'hero-video-wrapper';

  // Poster image as fallback (always visible until video plays)
  const poster = document.createElement('img');
  poster.className = 'hero-video-poster';
  poster.src = 'https://i.vimeocdn.com/video/1937928556-ef4fca087362157d0cee93cf79f3f4253f66e64038fe0fb17e203b825d1a30a2-d?mw=960&q=85';
  poster.alt = link.textContent || 'Video';
  poster.loading = 'eager';
  wrapper.append(poster);

  // Iframe hidden until video is confirmed playable
  const iframe = document.createElement('iframe');
  iframe.src = `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
  iframe.setAttribute('title', link.textContent || 'Hero video');
  iframe.className = 'hero-video-iframe';
  iframe.loading = 'lazy';
  wrapper.append(iframe);

  // Listen for Vimeo player ready event to reveal iframe
  window.addEventListener('message', (e) => {
    if (e.origin === 'https://player.vimeo.com') {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.event === 'ready' || data.method === 'ping') {
          iframe.classList.add('hero-video-active');
        }
      } catch { /* not a Vimeo message */ }
    }
  });

  container.replaceChildren(wrapper);
  return true;
}

export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  if (cols.length === 2) {
    block.classList.add('hero-split');
    cols[0].classList.add('hero-content');
    cols[1].classList.add('hero-media');

    // Check for Vimeo video link in the media column
    embedVimeo(cols[1]);
  }
}

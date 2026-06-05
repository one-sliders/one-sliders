(function () {
  const shell = {
    activeUrl: location.href,
    viewListeners: [],
    recording: false,
    begin() { this.recording = true; },
    end() { this.recording = false; },
    cleanup() {
      this.viewListeners.forEach(({ target, type, listener, options }) => {
        target.removeEventListener(type, listener, options);
      });
      this.viewListeners = [];
    }
  };

  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (shell.recording && (this === window || this === document)) {
      shell.viewListeners.push({ target: this, type, listener, options });
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  function isEventViewUrl(url) {
    const path = url.pathname.replace(/\/+$/, '');
    return path.endsWith('/content/events/index.html')
      || path.endsWith('/content/events/this-week.html')
      || path.endsWith('/content/events/this-week-gantt.html');
  }

  function copyHeadState(doc) {
    document.title = doc.title;

    document.head.querySelectorAll('style').forEach(style => style.remove());
    doc.head.querySelectorAll('style').forEach(style => {
      document.head.appendChild(style.cloneNode(true));
    });

    const incomingDescription = doc.head.querySelector('meta[name="description"]');
    const currentDescription = document.head.querySelector('meta[name="description"]');
    if (incomingDescription && currentDescription) {
      currentDescription.setAttribute('content', incomingDescription.getAttribute('content') || '');
    }
  }

  function runViewScripts(scripts) {
    scripts.forEach(source => {
      if ((source.type || '').includes('json')) {
        document.body.appendChild(source.cloneNode(true));
        return;
      }
      if (source.src) {
        const script = document.createElement('script');
        script.src = source.src;
        script.async = false;
        document.body.appendChild(script);
        return;
      }

      const script = document.createElement('script');
      script.textContent = '(function () {\n' + source.textContent + '\n})();';
      shell.begin();
      try {
        document.body.appendChild(script);
      } finally {
        shell.end();
      }
    });
  }

  async function swapView(href, pushHistory) {
    const url = new URL(href, location.href);
    if (!isEventViewUrl(url)) {
      location.href = url.href;
      return;
    }

    document.documentElement.classList.add('is-event-view-loading');

    try {
      const response = await fetch(url.href, { cache: 'default' });
      if (!response.ok) throw new Error('Could not load event view');

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const currentNav = document.querySelector('.event-nav');
      const incomingScripts = [];
      const nextNodes = [];

      doc.body.querySelectorAll('script').forEach(script => {
        incomingScripts.push(script.cloneNode(true));
        script.remove();
      });

      Array.from(doc.body.children).forEach(node => {
        if (node.matches && node.matches('.event-nav')) return;
        nextNodes.push(node.cloneNode(true));
      });

      shell.cleanup();
      copyHeadState(doc);
      document.body.replaceChildren(currentNav || document.createDocumentFragment(), ...nextNodes);
      runViewScripts(incomingScripts);

      if (pushHistory) history.pushState({ eventViewShell: true }, '', url.href);
      shell.activeUrl = url.href;
      scrollTo({ top: 0, behavior: 'auto' });
    } catch (error) {
      location.href = url.href;
    } finally {
      document.documentElement.classList.remove('is-event-view-loading');
    }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('.event-view-switcher a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !isEventViewUrl(url)) return;

    event.preventDefault();
    swapView(url.href, true);
  });

  addEventListener('popstate', () => {
    swapView(location.href, false);
  });

  originalAddEventListener.call(window, 'load', () => {
    shell.recording = false;
  }, { once: true });
  shell.recording = true;
})();

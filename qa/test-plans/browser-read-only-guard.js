(() => {
  const GUARD_VERSION = '2.0.0';

  if (
    window.__qaReadOnlyGuard
    && window.__qaReadOnlyGuard.installed
    && window.__qaReadOnlyGuard.version === GUARD_VERSION
  ) {
    return window.__qaReadOnlyGuard.snapshot();
  }

  const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
  const MAX_BLOCKED_RECORDS = 2000;
  const EXPECTED_LOCAL_ORIGIN = 'http://localhost:5173';
  const PRODUCTION_HOSTS = new Set([
    'app.industrialmatrix.com',
    'industrialmatrix.com',
    'www.industrialmatrix.com',
    'newcharts.industrialmatrix.com',
    'industrialmatrix.tools',
    'www.industrialmatrix.tools',
    'api.industrialmatrix.tools',
    'ws.industrialmatrix.tools',
    'assetmatrix.com',
    'www.assetmatrix.com',
  ]);

  const documentId = globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `qa-ro-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const state = {
    installed: true,
    version: GUARD_VERSION,
    documentId,
    allowedCount: 0,
    blocked: [],
    blockedDropped: 0,
  };

  const normalizeMethod = method => String(method || 'GET').toUpperCase();

  const parseUrl = value => {
    try {
      return new URL(String(value || ''), window.location.href);
    } catch {
      return null;
    }
  };

  const sanitizedUrl = value => {
    const parsed = parseUrl(value);
    return parsed ? `${parsed.origin}${parsed.pathname}` : '[unparseable-url]';
  };

  const isProductionHost = hostname => (
    PRODUCTION_HOSTS.has(hostname)
    || hostname.endsWith('.industrialmatrix.com')
    || hostname.endsWith('.industrialmatrix.tools')
    || hostname.endsWith('.assetmatrix.com')
  );

  const recordBlock = ({ kind, method, url, reason }) => {
    if (state.blocked.length < MAX_BLOCKED_RECORDS) {
      state.blocked.push({
        at: new Date().toISOString(),
        kind,
        method: normalizeMethod(method),
        url: sanitizedUrl(url),
        reason,
      });
    } else {
      state.blockedDropped += 1;
    }
    return false;
  };

  const checkRequest = (kind, methodValue, urlValue) => {
    const method = normalizeMethod(methodValue);
    const parsed = parseUrl(urlValue);
    const unsafeMethod = !SAFE_METHODS.has(method);
    const productionHost = Boolean(parsed && isProductionHost(parsed.hostname));

    if (unsafeMethod || productionHost) {
      return recordBlock({
        kind,
        method,
        url: urlValue,
        reason: unsafeMethod && productionHost
          ? 'unsafe-method-and-production-host'
          : unsafeMethod
            ? 'unsafe-method'
            : 'production-host',
      });
    }

    state.allowedCount += 1;
    return true;
  };

  const originalFetch = window.fetch;
  window.fetch = function guardedFetch(input, init = {}) {
    const method = init.method || (input && input.method) || 'GET';
    const url = (input && input.url) || input;
    if (!checkRequest('fetch', method, url)) {
      return Promise.reject(new DOMException('Blocked by QA read-only guard', 'AbortError'));
    }
    return originalFetch.apply(this, arguments);
  };

  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function guardedOpen(method, url, ...rest) {
    this.__qaReadOnlyRequest = { method: normalizeMethod(method), url };
    return originalXhrOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function guardedSend() {
    const request = this.__qaReadOnlyRequest || { method: 'GET', url: window.location.href };
    if (!checkRequest('xhr', request.method, request.url)) {
      throw new DOMException('Blocked by QA read-only guard', 'AbortError');
    }
    return originalXhrSend.apply(this, arguments);
  };

  const originalBeacon = navigator.sendBeacon && navigator.sendBeacon.bind(navigator);
  if (originalBeacon) {
    navigator.sendBeacon = function guardedBeacon(url) {
      if (!checkRequest('sendBeacon', 'POST', url)) return false;
      return originalBeacon.apply(this, arguments);
    };
  }

  // WebSocket frames do not have an HTTP method and can carry commands. Block
  // production socket construction and every outbound frame without inspecting
  // or recording its payload. Incoming data from an already-open safe socket is
  // unaffected.
  const OriginalWebSocket = window.WebSocket;
  if (OriginalWebSocket) {
    const originalWebSocketSend = OriginalWebSocket.prototype.send;
    OriginalWebSocket.prototype.send = function guardedWebSocketSend() {
      recordBlock({
        kind: 'websocket.send',
        method: 'WEBSOCKET',
        url: this.url || window.location.href,
        reason: 'websocket-send-disabled',
      });
      throw new DOMException('Blocked by QA read-only guard', 'AbortError');
    };

    const GuardedWebSocket = function guardedWebSocket(url, protocols) {
      const parsed = parseUrl(url);
      if (parsed && isProductionHost(parsed.hostname)) {
        recordBlock({
          kind: 'websocket.constructor',
          method: 'WEBSOCKET',
          url,
          reason: 'production-host',
        });
        throw new DOMException('Blocked production WebSocket by QA read-only guard', 'SecurityError');
      }
      return protocols === undefined
        ? new OriginalWebSocket(url)
        : new OriginalWebSocket(url, protocols);
    };

    Object.setPrototypeOf(GuardedWebSocket, OriginalWebSocket);
    GuardedWebSocket.prototype = OriginalWebSocket.prototype;
    for (const key of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) {
      Object.defineProperty(GuardedWebSocket, key, {
        value: OriginalWebSocket[key],
        enumerable: true,
      });
    }
    window.WebSocket = GuardedWebSocket;

    // Retain the reference only inside this closure so application code cannot
    // bypass the guard. This assignment also documents intentional non-use.
    void originalWebSocketSend;
  }

  const blockFormSubmit = (kind, form) => recordBlock({
    kind,
    method: normalizeMethod((form && form.method) || 'GET'),
    url: (form && form.action) || window.location.href,
    reason: 'form-submit-disabled',
  });

  HTMLFormElement.prototype.submit = function guardedSubmit() {
    blockFormSubmit('form.submit', this);
  };

  if (HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function guardedRequestSubmit() {
      blockFormSubmit('form.requestSubmit', this);
    };
  }

  document.addEventListener('submit', event => {
    blockFormSubmit('form.event', event.target);
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  document.addEventListener('click', event => {
    const target = event.target;
    const submitter = target && typeof target.closest === 'function'
      ? target.closest('button[type="submit"],input[type="submit"],input[type="image"]')
      : null;
    if (!submitter) return;
    blockFormSubmit('form.submitter-click', submitter.form);
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  const blockExternalNavigation = (kind, urlValue) => {
    const parsed = parseUrl(urlValue);
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) return false;
    if (parsed.origin === EXPECTED_LOCAL_ORIGIN) return false;

    return !recordBlock({
      kind,
      method: 'GET',
      url: urlValue,
      reason: isProductionHost(parsed.hostname) ? 'production-host' : 'external-navigation',
    });
  };

  document.addEventListener('click', event => {
    const target = event.target;
    const anchor = target && typeof target.closest === 'function'
      ? target.closest('a[href]')
      : null;
    if (anchor && blockExternalNavigation('anchor-navigation', anchor.href)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  const originalWindowOpen = window.open;
  window.open = function guardedWindowOpen(url) {
    if (blockExternalNavigation('window.open', url)) return null;
    return originalWindowOpen.apply(this, arguments);
  };

  const guard = {
    installed: true,
    version: GUARD_VERSION,
    snapshot: () => JSON.parse(JSON.stringify(state)),
  };

  Object.defineProperty(window, '__qaReadOnlyGuard', {
    value: guard,
    configurable: false,
    enumerable: false,
    writable: false,
  });

  return guard.snapshot();
})()

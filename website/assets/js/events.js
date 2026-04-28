const IS_LOCAL_PAGE = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const URL_PARAMS = new URLSearchParams(window.location.search);
const LOCAL_API_OVERRIDE = URL_PARAMS.get('api') || window.localStorage.getItem('helmEventsApiBase') || '';
const API_BASE = LOCAL_API_OVERRIDE || '';

(function () {
  'use strict';

  const grid = document.getElementById('events-grid');
  const loading = document.getElementById('events-loading');
  const status = document.getElementById('events-status');
  const pills = document.querySelectorAll('.events-pill');
  const countrySelect = document.getElementById('events-country');
  const dateFromInput = document.getElementById('events-date-from');
  const dateToInput = document.getElementById('events-date-to');
  const datesResetButton = document.getElementById('events-dates-reset');

  let activeType = '';
  let currentRequestId = 0;
  let activeController = null;

  function updateDatesResetVisibility() {
    if (!datesResetButton) return;
    const hasDates = (dateFromInput && dateFromInput.value) || (dateToInput && dateToInput.value);
    datesResetButton.classList.toggle('is-visible', !!hasDates);
  }

  // ── Helpers ──

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatDate(startDate, endDate) {
    const opts = { month: 'long', day: 'numeric', year: 'numeric' };
    const start = new Date(startDate + 'T00:00:00');
    if (!endDate || endDate === startDate) {
      return start.toLocaleDateString('en-US', opts);
    }
    const end = new Date(endDate + 'T00:00:00');
    // Same month & year - "May 15-16, 2026"
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      const month = start.toLocaleDateString('en-US', { month: 'long' });
      return month + ' ' + start.getDate() + '-' + end.getDate() + ', ' + start.getFullYear();
    }
    // Different months - "May 30 - Jun 1, 2026"
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', opts);
    return startStr + ' - ' + endStr;
  }

  function buildLocation(event) {
    const parts = [];
    if (event.city) parts.push(event.city);
    if (event.state) parts.push(event.state);
    if (event.country) parts.push(event.country);
    return parts.join(', ');
  }

  // ── Rendering ──

  function showLoading() {
    loading.style.display = '';
    if (status) status.style.display = 'none';
    grid.innerHTML = '';
    grid.style.display = 'none';
  }

  function hideLoading() {
    loading.style.display = 'none';
    grid.style.display = '';
  }

  function renderEmpty(message) {
    hideLoading();
    if (status) status.style.display = 'none';
    grid.innerHTML = '<div class="events-empty">' + escapeHTML(message) + '</div>';
    grid.style.display = 'block';
  }

  function renderEvents(events, context) {
    hideLoading();

    if (!events || events.length === 0) {
      renderEmpty('No events found matching your filters.');
      return;
    }

    if (status) {
      var typeLabel = context && context.type ? context.type : 'all';
      var countryLabel = context && context.country ? context.country : countrySelect.value;
      status.textContent = 'Showing ' + events.length + ' event' + (events.length === 1 ? '' : 's') +
        ' for ' + typeLabel + ' in ' + countryLabel + '.';
      status.style.display = 'block';
    }

    grid.style.display = '';
    grid.innerHTML = events.map(function (ev) {
      var url = ev.url ? escapeHTML(ev.url) : '#';
      var badge = escapeHTML(ev.type || 'Event');
      var name = escapeHTML(ev.name || 'Untitled Event');
      var date = formatDate(ev.startDate, ev.endDate);
      var location = escapeHTML(buildLocation(ev));
      var federation = ev.federation ? escapeHTML(ev.federation) : '';

      return (
        '<a class="event-card" href="' + url + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="event-card__badge">' + badge + '</span>' +
          '<span class="event-card__name">' + name + '</span>' +
          '<span class="event-card__date">' + escapeHTML(date) + '</span>' +
          (location ? '<span class="event-card__location">' + location + '</span>' : '') +
          (federation ? '<span class="event-card__federation">' + federation + '</span>' : '') +
        '</a>'
      );
    }).join('');
  }

  // ── Fetching ──

  function fetchEvents() {
    var country = countrySelect.value;
    var type = activeType;
    var fromValue = dateFromInput ? dateFromInput.value : '';
    var toValue = dateToInput ? dateToInput.value : '';
    var params = new URLSearchParams();
    params.set('country', country);
    if (type) {
      params.set('type', type);
    }
    if (fromValue) {
      params.set('from', fromValue);
    }
    if (toValue) {
      params.set('to', toValue);
    }

    updateDatesResetVisibility();

    var url = (API_BASE || '') + '/api/events?' + params.toString();
    var requestId = ++currentRequestId;
    if (activeController) {
      activeController.abort();
    }
    activeController = new AbortController();
    console.log('[events] fetching', url);

    showLoading();

    fetch(url, {
      signal: activeController.signal,
      cache: 'no-store'
    })
      .then(function (res) {
        if (requestId !== currentRequestId) return null;
        if (!res.ok) {
          if (IS_LOCAL_PAGE) {
            renderEmpty(
              'Events API not available on this local site. Use `?api=http://localhost:8787` for a local worker, or deploy the site when you are ready.'
            );
            return null;
          }
          renderEmpty('Events coming soon. Check back after launch.');
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        if (data === null || requestId !== currentRequestId) return;
        console.log('[events] response', data);
        if (data.meta && data.meta.cached === false) {
          renderEmpty(
            API_BASE
              ? 'No local event cache yet. Trigger the scheduled collector via /__scheduled, then refresh.'
              : 'Events coming soon. Check back after launch.'
          );
          return;
        }
        var events = Array.isArray(data) ? data : (data.events || []);
        console.log('[events] rendering', events.length, 'events');
        renderEvents(events, { type: type, country: country });
      })
      .catch(function (err) {
        if (err && err.name === 'AbortError') {
          return;
        }
        console.error('[events] fetch failed', err);
        if (IS_LOCAL_PAGE) {
          renderEmpty(
            'Events API unreachable' +
            (API_BASE ? ' at ' + API_BASE : '') +
            '. Use `?api=http://localhost:8787` for a local worker, or deploy the site when you are ready.'
          );
          return;
        }
        renderEmpty('Events coming soon. Check back after launch.');
      });
  }

  // ── Event Listeners ──

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      activeType = pill.getAttribute('data-type') || '';
      fetchEvents();
    });
  });

  countrySelect.addEventListener('change', function () {
    fetchEvents();
  });

  if (dateFromInput) {
    dateFromInput.addEventListener('change', function () {
      fetchEvents();
    });
  }
  if (dateToInput) {
    dateToInput.addEventListener('change', function () {
      fetchEvents();
    });
  }
  if (datesResetButton) {
    datesResetButton.addEventListener('click', function () {
      if (dateFromInput) dateFromInput.value = '';
      if (dateToInput) dateToInput.value = '';
      fetchEvents();
    });
  }

  // ── Init ──
  fetchEvents();

})();

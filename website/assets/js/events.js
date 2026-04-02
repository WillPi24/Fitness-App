const API_BASE = ''; // empty = same origin, or set to worker URL during development

(function () {
  'use strict';

  const grid = document.getElementById('events-grid');
  const loading = document.getElementById('events-loading');
  const pills = document.querySelectorAll('.events-pill');
  const countrySelect = document.getElementById('events-country');

  let activeType = '';

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
    // Same month & year — "May 15-16, 2026"
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      const month = start.toLocaleDateString('en-US', { month: 'long' });
      return month + ' ' + start.getDate() + '-' + end.getDate() + ', ' + start.getFullYear();
    }
    // Different months — "May 30 - Jun 1, 2026"
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
    grid.innerHTML = '';
    grid.style.display = 'none';
  }

  function hideLoading() {
    loading.style.display = 'none';
    grid.style.display = '';
  }

  function renderEmpty(message) {
    hideLoading();
    grid.innerHTML = '<div class="events-empty">' + escapeHTML(message) + '</div>';
    grid.style.display = 'block';
  }

  function renderEvents(events) {
    hideLoading();

    if (!events || events.length === 0) {
      renderEmpty('No events found matching your filters.');
      return;
    }

    grid.style.display = '';
    grid.innerHTML = events.map(function (ev) {
      var url = ev.url ? escapeHTML(ev.url) : '#';
      var badge = escapeHTML(ev.type || 'Event');
      var name = escapeHTML(ev.name || 'Untitled Event');
      var date = formatDate(ev.date, ev.end_date);
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
    var params = new URLSearchParams();
    params.set('country', country);
    if (activeType) {
      params.set('type', activeType);
    }

    var url = (API_BASE || '') + '/api/events?' + params.toString();

    showLoading();

    fetch(url)
      .then(function (res) {
        if (!res.ok) {
          // API not deployed yet or server error
          renderEmpty('Events coming soon. Check back after launch.');
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        if (data === null) return;
        var events = Array.isArray(data) ? data : (data.events || []);
        renderEvents(events);
      })
      .catch(function () {
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

  // ── Init ──
  fetchEvents();

})();

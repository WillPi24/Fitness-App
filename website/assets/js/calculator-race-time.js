(function () {
  'use strict';

  var distanceSelect = document.getElementById('rt-distance');
  var customField = document.getElementById('rt-custom-field');
  var customMeters = document.getElementById('rt-custom-meters');
  var minutesInput = document.getElementById('rt-minutes');
  var secondsInput = document.getElementById('rt-seconds');

  var result5k = document.getElementById('rt-5k');
  var result10k = document.getElementById('rt-10k');
  var resultHalf = document.getElementById('rt-half');
  var resultFull = document.getElementById('rt-full');

  var targets = [
    { el: result5k,   dist: 5000,  label: '5K' },
    { el: result10k,  dist: 10000, label: '10K' },
    { el: resultHalf, dist: 21097, label: 'Half Marathon' },
    { el: resultFull, dist: 42195, label: 'Marathon' }
  ];

  function formatTime(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    var mins = Math.floor((totalSeconds % 3600) / 60);
    var secs = Math.round(totalSeconds % 60);

    if (secs === 60) {
      mins += 1;
      secs = 0;
    }
    if (mins === 60) {
      hours += 1;
      mins = 0;
    }

    if (hours > 0) {
      return hours + ':' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }
    return mins + ':' + String(secs).padStart(2, '0');
  }

  function getKnownDistance() {
    var val = distanceSelect.value;
    if (val === 'custom') {
      return parseFloat(customMeters.value) || 0;
    }
    return parseFloat(val);
  }

  // Riegel formula: T2 = T1 * (D2 / D1)^1.06
  function predict(t1, d1, d2) {
    return t1 * Math.pow(d2 / d1, 1.06);
  }

  function calculate() {
    var d1 = getKnownDistance();
    var mins = parseFloat(minutesInput.value) || 0;
    var secs = parseFloat(secondsInput.value) || 0;
    var t1 = mins * 60 + secs;

    if (d1 <= 0 || t1 <= 0) {
      targets.forEach(function (t) { t.el.textContent = '—'; });
      return;
    }

    targets.forEach(function (t) {
      var predicted = predict(t1, d1, t.dist);
      t.el.textContent = formatTime(predicted);
    });
  }

  distanceSelect.addEventListener('change', function () {
    if (distanceSelect.value === 'custom') {
      customField.classList.remove('u-hidden');
    } else {
      customField.classList.add('u-hidden');
    }
    calculate();
  });

  minutesInput.addEventListener('input', calculate);
  secondsInput.addEventListener('input', calculate);
  customMeters.addEventListener('input', calculate);
})();

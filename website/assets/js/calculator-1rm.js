(function () {
  'use strict';

  var weightInput = document.getElementById('orm-weight');
  var repsInput = document.getElementById('orm-reps');
  var resultDisplay = document.getElementById('orm-result');

  function calculate() {
    var weight = parseFloat(weightInput.value);
    var reps = parseInt(repsInput.value, 10);

    if (!weight || weight <= 0 || !reps || reps < 1) {
      resultDisplay.textContent = '—';
      return;
    }

    if (reps === 1) {
      resultDisplay.textContent = weight.toFixed(1);
      return;
    }

    var oneRM = weight * (1 + reps / 30);
    resultDisplay.textContent = oneRM.toFixed(1);
  }

  weightInput.addEventListener('input', calculate);
  repsInput.addEventListener('input', calculate);
})();

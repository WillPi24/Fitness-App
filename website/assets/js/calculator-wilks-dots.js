(function () {
  'use strict';

  var wilksCoeffs = {
    male:   [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8],
    female: [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8]
  };

  var dotsCoeffs = {
    male:   [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093],
    female: [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706]
  };

  var bwInput = document.getElementById('wd-bodyweight');
  var totalInput = document.getElementById('wd-total');
  var sexInputs = document.querySelectorAll('input[name="wd-sex"]');
  var wilksDisplay = document.getElementById('wd-wilks');
  var dotsDisplay = document.getElementById('wd-dots');

  function getSelectedSex() {
    for (var i = 0; i < sexInputs.length; i++) {
      if (sexInputs[i].checked) return sexInputs[i].value;
    }
    return 'male';
  }

  function calcWilks(bw, total, sex) {
    var c = wilksCoeffs[sex];
    var denom = c[0]
      + c[1] * bw
      + c[2] * Math.pow(bw, 2)
      + c[3] * Math.pow(bw, 3)
      + c[4] * Math.pow(bw, 4)
      + c[5] * Math.pow(bw, 5);
    return (500 / Math.abs(denom)) * total;
  }

  function calcDOTS(bw, total, sex) {
    var c = dotsCoeffs[sex];
    var denom = c[0]
      + c[1] * bw
      + c[2] * Math.pow(bw, 2)
      + c[3] * Math.pow(bw, 3)
      + c[4] * Math.pow(bw, 4);
    return (500 / denom) * total;
  }

  function calculate() {
    var bw = parseFloat(bwInput.value);
    var total = parseFloat(totalInput.value);
    var sex = getSelectedSex();

    if (!bw || bw <= 0 || !total || total <= 0) {
      wilksDisplay.textContent = '—';
      dotsDisplay.textContent = '—';
      return;
    }

    wilksDisplay.textContent = calcWilks(bw, total, sex).toFixed(2);
    dotsDisplay.textContent = calcDOTS(bw, total, sex).toFixed(2);
  }

  bwInput.addEventListener('input', calculate);
  totalInput.addEventListener('input', calculate);
  for (var i = 0; i < sexInputs.length; i++) {
    sexInputs[i].addEventListener('change', calculate);
  }
})();

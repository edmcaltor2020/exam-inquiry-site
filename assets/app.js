(function () {
  'use strict';

  /* ---------- 첫 화면: 단면 영상처럼 겹치는 등고선 ---------- */
  var scan = document.getElementById('scan');
  if (scan) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-100 -100 200 200');

    function blob(r, seed, wobble) {
      var pts = [];
      var n = 72;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2;
        var k = 1 + wobble * (Math.sin(a * 3 + seed) * 0.5 + Math.sin(a * 5 - seed * 1.7) * 0.3 + Math.sin(a * 2 + seed * 0.6) * 0.4);
        pts.push([Math.cos(a) * r * k, Math.sin(a) * r * k * 0.94]);
      }
      var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
      for (var j = 1; j <= n; j++) {
        var p = pts[j % n];
        d += ' L' + p[0].toFixed(1) + ',' + p[1].toFixed(1);
      }
      return d + 'Z';
    }

    var base = document.createElementNS(NS, 'path');
    base.setAttribute('d', blob(88, 0.4, 0.07));
    base.setAttribute('class', 'is-fill');
    svg.appendChild(base);

    for (var i = 0; i < 9; i++) {
      var r = 86 - i * 9.2;
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', blob(r, 0.4 + i * 0.35, 0.07 + i * 0.006));
      path.setAttribute('data-draw', '');
      path.style.setProperty('--i', i);
      svg.appendChild(path);
    }

    var core = document.createElementNS(NS, 'path');
    core.setAttribute('d', blob(9, 2.2, 0.12));
    core.setAttribute('class', 'is-core');
    svg.appendChild(core);

    scan.appendChild(svg);
    svg.querySelectorAll('path[data-draw]').forEach(function (p) {
      p.style.setProperty('--len', Math.ceil(p.getTotalLength()));
    });
  }

  /* app:picker */
  /* app:form */
})();

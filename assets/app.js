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

  /* ---------- 검사 고르기 ---------- */
  var groups = window.EXAM_GROUPS || [];
  var selected = [];
  var activeGroup = groups.length ? groups[0].id : null;
  var typesEl = document.getElementById('types');
  var listEl = document.getElementById('exam-list');
  var chosenEls = [document.getElementById('chosen-main')];
  var dock = document.getElementById('dock');
  var dockCount = document.getElementById('dock-count');
  var listeners = [];

  function onChange(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (fn) { fn(selected.slice()); }); }

  function toggleExam(name, on) {
    var i = selected.indexOf(name);
    if (on && i < 0) selected.push(name);
    if (!on && i >= 0) selected.splice(i, 1);
    renderPicker();
    emit();
  }

  function renderChosen(el, emptyText) {
    el.textContent = '';
    if (!selected.length) {
      var e = document.createElement('span');
      e.className = 'empty';
      e.textContent = emptyText;
      el.appendChild(e);
      return;
    }
    selected.forEach(function (name) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.appendChild(document.createTextNode(name));
      var x = document.createElement('button');
      x.type = 'button';
      x.setAttribute('aria-label', name + ' 빼기');
      x.textContent = '×';
      x.addEventListener('click', function () { toggleExam(name, false); });
      chip.appendChild(x);
      el.appendChild(chip);
    });
  }

  function renderPicker() {
    if (!typesEl) return;
    typesEl.textContent = '';
    groups.forEach(function (g) {
      var n = g.exams.filter(function (x) { return selected.indexOf(x) >= 0; }).length;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'type';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(g.id === activeGroup));
      b.appendChild(document.createTextNode(g.name));
      if (n) {
        var c = document.createElement('span');
        c.className = 'count';
        c.textContent = n;
        b.appendChild(c);
      }
      b.addEventListener('click', function () { activeGroup = g.id; renderPicker(); });
      typesEl.appendChild(b);
    });

    var group = groups.filter(function (g) { return g.id === activeGroup; })[0];
    listEl.textContent = '';
    if (group) {
      group.exams.forEach(function (name) {
        var label = document.createElement('label');
        label.className = 'exam';
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = selected.indexOf(name) >= 0;
        input.addEventListener('change', function () { toggleExam(name, input.checked); });
        var span = document.createElement('span');
        span.textContent = name;
        label.appendChild(input);
        label.appendChild(span);
        listEl.appendChild(label);
      });
    }
    renderChosen(chosenEls[0], '아직 고른 검사가 없어요.');
    dockCount.textContent = selected.length;
    dock.classList.toggle('is-hidden', !selected.length || contactVisible);
  }

  var contactVisible = false;
  var contactEl = document.getElementById('contact');
  if (contactEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      contactVisible = entries[0].isIntersecting;
      dock.classList.toggle('is-hidden', !selected.length || contactVisible);
    }, { threshold: 0.15 }).observe(contactEl);
  }

  renderPicker();

  /* ---------- 문의 보내기 ---------- */
  var form = document.getElementById('form');
  var chosenForm = document.getElementById('chosen-form');
  var statusEl = document.getElementById('status');
  var submitBtn = document.getElementById('submit');
  var doneEl = document.getElementById('done');

  if (form) {
    chosenEls.push(chosenForm);
    var renderForm = function () { renderChosen(chosenForm, '고른 검사가 없어요. 위에서 고르거나 이대로 문의해도 됩니다.'); };
    onChange(renderForm);
    renderForm();

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = form.elements.name.value.trim();
      var contact = form.elements.contact.value.trim();
      var consent = document.getElementById('f-consent').checked;
      statusEl.className = 'status is-error';
      if (!name || !contact) { statusEl.textContent = '이름과 연락처를 적어 주세요.'; return; }
      if (!consent) { statusEl.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }

      submitBtn.disabled = true;
      statusEl.className = 'status';
      statusEl.textContent = '보내는 중이에요…';
      fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          contact: contact,
          message: form.elements.message.value.trim(),
          exams: selected,
          website: form.elements.website.value,
          consent: consent
        })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) { return { ok: r.ok, data: data }; });
      }).then(function (res) {
        if (!res.ok) throw new Error((res.data && res.data.error) || '보내지 못했어요. 잠시 뒤 다시 시도해 주세요.');
        form.hidden = true;
        doneEl.hidden = false;
        doneEl.focus && doneEl.setAttribute('tabindex', '-1');
        doneEl.focus();
      }).catch(function (err) {
        statusEl.className = 'status is-error';
        statusEl.textContent = err.message || '보내지 못했어요. 잠시 뒤 다시 시도해 주세요.';
      }).then(function () { submitBtn.disabled = false; });
    });
  }
})();

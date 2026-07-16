/* ============================================
   TTTC2453 Machine Learning - Study Site
   Complete JavaScript Engine
   ============================================ */

(function() {
  'use strict';

  /* --- Theme Toggle --- */
  function initTheme() {
    const saved = localStorage.getItem('tttc-theme');
    if (saved === 'light') document.body.classList.add('light-mode');
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('tttc-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
        updateThemeIcon();
      });
      updateThemeIcon();
    }
  }
  function updateThemeIcon() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const icon = btn.querySelector('.icon');
    if (icon) icon.textContent = document.body.classList.contains('light-mode') ? '\u263E' : '\u2600';
  }

  /* --- Sidebar Toggle (mobile) --- */
  function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });
      document.addEventListener('click', function(e) {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggle) {
          sidebar.classList.remove('open');
        }
      });
    }
  }

  /* --- Collapsible Sections --- */
  function initCollapsibles() {
    document.querySelectorAll('.collapsible-header').forEach(function(header) {
      header.addEventListener('click', function() {
        this.classList.toggle('open');
        const body = this.nextElementSibling;
        if (body) body.classList.toggle('open');
      });
    });
  }

  /* --- Progress Tracking --- */
  function getTopicId() {
    const m = window.location.pathname.match(/topic(\d+)/);
    return m ? 'topic' + m[1] : null;
  }

  function getProgress() {
    try { return JSON.parse(localStorage.getItem('tttc-progress') || '{}'); }
    catch(e) { return {}; }
  }
  function saveProgress(p) {
    localStorage.setItem('tttc-progress', JSON.stringify(p));
  }

  function updateTopicProgress(topicId, sectionId, complete) {
    const p = getProgress();
    if (!p[topicId]) p[topicId] = {};
    p[topicId][sectionId] = complete;
    saveProgress(p);
    refreshProgressBar();
  }

  function getTopicCompletionPct(topicId) {
    const p = getProgress();
    const sections = document.querySelectorAll('[data-progress-section]');
    if (sections.length === 0) return 0;
    let done = 0;
    sections.forEach(function(s) {
      if (p[topicId] && p[topicId][s.getAttribute('data-progress-section')]) done++;
    });
    return Math.round((done / sections.length) * 100);
  }

  function refreshProgressBar() {
    const topicId = getTopicId();
    if (!topicId) return;
    const pct = getTopicCompletionPct(topicId);
    document.querySelectorAll('.progress-bar-fill').forEach(function(bar) {
      bar.style.width = pct + '%';
    });
    document.querySelectorAll('.progress-pct').forEach(function(el) {
      el.textContent = pct + '%';
    });
    // Update overall progress for index page
    updateOverallProgress();
  }

  function updateOverallProgress() {
    const p = getProgress();
    const totalTopics = 11;
    let totalPct = 0;
    for (let i = 1; i <= totalTopics; i++) {
      const tid = 'topic' + i;
      const topicEl = document.querySelector('[data-topic-id="' + tid + '"]');
      const sections = topicEl ? topicEl.querySelectorAll('[data-progress-section]').length : 0;
      if (sections > 0 && p[tid]) {
        let done = 0;
        topicEl.querySelectorAll('[data-progress-section]').forEach(function(s) {
          if (p[tid][s.getAttribute('data-progress-section')]) done++;
        });
        totalPct += (done / sections) * 100;
      }
    }
    const overall = Math.round(totalPct / totalTopics);
    document.querySelectorAll('.overall-progress .progress-bar-fill').forEach(function(bar) {
      bar.style.width = overall + '%';
    });
    document.querySelectorAll('.overall-pct').forEach(function(el) {
      el.textContent = overall + '%';
    });
  }

  function markSectionComplete(sectionId) {
    const topicId = getTopicId();
    if (topicId) updateTopicProgress(topicId, sectionId, true);
  }

  /* --- Flashcard System --- */
  function initFlashcards() {
    document.querySelectorAll('.flashcard-container').forEach(function(container) {
      const topicId = getTopicId() || 'index';
      const cards = container.querySelectorAll('.flashcard');
      const counter = container.querySelector('.flashcard-counter');
      let known = JSON.parse(localStorage.getItem('tttc-flash-' + topicId) || '[]');
      let currentIdx = 0;
      let showAll = true;

      function getVisibleCards() {
        if (showAll) return Array.from(cards);
        return Array.from(cards).filter(function(_, i) { return known.indexOf(i) === -1; });
      }

      function showCard() {
        const visible = getVisibleCards();
        cards.forEach(function(c) { c.style.display = 'none'; c.classList.remove('flipped'); });
        if (visible.length === 0) {
          if (counter) counter.textContent = 'All cards mastered!';
          return;
        }
        if (currentIdx >= visible.length) currentIdx = 0;
        visible[currentIdx].style.display = 'block';
        if (counter) counter.textContent = (currentIdx + 1) + ' / ' + visible.length;
      }

      cards.forEach(function(card, idx) {
        card.addEventListener('click', function() { this.classList.toggle('flipped'); });

        const knownBtn = card.querySelector('.btn-known');
        const unknownBtn = card.querySelector('.btn-unknown');
        if (knownBtn) knownBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (known.indexOf(idx) === -1) known.push(idx);
          localStorage.setItem('tttc-flash-' + topicId, JSON.stringify(known));
          showCard();
          markSectionComplete('flash-' + idx);
        });
        if (unknownBtn) unknownBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          known = known.filter(function(k) { return k !== idx; });
          localStorage.setItem('tttc-flash-' + topicId, JSON.stringify(known));
          showCard();
        });
      });

      const prevBtn = container.querySelector('.flash-prev');
      const nextBtn = container.querySelector('.flash-next');
      if (prevBtn) prevBtn.addEventListener('click', function() {
        const v = getVisibleCards();
        currentIdx = (currentIdx - 1 + v.length) % v.length;
        showCard();
      });
      if (nextBtn) nextBtn.addEventListener('click', function() {
        const v = getVisibleCards();
        currentIdx = (currentIdx + 1) % v.length;
        showCard();
      });

      const shuffleBtn = container.querySelector('.flash-shuffle');
      if (shuffleBtn) shuffleBtn.addEventListener('click', function() {
        const visible = getVisibleCards();
        for (let i = visible.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          visible[i].parentNode.insertBefore(visible[j], visible[i]);
        }
        currentIdx = 0;
        showCard();
      });

      const filterBtn = container.querySelector('.flash-filter');
      if (filterBtn) filterBtn.addEventListener('click', function() {
        showAll = !showAll;
        this.textContent = showAll ? 'Show All' : 'Show Unknown Only';
        currentIdx = 0;
        showCard();
      });

      showCard();
    });
  }

  /* --- Quiz System --- */
  function initQuizzes() {
    document.querySelectorAll('.quiz-container').forEach(function(container) {
      const topicId = getTopicId() || 'index';
      const quizId = container.getAttribute('data-quiz-id') || 'default';
      const questions = container.querySelectorAll('.quiz-question');
      let answered = JSON.parse(localStorage.getItem('tttc-quiz-' + topicId + '-' + quizId) || '{}');

      questions.forEach(function(q, idx) {
        const options = q.querySelectorAll('.quiz-option');
        const feedback = q.querySelector('.quiz-feedback');
        const alreadyAnswered = answered[idx];

        if (alreadyAnswered !== undefined) {
          showAnswer(q, options, feedback, alreadyAnswered);
        }

        options.forEach(function(opt) {
          opt.addEventListener('click', function() {
            if (q.classList.contains('answered')) return;
            q.classList.add('answered');
            const correct = this.getAttribute('data-correct') === 'true';
            answered[idx] = correct;
            localStorage.setItem('tttc-quiz-' + topicId + '-' + quizId, JSON.stringify(answered));
            showAnswer(q, options, feedback, correct);
            if (correct) markSectionComplete('quiz-' + quizId + '-' + idx);
          });
        });
      });
    });
  }

  function showAnswer(q, options, feedback, correct) {
    options.forEach(function(opt) {
      if (opt.getAttribute('data-correct') === 'true') opt.classList.add('correct');
      else if (opt.classList.contains('selected')) opt.classList.add('incorrect');
    });
    if (feedback) {
      feedback.style.display = 'block';
      feedback.className = 'quiz-feedback ' + (correct ? 'correct' : 'incorrect');
    }
  }

  /* --- Fill-in-the-Blank System --- */
  function initFillBlanks() {
    document.querySelectorAll('.fill-blank-container').forEach(function(container) {
      const input = container.querySelector('.fill-blank-input');
      const feedback = container.querySelector('.fill-blank-feedback');
      const btn = container.querySelector('.btn-check');
      const answer = container.getAttribute('data-answer').toLowerCase().trim();
      const altAnswers = (container.getAttribute('data-alt-answers') || '').split('|').map(function(a) { return a.toLowerCase().trim(); }).filter(Boolean);

      if (btn) {
        btn.addEventListener('click', function() {
          const val = input.value.toLowerCase().trim();
          const isCorrect = val === answer || altAnswers.indexOf(val) !== -1;
          input.classList.remove('correct', 'incorrect');
          input.classList.add(isCorrect ? 'correct' : 'incorrect');
          if (feedback) {
            feedback.style.display = 'block';
            feedback.textContent = isCorrect ? 'Correct!' : 'Not quite. The expected answer is: ' + container.getAttribute('data-answer');
            feedback.style.color = isCorrect ? 'var(--accent-green)' : 'var(--accent-red)';
          }
          if (isCorrect) {
            const topicId = getTopicId();
            if (topicId) markSectionComplete('fill-' + container.getAttribute('data-fill-id'));
          }
        });
      }
      if (input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') btn.click();
        });
      }
    });
  }

  /* --- Reveal-on-Click --- */
  function initReveals() {
    document.querySelectorAll('.reveal-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const target = this.nextElementSibling;
        if (target) {
          const isOpen = target.classList.contains('open');
          target.classList.toggle('open');
          this.textContent = isOpen ? 'Click to reveal answer' : 'Click to hide answer';
        }
      });
    });
  }

  /* --- Scrollspy for Sidebar --- */
  function initScrollspy() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const items = sidebar.querySelectorAll('.nav-item');
    const sections = [];
    items.forEach(function(item) {
      const id = item.getAttribute('data-section');
      if (id) {
        const el = document.getElementById(id);
        if (el) sections.push({ el: el, item: item });
      }
    });
    if (sections.length === 0) return;

    window.addEventListener('scroll', function() {
      let current = sections[0];
      sections.forEach(function(s) {
        if (s.el.getBoundingClientRect().top <= 120) current = s;
      });
      items.forEach(function(i) { i.classList.remove('active'); });
      if (current) current.item.classList.add('active');
    });
  }

  /* --- Score Display --- */
  function getQuizScore(topicId, quizId) {
    const answered = JSON.parse(localStorage.getItem('tttc-quiz-' + topicId + '-' + quizId) || '{}');
    let correct = 0, total = 0;
    Object.keys(answered).forEach(function(k) {
      total++;
      if (answered[k]) correct++;
    });
    return { correct: correct, total: total };
  }

  function displayScores() {
    document.querySelectorAll('.quiz-score-display').forEach(function(el) {
      const topicId = getTopicId() || '';
      const quizId = el.getAttribute('data-quiz-id') || '';
      const s = getQuizScore(topicId, quizId);
      el.textContent = s.total > 0 ? s.correct + '/' + s.total + ' correct' : 'Not attempted';
    });
  }

  /* --- Index Page Progress Cards --- */
  function initIndexPage() {
    if (!document.querySelector('.topic-grid')) return;
    const p = getProgress();
    document.querySelectorAll('.topic-card').forEach(function(card) {
      const tid = card.getAttribute('data-topic-id');
      if (!tid) return;
      const sections = card.querySelectorAll('[data-progress-section]');
      let done = 0;
      sections.forEach(function(s) {
        if (p[tid] && p[tid][s.getAttribute('data-progress-section')]) done++;
      });
      const pct = sections.length > 0 ? Math.round((done / sections.length) * 100) : 0;
      const bar = card.querySelector('.progress-bar-fill');
      const pctEl = card.querySelector('.pct');
      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
      if (pct >= 100) {
        const badge = card.querySelector('.completion-badge');
        if (badge) badge.style.display = 'flex';
      }
    });
    updateOverallProgress();
  }

  /* --- Init Everything --- */
  function init() {
    initTheme();
    initSidebar();
    initCollapsibles();
    initFlashcards();
    initQuizzes();
    initFillBlanks();
    initReveals();
    initScrollspy();
    displayScores();
    refreshProgressBar();
    initIndexPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual triggers
  window.tttc = {
    markComplete: markSectionComplete,
    getProgress: getProgress,
    getQuizScore: getQuizScore
  };

})();

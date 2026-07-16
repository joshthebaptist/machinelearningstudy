/* ============================================
   Practice Pages - Interactive Quiz Engine
   ============================================ */
(function() {
  'use strict';

  function initPracticeQuizzes() {
    document.querySelectorAll('.practice-container').forEach(function(container) {
      var questions = container.querySelectorAll('.practice-question');
      var correct = 0, wrong = 0, answered = 0;
      var total = questions.length;

      function updateScore() {
        var pctEl = container.closest('.practice-page') ?
          container.closest('.practice-page').querySelector('.score-pct') : null;
        var corrEl = container.closest('.practice-page') ?
          container.closest('.practice-page').querySelector('.score-correct') : null;
        var wrongEl = container.closest('.practice-page') ?
          container.closest('.practice-page').querySelector('.score-wrong') : null;
        var progFill = container.closest('.practice-page') ?
          container.closest('.practice-page').querySelector('.progress-bar-fill') : null;
        var progText = container.closest('.practice-page') ?
          container.closest('.practice-page').querySelector('.progress-text') : null;

        if (pctEl) pctEl.textContent = answered > 0 ? Math.round((correct / answered) * 100) + '%' : '--';
        if (corrEl) corrEl.textContent = correct;
        if (wrongEl) wrongEl.textContent = wrong;
        if (progFill) progFill.style.width = (answered / total * 100) + '%';
        if (progText) progText.textContent = answered + ' / ' + total + ' answered';
      }

      questions.forEach(function(q) {
        var options = q.querySelectorAll('.practice-option');
        var explanation = q.querySelector('.practice-explanation');
        var letters = ['A', 'B', 'C', 'D', 'E', 'F'];

        options.forEach(function(opt, idx) {
          // Add letter labels
          var letterSpan = opt.querySelector('.opt-letter');
          if (!letterSpan) {
            var span = document.createElement('span');
            span.className = 'opt-letter';
            span.textContent = letters[idx] || '';
            opt.insertBefore(span, opt.firstChild);
          }

          opt.addEventListener('click', function() {
            if (q.classList.contains('answered')) return;
            q.classList.add('answered');

            var isCorrect = opt.getAttribute('data-correct') === 'true';
            answered++;

            if (isCorrect) {
              correct++;
              opt.classList.add('correct');
              q.classList.add('answered-correct');
            } else {
              wrong++;
              opt.classList.add('incorrect');
              q.classList.add('answered-wrong');
              // Highlight the correct one
              options.forEach(function(o) {
                if (o.getAttribute('data-correct') === 'true') o.classList.add('correct');
              });
            }

            // Disable all options
            options.forEach(function(o) { o.classList.add('disabled'); });

            // Show explanation
            if (explanation) {
              explanation.classList.add('show');
              explanation.classList.add(isCorrect ? 'correct-exp' : 'wrong-exp');
            }

            updateScore();
          });
        });
      });
    });
  }

  function initSolutions() {
    document.querySelectorAll('.solution-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var content = this.nextElementSibling;
        if (content) {
          var isOpen = content.classList.contains('open');
          content.classList.toggle('open');
          this.innerHTML = isOpen ?
            '&#128065; Reveal Full Solution' :
            '&#128065; Hide Solution';
        }
      });
    });
  }

  function init() {
    initPracticeQuizzes();
    initSolutions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * CareerSetu — AI Mock Interview Simulator
 */

import { checkAuthGuard, renderUserProfileWidget } from './auth.js';
import { saveUserData, getUserData } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuthGuard()) return;
  renderUserProfileWidget();

  const setupCard = document.getElementById('interview-setup-card');
  const sessionCard = document.getElementById('interview-session-card');
  const startBtn = document.getElementById('start-interview-btn');
  const submitAnswerBtn = document.getElementById('submit-answer-btn');
  const nextQuestionBtn = document.getElementById('next-question-btn');
  const endInterviewBtn = document.getElementById('end-interview-btn');
  const prefillAnswerBtn = document.getElementById('prefill-sample-answer-btn');

  const questionNumEl = document.getElementById('question-number');
  const questionTotalEl = document.getElementById('question-total');
  const questionTextEl = document.getElementById('question-text');
  const questionTipsEl = document.getElementById('question-tips');
  const answerInput = document.getElementById('user-answer-input');
  const feedbackContainer = document.getElementById('feedback-container');

  let currentQuestions = [];
  let currentQuestionIndex = 0;
  let interviewConfig = {};
  let sessionEvaluations = [];

  // Start Interview Handler
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      interviewConfig = {
        role: document.getElementById('interview-role')?.value || 'Frontend Web Developer',
        type: document.getElementById('interview-type')?.value || 'Technical',
        difficulty: document.getElementById('interview-difficulty')?.value || 'Intermediate'
      };

      startBtn.disabled = true;
      startBtn.innerHTML = '<span class="loading-spinner"></span> Generating Tailored Questions...';

      try {
        const res = await fetch('/api/mock-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_questions',
            role: interviewConfig.role,
            type: interviewConfig.type,
            difficulty: interviewConfig.difficulty
          })
        });

        const json = await res.json();
        currentQuestions = json.data?.questions || [];
        currentQuestionIndex = 0;
        sessionEvaluations = [];

        if (currentQuestions.length > 0) {
          if (setupCard) setupCard.style.display = 'none';
          if (sessionCard) sessionCard.style.display = 'block';
          displayQuestion(0);
        }
      } catch (err) {
        console.warn('Failed to load questions:', err);
      } finally {
        startBtn.disabled = false;
        startBtn.textContent = 'Begin Mock Interview Session';
      }
    });
  }

  function displayQuestion(index) {
    const q = currentQuestions[index];
    if (!q) return;

    if (questionNumEl) questionNumEl.textContent = index + 1;
    if (questionTotalEl) questionTotalEl.textContent = currentQuestions.length;
    if (questionTextEl) questionTextEl.textContent = q.question;
    if (questionTipsEl) questionTipsEl.textContent = q.tips || 'Be concise, structured, and give concrete examples.';

    if (answerInput) {
      answerInput.value = '';
      answerInput.disabled = false;
      answerInput.focus();
    }

    if (feedbackContainer) feedbackContainer.innerHTML = '';
    if (submitAnswerBtn) {
      submitAnswerBtn.style.display = 'inline-flex';
      submitAnswerBtn.disabled = false;
      submitAnswerBtn.textContent = 'Submit Answer & Evaluate';
    }
    if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';
  }

  // Prefill sample answer for fast hackathon judging
  if (prefillAnswerBtn) {
    prefillAnswerBtn.addEventListener('click', () => {
      if (!answerInput) return;
      answerInput.value = "In modern JavaScript, 'let' and 'const' were introduced in ES6 to provide block scoping, preventing accidental variable leakage outside loops or conditionals. 'const' creates an immutable variable identifier, while 'let' can be reassigned. 'var' has function scope and is subject to hoisting, which can lead to unpredictable runtime bugs.";
    });
  }

  // Submit Answer & Evaluate
  if (submitAnswerBtn) {
    submitAnswerBtn.addEventListener('click', async () => {
      const answer = (answerInput?.value || '').trim();
      if (!answer) {
        alert('Please enter your answer before submitting.');
        return;
      }

      submitAnswerBtn.disabled = true;
      submitAnswerBtn.innerHTML = '<span class="loading-spinner"></span> Gemini is Evaluating...';

      const currentQ = currentQuestions[currentQuestionIndex];

      try {
        const res = await fetch('/api/mock-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'evaluate_answer',
            role: interviewConfig.role,
            question: currentQ.question,
            answer: answer
          })
        });

        const json = await res.json();
        const evalData = json.data;
        sessionEvaluations.push({ question: currentQ.question, answer, evaluation: evalData });

        renderFeedback(evalData);

        submitAnswerBtn.style.display = 'none';
        if (nextQuestionBtn) {
          nextQuestionBtn.style.display = 'inline-flex';
          nextQuestionBtn.textContent = currentQuestionIndex < currentQuestions.length - 1 ? 'Next Question →' : 'Complete Session & View Summary';
        }
      } catch (err) {
        console.warn('Evaluation failed:', err);
      }
    });
  }

  // Next Question
  if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', () => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
      } else {
        finishInterviewSession();
      }
    });
  }

  if (endInterviewBtn) {
    endInterviewBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to end this interview session?')) {
        finishInterviewSession();
      }
    });
  }

  function renderFeedback(evalData) {
    if (!feedbackContainer) return;

    const score = evalData.score || 8.0;
    const scoreColor = score >= 8 ? 'text-emerald' : score >= 6 ? 'text-cyan' : 'text-amber';

    feedbackContainer.innerHTML = `
      <div class="feedback-card">
        <div class="flex-between mb-1">
          <div class="flex-align">
            <span class="badge badge-emerald">AI Feedback</span>
            <span class="text-dim" style="font-size: 0.8rem;">Evaluated by Gemini</span>
          </div>
          <span class="stat-value ${scoreColor}" style="font-size: 1.5rem;">${score} / 10</span>
        </div>

        <div class="grid-2 mb-1">
          <div>
            <p style="font-size: 0.85rem;"><strong>Technical Accuracy:</strong></p>
            <p class="text-muted" style="font-size: 0.85rem;">${evalData.technicalAccuracy}</p>
          </div>
          <div>
            <p style="font-size: 0.85rem;"><strong>Communication & Structure:</strong></p>
            <p class="text-muted" style="font-size: 0.85rem;">${evalData.communication}</p>
          </div>
        </div>

        <div style="background: rgba(0, 210, 255, 0.05); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-top: 0.75rem;">
          <p style="font-size: 0.85rem; color: #a5f3fc;"><strong>💡 Model Response Recommendation:</strong></p>
          <p style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.5; margin-top: 0.25rem;">
            ${evalData.suggestedBetterAnswer}
          </p>
        </div>
      </div>
    `;
  }

  async function finishInterviewSession() {
    // Save to Firestore / local progress
    const avgScore = sessionEvaluations.reduce((acc, curr) => acc + (curr.evaluation?.score || 7), 0) / (sessionEvaluations.length || 1);
    
    await saveUserData('interviews', {
      role: interviewConfig.role,
      type: interviewConfig.type,
      averageScore: avgScore.toFixed(1),
      evaluations: sessionEvaluations,
      completedAt: new Date().toISOString()
    });

    if (sessionCard) {
      sessionCard.innerHTML = `
        <div class="card text-center" style="padding: 3rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
          <h2 style="margin-bottom: 0.5rem;">Mock Interview Completed!</h2>
          <p class="text-muted mb-2">You completed ${sessionEvaluations.length} interview questions for <strong>${interviewConfig.role}</strong>.</p>
          
          <div style="display: inline-block; background: var(--bg-surface); padding: 1.5rem 2.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
            <p class="text-dim" style="font-size: 0.85rem;">Average Performance Score</p>
            <p class="stat-value text-emerald" style="font-size: 2.5rem;">${avgScore.toFixed(1)} / 10</p>
          </div>

          <div style="display: flex; gap: 1rem; justify-content: center;">
            <a href="interview.html" class="btn btn-secondary">Practice Another Role</a>
            <a href="progress.html" class="btn btn-primary">Check Progress Dashboard →</a>
          </div>
        </div>
      `;
    }
  }
});

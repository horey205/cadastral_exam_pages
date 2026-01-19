let allQuestions = [];
let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 60;
let currentMode = 'study'; // 'study' or 'exam'
let selectedSource = '기출'; // '기출' or 'all'

// Initialize questions from loaded script
function initQuiz() {
    if (typeof QUESTIONS !== 'undefined') {
        allQuestions = QUESTIONS;
        console.log("Loaded questions:", allQuestions.length);
        const countElem = document.getElementById('total-q-count');
        if (countElem) countElem.innerText = allQuestions.length;

        // 동적으로 과목 버튼 생성
        generateSubjectButtons();

    } else {
        console.error("questions.js failed to load.");
        alert("데이터 파일을 불러오지 못했습니다. 새로고침을 해주세요.");
    }
}

function generateSubjectButtons() {
    // 과목 목록 추출 (중복 제거 & 정렬)
    // 데이터 정제: 너무 길거나(20자 이상), 질문 내용이 포함된 오분류 데이터 제거
    const subjects = [...new Set(allQuestions
        .map(q => q.subject)
        .filter(s => s && s.length < 20 && !s.includes("다음") && !s.includes("설명"))
    )].sort();

    // HTML 그리드 찾기
    const grid = document.querySelector('.subject-grid');
    if (!grid) return;

    grid.innerHTML = ''; // 기존 하드코딩된 버튼 제거

    if (subjects.length === 0) {
        grid.innerHTML = '<p style="text-align:center; padding:20px; grid-column:1/-1;">불러올 과목 데이터가 없습니다.<br>questions.js/script.js를 확인해주세요.</p>';
        return;
    }

    subjects.forEach(subj => {
        const div = document.createElement('div');
        div.className = 'subject-card glass';
        div.innerHTML = `
            <h4 style="margin-bottom:15px">📚 ${subj}</h4>
            <div class="button-group">
                <button class="primary-btn" onclick="startQuiz('${subj}', 'study')">학습하기</button>
                <button class="glass-btn" onclick="startQuiz('${subj}', 'exam')">모의고사</button>
            </div>
        `;
        grid.appendChild(div);
    });
}

window.onload = initQuiz;

function showLanding() {
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('result').classList.add('hidden');
    document.getElementById('landing').classList.remove('hidden');
}

function setSource(src) {
    selectedSource = src;
    document.getElementById('src-official').classList.toggle('active', src === '기출');
    document.getElementById('src-all').classList.toggle('active', src === 'all');
}

function startQuiz(subject, mode) {
    currentMode = mode;
    console.log("Starting Quiz. Subject:", subject, "Mode:", mode);

    // Filter questions by subject
    // (기존의 source 필터링 로직 제거 - 모든 데이터가 '측량및지형공간정보산업기사'임)
    let filtered = allQuestions.filter(q => q.subject === subject);

    console.log("Filtered questions:", filtered.length);

    if (filtered.length === 0) {
        alert(`'${subject}' 과목의 문항이 없습니다.`);
        return;
    }

    if (mode === 'exam') {
        // --- Mock Exam: Random 20 questions ---
        // 난이도 데이터가 없을 수 있으므로 단순 랜덤
        currentQuiz = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 20);
    } else {
        // --- Study Mode: Load all questions in order or shuffled ---
        currentQuiz = [...filtered].sort(() => 0.5 - Math.random());
    }

    currentIndex = 0;
    score = 0;

    document.getElementById('landing').classList.add('hidden');
    document.getElementById('quiz').classList.remove('hidden');

    showQuestion();
}

function showQuestion() {
    if (currentIndex >= currentQuiz.length) {
        showResult();
        return;
    }

    const q = currentQuiz[currentIndex];

    // Header Info
    document.getElementById('curr-subject').innerText = q.subject;
    document.getElementById('curr-num').innerText = q.num;
    document.getElementById('q-text').innerText = q.text;

    // Progress
    const progress = (currentIndex / currentQuiz.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('q-counter').innerText = `${currentIndex + 1} / ${currentQuiz.length}`;

    // Image
    const imgContainer = document.getElementById('q-image');
    if (q.image) {
        imgContainer.innerHTML = `<img src="${q.image}" alt="Question Image" onerror="this.style.display='none'">`;
        imgContainer.classList.remove('hidden');
    } else {
        imgContainer.classList.add('hidden');
    }

    // Options
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn glass';
        // 옵션 텍스트 앞에 번호 추가
        btn.innerHTML = `<span class="opt-num">${idx + 1}</span> ${opt}`;
        btn.onclick = () => checkAnswer(idx + 1);
        optionsContainer.appendChild(btn);
    });

    // Reset UI
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');

    // Timer (Only in Exam Mode)
    clearInterval(timer);
    if (currentMode === 'exam') {
        document.getElementById('timer').classList.remove('hidden');
        startQuestionTimer();
    } else {
        document.getElementById('timer').classList.add('hidden');
    }
}

function startQuestionTimer() {
    timeLeft = 60;
    updateTimerDisplay();
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    const timerElem = document.getElementById('timer');
    timerElem.innerText = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

    if (timeLeft < 10) {
        timerElem.style.color = '#ef4444';
    } else {
        timerElem.style.color = 'var(--admin-primary)';
    }
}

function handleTimeout() {
    alert("시간이 초과되었습니다!");
    checkAnswer(-1, true);
}

function checkAnswer(selectedIdx, isTimeout = false) {
    if (timer) clearInterval(timer);

    const q = currentQuiz[currentIndex];
    const isCorrect = selectedIdx === q.answer;

    const options = document.querySelectorAll('.option-btn');
    options.forEach((btn, idx) => {
        btn.disabled = true;
        // Kinz scrap data: answer is 1-based index but originally 0-based in some scrapes? 
        // No, scraper logic puts answer as int from "정답 : N".
        // Let's debug: console.log("Correct:", q.answer, "Selected:", selectedIdx);
        // Ensure q.answer is valid.
        const correctAns = q.answer ? parseInt(q.answer) : 0;

        if (idx + 1 === correctAns) {
            btn.classList.add('correct');
        } else if (idx + 1 === selectedIdx) {
            btn.classList.add('wrong');
        }
    });

    if (isCorrect) score++;

    // Show Explanation
    const expDiv = document.getElementById('explanation');
    expDiv.querySelector('#exp-text').innerHTML = q.explanation || "해설이 없습니다.";
    expDiv.classList.remove('hidden');

    // Show Next Button
    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.remove('hidden');

    // Auto-scroll to show explanation and button
    setTimeout(() => {
        nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    // In Exam mode, still show feedback but keep moving
    if (currentMode === 'exam' && isTimeout) {
        setTimeout(nextQuestion, 2000); // 2 seconds delay on timeout
    }
}

function nextQuestion() {
    currentIndex++;
    showQuestion();
}

function showResult() {
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('result').classList.remove('hidden');

    const finalScore = Math.round((score / currentQuiz.length) * 100);
    document.getElementById('final-score').innerText = finalScore;
    document.getElementById('correct-count').innerText = score;
    document.getElementById('total-questions').innerText = currentQuiz.length;
}

function restartQuiz() {
    showLanding();
}

/* ==========================================================================
   Kraepelin Test Simulator - Core Engine & Analytics JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. State Management & Variables
    // ==========================================
    const state = {
        mode: 'standard',           // 'standard', 'medium', 'quick', 'custom'
        totalColumns: 50,           // Default 50 columns for standard
        timePerColumn: 15,          // 15 seconds per column
        digitsPerColumn: 26,        // 26 random numbers = 25 pairs
        soundEnabled: true,
        theme: 'dark',
        
        // Active test runtime variables
        isRunning: false,
        isPaused: false,
        currentColIndex: 0,
        matrixData: [],             // Array of columns, each containing { digits: [], answers: [] }
        userAnswers: [],            // Store user input per column & position
        columnStats: [],            // Performance data per column
        
        // Timers
        colTimeRemaining: 15,
        totalTimeRemaining: 750,
        colTimerInterval: null,
        totalTimerInterval: null,
        colStartTime: null,
        
        // Audio Context Synthesizer
        audioCtx: null,
        chartInstance: null
    };

    // ==========================================
    // 2. DOM Elements Selection
    // ==========================================
    const DOM = {
        // Screens
        setupScreen: document.getElementById('setupScreen'),
        testScreen: document.getElementById('testScreen'),
        resultScreen: document.getElementById('resultScreen'),
        countdownModal: document.getElementById('countdownModal'),
        countdownNumber: document.getElementById('countdownNumber'),
        
        // Mode Selection
        modeCards: document.querySelectorAll('.mode-card'),
        testModeRadios: document.getElementsByName('testMode'),
        customOptionsPanel: document.getElementById('customOptionsPanel'),
        customColumnsInput: document.getElementById('customColumns'),
        customTimePerColInput: document.getElementById('customTimePerCol'),
        startTestBtn: document.getElementById('startTestBtn'),
        
        // Header Controls
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        soundToggleBtn: document.getElementById('soundToggleBtn'),
        mobileKeypadToggleBtn: document.getElementById('mobileKeypadToggleBtn'),
        testStatsHeader: document.getElementById('testStatsHeader'),
        headerColumnIndex: document.getElementById('headerColumnIndex'),
        headerColumnTimer: document.getElementById('headerColumnTimer'),
        headerTimerBar: document.getElementById('headerTimerBar'),
        headerTotalTimer: document.getElementById('headerTotalTimer'),
        
        // Test Workspace
        matrixWrapper: document.getElementById('matrixWrapper'),
        matrixContainer: document.getElementById('matrixContainer'),
        pindahBanner: document.getElementById('pindahBanner'),
        currentColumnLabel: document.getElementById('currentColumnLabel'),
        abortTestBtn: document.getElementById('abortTestBtn'),
        virtualKeypad: document.getElementById('virtualKeypad'),
        
        // Custom Abort Modal
        abortModal: document.getElementById('abortModal'),
        finishNowBtn: document.getElementById('finishNowBtn'),
        exitSetupBtn: document.getElementById('exitSetupBtn'),
        resumeTestBtn: document.getElementById('resumeTestBtn'),
        
        // Result Notice Popup Modal
        resultNoticeModal: document.getElementById('resultNoticeModal'),
        closeNoticeModalBtn: document.getElementById('closeNoticeModalBtn'),
        
        // Result Screen Metrics
        resultGradeBadge: document.getElementById('resultGradeBadge'),
        resultGradeTitle: document.getElementById('resultGradeTitle'),
        resultGradeSub: document.getElementById('resultGradeSub'),
        resAccuracySummary: document.getElementById('resAccuracySummary'),
        resAnsweredSummary: document.getElementById('resAnsweredSummary'),
        resPaceSummary: document.getElementById('resPaceSummary'),
        
        metricTotalQuestions: document.getElementById('metricTotalQuestions'),
        metricAnswered: document.getElementById('metricAnswered'),
        metricAnsweredPercent: document.getElementById('metricAnsweredPercent'),
        metricUnanswered: document.getElementById('metricUnanswered'),
        metricUnansweredPercent: document.getElementById('metricUnansweredPercent'),
        metricCorrect: document.getElementById('metricCorrect'),
        metricWrong: document.getElementById('metricWrong'),
        metricAccuracy: document.getElementById('metricAccuracy'),
        metricAvgTime: document.getElementById('metricAvgTime'),
        metricSpeedPace: document.getElementById('metricSpeedPace'),
        metricDuration: document.getElementById('metricDuration'),
        
        // Analysis & Breakdown
        analysisSpeed: document.getElementById('analysisSpeed'),
        analysisAccuracy: document.getElementById('analysisAccuracy'),
        analysisStability: document.getElementById('analysisStability'),
        analysisEndurance: document.getElementById('analysisEndurance'),
        analysisTips: document.getElementById('analysisTips'),
        
        toggleTableBtn: document.getElementById('toggleTableBtn'),
        tableContainer: document.getElementById('tableContainer'),
        breakdownTableBody: document.getElementById('breakdownTableBody'),
        restartTestBtn: document.getElementById('restartTestBtn'),
        printReportBtn: document.getElementById('printReportBtn')
    };

    // Detect Touch / Mobile Screen to show Virtual Keypad toggle
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice) {
        DOM.mobileKeypadToggleBtn.classList.remove('hidden');
        DOM.virtualKeypad.classList.add('visible');
    }

    // ==========================================
    // 3. Audio Synthesizer (Web Audio API)
    // ==========================================
    function initAudio() {
        if (!state.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                state.audioCtx = new AudioContext();
            }
        }
    }

    function playTone(freq, type = 'sine', duration = 0.1, gainValue = 0.15) {
        if (!state.soundEnabled) return;
        try {
            initAudio();
            if (!state.audioCtx) return;
            
            const osc = state.audioCtx.createOscillator();
            const gain = state.audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
            
            gain.gain.setValueAtTime(gainValue, state.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(state.audioCtx.destination);
            
            osc.start();
            osc.stop(state.audioCtx.currentTime + duration);
        } catch (e) {
            console.error('Audio synth error:', e);
        }
    }

    function playSound(name) {
        if (!state.soundEnabled) return;
        switch (name) {
            case 'click':
                playTone(480, 'sine', 0.05, 0.08);
                break;
            case 'shift':
                // Two-tone shift chime ("PINDAH!")
                playTone(659.25, 'triangle', 0.15, 0.25); // E5
                setTimeout(() => playTone(880, 'triangle', 0.25, 0.3), 120); // A5
                break;
            case 'warning':
                playTone(329.63, 'square', 0.08, 0.1);
                break;
            case 'countdown':
                playTone(523.25, 'sine', 0.12, 0.2); // C5
                break;
            case 'start':
                playTone(1046.50, 'sine', 0.3, 0.3); // C6
                break;
            case 'finish':
                // Success chord
                playTone(523.25, 'triangle', 0.2, 0.2);
                setTimeout(() => playTone(659.25, 'triangle', 0.2, 0.2), 150);
                setTimeout(() => playTone(783.99, 'triangle', 0.4, 0.25), 300);
                break;
        }
    }

    // ==========================================
    // 4. Mode Selection & UI Listeners
    // ==========================================
    DOM.modeCards.forEach(card => {
        card.addEventListener('click', () => {
            DOM.modeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                state.mode = radio.value;
                if (state.mode === 'custom') {
                    DOM.customOptionsPanel.classList.remove('hidden');
                } else {
                    DOM.customOptionsPanel.classList.add('hidden');
                }
            }
        });
    });

    // Theme Toggle
    DOM.themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.replace('dark-theme', 'light-theme');
            DOM.themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            state.theme = 'light';
        } else {
            document.body.classList.replace('light-theme', 'dark-theme');
            DOM.themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            state.theme = 'dark';
        }
        if (state.chartInstance) {
            updateChartTheme();
        }
    });

    // Sound Toggle
    DOM.soundToggleBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) {
            DOM.soundToggleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            DOM.soundToggleBtn.style.color = '';
            playSound('click');
        } else {
            DOM.soundToggleBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            DOM.soundToggleBtn.style.color = 'var(--text-muted)';
        }
    });

    // Mobile Keypad Toggle
    DOM.mobileKeypadToggleBtn.addEventListener('click', () => {
        DOM.virtualKeypad.classList.toggle('visible');
    });

    // Toggle Breakdown Table
    DOM.toggleTableBtn.addEventListener('click', () => {
        DOM.tableContainer.classList.toggle('hidden');
    });

    // Restart Test
    DOM.restartTestBtn.addEventListener('click', () => {
        switchScreen(DOM.setupScreen);
    });

    // Print PDF Report
    DOM.printReportBtn.addEventListener('click', () => {
        window.print();
    });

    // Abort Test Button -> Show Custom Abort Modal
    DOM.abortTestBtn.addEventListener('click', () => {
        if (!state.isRunning) return;
        state.isPaused = true;
        DOM.abortModal.classList.remove('hidden');
    });

    // Abort Modal Options
    DOM.finishNowBtn.addEventListener('click', () => {
        DOM.abortModal.classList.add('hidden');
        state.isPaused = false;
        finishTest();
    });

    DOM.exitSetupBtn.addEventListener('click', () => {
        DOM.abortModal.classList.add('hidden');
        state.isPaused = false;
        stopTimers();
        state.isRunning = false;
        DOM.testStatsHeader.classList.add('hidden');
        switchScreen(DOM.setupScreen);
    });

    DOM.resumeTestBtn.addEventListener('click', () => {
        DOM.abortModal.classList.add('hidden');
        state.isPaused = false;
    });

    // Close Result Scroll Notice Modal & Trigger Smooth Scroll Animation
    if (DOM.closeNoticeModalBtn) {
        DOM.closeNoticeModalBtn.addEventListener('click', () => {
            if (DOM.resultNoticeModal) {
                DOM.resultNoticeModal.classList.add('hidden');
            }
            // Smooth scroll animation to metrics grid and Kraepelin Work Curve graph
            setTimeout(() => {
                const targetElement = document.querySelector('.metrics-grid') || document.querySelector('.chart-card');
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        });
    }

    // Helper: Switch Screens
    function switchScreen(targetScreen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        targetScreen.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ==========================================
    // 5. Kraepelin Data Generator
    // ==========================================
    function setupTestParameters() {
        if (state.mode === 'standard') {
            state.totalColumns = 50;
            state.timePerColumn = 15;
        } else if (state.mode === 'medium') {
            state.totalColumns = 20;
            state.timePerColumn = 15;
        } else if (state.mode === 'quick') {
            state.totalColumns = 10;
            state.timePerColumn = 15;
        } else if (state.mode === 'custom') {
            state.totalColumns = Math.max(1, Math.min(60, parseInt(DOM.customColumnsInput.value) || 40));
            state.timePerColumn = Math.max(5, Math.min(30, parseInt(DOM.customTimePerColInput.value) || 15));
        }
        
        state.totalTimeRemaining = state.totalColumns * state.timePerColumn;
    }

    function generateMatrixData() {
        state.matrixData = [];
        state.userAnswers = [];
        state.columnStats = [];

        for (let col = 0; col < state.totalColumns; col++) {
            const digits = [];
            for (let d = 0; d < state.digitsPerColumn; d++) {
                // Generate random single digit numbers between 1 and 9
                digits.push(Math.floor(Math.random() * 9) + 1);
            }
            
            // Calculate correct unit digit answers for adjacent vertical pairs (Bottom to Top)
            // Example: Index 25 is bottom digit, Index 24 is one above bottom digit
            const expectedAnswers = [];
            for (let p = state.digitsPerColumn - 1; p >= 1; p--) {
                const bottomVal = digits[p];
                const topVal = digits[p - 1];
                const sum = bottomVal + topVal;
                const unitDigit = sum % 10;
                expectedAnswers.push({
                    pairIndex: (state.digitsPerColumn - 1) - p, // 0 is bottom-most pair
                    bottomDigit: bottomVal,
                    topDigit: topVal,
                    correctDigit: unitDigit
                });
            }

            state.matrixData.push({
                colIndex: col,
                digits: digits,
                expectedAnswers: expectedAnswers
            });

            // Initialize user answers array for this column
            state.userAnswers.push(new Array(expectedAnswers.length).fill(null));
        }
    }

    // ==========================================
    // 6. Build Kraepelin DOM Elements
    // ==========================================
    function renderKraepelinMatrix() {
        DOM.matrixContainer.innerHTML = '';

        state.matrixData.forEach((colData, colIdx) => {
            const colEl = document.createElement('div');
            colEl.className = `kraepelin-column ${colIdx === 0 ? 'active' : ''}`;
            colEl.id = `col-${colIdx}`;

            // Column Header Label
            const headerBadge = document.createElement('div');
            headerBadge.className = 'column-header-badge';
            headerBadge.innerText = `#${colIdx + 1}`;
            colEl.appendChild(headerBadge);

            // Stack Container (Bottom to Top order)
            const stackEl = document.createElement('div');
            stackEl.className = 'column-digits-stack';

            // Top-most digit (index 0)
            const topDigitBox = document.createElement('div');
            topDigitBox.className = 'digit-box';
            topDigitBox.innerText = colData.digits[0];
            stackEl.appendChild(topDigitBox);

            // For each pair from top to bottom (so that visual renders top digit, input, bottom digit)
            for (let i = 0; i < colData.digits.length - 1; i++) {
                // Input field between digit i and digit i+1
                // Pair index from bottom: (colData.digits.length - 2) - i
                const pairIndexFromBottom = (colData.digits.length - 2) - i;
                
                const inputSlot = document.createElement('div');
                inputSlot.className = 'input-slot';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.inputMode = 'numeric';
                input.maxLength = 1;
                input.dataset.col = colIdx;
                input.dataset.pair = pairIndexFromBottom;
                input.autocomplete = 'off';
                
                // Disable inputs for inactive columns initially
                if (colIdx !== 0) input.disabled = true;

                inputSlot.appendChild(input);
                stackEl.appendChild(inputSlot);

                // Digit below input
                const bottomDigitBox = document.createElement('div');
                bottomDigitBox.className = 'digit-box';
                bottomDigitBox.innerText = colData.digits[i + 1];
                stackEl.appendChild(bottomDigitBox);
            }

            colEl.appendChild(stackEl);
            DOM.matrixContainer.appendChild(colEl);
        });

        attachInputListeners();
    }

    // ==========================================
    // 7. Input Handling & Focus Controller
    // ==========================================
    function attachInputListeners() {
        const inputs = DOM.matrixContainer.querySelectorAll('input');

        inputs.forEach(input => {
            input.addEventListener('keydown', (e) => {
                const col = parseInt(input.dataset.col);
                const pair = parseInt(input.dataset.pair);

                if (col !== state.currentColIndex) return;

                if (e.key >= '0' && e.key <= '9') {
                    e.preventDefault();
                    input.value = e.key;
                    input.classList.add('filled');
                    state.userAnswers[col][pair] = parseInt(e.key);
                    playSound('click');

                    // Move focus to next input ABOVE (pair + 1)
                    moveFocus(col, pair + 1);
                } else if (e.key === 'Backspace') {
                    e.preventDefault();
                    if (input.value !== '') {
                        input.value = '';
                        input.classList.remove('filled');
                        state.userAnswers[col][pair] = null;
                    } else {
                        // Move focus to input BELOW (pair - 1)
                        moveFocus(col, pair - 1);
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveFocus(col, pair + 1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveFocus(col, pair - 1);
                }
            });
        });
    }

    // Virtual Keypad Button Listeners
    const virtualKeys = DOM.virtualKeypad.querySelectorAll('.key-btn');
    virtualKeys.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const activeInput = document.activeElement;
            if (activeInput && activeInput.tagName === 'INPUT' && parseInt(activeInput.dataset.col) === state.currentColIndex) {
                const key = btn.dataset.key;
                const col = parseInt(activeInput.dataset.col);
                const pair = parseInt(activeInput.dataset.pair);

                if (key >= '0' && key <= '9') {
                    activeInput.value = key;
                    activeInput.classList.add('filled');
                    state.userAnswers[col][pair] = parseInt(key);
                    playSound('click');
                    moveFocus(col, pair + 1);
                } else if (key === 'Backspace') {
                    if (activeInput.value !== '') {
                        activeInput.value = '';
                        activeInput.classList.remove('filled');
                        state.userAnswers[col][pair] = null;
                    } else {
                        moveFocus(col, pair - 1);
                    }
                }
            }
        });
    });

    function moveFocus(col, targetPair) {
        const totalPairs = state.digitsPerColumn - 1;
        if (targetPair >= 0 && targetPair < totalPairs) {
            const nextInput = DOM.matrixContainer.querySelector(`input[data-col="${col}"][data-pair="${targetPair}"]`);
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
                nextInput.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }
    }

    function focusBottomInputOfColumn(colIdx) {
        const bottomInput = DOM.matrixContainer.querySelector(`input[data-col="${colIdx}"][data-pair="0"]`);
        if (bottomInput) {
            bottomInput.focus();
            bottomInput.select();
            
            // Auto scroll vertical wrapper to the bottom so the first question at the bottom is immediately visible!
            setTimeout(() => {
                bottomInput.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'center' });
                if (DOM.matrixWrapper) {
                    DOM.matrixWrapper.scrollTop = DOM.matrixWrapper.scrollHeight;
                }
            }, 60);
        }
    }

    function scrollColumnToCenter(colIdx) {
        const colEl = document.getElementById(`col-${colIdx}`);
        if (colEl) {
            colEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'end' });
        }
    }

    // ==========================================
    // 8. Test Execution & Timer System
    // ==========================================
    DOM.startTestBtn.addEventListener('click', () => {
        initAudio();
        setupTestParameters();
        generateMatrixData();
        renderKraepelinMatrix();
        
        // Show Countdown Modal
        DOM.countdownModal.classList.remove('hidden');
        let count = 3;
        DOM.countdownNumber.innerText = count;
        playSound('countdown');

        const countdownTimer = setInterval(() => {
            count--;
            if (count > 0) {
                DOM.countdownNumber.innerText = count;
                playSound('countdown');
            } else {
                clearInterval(countdownTimer);
                DOM.countdownModal.classList.add('hidden');
                playSound('start');
                startTestExecution();
            }
        }, 1000);
    });

    function startTestExecution() {
        state.isRunning = true;
        state.currentColIndex = 0;
        state.colTimeRemaining = state.timePerColumn;

        switchScreen(DOM.testScreen);
        DOM.testStatsHeader.classList.remove('hidden');

        updateHeaderStats();
        focusBottomInputOfColumn(0);
        scrollColumnToCenter(0);

        startTimers();
    }

    function updateHeaderStats() {
        DOM.headerColumnIndex.innerText = `${state.currentColIndex + 1} / ${state.totalColumns}`;
        DOM.currentColumnLabel.innerText = `Lajur ${state.currentColIndex + 1} dari ${state.totalColumns}`;
        
        // Format Total Timer
        const totalMinutes = Math.floor(state.totalTimeRemaining / 60);
        const totalSeconds = state.totalTimeRemaining % 60;
        DOM.headerTotalTimer.innerText = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
        
        // Format Column Timer & Bar
        DOM.headerColumnTimer.innerText = `${Math.ceil(state.colTimeRemaining)}s`;
        const percentage = (state.colTimeRemaining / state.timePerColumn) * 100;
        DOM.headerTimerBar.style.width = `${percentage}%`;

        if (state.colTimeRemaining <= 3) {
            DOM.headerTimerBar.classList.add('warning');
        } else {
            DOM.headerTimerBar.classList.remove('warning');
        }
    }

    function startTimers() {
        stopTimers();

        // High frequency timer for smooth bar animation & column switch (every 100ms)
        state.colTimerInterval = setInterval(() => {
            if (!state.isRunning || state.isPaused) return;

            state.colTimeRemaining -= 0.1;
            
            if (Math.ceil(state.colTimeRemaining) !== Math.ceil(state.colTimeRemaining + 0.1)) {
                if (Math.ceil(state.colTimeRemaining) <= 3 && Math.ceil(state.colTimeRemaining) > 0) {
                    playSound('warning');
                }
            }

            if (state.colTimeRemaining <= 0) {
                advanceToNextColumn();
            } else {
                updateHeaderStats();
            }
        }, 100);

        // 1 Second interval for total duration counter
        state.totalTimerInterval = setInterval(() => {
            if (!state.isRunning || state.isPaused) return;
            if (state.totalTimeRemaining > 0) {
                state.totalTimeRemaining--;
            }
        }, 1000);
    }

    function stopTimers() {
        if (state.colTimerInterval) clearInterval(state.colTimerInterval);
        if (state.totalTimerInterval) clearInterval(state.totalTimerInterval);
    }

    function advanceToNextColumn() {
        // Record data for completed column
        const currentColEl = document.getElementById(`col-${state.currentColIndex}`);
        if (currentColEl) {
            currentColEl.classList.remove('active');
            currentColEl.classList.add('completed');
            // Disable inputs in finished column
            currentColEl.querySelectorAll('input').forEach(i => i.disabled = true);
        }

        state.currentColIndex++;

        if (state.currentColIndex >= state.totalColumns) {
            // Test finished!
            finishTest();
        } else {
            // Move to next column
            state.colTimeRemaining = state.timePerColumn;
            
            playSound('shift');
            showPindahBanner();

            const nextColEl = document.getElementById(`col-${state.currentColIndex}`);
            if (nextColEl) {
                nextColEl.classList.add('active');
                nextColEl.querySelectorAll('input').forEach(i => i.disabled = false);
            }

            updateHeaderStats();
            focusBottomInputOfColumn(state.currentColIndex);
            scrollColumnToCenter(state.currentColIndex);
        }
    }

    function showPindahBanner() {
        DOM.pindahBanner.classList.remove('hidden');
        setTimeout(() => {
            DOM.pindahBanner.classList.add('hidden');
        }, 750);
    }

    function finishTest() {
        stopTimers();
        state.isRunning = false;
        playSound('finish');
        DOM.testStatsHeader.classList.add('hidden');
        
        calculateResultsAndAnalytics();
        switchScreen(DOM.resultScreen);

        // Display result scroll guidance popup modal
        if (DOM.resultNoticeModal) {
            DOM.resultNoticeModal.classList.remove('hidden');
        }
    }

    // ==========================================
    // 9. Results & Analytics Calculation Engine
    // ==========================================
    function calculateResultsAndAnalytics() {
        let totalQuestions = 0;
        let answeredCount = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let unansweredCount = 0;

        state.columnStats = [];

        // Determine columns attempted (only count up to current column if ended early)
        const attemptedCols = Math.min(state.totalColumns, state.currentColIndex + 1);
        const attemptedMatrixData = state.matrixData.slice(0, attemptedCols);

        attemptedMatrixData.forEach((colData, colIdx) => {
            const userAnswersCol = state.userAnswers[colIdx] || [];
            let colAnswered = 0;
            let colCorrect = 0;
            let colWrong = 0;
            let colUnanswered = 0;

            colData.expectedAnswers.forEach((expected, pairIdx) => {
                totalQuestions++;
                const userVal = userAnswersCol[pairIdx];
                if (userVal !== null && userVal !== undefined) {
                    colAnswered++;
                    answeredCount++;
                    if (userVal === expected.correctDigit) {
                        colCorrect++;
                        correctCount++;
                    } else {
                        colWrong++;
                        wrongCount++;
                    }
                } else {
                    colUnanswered++;
                    unansweredCount++;
                }
            });

            state.columnStats.push({
                colIndex: colIdx + 1,
                totalQuestions: colData.expectedAnswers.length,
                answered: colAnswered,
                correct: colCorrect,
                wrong: colWrong,
                unanswered: colUnanswered,
                accuracy: colAnswered > 0 ? ((colCorrect / colAnswered) * 100).toFixed(1) : 0
            });
        });

        // Actual elapsed time so far
        const initialTotalSec = state.totalColumns * state.timePerColumn;
        const actualElapsedSec = Math.max(1, initialTotalSec - state.totalTimeRemaining);

        const accuracyPercent = answeredCount > 0 ? ((correctCount / answeredCount) * 100).toFixed(1) : 0;
        const avgTimePerAnswer = answeredCount > 0 ? (actualElapsedSec / answeredCount).toFixed(2) : 0;
        const speedPace = Math.round(answeredCount / (actualElapsedSec / 60)); // Answers per minute

        // Update DOM Metric Cards
        DOM.metricTotalQuestions.innerText = totalQuestions;
        DOM.metricAnswered.innerText = answeredCount;
        DOM.metricAnsweredPercent.innerText = `${((answeredCount / (totalQuestions || 1)) * 100).toFixed(1)}% dari total`;
        DOM.metricUnanswered.innerText = unansweredCount;
        DOM.metricUnansweredPercent.innerText = `${((unansweredCount / (totalQuestions || 1)) * 100).toFixed(1)}% terlewati`;
        DOM.metricCorrect.innerText = correctCount;
        DOM.metricWrong.innerText = wrongCount;
        DOM.metricAccuracy.innerText = `${accuracyPercent}%`;
        DOM.metricAvgTime.innerText = `${avgTimePerAnswer}s`;
        DOM.metricSpeedPace.innerText = `${speedPace} /m`;
        
        const durationMin = Math.floor(actualElapsedSec / 60);
        const durationSec = Math.floor(actualElapsedSec % 60);
        DOM.metricDuration.innerText = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;

        DOM.resAccuracySummary.innerText = `${accuracyPercent}%`;
        DOM.resAnsweredSummary.innerText = answeredCount;
        DOM.resPaceSummary.innerText = `${speedPace} /m`;

        // Calculate Grade & Psychogram Interpretation
        evaluatePsychogram(answeredCount, accuracyPercent, speedPace);

        // Build Table Breakdown
        renderBreakdownTable();

        // Render Kraepelin Work Curve Chart
        renderKraepelinChart();
    }

    function evaluatePsychogram(totalAnswered, accuracy, pace) {
        // Evaluate Grade
        let grade = 'B';
        let gradeTitle = 'Performa Baik (Average Plus)';
        let gradeSub = 'Kemampuan konsentrasi dan kecepatan kerja Anda berada pada level standar psikotes perusahaan.';

        if (accuracy >= 94 && pace >= 45) {
            grade = 'A';
            gradeTitle = 'Performa Sangat Baik (Superior)';
            gradeSub = 'Selamat! Hasil simulasi tes Kraepelin Anda sangat memuaskan dan memenuhi kriteria seleksi perusahaan papan atas / BUMN.';
        } else if (accuracy >= 85 && pace >= 30) {
            grade = 'B';
            gradeTitle = 'Performa Baik (Kompeten)';
            gradeSub = 'Performa kerja stabil dengan akurasi yang terjaga. Pertahankan ritme saat ujian psikotes sesungguhnya.';
        } else if (accuracy >= 70 || pace >= 20) {
            grade = 'C';
            gradeTitle = 'Performa Cukup (Perlu Pembenahan)';
            gradeSub = 'Kecepatan atau ketelitian Anda masih perlu ditingkatkan agar mencapai ambang batas kelulusan optimum.';
        } else {
            grade = 'D';
            gradeTitle = 'Performa Perlu Latihan Intensif';
            gradeSub = 'Disarankan untuk melakukan latihan rutin 10-15 menit setiap hari guna meningkatkan respon motorik dan fokus.';
        }

        DOM.resultGradeBadge.className = `grade-badge grade-${grade.toLowerCase()}`;
        DOM.resultGradeBadge.innerText = grade;
        DOM.resultGradeTitle.innerText = gradeTitle;
        DOM.resultGradeSub.innerText = gradeSub;

        // 1. Kecepatan Kerja (Pace)
        if (pace >= 45) {
            DOM.analysisSpeed.innerText = `Sangat Tinggi (${pace} jawaban/menit). Anda memiliki kecepatan respon dan daya gerak motorik yang cepat dalam menyelesaikan tugas numerik terstruktur.`;
        } else if (pace >= 30) {
            DOM.analysisSpeed.innerText = `Sedang / Standar (${pace} jawaban/menit). Kecepatan kerja Anda stabil dan sesuai dengan ekspektasi rata-rata kandidat psikotes.`;
        } else {
            DOM.analysisSpeed.innerText = `Cenderung Rendah (${pace} jawaban/menit). Anda memprioritaskan kehati-hatian atau mungkin terkendala kecepatan pengetikan angka.`;
        }

        // 2. Ketelitian Kerja (Accuracy)
        if (accuracy >= 95) {
            DOM.analysisAccuracy.innerText = `Tinggi (${accuracy}%). Sangat teliti, mampu meminimalisir kesalahan kalkulasi di bawah tekanan waktu yang tinggi.`;
        } else if (accuracy >= 88) {
            DOM.analysisAccuracy.innerText = `Cukup Baik (${accuracy}%). Tingkat presisi kerja baik dengan sesekali terjadi kesalahan hitung yang wajar.`;
        } else {
            DOM.analysisAccuracy.innerText = `Perlu Ditingkatkan (${accuracy}%). Terdapat cukup banyak jawaban salah yang mengindikasikan gangguan konsentrasi atau panik saat pindah lajur.`;
        }

        // 3. Kestabilan Kerja (Stability) - Standard Deviation of answers per column
        const answeredPerCol = state.columnStats.map(s => s.answered);
        const mean = answeredPerCol.reduce((a, b) => a + b, 0) / (answeredPerCol.length || 1);
        const variance = answeredPerCol.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (answeredPerCol.length || 1);
        const stdDev = Math.sqrt(variance);

        if (stdDev <= 2.5) {
            DOM.analysisStability.innerText = `Sangat Stabil (Fluktuasi ±${stdDev.toFixed(1)} items). Anda memiliki emosi yang tenang, ritme kerja konsisten, dan pengendalian stres yang prima.`;
        } else if (stdDev <= 4.5) {
            DOM.analysisStability.innerText = `Moderat (Fluktuasi ±${stdDev.toFixed(1)} items). Ritme kerja sedikit bergelombang namun masih dalam kisaran toleransi psikotes normal.`;
        } else {
            DOM.analysisStability.innerText = `Fluktuatif (Fluktuasi ±${stdDev.toFixed(1)} items). Grafik grafik naik-turun tajam mengindikasikan konsentrasi yang mudah buyar atau ritme kerja kurang teratur.`;
        }

        // 4. Ketahanan Kerja (Endurance) - Compare First Half vs Second Half
        const halfIndex = Math.floor(answeredPerCol.length / 2);
        const firstHalf = answeredPerCol.slice(0, halfIndex);
        const secondHalf = answeredPerCol.slice(halfIndex);
        
        const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
        const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
        const enduranceDiff = avgSecondHalf - avgFirstHalf;

        if (enduranceDiff >= 1.0) {
            DOM.analysisEndurance.innerText = `Grafik Naik (Meningkat +${enduranceDiff.toFixed(1)}). Memiliki daya tahan mental tinggi, semakin lama bekerja semakin cepat dan padu (Pemanasan bagus).`;
        } else if (Math.abs(enduranceDiff) < 1.0) {
            DOM.analysisEndurance.innerText = `Grafik Datar (Konsisten ${avgSecondHalf.toFixed(1)} vs ${avgFirstHalf.toFixed(1)}). Ketahanan fisik dan energi mental sangat terjaga dari awal hingga lajur terakhir.`;
        } else {
            DOM.analysisEndurance.innerText = `Grafik Menurun (Fatique -${Math.abs(enduranceDiff).toFixed(1)}). Mengalami penurunan performa akibat kelelahan (fatigue) pada lajur-lajur akhir.`;
        }

        // Tips Evaluasi
        DOM.analysisTips.innerText = `Gunakan Numpad keyboard dengan posisi jari yang rileks. Saat terdengar sinyal "PINDAH!", langsung alihkan pandangan mata ke angka paling bawah pada kolom berikutnya tanpa memikirkan jawaban yang terlewati.`;
    }

    function renderBreakdownTable() {
        DOM.breakdownTableBody.innerHTML = '';
        state.columnStats.forEach(stat => {
            const row = document.createElement('tr');
            
            const maxAnsweredInCols = Math.max(...state.columnStats.map(s => s.answered), 1);
            const barWidthPercent = (stat.answered / maxAnsweredInCols) * 100;

            row.innerHTML = `
                <td><strong>Lajur ${stat.colIndex}</strong></td>
                <td>${stat.totalQuestions}</td>
                <td><strong>${stat.answered}</strong></td>
                <td class="text-emerald">${stat.correct}</td>
                <td class="text-rose">${stat.wrong}</td>
                <td class="text-muted">${stat.unanswered}</td>
                <td><strong>${stat.accuracy}%</strong></td>
                <td>
                    <div class="table-bar-container">
                        <div class="table-bar-fill" style="width: ${barWidthPercent}%;"></div>
                    </div>
                </td>
            `;
            DOM.breakdownTableBody.appendChild(row);
        });
    }

    // ==========================================
    // 10. Chart.js Kraepelin Work Curve
    // ==========================================
    function renderKraepelinChart() {
        const ctx = document.getElementById('kraepelinChart').getContext('2d');
        
        if (state.chartInstance) {
            state.chartInstance.destroy();
        }

        const labels = state.columnStats.map(s => `Lajur ${s.colIndex}`);
        const totalAnsweredData = state.columnStats.map(s => s.answered);
        const correctData = state.columnStats.map(s => s.correct);

        const isDark = document.body.classList.contains('dark-theme');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        const textColor = isDark ? '#94a3b8' : '#475569';

        // Gradient Fills
        const gradientTotal = ctx.createLinearGradient(0, 0, 0, 300);
        gradientTotal.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
        gradientTotal.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        const gradientCorrect = ctx.createLinearGradient(0, 0, 0, 300);
        gradientCorrect.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradientCorrect.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        state.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Dijawab',
                        data: totalAnsweredData,
                        borderColor: '#6366f1',
                        backgroundColor: gradientTotal,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#6366f1',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Jawaban Benar',
                        data: correctData,
                        borderColor: '#10b981',
                        backgroundColor: gradientCorrect,
                        borderWidth: 2,
                        borderDash: [4, 4],
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#10b981',
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false // Used custom HTML legend
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: isDark ? '#f8fafc' : '#0f172a',
                        bodyColor: isDark ? '#cbd5e1' : '#334155',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                            afterBody: function(context) {
                                const index = context[0].dataIndex;
                                const stat = state.columnStats[index];
                                return `Akurasi: ${stat.accuracy}%\nSalah: ${stat.wrong} item`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 12 }, stepSize: 5 },
                        title: { display: true, text: 'Jumlah Item / Jawaban', color: textColor }
                    }
                }
            }
        });
    }

    function updateChartTheme() {
        if (state.chartInstance) {
            renderKraepelinChart();
        }
    }

});

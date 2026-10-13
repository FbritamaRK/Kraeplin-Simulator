/* ==========================================================================
   Kraepelin Test Simulator - Core Engine & Analytics JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. State Management & Variables
    // ==========================================
    const state = {
        testType: 'kraepelin',      // 'kraepelin' (bawah ke atas) or 'pauli' (atas ke bawah)
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
        chartInstance: null,
        trendChartInstance: null,
        compareChartInstance: null,
        detailChartInstance: null,
        selectedHistoryIds: [],
        currentTestRecord: null,
        currentFocusedPair: 0
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
        countdownSub: document.getElementById('countdownSub'),
        
        // Test Type Selection (Kraepelin vs Pauli)
        typeCards: document.querySelectorAll('.type-card'),
        testTypeRadios: document.getElementsByName('testType'),
        guideTitle: document.getElementById('guideTitle'),
        guideStep1: document.getElementById('guideStep1'),
        guideStep3: document.getElementById('guideStep3'),
        startBtnLabel: document.getElementById('startBtnLabel'),
        
        // Mode Selection
        modeCards: document.querySelectorAll('.mode-card'),
        testModeRadios: document.getElementsByName('testMode'),
        customOptionsPanel: document.getElementById('customOptionsPanel'),
        customColumnsInput: document.getElementById('customColumns'),
        customTimePerColInput: document.getElementById('customTimePerCol'),
        startTestBtn: document.getElementById('startTestBtn'),
        directionIndicator: document.getElementById('directionIndicator'),
        
        // Header Controls
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        soundToggleBtn: document.getElementById('soundToggleBtn'),
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
        
        // Custom Abort Modal
        abortModal: document.getElementById('abortModal'),
        abortModalTitle: document.getElementById('abortModalTitle'),
        finishNowBtn: document.getElementById('finishNowBtn'),
        exitSetupBtn: document.getElementById('exitSetupBtn'),
        resumeTestBtn: document.getElementById('resumeTestBtn'),
        
        // Result Notice Toast Notification
        resultNoticeModal: document.getElementById('resultNoticeModal'),
        resultToastCard: document.getElementById('resultToastCard'),
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
        restartBtnLabel: document.getElementById('restartBtnLabel'),
        printReportBtn: document.getElementById('printReportBtn'),

        // History & Comparison Elements
        historyToggleBtn: document.getElementById('historyToggleBtn'),
        headerHistoryBadge: document.getElementById('headerHistoryBadge'),

        setupHistoryCard: document.getElementById('setupHistoryCard'),
        shSummaryText: document.getElementById('shSummaryText'),
        shViewAllBtn: document.getElementById('shViewAllBtn'),
        shTotalTests: document.getElementById('shTotalTests'),
        shAvgAccuracy: document.getElementById('shAvgAccuracy'),
        shMaxPace: document.getElementById('shMaxPace'),
        shLastTestDate: document.getElementById('shLastTestDate'),

        resultComparisonCard: document.getElementById('resultComparisonCard'),
        compPrevDate: document.getElementById('compPrevDate'),
        compOpenCompareBtn: document.getElementById('compOpenCompareBtn'),
        compMetricsRow: document.getElementById('compMetricsRow'),
        viewHistoryFromResBtn: document.getElementById('viewHistoryFromResBtn'),

        historyModal: document.getElementById('historyModal'),
        closeHistoryModalBtn: document.getElementById('closeHistoryModalBtn'),
        historyTabs: document.querySelectorAll('.history-tab'),
        historyTabContents: document.querySelectorAll('.history-tab-content'),
        historyCount: document.getElementById('historyCount'),

        historyTypeFilter: document.getElementById('historyTypeFilter'),
        compareSelectedBtn: document.getElementById('compareSelectedBtn'),
        selectedCount: document.getElementById('selectedCount'),
        exportHistoryBtn: document.getElementById('exportHistoryBtn'),
        clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),
        historyTable: document.getElementById('historyTable'),
        historyTableBody: document.getElementById('historyTableBody'),
        historyEmptyState: document.getElementById('historyEmptyState'),
        emptyStartBtn: document.getElementById('emptyStartBtn'),

        trendAvgAccuracy: document.getElementById('trendAvgAccuracy'),
        trendAvgPace: document.getElementById('trendAvgPace'),
        trendMaxPace: document.getElementById('trendMaxPace'),
        trendStatusLabel: document.getElementById('trendStatusLabel'),
        trendChartCanvas: document.getElementById('trendChart'),

        compareSelectA: document.getElementById('compareSelectA'),
        compareSelectB: document.getElementById('compareSelectB'),
        compareDetailsWrapper: document.getElementById('compareDetailsWrapper'),

        historyDetailModal: document.getElementById('historyDetailModal'),
        closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),
        hdTitle: document.getElementById('hdTitle'),
        hdSub: document.getElementById('hdSub'),
        hdBody: document.getElementById('hdBody'),

        confirmClearModal: document.getElementById('confirmClearModal'),
        confirmClearBtn: document.getElementById('confirmClearBtn'),
        cancelClearBtn: document.getElementById('cancelClearBtn')
    };


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
    // 4. Test Type & Mode Selection Listeners
    // ==========================================
    function updateGuideAndUIForTestType() {
        if (state.testType === 'pauli') {
            if (DOM.guideTitle) DOM.guideTitle.innerHTML = '<i class="fa-solid fa-lightbulb"></i> Cara Mengerjakan Tes Pauli:';
            if (DOM.guideStep1) DOM.guideStep1.innerHTML = 'Penjumlahan 2 angka berurutan secara <strong>vertikal dari atas ke bawah</strong>.';
            if (DOM.guideStep3) DOM.guideStep3.innerHTML = 'Kursor otomatis bergerak <strong>turun</strong> setelah menjawab. Setiap <strong>15 detik</strong> akan terdengar bunyi sinyal &amp; visual alert <strong>"PINDAH!"</strong> dan kursor otomatis bergeser ke kolom berikutnya pada angka paling atas.';
            if (DOM.startBtnLabel) DOM.startBtnLabel.innerText = 'MULAI SIMULASI TES PAULI';
            if (DOM.directionIndicator) {
                DOM.directionIndicator.className = 'direction-badge badge-pauli';
                DOM.directionIndicator.innerHTML = '<i class="fa-solid fa-arrow-down"></i> Atas ke Bawah';
            }
            if (DOM.restartBtnLabel) DOM.restartBtnLabel.innerText = 'Ulangi Tes Pauli';
        } else {
            if (DOM.guideTitle) DOM.guideTitle.innerHTML = '<i class="fa-solid fa-lightbulb"></i> Cara Mengerjakan Tes Kraepelin:';
            if (DOM.guideStep1) DOM.guideStep1.innerHTML = 'Penjumlahan 2 angka berurutan secara <strong>vertikal dari bawah ke atas</strong>.';
            if (DOM.guideStep3) DOM.guideStep3.innerHTML = 'Kursor otomatis bergerak <strong>naik</strong> setelah menjawab. Setiap <strong>15 detik</strong> akan terdengar bunyi sinyal &amp; visual alert <strong>"PINDAH!"</strong> dan kursor otomatis bergeser ke kolom berikutnya pada angka paling bawah.';
            if (DOM.startBtnLabel) DOM.startBtnLabel.innerText = 'MULAI SIMULASI TES KRAEPELIN';
            if (DOM.directionIndicator) {
                DOM.directionIndicator.className = 'direction-badge badge-kraepelin';
                DOM.directionIndicator.innerHTML = '<i class="fa-solid fa-arrow-up"></i> Bawah ke Atas';
            }
            if (DOM.restartBtnLabel) DOM.restartBtnLabel.innerText = 'Ulangi Tes Kraepelin';
        }
    }

    // Test Type Cards (Kraepelin vs Pauli)
    DOM.typeCards.forEach(card => {
        card.addEventListener('click', () => {
            DOM.typeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                state.testType = radio.value;
                updateGuideAndUIForTestType();
                playSound('click');
            }
        });
    });

    // Mode Cards (Duration & Preset)
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

    // Initialize UI for default test type
    updateGuideAndUIForTestType();

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
        // Blur active input to dismiss phone keyboard when abort modal is open
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
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
        // Refocus active input to bring native phone keyboard back
        const targetPair = (state.currentFocusedPair !== undefined && state.currentFocusedPair !== null)
            ? state.currentFocusedPair
            : 0;
        const curInput = DOM.matrixContainer.querySelector(`input[data-col="${state.currentColIndex}"][data-pair="${targetPair}"]`);
        if (curInput) {
            curInput.focus();
            curInput.select();
        }
    });

    // Result Scroll Notice Toast Handling & Smooth Scroll
    let resultToastTimer = null;

    function hideResultToast() {
        if (!DOM.resultNoticeModal || DOM.resultNoticeModal.classList.contains('hidden')) return;
        DOM.resultNoticeModal.classList.add('toast-hiding');
        setTimeout(() => {
            if (DOM.resultNoticeModal) {
                DOM.resultNoticeModal.classList.add('hidden');
                DOM.resultNoticeModal.classList.remove('toast-hiding');
            }
        }, 240);
        if (resultToastTimer) {
            clearTimeout(resultToastTimer);
            resultToastTimer = null;
        }
    }

    function showResultToast() {
        if (!DOM.resultNoticeModal) return;
        if (resultToastTimer) {
            clearTimeout(resultToastTimer);
            resultToastTimer = null;
        }
        DOM.resultNoticeModal.classList.remove('toast-hiding');
        DOM.resultNoticeModal.classList.remove('hidden');

        // Auto dismiss after 10 seconds
        resultToastTimer = setTimeout(() => {
            hideResultToast();
        }, 10000);
    }

    if (DOM.closeNoticeModalBtn) {
        DOM.closeNoticeModalBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hideResultToast();
        });
    }

    if (DOM.resultToastCard) {
        DOM.resultToastCard.addEventListener('click', (e) => {
            if (e.target.closest('#closeNoticeModalBtn')) return;
            hideResultToast();
            setTimeout(() => {
                const targetElement = document.querySelector('.metrics-grid') || document.querySelector('.chart-card');
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 80);
        });
    }

    // Auto dismiss toast when user scrolls down the results page
    window.addEventListener('scroll', () => {
        if (DOM.resultScreen && DOM.resultScreen.classList.contains('active')) {
            if (window.scrollY > 150) {
                hideResultToast();
            }
        }
    }, { passive: true });

    // Helper: Switch Screens
    function switchScreen(targetScreen) {
        // Blur active element to immediately close native mobile keyboard
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        targetScreen.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (targetScreen !== DOM.resultScreen) {
            hideResultToast();
        }

        if (targetScreen === DOM.setupScreen) {
            updateHeaderHistoryBadge();
            renderSetupHistorySummary();
        }
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
            
            const expectedAnswers = [];
            if (state.testType === 'pauli') {
                // PAULI: Top to Bottom order
                // Pair 0 is top pair: between index 0 and index 1
                for (let p = 0; p < state.digitsPerColumn - 1; p++) {
                    const topVal = digits[p];
                    const bottomVal = digits[p + 1];
                    const sum = topVal + bottomVal;
                    const unitDigit = sum % 10;
                    expectedAnswers.push({
                        pairIndex: p, // 0 is top-most pair
                        topDigit: topVal,
                        bottomDigit: bottomVal,
                        correctDigit: unitDigit
                    });
                }
            } else {
                // KRAEPELIN: Bottom to Top order
                // Pair 0 is bottom-most pair: between index (N-1) and index (N-2)
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
    // 6. Build Matrix DOM Elements (Kraepelin & Pauli)
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

            // Stack Container
            const stackEl = document.createElement('div');
            stackEl.className = 'column-digits-stack';

            // Top-most digit (index 0)
            const topDigitBox = document.createElement('div');
            topDigitBox.className = 'digit-box';
            topDigitBox.innerText = colData.digits[0];
            stackEl.appendChild(topDigitBox);

            // For each pair from top to bottom
            for (let i = 0; i < colData.digits.length - 1; i++) {
                // In Pauli: pair 0 is top-most (i)
                // In Kraepelin: pair 0 is bottom-most ((length - 2) - i)
                const pairIndex = (state.testType === 'pauli')
                    ? i
                    : (colData.digits.length - 2) - i;
                
                const inputSlot = document.createElement('div');
                inputSlot.className = 'input-slot';
                
                const input = document.createElement('input');
                input.type = 'tel';
                input.inputMode = 'numeric';
                input.pattern = '[0-9]*';
                input.maxLength = 1;
                input.dataset.col = colIdx;
                input.dataset.pair = pairIndex;
                input.autocomplete = 'off';
                input.autocapitalize = 'off';
                input.spellcheck = false;
                
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

            // Clicking anywhere on active column focuses the current input to pop up mobile keyboard
            colEl.addEventListener('click', (e) => {
                if (colIdx !== state.currentColIndex || !state.isRunning || state.isPaused) return;
                if (e.target.tagName !== 'INPUT') {
                    const targetPair = (state.currentFocusedPair !== undefined && state.currentFocusedPair !== null)
                        ? state.currentFocusedPair
                        : 0;
                    const targetInput = colEl.querySelector(`input[data-pair="${targetPair}"]`);
                    if (targetInput) {
                        targetInput.focus();
                        targetInput.select();
                    }
                }
            });

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
            // Keep track of focused pair
            input.addEventListener('focus', () => {
                state.currentFocusedPair = parseInt(input.dataset.pair);
            });

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

                    // In both Kraepelin and Pauli, next question is pair + 1!
                    moveFocus(col, pair + 1);
                } else if (e.key === 'Backspace') {
                    e.preventDefault();
                    if (input.value !== '') {
                        input.value = '';
                        input.classList.remove('filled');
                        state.userAnswers[col][pair] = null;
                    } else {
                        // In both Kraepelin and Pauli, backspace goes to previous question (pair - 1)!
                        moveFocus(col, pair - 1);
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (state.testType === 'pauli') {
                        // In Pauli, visually Up is pair - 1
                        moveFocus(col, pair - 1);
                    } else {
                        // In Kraepelin, visually Up is pair + 1
                        moveFocus(col, pair + 1);
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (state.testType === 'pauli') {
                        // In Pauli, visually Down is pair + 1
                        moveFocus(col, pair + 1);
                    } else {
                        // In Kraepelin, visually Down is pair - 1
                        moveFocus(col, pair - 1);
                    }
                }
            });

            // Native mobile soft keyboard input event support
            input.addEventListener('input', () => {
                const col = parseInt(input.dataset.col);
                const pair = parseInt(input.dataset.pair);

                if (col !== state.currentColIndex) return;

                const val = input.value;
                if (/^[0-9]$/.test(val)) {
                    input.classList.add('filled');
                    state.userAnswers[col][pair] = parseInt(val);
                    playSound('click');
                    moveFocus(col, pair + 1);
                } else if (val === '') {
                    input.classList.remove('filled');
                    state.userAnswers[col][pair] = null;
                } else {
                    const lastDigit = val.replace(/\D/g, '').slice(-1);
                    if (lastDigit) {
                        input.value = lastDigit;
                        input.classList.add('filled');
                        state.userAnswers[col][pair] = parseInt(lastDigit);
                        playSound('click');
                        moveFocus(col, pair + 1);
                    } else {
                        input.value = '';
                        input.classList.remove('filled');
                        state.userAnswers[col][pair] = null;
                    }
                }
            });

            // Handle backspace when input is already empty on mobile keyboards
            input.addEventListener('beforeinput', (e) => {
                if (e.inputType === 'deleteContentBackward' && input.value === '') {
                    const col = parseInt(input.dataset.col);
                    const pair = parseInt(input.dataset.pair);
                    if (col === state.currentColIndex) {
                        moveFocus(col, pair - 1);
                    }
                }
            });
        });
    }

    function moveFocus(col, targetPair) {
        const totalPairs = state.digitsPerColumn - 1;
        if (targetPair >= 0 && targetPair < totalPairs) {
            state.currentFocusedPair = targetPair;
            const nextInput = DOM.matrixContainer.querySelector(`input[data-col="${col}"][data-pair="${targetPair}"]`);
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
                nextInput.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }
    }

    function focusStartingInputOfColumn(colIdx) {
        state.currentFocusedPair = 0;
        // In both tests, the first question in column is data-pair="0"
        const startInput = DOM.matrixContainer.querySelector(`input[data-col="${colIdx}"][data-pair="0"]`);
        if (startInput) {
            startInput.focus();
            startInput.select();
            
            setTimeout(() => {
                if (state.testType === 'pauli') {
                    // Pauli starts at the top
                    startInput.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
                    if (DOM.matrixWrapper) {
                        DOM.matrixWrapper.scrollTop = 0;
                    }
                } else {
                    // Kraepelin starts at the bottom
                    startInput.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'center' });
                    if (DOM.matrixWrapper) {
                        DOM.matrixWrapper.scrollTop = DOM.matrixWrapper.scrollHeight;
                    }
                }
            }, 60);
        }
    }

    function scrollColumnToCenter(colIdx) {
        const colEl = document.getElementById(`col-${colIdx}`);
        if (colEl) {
            const verticalBlock = (state.testType === 'pauli') ? 'start' : 'end';
            colEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: verticalBlock });
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
        if (DOM.countdownSub) {
            DOM.countdownSub.innerText = state.testType === 'pauli'
                ? 'Tes Pauli: penjumlahan dari atas ke bawah...'
                : 'Tes Kraepelin: penjumlahan dari bawah ke atas...';
        }
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
        
        // Update direction badge
        if (DOM.directionIndicator) {
            if (state.testType === 'pauli') {
                DOM.directionIndicator.className = 'direction-badge badge-pauli';
                DOM.directionIndicator.innerHTML = '<i class="fa-solid fa-arrow-down"></i> Atas ke Bawah';
            } else {
                DOM.directionIndicator.className = 'direction-badge badge-kraepelin';
                DOM.directionIndicator.innerHTML = '<i class="fa-solid fa-arrow-up"></i> Bawah ke Atas';
            }
        }

        focusStartingInputOfColumn(0);
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
            focusStartingInputOfColumn(state.currentColIndex);
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

        // Display result scroll guidance toast notification
        showResultToast();
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
        const psychoEval = evaluatePsychogram(answeredCount, accuracyPercent, speedPace);

        // Build Table Breakdown
        renderBreakdownTable();

        // Render Kraepelin Work Curve Chart
        renderKraepelinChart();

        // Save Record to History and Update Comparison
        saveCurrentTestSession({
            totalQuestions,
            answeredCount,
            unansweredCount,
            correctCount,
            wrongCount,
            accuracyPercent,
            avgTimePerAnswer,
            speedPace,
            actualElapsedSec,
            durationFormatted: `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`,
            psychoEval
        });
    }

    function evaluatePsychogram(totalAnswered, accuracy, pace) {
        // Evaluate Grade
        let grade = 'B';
        let gradeTitle = 'Performa Baik (Average Plus)';
        const testName = state.testType === 'pauli' ? 'Pauli' : 'Kraepelin';
        let gradeSub = `Kemampuan konsentrasi dan kecepatan kerja Anda berada pada level standar psikotes ${testName}.`;

        if (accuracy >= 94 && pace >= 45) {
            grade = 'A';
            gradeTitle = 'Performa Sangat Baik (Superior)';
            gradeSub = `Selamat! Hasil simulasi tes ${testName} Anda sangat memuaskan dan memenuhi kriteria seleksi perusahaan papan atas / BUMN.`;
        } else if (accuracy >= 85 && pace >= 30) {
            grade = 'B';
            gradeTitle = 'Performa Baik (Kompeten)';
            gradeSub = `Performa kerja stabil dengan akurasi yang terjaga. Pertahankan ritme saat ujian psikotes ${testName} sesungguhnya.`;
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
        const targetDirectionWord = state.testType === 'pauli' ? 'angka paling atas' : 'angka paling bawah';
        DOM.analysisTips.innerText = `Gunakan Numpad keyboard dengan posisi jari yang rileks. Saat terdengar sinyal "PINDAH!", langsung alihkan pandangan mata ke ${targetDirectionWord} pada kolom berikutnya tanpa memikirkan jawaban yang terlewati.`;

        return {
            grade,
            gradeTitle,
            gradeSub,
            stdDev: parseFloat(stdDev.toFixed(1)),
            enduranceDiff: parseFloat(enduranceDiff.toFixed(1))
        };
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
                        label: `Total Dijawab (${state.testType === 'pauli' ? 'Pauli' : 'Kraepelin'})`,
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
        if (state.trendChartInstance && DOM.historyModal && !DOM.historyModal.classList.contains('hidden')) {
            renderTrendsView();
        }
        if (state.compareChartInstance && DOM.historyModal && !DOM.historyModal.classList.contains('hidden')) {
            renderCompareView(DOM.compareSelectA?.value, DOM.compareSelectB?.value);
        }
    }


    // ==========================================================================
    // 11. History & Performance Comparison Engine
    // ==========================================================================

    const HistoryManager = {
        STORAGE_KEY: 'kraepelin_sim_test_history_v1',

        getHistory() {
            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (err) {
                console.error('Gagal membaca riwayat tes:', err);
                return [];
            }
        },

        saveHistory(list) {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
            } catch (err) {
                console.error('Gagal menyimpan riwayat tes:', err);
            }
        },

        addRecord(record) {
            const list = this.getHistory();
            list.unshift(record); // Urutan terbaru di posisi pertama
            this.saveHistory(list);
            return list;
        },

        deleteRecord(id) {
            const list = this.getHistory().filter(item => item.id !== id);
            this.saveHistory(list);
            return list;
        },

        clearAll() {
            this.saveHistory([]);
        },

        getRecordById(id) {
            return this.getHistory().find(item => item.id === id);
        }
    };

    function formatDateTimeID(date) {
        const d = date instanceof Date ? date : new Date(date);
        const day = d.getDate();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year}, ${hours}:${minutes}`;
    }

    function saveCurrentTestSession(res) {
        const attemptedCols = Math.min(state.totalColumns, state.currentColIndex + 1);
        const historyList = HistoryManager.getHistory();
        const prevRecord = historyList.length > 0 ? historyList[0] : null;

        const newRecord = {
            id: 'test_' + Date.now(),
            timestamp: Date.now(),
            dateFormatted: formatDateTimeID(new Date()),
            testType: state.testType,
            mode: state.mode,
            totalColumns: state.totalColumns,
            attemptedColumns: attemptedCols,
            timePerColumn: state.timePerColumn,
            elapsedSeconds: res.actualElapsedSec,
            durationFormatted: res.durationFormatted,
            totalQuestions: res.totalQuestions,
            answered: res.answeredCount,
            answeredPercent: ((res.answeredCount / (res.totalQuestions || 1)) * 100).toFixed(1),
            unanswered: res.unansweredCount,
            correct: res.correctCount,
            wrong: res.wrongCount,
            accuracy: parseFloat(res.accuracyPercent),
            pace: res.speedPace,
            avgTime: parseFloat(res.avgTimePerAnswer),
            grade: res.psychoEval.grade,
            gradeTitle: res.psychoEval.gradeTitle,
            gradeSub: res.psychoEval.gradeSub,
            stdDev: res.psychoEval.stdDev,
            enduranceDiff: res.psychoEval.enduranceDiff,
            analysisSpeed: DOM.analysisSpeed ? DOM.analysisSpeed.innerText : '',
            analysisAccuracy: DOM.analysisAccuracy ? DOM.analysisAccuracy.innerText : '',
            analysisStability: DOM.analysisStability ? DOM.analysisStability.innerText : '',
            analysisEndurance: DOM.analysisEndurance ? DOM.analysisEndurance.innerText : '',
            analysisTips: DOM.analysisTips ? DOM.analysisTips.innerText : '',
            columnStats: JSON.parse(JSON.stringify(state.columnStats))
        };

        HistoryManager.addRecord(newRecord);
        state.currentTestRecord = newRecord;

        updateHeaderHistoryBadge();
        renderSetupHistorySummary();
        renderResultComparisonCard(newRecord, prevRecord);
    }

    function updateHeaderHistoryBadge() {
        if (!DOM.headerHistoryBadge) return;
        const total = HistoryManager.getHistory().length;
        if (total > 0) {
            DOM.headerHistoryBadge.innerText = total > 99 ? '99+' : total;
            DOM.headerHistoryBadge.classList.remove('hidden');
        } else {
            DOM.headerHistoryBadge.classList.add('hidden');
        }
        if (DOM.historyCount) {
            DOM.historyCount.innerText = total;
        }
    }

    function renderSetupHistorySummary() {
        if (!DOM.setupHistoryCard) return;
        const list = HistoryManager.getHistory();
        if (list.length === 0) {
            DOM.setupHistoryCard.classList.add('hidden');
            return;
        }

        DOM.setupHistoryCard.classList.remove('hidden');
        const total = list.length;
        const avgAcc = (list.reduce((acc, item) => acc + item.accuracy, 0) / total).toFixed(1);
        const maxPace = Math.max(...list.map(item => item.pace));
        const last = list[0];
        const lastTestType = last.testType === 'pauli' ? 'Pauli' : 'Kraepelin';

        if (DOM.shSummaryText) {
            DOM.shSummaryText.innerText = `Total ${total} sesi simulasi • Terakhir: ${lastTestType} (Grade ${last.grade}) • ${last.dateFormatted}`;
        }
        if (DOM.shTotalTests) DOM.shTotalTests.innerText = total;
        if (DOM.shAvgAccuracy) DOM.shAvgAccuracy.innerText = `${avgAcc}%`;
        if (DOM.shMaxPace) DOM.shMaxPace.innerText = `${maxPace} /m`;
        if (DOM.shLastTestDate) DOM.shLastTestDate.innerText = last.dateFormatted;
    }

    function renderResultComparisonCard(current, prev) {
        if (!DOM.resultComparisonCard) return;
        DOM.resultComparisonCard.classList.remove('hidden');

        if (!prev) {
            if (DOM.compPrevDate) DOM.compPrevDate.innerText = 'Sesi simulasi pertama Anda di browser ini!';
            if (DOM.compMetricsRow) {
                DOM.compMetricsRow.innerHTML = `
                    <div class="comp-metric-item" style="grid-column: 1 / -1; padding: 16px; text-align: center;">
                        <span style="color: var(--accent-cyan); font-weight: 700; font-size: 0.95rem;">
                            <i class="fa-solid fa-flag-checkered"></i> Simulasi Tes Pertama Berhasil Disimpan ke Riwayat
                        </span>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; display: block;">
                            Lakukan tes berikutnya untuk melihat perbandingan perkembangan performa, akurasi, dan pergeseran kurva kerja Anda.
                        </span>
                    </div>
                `;
            }
            if (DOM.compOpenCompareBtn) DOM.compOpenCompareBtn.classList.add('hidden');
            return;
        }

        if (DOM.compOpenCompareBtn) {
            DOM.compOpenCompareBtn.classList.remove('hidden');
            DOM.compOpenCompareBtn.onclick = () => {
                openHistoryModal('tabCompare', prev.id, current.id);
            };
        }

        const prevTestName = prev.testType === 'pauli' ? 'Pauli' : 'Kraepelin';
        if (DOM.compPrevDate) {
            DOM.compPrevDate.innerText = `Dibandingkan dengan sesi sebelumnya (${prev.dateFormatted} • ${prevTestName} Grade ${prev.grade})`;
        }

        const accDiff = current.accuracy - prev.accuracy;
        const paceDiff = current.pace - prev.pace;
        const correctDiff = current.correct - prev.correct;
        const wrongDiff = current.wrong - prev.wrong;
        const answeredDiff = current.answered - prev.answered;
        const stdDiff = current.stdDev - prev.stdDev;

        function getDiffBadge(diff, unit = '', invert = false) {
            const isZero = Math.abs(diff) < 0.05;
            const isPositive = invert ? diff < -0.05 : diff > 0.05;
            const sign = diff > 0 ? '+' : '';
            const cssClass = isZero ? 'diff-neutral' : (isPositive ? 'diff-positive' : 'diff-negative');
            const icon = isZero ? 'fa-minus' : (diff > 0 ? 'fa-arrow-up' : 'fa-arrow-down');
            const displayVal = unit === '%' ? diff.toFixed(1) : Math.round(diff);
            return `<span class="comp-diff-badge ${cssClass}"><i class="fa-solid ${icon}"></i> ${sign}${displayVal}${unit}</span>`;
        }

        if (DOM.compMetricsRow) {
            DOM.compMetricsRow.innerHTML = `
                <div class="comp-metric-item">
                    <span class="comp-m-label">Akurasi</span>
                    <div class="comp-m-body">
                        <span class="comp-m-val text-cyan">${current.accuracy}%</span>
                        ${getDiffBadge(accDiff, '%')}
                    </div>
                </div>
                <div class="comp-metric-item">
                    <span class="comp-m-label">Kecepatan</span>
                    <div class="comp-m-body">
                        <span class="comp-m-val text-orange">${current.pace} /m</span>
                        ${getDiffBadge(paceDiff, '/m')}
                    </div>
                </div>
                <div class="comp-metric-item">
                    <span class="comp-m-label">Jawaban Benar</span>
                    <div class="comp-m-body">
                        <span class="comp-m-val text-emerald">${current.correct}</span>
                        ${getDiffBadge(correctDiff)}
                    </div>
                </div>
                <div class="comp-metric-item">
                    <span class="comp-m-label">Jawaban Salah</span>
                    <div class="comp-m-body">
                        <span class="comp-m-val text-rose">${current.wrong}</span>
                        ${getDiffBadge(wrongDiff, '', true)}
                    </div>
                </div>
                <div class="comp-metric-item">
                    <span class="comp-m-label">Total Dijawab</span>
                    <div class="comp-m-body">
                        <span class="comp-m-val text-indigo">${current.answered}</span>
                        ${getDiffBadge(answeredDiff)}
                    </div>
                </div>
                <div class="comp-metric-item">
                    <span class="comp-m-label">Kestabilan (Fluktuasi)</span>
                    <div class="comp-m-body">
                        <span class="comp-m-val text-teal">±${current.stdDev}</span>
                        ${getDiffBadge(stdDiff, '', true)}
                    </div>
                </div>
            `;
        }
    }

    function openHistoryModal(defaultTab = 'tabList', selectAId = null, selectBId = null) {
        if (!DOM.historyModal) return;
        DOM.historyModal.classList.remove('hidden');
        updateHeaderHistoryBadge();
        switchHistoryTab(defaultTab, selectAId, selectBId);
        playSound('click');
    }

    function closeHistoryModal() {
        if (!DOM.historyModal) return;
        DOM.historyModal.classList.add('hidden');
    }

    function switchHistoryTab(tabName, selectAId = null, selectBId = null) {
        if (DOM.historyTabs) {
            DOM.historyTabs.forEach(tab => {
                if (tab.getAttribute('data-tab') === tabName) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }

        if (DOM.historyTabContents) {
            DOM.historyTabContents.forEach(content => {
                if (content.id === tabName) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        }

        if (tabName === 'tabList') {
            renderHistoryTable();
        } else if (tabName === 'tabTrends') {
            renderTrendsView();
        } else if (tabName === 'tabCompare') {
            renderCompareView(selectAId, selectBId);
        }
    }

    function renderHistoryTable() {
        if (!DOM.historyTableBody) return;
        const allList = HistoryManager.getHistory();
        const filterVal = DOM.historyTypeFilter ? DOM.historyTypeFilter.value : 'all';

        const filtered = allList.filter(item => {
            if (filterVal === 'all') return true;
            return item.testType === filterVal;
        });

        if (filtered.length === 0) {
            DOM.historyTableBody.innerHTML = '';
            if (DOM.historyTable) DOM.historyTable.classList.add('hidden');
            if (DOM.historyEmptyState) DOM.historyEmptyState.classList.remove('hidden');
            return;
        }

        if (DOM.historyTable) DOM.historyTable.classList.remove('hidden');
        if (DOM.historyEmptyState) DOM.historyEmptyState.classList.add('hidden');

        DOM.historyTableBody.innerHTML = '';

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            const isChecked = state.selectedHistoryIds.includes(item.id);
            const typeLabel = item.testType === 'pauli' ? 'Pauli' : 'Kraepelin';
            const badgeClass = item.testType === 'pauli' ? 'badge-pauli' : 'badge-kraepelin';
            const iconDir = item.testType === 'pauli' ? 'fa-arrow-down' : 'fa-arrow-up';

            let modeLabel = '50 Lajur';
            if (item.mode === 'medium') modeLabel = '20 Lajur';
            else if (item.mode === 'quick') modeLabel = '10 Lajur';
            else if (item.mode === 'custom') modeLabel = `${item.totalColumns} Lajur`;

            tr.innerHTML = `
                <td class="td-checkbox">
                    <input type="checkbox" class="history-checkbox" data-id="${item.id}" ${isChecked ? 'checked' : ''}>
                </td>
                <td>
                    <strong>${item.dateFormatted}</strong>
                    <div style="font-size: 0.76rem; color: var(--text-muted);">${item.durationFormatted} pengerjaan</div>
                </td>
                <td>
                    <span class="ht-type-badge ${badgeClass}"><i class="fa-solid ${iconDir}"></i> ${typeLabel}</span>
                    <span style="font-size: 0.78rem; color: var(--text-secondary); margin-left: 4px;">${modeLabel}</span>
                </td>
                <td>
                    <span class="ht-grade grade-${item.grade.toLowerCase()}">${item.grade}</span>
                </td>
                <td>
                    <strong class="text-cyan">${item.accuracy}%</strong>
                </td>
                <td>
                    <strong class="text-orange">${item.pace}</strong> <span style="font-size: 0.78rem; color: var(--text-muted);">/m</span>
                </td>
                <td>
                    <strong>${item.answered}</strong> <span style="font-size: 0.78rem; color: var(--text-muted);">/${item.totalQuestions}</span>
                </td>
                <td>
                    <span class="text-emerald">${item.correct}</span> / <span class="text-rose">${item.wrong}</span>
                </td>
                <td>
                    <div class="table-action-btns">
                        <button class="btn-icon-sm btn-view" data-id="${item.id}" title="Lihat Rincian Tes Lengkap">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn-icon-sm btn-compare" data-id="${item.id}" title="Bandingkan dengan Tes Lain">
                            <i class="fa-solid fa-code-compare"></i>
                        </button>
                        <button class="btn-icon-sm btn-delete" data-id="${item.id}" title="Hapus Riwayat Ini">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;

            // Checkbox event
            const checkbox = tr.querySelector('.history-checkbox');
            checkbox.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                if (e.target.checked) {
                    if (state.selectedHistoryIds.length >= 2) {
                        state.selectedHistoryIds.shift(); // Hapus pilihan tertua agar tetap maksimal 2
                    }
                    state.selectedHistoryIds.push(id);
                } else {
                    state.selectedHistoryIds = state.selectedHistoryIds.filter(selectedId => selectedId !== id);
                }
                updateCompareSelectedBtnState();
                renderHistoryTable();
            });

            // Action buttons
            tr.querySelector('.btn-view').addEventListener('click', () => {
                openTestDetailModal(item.id);
            });

            tr.querySelector('.btn-compare').addEventListener('click', () => {
                const historyList = HistoryManager.getHistory();
                const other = historyList.find(h => h.id !== item.id);
                if (other) {
                    openHistoryModal('tabCompare', other.id, item.id);
                } else {
                    openHistoryModal('tabCompare', item.id, item.id);
                }
            });

            tr.querySelector('.btn-delete').addEventListener('click', () => {
                deleteHistoryItem(item.id);
            });

            DOM.historyTableBody.appendChild(tr);
        });

        updateCompareSelectedBtnState();
    }

    function updateCompareSelectedBtnState() {
        const count = state.selectedHistoryIds.length;
        if (DOM.selectedCount) DOM.selectedCount.innerText = count;
        if (DOM.compareSelectedBtn) {
            DOM.compareSelectedBtn.disabled = count !== 2;
        }
    }

    function renderTrendsView() {
        if (!DOM.trendChartCanvas) return;
        const historyList = HistoryManager.getHistory();

        if (historyList.length === 0) {
            if (DOM.trendAvgAccuracy) DOM.trendAvgAccuracy.innerText = '-';
            if (DOM.trendAvgPace) DOM.trendAvgPace.innerText = '-';
            if (DOM.trendMaxPace) DOM.trendMaxPace.innerText = '-';
            if (DOM.trendStatusLabel) DOM.trendStatusLabel.innerText = 'Belum ada data';
            if (state.trendChartInstance) {
                state.trendChartInstance.destroy();
                state.trendChartInstance = null;
            }
            return;
        }

        const chronList = [...historyList].reverse().slice(-20); // Maksimal 20 riwayat kronologis
        const total = chronList.length;
        const avgAcc = (chronList.reduce((sum, item) => sum + item.accuracy, 0) / total).toFixed(1);
        const avgPace = Math.round(chronList.reduce((sum, item) => sum + item.pace, 0) / total);
        const maxPace = Math.max(...chronList.map(item => item.pace));

        if (DOM.trendAvgAccuracy) DOM.trendAvgAccuracy.innerText = `${avgAcc}%`;
        if (DOM.trendAvgPace) DOM.trendAvgPace.innerText = `${avgPace} /m`;
        if (DOM.trendMaxPace) DOM.trendMaxPace.innerText = `${maxPace} /m`;

        let trendStatus = 'Stabil & Terjaga';
        if (total >= 2) {
            const firstAcc = chronList[0].accuracy;
            const lastAcc = chronList[total - 1].accuracy;
            const firstPace = chronList[0].pace;
            const lastPace = chronList[total - 1].pace;

            if (lastAcc >= firstAcc && lastPace > firstPace + 3) {
                trendStatus = '↗ Kecepatan Meningkat';
            } else if (lastAcc > firstAcc + 3) {
                trendStatus = '↗ Akurasi Meningkat';
            } else if (lastAcc < firstAcc - 4) {
                trendStatus = '↘ Akurasi Menurun';
            } else if (lastPace < firstPace - 5) {
                trendStatus = '↘ Kecepatan Menurun';
            } else {
                trendStatus = '→ Konsisten & Prima';
            }
        }
        if (DOM.trendStatusLabel) DOM.trendStatusLabel.innerText = trendStatus;

        if (state.trendChartInstance) {
            state.trendChartInstance.destroy();
            state.trendChartInstance = null;
        }

        const isDark = document.body.classList.contains('dark-theme');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        const textColor = isDark ? '#94a3b8' : '#475569';
        const labels = chronList.map((item, idx) => `Tes #${idx + 1}`);

        const ctx = DOM.trendChartCanvas.getContext('2d');
        state.trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Akurasi (%)',
                        data: chronList.map(item => item.accuracy),
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.15)',
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true,
                        yAxisID: 'yAcc',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#06b6d4'
                    },
                    {
                        label: 'Kecepatan (/menit)',
                        data: chronList.map(item => item.pace),
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.3,
                        fill: false,
                        yAxisID: 'yPace',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#f97316'
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
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: isDark ? '#f8fafc' : '#0f172a',
                        bodyColor: isDark ? '#cbd5e1' : '#334155',
                        borderColor: '#06b6d4',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            title: function(items) {
                                const idx = items[0].dataIndex;
                                const item = chronList[idx];
                                return `${item.dateFormatted} (${item.testType === 'pauli' ? 'Pauli' : 'Kraepelin'} Grade ${item.grade})`;
                            },
                            afterBody: function(items) {
                                const idx = items[0].dataIndex;
                                const item = chronList[idx];
                                return `Dijawab: ${item.answered} | Benar: ${item.correct} | Salah: ${item.wrong}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
                    },
                    yAcc: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: 0,
                        max: 100,
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            callback: val => `${val}%`,
                            font: { family: 'JetBrains Mono', size: 11 }
                        },
                        title: { display: true, text: 'Akurasi (%)', color: '#06b6d4' }
                    },
                    yPace: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: { drawOnChartArea: false },
                        ticks: {
                            color: textColor,
                            font: { family: 'JetBrains Mono', size: 11 }
                        },
                        title: { display: true, text: 'Kecepatan (/menit)', color: '#f97316' }
                    }
                }
            }
        });
    }

    function renderCompareView(idA = null, idB = null) {
        if (!DOM.compareDetailsWrapper) return;
        const historyList = HistoryManager.getHistory();

        if (historyList.length === 0) {
            DOM.compareDetailsWrapper.innerHTML = `
                <div class="history-empty-state">
                    <div class="empty-icon"><i class="fa-solid fa-code-compare"></i></div>
                    <h4>Belum Ada Data untuk Perbandingan</h4>
                    <p>Selesaikan setidaknya satu atau dua sesi tes terlebih dahulu untuk membandingkan performa.</p>
                </div>
            `;
            if (state.compareChartInstance) {
                state.compareChartInstance.destroy();
                state.compareChartInstance = null;
            }
            return;
        }

        // Populate dropdown options
        if (DOM.compareSelectA && DOM.compareSelectB) {
            const populateOptions = (selectElem, activeId) => {
                selectElem.innerHTML = '';
                historyList.forEach((item, index) => {
                    const opt = document.createElement('option');
                    opt.value = item.id;
                    const typeLabel = item.testType === 'pauli' ? 'Pauli' : 'Kraepelin';
                    opt.innerText = `Sesi #${historyList.length - index} • ${item.dateFormatted} • ${typeLabel} (${item.accuracy}%, ${item.pace}/m, Grade ${item.grade})`;
                    if (item.id === activeId) opt.selected = true;
                    selectElem.appendChild(opt);
                });
            };

            // Determine selections
            let activeAId = idA;
            let activeBId = idB;

            if (!activeAId || !HistoryManager.getRecordById(activeAId)) {
                if (state.selectedHistoryIds.length >= 1) {
                    activeAId = state.selectedHistoryIds[0];
                } else if (historyList.length >= 2) {
                    activeAId = historyList[1].id; // Tes yang lebih lama sebagai baseline A
                } else {
                    activeAId = historyList[0].id;
                }
            }

            if (!activeBId || !HistoryManager.getRecordById(activeBId)) {
                if (state.selectedHistoryIds.length >= 2) {
                    activeBId = state.selectedHistoryIds[1];
                } else {
                    activeBId = historyList[0].id; // Tes paling baru sebagai B
                }
            }

            populateOptions(DOM.compareSelectA, activeAId);
            populateOptions(DOM.compareSelectB, activeBId);
        }

        const recA = HistoryManager.getRecordById(DOM.compareSelectA.value) || historyList[0];
        const recB = HistoryManager.getRecordById(DOM.compareSelectB.value) || historyList[0];

        // Hitung deltas (B vs A)
        const accDelta = recB.accuracy - recA.accuracy;
        const paceDelta = recB.pace - recA.pace;
        const correctDelta = recB.correct - recA.correct;
        const wrongDelta = recB.wrong - recA.wrong;
        const answeredDelta = recB.answered - recA.answered;
        const stdDelta = recB.stdDev - recA.stdDev;
        const enduranceDelta = recB.enduranceDiff - recA.enduranceDiff;

        function getDiffBadge(diff, unit = '', invert = false) {
            const isZero = Math.abs(diff) < 0.05;
            const isPositive = invert ? diff < -0.05 : diff > 0.05;
            const sign = diff > 0 ? '+' : '';
            const cssClass = isZero ? 'diff-neutral' : (isPositive ? 'diff-positive' : 'diff-negative');
            const icon = isZero ? 'fa-minus' : (diff > 0 ? 'fa-arrow-up' : 'fa-arrow-down');
            const displayVal = unit === '%' ? diff.toFixed(1) : Math.round(diff);
            return `<span class="comp-diff-badge ${cssClass}"><i class="fa-solid ${icon}"></i> ${sign}${displayVal}${unit}</span>`;
        }

        const typeA = recA.testType === 'pauli' ? 'Pauli' : 'Kraepelin';
        const typeB = recB.testType === 'pauli' ? 'Pauli' : 'Kraepelin';

        DOM.compareDetailsWrapper.innerHTML = `
            <!-- Side by Side Cards -->
            <div class="compare-cards-grid">
                <!-- Card A -->
                <div class="compare-card card-a">
                    <div class="c-card-header">
                        <div>
                            <span class="c-tag tag-a"><i class="fa-solid fa-circle-dot"></i> Tes A (Dasar / Baseline)</span>
                            <div class="c-card-title">${typeA} • Grade ${recA.grade}</div>
                            <div class="c-card-date">${recA.dateFormatted} • Durasi ${recA.durationFormatted}</div>
                        </div>
                        <div class="grade-badge grade-${recA.grade.toLowerCase()}">${recA.grade}</div>
                    </div>
                    <div class="sh-stats-grid" style="margin-top: 10px;">
                        <div class="sh-stat-item">
                            <span class="sh-stat-label">Akurasi</span>
                            <span class="sh-stat-value text-cyan">${recA.accuracy}%</span>
                        </div>
                        <div class="sh-stat-item">
                            <span class="sh-stat-label">Kecepatan</span>
                            <span class="sh-stat-value text-orange">${recA.pace} /m</span>
                        </div>
                        <div class="sh-stat-item">
                            <span class="sh-stat-label">Jawaban Benar</span>
                            <span class="sh-stat-value text-emerald">${recA.correct}</span>
                        </div>
                        <div class="sh-stat-item">
                            <span class="sh-stat-label">Jawaban Salah</span>
                            <span class="sh-stat-value text-rose">${recA.wrong}</span>
                        </div>
                    </div>
                </div>

                <!-- Card B -->
                <div class="compare-card card-b">
                    <div class="c-card-header">
                        <div>
                            <span class="c-tag tag-b"><i class="fa-solid fa-circle-check"></i> Tes B (Pembanding / Terbaru)</span>
                            <div class="c-card-title">${typeB} • Grade ${recB.grade}</div>
                            <div class="c-card-date">${recB.dateFormatted} • Durasi ${recB.durationFormatted}</div>
                        </div>
                        <div class="grade-badge grade-${recB.grade.toLowerCase()}">${recB.grade}</div>
                    </div>
                    <div class="sh-stats-grid" style="margin-top: 10px;">
                        <div class="sh-stat-item">
                            <span class="sh-stat-label">Akurasi</span>
                            <span class="sh-stat-value text-cyan">${recB.accuracy}%</span>
                        </div>
                        <div class="sh-stat-item">
                            <span class="sh-stat-label">Kecepatan</span>
                            <span class="sh-stat-value text-orange">${recB.pace} /m</span>
                        </div>
                        <div class="sh-stat-item">
                            <span class="sh-stat-label">Jawaban Benar</span>
                            <span class="sh-stat-value text-emerald">${recB.correct}</span>
                        </div>
                        <div class="sh-stat-item">
                            <span class="sh-stat-label">Jawaban Salah</span>
                            <span class="sh-stat-value text-rose">${recB.wrong}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detailed Comparison Table -->
            <div class="compare-metrics-table-box">
                <h4><i class="fa-solid fa-table-list text-accent"></i> Tabel Analisis Komparasi Parameter (Tes B vs Tes A)</h4>
                <div style="overflow-x: auto;">
                    <table class="compare-table">
                        <thead>
                            <tr>
                                <th>Indikator Evaluasi</th>
                                <th>Tes A (${recA.dateFormatted.split(',')[0]})</th>
                                <th>Tes B (${recB.dateFormatted.split(',')[0]})</th>
                                <th>Selisih (Perubahan)</th>
                                <th>Status Progres</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Tingkat Akurasi</strong></td>
                                <td>${recA.accuracy}%</td>
                                <td>${recB.accuracy}%</td>
                                <td>${getDiffBadge(accDelta, '%')}</td>
                                <td>${accDelta > 1 ? '<span class="text-emerald font-semibold">Ketelitian Meningkat</span>' : (accDelta < -1 ? '<span class="text-rose font-semibold">Ketelitian Menurun</span>' : '<span class="text-secondary font-semibold">Akurasi Konsisten</span>')}</td>
                            </tr>
                            <tr>
                                <td><strong>Kecepatan Menjawab (Pace)</strong></td>
                                <td>${recA.pace} /menit</td>
                                <td>${recB.pace} /menit</td>
                                <td>${getDiffBadge(paceDelta, '/m')}</td>
                                <td>${paceDelta > 2 ? '<span class="text-emerald font-semibold">Respon Lebih Cepat</span>' : (paceDelta < -2 ? '<span class="text-rose font-semibold">Respon Melambat</span>' : '<span class="text-secondary font-semibold">Ritme Stabil</span>')}</td>
                            </tr>
                            <tr>
                                <td><strong>Total Soal Dijawab</strong></td>
                                <td>${recA.answered} item</td>
                                <td>${recB.answered} item</td>
                                <td>${getDiffBadge(answeredDelta)}</td>
                                <td>${answeredDelta > 0 ? '<span class="text-emerald font-semibold">Output Bertambah</span>' : (answeredDelta < 0 ? '<span class="text-rose font-semibold">Output Berkurang</span>' : '<span class="text-secondary font-semibold">Sama</span>')}</td>
                            </tr>
                            <tr>
                                <td><strong>Jawaban Benar</strong></td>
                                <td>${recA.correct} item</td>
                                <td>${recB.correct} item</td>
                                <td>${getDiffBadge(correctDelta)}</td>
                                <td>${correctDelta > 0 ? '<span class="text-emerald font-semibold">Skor Benar Naik</span>' : (correctDelta < 0 ? '<span class="text-rose font-semibold">Skor Benar Turun</span>' : '<span class="text-secondary font-semibold">Sama</span>')}</td>
                            </tr>
                            <tr>
                                <td><strong>Kesalahan Hitung (Salah)</strong></td>
                                <td>${recA.wrong} item</td>
                                <td>${recB.wrong} item</td>
                                <td>${getDiffBadge(wrongDelta, '', true)}</td>
                                <td>${wrongDelta < 0 ? '<span class="text-emerald font-semibold">Koreksi Kesalahan Bagus</span>' : (wrongDelta > 0 ? '<span class="text-rose font-semibold">Kesalahan Bertambah</span>' : '<span class="text-secondary font-semibold">Konstan</span>')}</td>
                            </tr>
                            <tr>
                                <td><strong>Kestabilan Ritme (Deviasi Std)</strong></td>
                                <td>±${recA.stdDev}</td>
                                <td>±${recB.stdDev}</td>
                                <td>${getDiffBadge(stdDelta, '', true)}</td>
                                <td>${stdDelta < -0.3 ? '<span class="text-emerald font-semibold">Emosi & Ritme Lebih Tenang</span>' : (stdDelta > 0.3 ? '<span class="text-rose font-semibold">Fluktuasi Bertambah</span>' : '<span class="text-secondary font-semibold">Kestabilan Serupa</span>')}</td>
                            </tr>
                            <tr>
                                <td><strong>Tren Ketahanan (Endurance)</strong></td>
                                <td>${recA.enduranceDiff >= 0 ? '+' : ''}${recA.enduranceDiff}</td>
                                <td>${recB.enduranceDiff >= 0 ? '+' : ''}${recB.enduranceDiff}</td>
                                <td>${getDiffBadge(enduranceDelta)}</td>
                                <td>${enduranceDelta > 0.5 ? '<span class="text-emerald font-semibold">Daya Tahan Lebih Tinggi</span>' : (enduranceDelta < -0.5 ? '<span class="text-rose font-semibold">Kelelahan Lebih Terasa</span>' : '<span class="text-secondary font-semibold">Konsistensi Terjaga</span>')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Overlay Kurva Kerja Chart Container -->
            <div class="compare-chart-box">
                <div class="trend-chart-header">
                    <div>
                        <h4><i class="fa-solid fa-chart-area text-indigo"></i> Grafik Kurva Kerja Komparatif per Lajur</h4>
                        <span class="trend-sub">Visualisasi overlay jawaban per lajur antara Tes A (${typeA}) vs Tes B (${typeB})</span>
                    </div>
                    <div class="compare-legend">
                        <span class="c-legend-item"><span class="c-dot dot-a"></span> Tes A (${recA.dateFormatted.split(',')[0]})</span>
                        <span class="c-legend-item"><span class="c-dot dot-b"></span> Tes B (${recB.dateFormatted.split(',')[0]})</span>
                    </div>
                </div>
                <div class="compare-canvas-wrapper">
                    <canvas id="compareChart" height="280"></canvas>
                </div>
            </div>

            <!-- AI / Psychometric Evaluation Summary -->
            <div class="compare-insight-card">
                <h4><i class="fa-solid fa-brain"></i> Evaluasi Perbandingan Sikap Kerja Psikotes:</h4>
                <p id="compareAiText">
                    ${generateComparativeInsight(recA, recB, accDelta, paceDelta, wrongDelta, stdDelta, enduranceDelta)}
                </p>
            </div>
        `;

        // Render Compare Overlay Chart
        renderCompareOverlayChart(recA, recB);
    }

    function renderCompareOverlayChart(recA, recB) {
        const canvas = document.getElementById('compareChart');
        if (!canvas) return;

        if (state.compareChartInstance) {
            state.compareChartInstance.destroy();
            state.compareChartInstance = null;
        }

        const maxCols = Math.max(recA.columnStats.length, recB.columnStats.length);
        const labels = Array.from({ length: maxCols }, (_, i) => `Lajur ${i + 1}`);

        const dataA = recA.columnStats.map(s => s.answered);
        const dataB = recB.columnStats.map(s => s.answered);

        const isDark = document.body.classList.contains('dark-theme');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        const textColor = isDark ? '#94a3b8' : '#475569';

        const ctx = canvas.getContext('2d');
        state.compareChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Tes A (${recA.dateFormatted.split(',')[0]})`,
                        data: dataA,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 2,
                        borderDash: [4, 4],
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#6366f1',
                        pointRadius: 3,
                        pointHoverRadius: 5
                    },
                    {
                        label: `Tes B (${recB.dateFormatted.split(',')[0]})`,
                        data: dataB,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#10b981',
                        pointRadius: 4,
                        pointHoverRadius: 6
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
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: isDark ? '#f8fafc' : '#0f172a',
                        bodyColor: isDark ? '#cbd5e1' : '#334155',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        padding: 12
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
                        title: { display: true, text: 'Jumlah Jawaban per Lajur', color: textColor }
                    }
                }
            }
        });
    }

    function generateComparativeInsight(recA, recB, accDelta, paceDelta, wrongDelta, stdDelta, enduranceDelta) {
        const insights = [];

        if (paceDelta > 2 && accDelta >= -1) {
            insights.push(`<strong>Peningkatan Kecepatan:</strong> Kecepatan kerja Anda pada Tes B meningkat sebesar <strong>+${paceDelta} jawaban/menit</strong> tanpa mengorbankan akurasi.`);
        } else if (paceDelta < -2) {
            insights.push(`<strong>Penurunan Kecepatan:</strong> Kecepatan pada Tes B mengalami penurunan <strong>${Math.abs(paceDelta)} jawaban/menit</strong> dibandingkan Tes A.`);
        } else {
            insights.push(`<strong>Kecepatan Konsisten:</strong> Ritme kecepatan kerja Anda stabil pada kisaran <strong>${recB.pace} jawaban/menit</strong>.`);
        }

        if (accDelta > 1) {
            insights.push(`<strong>Ketelitian Lebih Tinggi:</strong> Akurasi meningkat <strong>+${accDelta.toFixed(1)}%</strong> dengan kesalahan yang berkurang.`);
        } else if (accDelta < -2) {
            insights.push(`<strong>Perhatian pada Ketelitian:</strong> Akurasi menurun <strong>${Math.abs(accDelta).toFixed(1)}%</strong>. Upayakan tetap tenang saat perpindahan lajur.`);
        }

        if (stdDelta < -0.3) {
            insights.push(`<strong>Kestabilan Emosi Menguat:</strong> Fluktuasi ritme antar lajur lebih teratur (deviasi standar menurun sebesar <strong>${Math.abs(stdDelta).toFixed(1)}</strong>), mengindikasikan pengendalian stres yang semakin matang.`);
        }

        if (enduranceDelta > 0.5) {
            insights.push(`<strong>Daya Tahan Meningkat:</strong> Performa di paruh kedua pengerjaan menunjukkan stamina mental yang lebih kuat dibandingkan Tes A.`);
        }

        return insights.join('<br><br>') || 'Performa antar kedua simulasi tes menunjukkan konsistensi yang sangat baik di seluruh aspek psikogram.';
    }

    function openTestDetailModal(id) {
        const record = HistoryManager.getRecordById(id);
        if (!record || !DOM.historyDetailModal) return;

        const typeName = record.testType === 'pauli' ? 'Pauli' : 'Kraepelin';
        if (DOM.hdTitle) DOM.hdTitle.innerText = `Rincian Hasil Tes ${typeName} (Grade ${record.grade})`;
        if (DOM.hdSub) DOM.hdSub.innerText = `Sesi ${record.dateFormatted} • Durasi ${record.durationFormatted}`;

        let modeName = '50 Lajur';
        if (record.mode === 'medium') modeName = '20 Lajur';
        else if (record.mode === 'quick') modeName = '10 Lajur';
        else if (record.mode === 'custom') modeName = `${record.totalColumns} Lajur`;

        if (DOM.hdBody) {
            DOM.hdBody.innerHTML = `
                <!-- Hero Badge -->
                <div class="result-hero-card" style="margin-bottom: 0;">
                    <div class="result-hero-main">
                        <div class="performance-badge-container">
                            <div class="grade-badge grade-${record.grade.toLowerCase()}">${record.grade}</div>
                            <div class="grade-info">
                                <h2>${record.gradeTitle}</h2>
                                <p>${record.gradeSub}</p>
                            </div>
                        </div>
                    </div>
                    <div class="result-quick-summary">
                        <div class="quick-metric">
                            <span class="qm-value text-accent">${record.accuracy}%</span>
                            <span class="qm-label">Akurasi</span>
                        </div>
                        <div class="divider-v"></div>
                        <div class="quick-metric">
                            <span class="qm-value">${record.answered}</span>
                            <span class="qm-label">Dijawab</span>
                        </div>
                        <div class="divider-v"></div>
                        <div class="quick-metric">
                            <span class="qm-value">${record.pace} /m</span>
                            <span class="qm-label">Kecepatan</span>
                        </div>
                    </div>
                </div>

                <!-- 9 Metrics Grid -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="mc-icon text-blue"><i class="fa-solid fa-list-ol"></i></div>
                        <div class="mc-content">
                            <span class="mc-title">Total Soal Dibuka</span>
                            <span class="mc-number">${record.totalQuestions}</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="mc-icon text-indigo"><i class="fa-solid fa-pen-to-square"></i></div>
                        <div class="mc-content">
                            <span class="mc-title">Soal Dijawab</span>
                            <span class="mc-number">${record.answered}</span>
                            <span class="mc-sub">${record.answeredPercent}% dari total</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="mc-icon text-amber"><i class="fa-solid fa-clock-rotate-left"></i></div>
                        <div class="mc-content">
                            <span class="mc-title">Soal Terlewati</span>
                            <span class="mc-number">${record.unanswered}</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="mc-icon text-emerald"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="mc-content">
                            <span class="mc-title">Jawaban Benar</span>
                            <span class="mc-number text-emerald">${record.correct}</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="mc-icon text-rose"><i class="fa-solid fa-circle-xmark"></i></div>
                        <div class="mc-content">
                            <span class="mc-title">Jawaban Salah</span>
                            <span class="mc-number text-rose">${record.wrong}</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="mc-icon text-cyan"><i class="fa-solid fa-bullseye"></i></div>
                        <div class="mc-content">
                            <span class="mc-title">Tingkat Akurasi</span>
                            <span class="mc-number text-cyan">${record.accuracy}%</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="mc-icon text-purple"><i class="fa-solid fa-stopwatch"></i></div>
                        <div class="mc-content">
                            <span class="mc-title">Rata-Rata Waktu</span>
                            <span class="mc-number">${record.avgTime}s</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="mc-icon text-orange"><i class="fa-solid fa-bolt"></i></div>
                        <div class="mc-content">
                            <span class="mc-title">Kecepatan Menjawab</span>
                            <span class="mc-number">${record.pace}</span>
                            <span class="mc-sub">jawaban/menit</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="mc-icon text-teal"><i class="fa-solid fa-hourglass-half"></i></div>
                        <div class="mc-content">
                            <span class="mc-title">Total Durasi</span>
                            <span class="mc-number">${record.durationFormatted}</span>
                        </div>
                    </div>
                </div>

                <!-- Work Curve Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <div>
                            <h3><i class="fa-solid fa-chart-area"></i> Kurva Kerja (${typeName})</h3>
                            <p>Visualisasi jumlah jawaban benar dan total jawaban per lajur.</p>
                        </div>
                    </div>
                    <div class="chart-body">
                        <canvas id="detailHistoryChart" height="260"></canvas>
                    </div>
                </div>

                <!-- Psychogram Analysis -->
                <div class="psycho-analysis-card">
                    <h3><i class="fa-solid fa-user-astronaut"></i> Catatan Psikogram Sesi Ini</h3>
                    <div class="psycho-grid">
                        <div class="psycho-aspect">
                            <div class="aspect-header">
                                <span class="aspect-icon"><i class="fa-solid fa-gauge-high"></i></span>
                                <h4>1. Kecepatan Kerja</h4>
                            </div>
                            <p>${record.analysisSpeed}</p>
                        </div>
                        <div class="psycho-aspect">
                            <div class="aspect-header">
                                <span class="aspect-icon"><i class="fa-solid fa-bullseye"></i></span>
                                <h4>2. Ketelitian Kerja</h4>
                            </div>
                            <p>${record.analysisAccuracy}</p>
                        </div>
                        <div class="psycho-aspect">
                            <div class="aspect-header">
                                <span class="aspect-icon"><i class="fa-solid fa-wave-square"></i></span>
                                <h4>3. Kestabilan Ritme</h4>
                            </div>
                            <p>${record.analysisStability}</p>
                        </div>
                        <div class="psycho-aspect">
                            <div class="aspect-header">
                                <span class="aspect-icon"><i class="fa-solid fa-battery-three-quarters"></i></span>
                                <h4>4. Daya Tahan</h4>
                            </div>
                            <p>${record.analysisEndurance}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Render Detail Chart
        const detailCanvas = document.getElementById('detailHistoryChart');
        if (detailCanvas) {
            if (state.detailChartInstance) {
                state.detailChartInstance.destroy();
                state.detailChartInstance = null;
            }

            const isDark = document.body.classList.contains('dark-theme');
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
            const textColor = isDark ? '#94a3b8' : '#475569';
            const ctx = detailCanvas.getContext('2d');

            state.detailChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: record.columnStats.map(s => `Lajur ${s.colIndex}`),
                    datasets: [
                        {
                            label: 'Total Dijawab',
                            data: record.columnStats.map(s => s.answered),
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#6366f1',
                            pointRadius: 4
                        },
                        {
                            label: 'Jawaban Benar',
                            data: record.columnStats.map(s => s.correct),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 2,
                            borderDash: [4, 4],
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#10b981',
                            pointRadius: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { color: gridColor }, ticks: { color: textColor } },
                        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }
                    }
                }
            });
        }

        DOM.historyDetailModal.classList.remove('hidden');
    }

    function deleteHistoryItem(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus data simulasi tes ini dari riwayat?')) return;
        HistoryManager.deleteRecord(id);
        state.selectedHistoryIds = state.selectedHistoryIds.filter(selectedId => selectedId !== id);
        updateHeaderHistoryBadge();
        renderSetupHistorySummary();
        renderHistoryTable();
        playSound('click');
    }

    function exportHistoryData() {
        const historyList = HistoryManager.getHistory();
        if (historyList.length === 0) {
            alert('Belum ada riwayat tes untuk diekspor.');
            return;
        }

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyList, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `kraeplin-history-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    function initHistoryEventListeners() {
        // Header history toggle
        if (DOM.historyToggleBtn) {
            DOM.historyToggleBtn.addEventListener('click', () => {
                openHistoryModal('tabList');
            });
        }

        // Setup screen view all
        if (DOM.shViewAllBtn) {
            DOM.shViewAllBtn.addEventListener('click', () => {
                openHistoryModal('tabList');
            });
        }

        // Result screen view history
        if (DOM.viewHistoryFromResBtn) {
            DOM.viewHistoryFromResBtn.addEventListener('click', () => {
                openHistoryModal('tabList');
            });
        }

        // Modal close buttons
        if (DOM.closeHistoryModalBtn) {
            DOM.closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
        }

        if (DOM.historyModal) {
            DOM.historyModal.addEventListener('click', (e) => {
                if (e.target === DOM.historyModal) closeHistoryModal();
            });
        }

        if (DOM.closeDetailModalBtn) {
            DOM.closeDetailModalBtn.addEventListener('click', () => {
                if (DOM.historyDetailModal) DOM.historyDetailModal.classList.add('hidden');
            });
        }

        if (DOM.historyDetailModal) {
            DOM.historyDetailModal.addEventListener('click', (e) => {
                if (e.target === DOM.historyDetailModal) DOM.historyDetailModal.classList.add('hidden');
            });
        }

        // Tab navigation
        if (DOM.historyTabs) {
            DOM.historyTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.getAttribute('data-tab');
                    switchHistoryTab(tabName);
                    playSound('click');
                });
            });
        }

        // Filter dropdown
        if (DOM.historyTypeFilter) {
            DOM.historyTypeFilter.addEventListener('change', () => {
                renderHistoryTable();
            });
        }

        // Compare Selected Button
        if (DOM.compareSelectedBtn) {
            DOM.compareSelectedBtn.addEventListener('click', () => {
                if (state.selectedHistoryIds.length === 2) {
                    openHistoryModal('tabCompare', state.selectedHistoryIds[0], state.selectedHistoryIds[1]);
                }
            });
        }

        // Compare Select dropdowns change
        if (DOM.compareSelectA) {
            DOM.compareSelectA.addEventListener('change', () => {
                renderCompareView(DOM.compareSelectA.value, DOM.compareSelectB.value);
            });
        }
        if (DOM.compareSelectB) {
            DOM.compareSelectB.addEventListener('change', () => {
                renderCompareView(DOM.compareSelectA.value, DOM.compareSelectB.value);
            });
        }

        // Export JSON
        if (DOM.exportHistoryBtn) {
            DOM.exportHistoryBtn.addEventListener('click', exportHistoryData);
        }

        // Clear All Modal
        if (DOM.clearAllHistoryBtn) {
            DOM.clearAllHistoryBtn.addEventListener('click', () => {
                if (DOM.confirmClearModal) DOM.confirmClearModal.classList.remove('hidden');
            });
        }

        if (DOM.cancelClearBtn) {
            DOM.cancelClearBtn.addEventListener('click', () => {
                if (DOM.confirmClearModal) DOM.confirmClearModal.classList.add('hidden');
            });
        }

        if (DOM.confirmClearBtn) {
            DOM.confirmClearBtn.addEventListener('click', () => {
                HistoryManager.clearAll();
                state.selectedHistoryIds = [];
                if (DOM.confirmClearModal) DOM.confirmClearModal.classList.add('hidden');
                updateHeaderHistoryBadge();
                renderSetupHistorySummary();
                renderHistoryTable();
                playSound('click');
            });
        }

        // Empty state start test button
        if (DOM.emptyStartBtn) {
            DOM.emptyStartBtn.addEventListener('click', () => {
                closeHistoryModal();
                switchScreen(DOM.setupScreen);
            });
        }
    }

    // Initialize History on Load
    initHistoryEventListeners();
    updateHeaderHistoryBadge();
    renderSetupHistorySummary();

});

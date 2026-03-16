// Dictionaries
const EN_WORDS = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"];
const RU_WORDS = ["и", "в", "не", "на", "я", "быть", "он", "с", "что", "а", "по", "это", "она", "этот", "к", "но", "они", "мы", "как", "из", "у", "который", "то", "за", "свой", "весь", "год", "от", "так", "о", "для", "ты", "же", "все", "тот", "или", "если", "бы", "себя", "один", "уже", "до", "время", "вот", "сказать", "кто", "да", "говорить", "мочь", "знать", "стать", "при", "чтобы", "дело", "жизнь", "первый", "день", "рука", "очень", "со", "два", "новый", "дать", "даже", "там", "раз", "где", "есть", "ну", "под", "можно"];
const EN_QUOTES = [
    "Design is not just what it looks like and feels like. Design is how it works.",
    "Innovation distinguishes between a leader and a follower.",
    "Stay hungry, stay foolish.",
    "Simplicity is the ultimate sophistication.",
    "The people who are crazy enough to think they can change the world are the ones who do.",
    "Quality is more important than quantity. One home run is much better than two doubles.",
    "The best way to predict the future is to invent it."
];
const RU_QUOTES = [
    "Дизайн — это не то, как предмет выглядит, а то, как он работает.",
    "Инновации отличают лидера от догоняющего.",
    "Оставайтесь голодными, оставайтесь безрассудными. Ваше время ограничено, не тратьте его, живя чужой жизнью.",
    "Простота — это высшая степень утонченности.",
    "Люди, которые достаточно безумны, чтобы думать, что они могут изменить мир, — это те, кто это делает.",
    "Качество важнее количества. Один хоум-ран гораздо лучше, чем два дабла.",
    "Сделай шаг, и дорога появится сама собой.",
    "Лучший способ предсказать будущее — изобрести его."
];

// State
let settings = {
    language: 'ru',
    mode: 'words',
    wordCount: 25,
    includeNumbers: false,
    includePunctuation: false,
    customText: 'Введите свой текст здесь...'
};

let localSettings = { ...settings };

let currentText = '';
let userInput = '';
let status = 'idle'; // idle, typing, finished
let startTime = null;
let endTime = null;
let wpmInterval = null;

// DOM Elements
const hiddenInput = document.getElementById('hidden-input');
const textDisplay = document.getElementById('text-display');
const progressCurrent = document.getElementById('progress-current');
const progressTotal = document.getElementById('progress-total');
const progressBar = document.getElementById('progress-bar');
const liveWpmDisplay = document.getElementById('live-wpm');
const startPrompt = document.getElementById('start-prompt');
const typingArea = document.getElementById('typing-area');
const resultsArea = document.getElementById('results-area');

const resultWpm = document.getElementById('result-wpm');
const resultAccuracy = document.getElementById('result-accuracy');
const resultErrors = document.getElementById('result-errors');
const retryBtn = document.getElementById('retry-btn');

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const langSelector = document.getElementById('lang-selector');
const modeSelector = document.getElementById('mode-selector');
const wordCountSelector = document.getElementById('word-count-selector');
const wordCountContainer = document.getElementById('word-count-container');
const customTextContainer = document.getElementById('custom-text-container');
const customTextInput = document.getElementById('custom-text-input');
const togglesContainer = document.getElementById('toggles-container');
const toggleNumbers = document.getElementById('toggle-numbers');
const toggleNumbersBg = document.getElementById('toggle-numbers-bg');
const toggleNumbersKnob = document.getElementById('toggle-numbers-knob');
const togglePunctuation = document.getElementById('toggle-punctuation');
const togglePunctuationBg = document.getElementById('toggle-punctuation-bg');
const togglePunctuationKnob = document.getElementById('toggle-punctuation-knob');

// Initialize Lucide Icons
lucide.createIcons();

// Logic
function generateText(s) {
    if (s.mode === 'custom') {
        return s.customText.trim() || "Текст не задан.";
    }
    if (s.mode === 'quotes') {
        const quotes = s.language === 'ru' ? RU_QUOTES : EN_QUOTES;
        let q = quotes[Math.floor(Math.random() * quotes.length)];
        if (!s.includePunctuation) {
            q = q.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()—"']/g, "").toLowerCase();
        }
        if (!s.includeNumbers) {
            q = q.replace(/[0-9]/g, "");
        }
        return q.replace(/\s{2,}/g, " ").trim();
    }
    const dict = s.language === 'ru' ? RU_WORDS : EN_WORDS;
    let result = [];
    for (let i = 0; i < s.wordCount; i++) {
        let w = dict[Math.floor(Math.random() * dict.length)];
        if (s.includePunctuation) {
            if (Math.random() < 0.1) w = w.charAt(0).toUpperCase() + w.slice(1);
            if (Math.random() < 0.1) w += (Math.random() < 0.5 ? ',' : '.');
        }
        result.push(w);
    }
    if (s.includeNumbers) {
        const numCount = Math.max(1, Math.floor(s.wordCount * 0.1));
        for (let i = 0; i < numCount; i++) {
            const pos = Math.floor(Math.random() * result.length);
            result.splice(pos, 0, Math.floor(Math.random() * 1000).toString());
        }
    }
    return result.join(' ');
}

function renderText() {
    textDisplay.innerHTML = '';
    for (let i = 0; i < currentText.length; i++) {
        const char = currentText[i];
        const span = document.createElement('span');
        span.className = 'relative text-gray-300';
        
        if (i < userInput.length) {
            if (userInput[i] === char) {
                span.className = 'relative text-black';
            } else {
                span.className = 'relative text-red-500';
                if (char === ' ') span.classList.add('bg-red-100');
            }
        }
        
        if (i === userInput.length && status !== 'finished') {
            const cursor = document.createElement('span');
            cursor.className = 'absolute -left-[1px] top-[10%] bottom-[10%] w-[3px] bg-black rounded-full cursor-blink';
            span.appendChild(cursor);
        }
        
        span.appendChild(document.createTextNode(char));
        textDisplay.appendChild(span);
    }
}

function updateProgress() {
    progressCurrent.textContent = userInput.length;
    progressTotal.textContent = currentText.length;
    progressBar.style.width = `${(userInput.length / currentText.length) * 100}%`;
    
    if (status === 'idle') {
        startPrompt.style.opacity = '1';
    } else {
        startPrompt.style.opacity = '0';
    }
}

function startWpmInterval() {
    if (wpmInterval) clearInterval(wpmInterval);
    wpmInterval = setInterval(() => {
        const timeElapsed = (Date.now() - startTime) / 60000;
        const wordsTyped = userInput.length / 5;
        liveWpmDisplay.textContent = Math.round(wordsTyped / timeElapsed) || 0;
    }, 1000);
}

function finishTest() {
    status = 'finished';
    endTime = Date.now();
    if (wpmInterval) clearInterval(wpmInterval);
    
    const timeElapsed = (endTime - startTime) / 60000;
    const wordsTyped = currentText.length / 5;
    const finalWpm = Math.round(wordsTyped / timeElapsed);
    
    let correctChars = 0;
    for (let i = 0; i < currentText.length; i++) {
        if (currentText[i] === userInput[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / currentText.length) * 100);
    const errors = currentText.length - correctChars;
    
    resultWpm.textContent = `${finalWpm} WPM`;
    resultAccuracy.textContent = `${accuracy}%`;
    resultAccuracy.className = `text-4xl font-semibold tracking-tight ${accuracy > 95 ? 'text-green-600' : accuracy > 80 ? 'text-black' : 'text-red-500'}`;
    resultErrors.textContent = errors;
    resultErrors.className = `text-4xl font-semibold tracking-tight ${errors === 0 ? 'text-green-600' : 'text-red-500'}`;
    
    typingArea.classList.add('hidden');
    typingArea.classList.remove('flex');
    resultsArea.classList.remove('hidden');
    resultsArea.classList.add('flex');
    
    hiddenInput.disabled = true;
}

function resetTest() {
    currentText = generateText(settings);
    userInput = '';
    status = 'idle';
    startTime = null;
    endTime = null;
    if (wpmInterval) clearInterval(wpmInterval);
    liveWpmDisplay.textContent = '0';
    
    typingArea.classList.remove('hidden');
    typingArea.classList.add('flex');
    resultsArea.classList.add('hidden');
    resultsArea.classList.remove('flex');
    
    hiddenInput.disabled = false;
    hiddenInput.value = '';
    hiddenInput.focus();
    
    updateProgress();
    renderText();
}

// Event Listeners
hiddenInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length <= currentText.length) {
        if (status === 'idle' && val.length > 0) {
            status = 'typing';
            startTime = Date.now();
            startWpmInterval();
        }
        userInput = val;
        updateProgress();
        renderText();
        
        if (val.length === currentText.length) {
            finishTest();
        }
    } else {
        e.target.value = userInput;
    }
});

document.addEventListener('click', (e) => {
    if (!settingsModal.classList.contains('hidden') && status !== 'finished') return;
    if (status !== 'finished') {
        hiddenInput.focus();
    }
});

retryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetTest();
});

// Settings Logic
function updatePillSelector(container, value) {
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.dataset.val == value) {
            btn.className = 'flex-1 py-2 text-sm font-medium rounded-lg transition-all bg-white shadow-sm text-black';
        } else {
            btn.className = 'flex-1 py-2 text-sm font-medium rounded-lg transition-all text-gray-500 hover:text-black';
        }
    });
}

function updateToggleUI(checkbox, bg, knob) {
    if (checkbox.checked) {
        bg.classList.remove('bg-gray-200');
        bg.classList.add('bg-black');
        knob.classList.remove('translate-x-0');
        knob.classList.add('translate-x-6');
    } else {
        bg.classList.remove('bg-black');
        bg.classList.add('bg-gray-200');
        knob.classList.remove('translate-x-6');
        knob.classList.add('translate-x-0');
    }
}

function renderSettingsUI() {
    updatePillSelector(langSelector, localSettings.language);
    updatePillSelector(modeSelector, localSettings.mode);
    updatePillSelector(wordCountSelector, localSettings.wordCount);
    
    if (localSettings.mode === 'words') {
        wordCountContainer.classList.remove('hidden');
        customTextContainer.classList.add('hidden');
        togglesContainer.classList.remove('hidden');
    } else if (localSettings.mode === 'quotes') {
        wordCountContainer.classList.add('hidden');
        customTextContainer.classList.add('hidden');
        togglesContainer.classList.remove('hidden');
    } else {
        wordCountContainer.classList.add('hidden');
        customTextContainer.classList.remove('hidden');
        togglesContainer.classList.add('hidden');
    }
    
    customTextInput.value = localSettings.customText;
    
    toggleNumbers.checked = localSettings.includeNumbers;
    updateToggleUI(toggleNumbers, toggleNumbersBg, toggleNumbersKnob);
    
    togglePunctuation.checked = localSettings.includePunctuation;
    updateToggleUI(togglePunctuation, togglePunctuationBg, togglePunctuationKnob);
}

settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    localSettings = { ...settings };
    renderSettingsUI();
    settingsModal.classList.remove('hidden');
    settingsModal.classList.add('flex');
});

closeSettingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsModal.classList.add('hidden');
    settingsModal.classList.remove('flex');
    hiddenInput.focus();
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
        settingsModal.classList.remove('flex');
        hiddenInput.focus();
    }
});

langSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        localSettings.language = e.target.dataset.val;
        renderSettingsUI();
    }
});

modeSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        localSettings.mode = e.target.dataset.val;
        renderSettingsUI();
    }
});

wordCountSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        localSettings.wordCount = parseInt(e.target.dataset.val);
        renderSettingsUI();
    }
});

customTextInput.addEventListener('input', (e) => {
    localSettings.customText = e.target.value;
});

toggleNumbers.addEventListener('change', (e) => {
    localSettings.includeNumbers = e.target.checked;
    updateToggleUI(toggleNumbers, toggleNumbersBg, toggleNumbersKnob);
});

togglePunctuation.addEventListener('change', (e) => {
    localSettings.includePunctuation = e.target.checked;
    updateToggleUI(togglePunctuation, togglePunctuationBg, togglePunctuationKnob);
});

saveSettingsBtn.addEventListener('click', () => {
    settings = { ...localSettings };
    settingsModal.classList.add('hidden');
    settingsModal.classList.remove('flex');
    resetTest();
});

// Initialize app
resetTest();

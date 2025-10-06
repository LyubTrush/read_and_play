// Глобальные переменные словаря
let currentGroupIndex = 0;
let currentWordIndex = 0;
let dictionaryData = null;
let currentViewMode = 'single'; // 'single' или 'all'

// Загрузка данных словаря
async function loadDictionaryData() {
    try {
        console.log('Загружаем данные словаря AR...');
        
        const response = await fetch('../../data/ar-words-data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        dictionaryData = await response.json();
        console.log('Данные словаря успешно загружены:', dictionaryData);
        
        // Создаем навигацию по группам
        createGroupsNavigation();
        // Показываем первую группу слов
        showCurrentGroup();
        // Добавляем обработчик клавиатуры
        setupKeyboardNavigation();
        
    } catch (error) {
        console.error('Ошибка загрузки данных словаря:', error);
        alert('Ошибка загрузки словаря. Пожалуйста, обновите страницу.');
    }
}

// Настройка навигации с клавиатуры
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Работает только в режиме одной карточки
        if (currentViewMode !== 'single') return;
        
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                prevWord();
                break;
            case 'ArrowRight':
                event.preventDefault();
                nextWord();
                break;
        }
    });
}

// Создание навигации по группам
function createGroupsNavigation() {
    const groupsNav = document.getElementById('groupsNavigation');
    groupsNav.innerHTML = '';
    
    dictionaryData.levels.forEach((group, index) => {
        const button = document.createElement('button');
        button.className = `group-button ${index === 0 ? 'active' : ''}`;
        button.textContent = group.name;
        button.onclick = () => switchGroup(index);
        groupsNav.appendChild(button);
    });
}

// Переключение группы
function switchGroup(groupIndex) {
    currentGroupIndex = groupIndex;
    currentWordIndex = 0;
    
    // Обновляем активную кнопку группы
    document.querySelectorAll('.group-button').forEach((btn, index) => {
        btn.classList.toggle('active', index === groupIndex);
    });
    
    // Показываем группу
    showCurrentGroup();
}

// Показать текущую группу слов
function showCurrentGroup() {
    if (!dictionaryData || !dictionaryData.levels[currentGroupIndex]) {
        console.error('Данные не загружены или группа не найдена');
        return;
    }

    const currentGroup = dictionaryData.levels[currentGroupIndex];
    
    // Показываем слова в зависимости от режима просмотра
    if (currentViewMode === 'single') {
        showSingleCardView(currentGroup);
    } else {
        showAllCardsView(currentGroup);
    }
}

// Режим одной карточки
function showSingleCardView(currentGroup) {
    const singleView = document.getElementById('singleCardView');
    const allView = document.getElementById('allCardsView');
    
    // Переключаем видимость
    singleView.style.display = 'flex';
    allView.style.display = 'none';
    
    // Показываем текущее слово
    showCurrentWord(currentGroup);
}

// Режим всех карточек
function showAllCardsView(currentGroup) {
    const singleView = document.getElementById('singleCardView');
    const allView = document.getElementById('allCardsView');
    const wordsGrid = document.getElementById('wordsGrid');
    
    // Переключаем видимость
    singleView.style.display = 'none';
    allView.style.display = 'flex';
    
    // Очищаем сетку
    wordsGrid.innerHTML = '';
    
    // Создаем карточки для всех слов в группе
    currentGroup.words.forEach(wordData => {
        const wordCard = createWordCard(wordData, 'grid');
        wordsGrid.appendChild(wordCard);
    });
}

// Показать текущее слово в режиме одной карточки
function showCurrentWord(currentGroup) {
    const wordDisplay = document.getElementById('currentWordDisplay');
    
    if (currentWordIndex >= currentGroup.words.length) {
        currentWordIndex = 0;
    }
    
    const wordData = currentGroup.words[currentWordIndex];
    const wordCard = createWordCard(wordData, 'single');
    
    wordDisplay.innerHTML = '';
    wordDisplay.appendChild(wordCard);
}

// Создание карточки слова
function createWordCard(wordData, mode = 'single') {
    const card = document.createElement('div');
    card.className = mode === 'single' ? 'word-card-single' : 'word-card-grid';
    
    // Форматируем слово с выделением буквосочетания AR
    const formattedWord = formatWordWithHighlight(wordData.word);
    
    card.innerHTML = `
        <div class="word-image">
            <img src="${wordData.image}" alt="${wordData.lowercase}" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="fallback-emoji" style="display: none;">${getEmojiForWord(wordData.lowercase)}</div>
        </div>
        
        <div class="word-english">${formattedWord}</div>
        <div class="word-transcription">${wordData.transcription || '/transcription/'}</div>
        <div class="word-russian">${wordData.translation || 'перевод'}</div>
        
        <button class="sound-button" onclick="playWordSound('${wordData.lowercase}')">
            <img src="../../assets/icon/speaker.png" alt="Прослушать">
            Прослушать
        </button>
    `;
    
    return card;
}

// Переключение режима просмотра
function setViewMode(mode) {
    currentViewMode = mode;
    
    // Обновляем активные кнопки
    document.querySelectorAll('.view-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="setViewMode('${mode}')"]`).classList.add('active');
    
    // Сбрасываем индекс слова при переключении режима
    if (mode === 'single') {
        currentWordIndex = 0;
    }
    
    // Показываем группу в новом режиме
    showCurrentGroup();
}

// Следующее слово (только в режиме одной карточки)
function nextWord() {
    if (currentViewMode !== 'single') return;
    
    const currentGroup = dictionaryData.levels[currentGroupIndex];
    currentWordIndex = (currentWordIndex + 1) % currentGroup.words.length;
    showCurrentWord(currentGroup);
}

// Предыдущее слово (только в режиме одной карточки)
function prevWord() {
    if (currentViewMode !== 'single') return;
    
    const currentGroup = dictionaryData.levels[currentGroupIndex];
    currentWordIndex = currentWordIndex === 0 ? currentGroup.words.length - 1 : currentWordIndex - 1;
    showCurrentWord(currentGroup);
}

// Форматирование слова с выделением буквосочетания AR
function formatWordWithHighlight(word) {
    let result = '';
    const wordToFormat = word.toLowerCase();
    
    // Ищем буквосочетание AR для выделения
    const arIndex = wordToFormat.indexOf('ar');
    
    if (arIndex !== -1) {
        // Выделяем AR красным цветом
        result = word.substring(0, arIndex) + 
                `<span class="sound-a">${word.substring(arIndex, arIndex + 2)}</span>` +
                word.substring(arIndex + 2);
    } else {
        result = word;
    }
    
    return result;
}

// Воспроизведение звука слова
function playWordSound(word) {
    console.log(`Воспроизводим звук: ${word}`);
    
    // Создаем синтез речи для произношения
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        // Находим голос для английского
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
            voice.lang.includes('en') || voice.lang.includes('US')
        );
        
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
        
        speechSynthesis.speak(utterance);
    } else {
        console.log('Speech Synthesis не поддерживается');
        // Альтернатива - использовать предзаписанные звуки
        try {
            const wordSound = new Audio(`../../assets/audio/words/${word}.mp3`);
            wordSound.volume = 0.8;
            wordSound.play().catch(e => {
                console.log('Ошибка воспроизведения звука:', e);
            });
        } catch (e) {
            console.log('Не удалось воспроизвести звук');
        }
    }
}

// Получение эмодзи для слова (fallback)
function getEmojiForWord(word) {
    const emojiMap = {
        'car': '🚗', 'star': '⭐', 'far': '↔️', 'jar': '🫙',
        'park': '🏞️', 'dark': '🌑', 'shark': '🦈', 'card': '🃏',
        'hard': '💪', 'farm': '🚜', 'arm': '💪', 'art': '🎨',
        'part': '🔧'
    };
    return emojiMap[word] || '📖';
}

// Инициализация словаря
document.addEventListener('DOMContentLoaded', function() {
    console.log('Словарь AR инициализируется...');
    
    // Загрузка данных
    loadDictionaryData();
    
    console.log('Словарь AR готов к работе');
    console.log('Используйте стрелки ← → на клавиатуре для навигации');
});

// Делаем функции глобальными для HTML
window.playWordSound = playWordSound;
window.nextWord = nextWord;
window.prevWord = prevWord;
window.setViewMode = setViewMode;
window.switchGroup = switchGroup;
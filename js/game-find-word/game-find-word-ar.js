// Глобальные переменные игры "Найди слово" для AR
let currentLevel = 0;
let currentWordIndex = 0;
let score = 0;
let totalWords = 0;
let currentWords = [];
let progressDots = [];
let answers = [];
let currentWordData = null;
let soundEnabled = true;
let gameData = null;

// Загрузка данных игры для AR
async function loadGameData() {
    try {
        console.log('Загружаем данные для игры "Найди слово" с AR...');
        const response = await fetch('../../data/ar-words-data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        gameData = await response.json();
        console.log('Данные AR игры успешно загружены:', gameData);
        
    } catch (error) {
        console.error('Ошибка загрузки данных AR игры:', error);
        gameData = getFallbackData();
        console.log('Используем резервные данные AR');
    }
}

// Резервные данные для AR
function getFallbackData() {
    return {
        levels: [
            {
                name: "Простейшие слова",
                words: [
                    {word: "CAR", lowercase: "car", image: "../../assets/images/words/car.png", variants: ["car", "star", "far", "jar"]},
                    {word: "STAR", lowercase: "star", image: "../../assets/images/words/star.png", variants: ["star", "car", "far", "jar"]},
                    {word: "FAR", lowercase: "far", image: "../../assets/images/words/far.png", variants: ["far", "car", "star", "jar"]},
                    {word: "JAR", lowercase: "jar", image: "../../assets/images/words/jar.png", variants: ["jar", "car", "star", "far"]}
                ]
            },
            {
                name: "Слова с начальными стечениями", 
                words: [
                    {word: "PARK", lowercase: "park", image: "../../assets/images/words/park.png", variants: ["park", "dark", "shark", "mark"]},
                    {word: "DARK", lowercase: "dark", image: "../../assets/images/words/dark.png", variants: ["dark", "park", "shark", "bark"]},
                    {word: "SHARK", lowercase: "shark", image: "../../assets/images/words/shark.png", variants: ["shark", "park", "dark", "mark"]},
                    {word: "CARD", lowercase: "card", image: "../../assets/images/words/card.png", variants: ["card", "hard", "yard", "ward"]},
                    {word: "HARD", lowercase: "hard", image: "../../assets/images/words/hard.png", variants: ["hard", "card", "yard", "ward"]},
                    {word: "FARM", lowercase: "farm", image: "../../assets/images/words/farm.png", variants: ["farm", "arm", "harm", "charm"]},
                    {word: "ARM", lowercase: "arm", image: "../../assets/images/words/arm.png", variants: ["arm", "farm", "harm", "charm"]},
                    {word: "ART", lowercase: "art", image: "../../assets/images/words/art.png", variants: ["art", "part", "cart", "smart"]},
                    {word: "PART", lowercase: "part", image: "../../assets/images/words/part.png", variants: ["part", "art", "cart", "smart"]}
                ]
            }
        ]
    };
}

// Получение слов для уровня с правильной логикой накопления для AR
function getWordsForLevel(level) {
    let allWords = [];
    
    // Уровень 1: только слова уровня 1 в UPPERCASE
    if (level === 1) {
        allWords = gameData.levels[0].words.map(wordData => ({
            ...wordData,
            displayWord: wordData.word // UPPERCASE
        }));
    }
    // Уровень 2: слова уровня 1 (lowercase) + слова уровня 2 (UPPERCASE)
    else if (level === 2) {
        // Слова из уровня 1 в lowercase
        const level1Words = gameData.levels[0].words.map(wordData => ({
            ...wordData,
            displayWord: wordData.lowercase // lowercase
        }));
        
        // Слова из уровня 2 в UPPERCASE
        const level2Words = gameData.levels[1].words.map(wordData => ({
            ...wordData,
            displayWord: wordData.word // UPPERCASE
        }));
        
        allWords = [...level1Words, ...level2Words];
    }
    // Уровень 3: все слова из всех уровней в lowercase
    else if (level === 3) {
        for (let i = 0; i < gameData.levels.length; i++) {
            const levelWords = gameData.levels[i].words.map(wordData => ({
                ...wordData,
                displayWord: wordData.lowercase // lowercase
            }));
            allWords = allWords.concat(levelWords);
        }
    }
    
    return allWords;
}

// Начало уровня
async function startLevel(level) {
    if (!gameData) {
        console.log('Данные еще не загружены, ожидаем...');
        await loadGameData();
    }

    if (!gameData) {
        console.error('Данные игры не загружены');
        alert('Ошибка загрузки данных игры. Пожалуйста, обновите страницу.');
        return;
    }

    currentLevel = level - 1;
    currentWordIndex = 0;
    score = 0;
    progressDots = [];
    answers = [];
    
    currentWords = getWordsForLevel(level);
    console.log(`Уровень ${level}: ${currentWords.length} слов`);
    
    currentWords = shuffleArray(currentWords);
    totalWords = currentWords.length;
    
    document.getElementById('levelSelect').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    if (level === 3) {
        document.getElementById('levelInfo').textContent = `Уровень 3: Тренировка-экзамен (${totalWords} слов)`;
    } else {
        document.getElementById('levelInfo').textContent = `Уровень ${level}: ${gameData.levels[currentLevel].name} (${totalWords} слов)`;
    }
    
    createProgressDots();
    showNextWord();
}

// Создание кружочков прогресса
function createProgressDots() {
    const progressDotsContainer = document.getElementById('progressDots');
    progressDotsContainer.innerHTML = '';
    progressDots = [];
    
    for (let i = 0; i < totalWords; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (i === 0) {
            dot.classList.add('current');
        }
        progressDotsContainer.appendChild(dot);
        progressDots.push(dot);
    }
}

// Показать следующее слово
function showNextWord() {
    if (currentWordIndex >= totalWords) {
        showResult();
        return;
    }

    currentWordData = currentWords[currentWordIndex];
    
    // Показываем картинку
    showImage(currentWordData);
    
    // Создаем карточки со словами (3 варианта)
    createWordCards(currentWordData);
}

// Показать картинку
function showImage(wordData) {
    const imageContainer = document.getElementById('currentImage');
    imageContainer.innerHTML = '';
    
    const imageDiv = document.createElement('div');
    imageDiv.className = 'main-image';
    
    const img = document.createElement('img');
    img.src = wordData.image;
    img.alt = wordData.lowercase;
    img.onerror = function() {
        this.style.display = 'none';
        const emoji = document.createElement('div');
        emoji.className = 'fallback-emoji-large';
        emoji.textContent = getEmojiForWord(wordData.lowercase);
        imageDiv.appendChild(emoji);
    };
    
    imageDiv.appendChild(img);
    imageContainer.appendChild(imageDiv);
}

// Создание карточек со словами (3 варианта)
function createWordCards(wordData) {
    const wordsGrid = document.getElementById('wordsGrid');
    wordsGrid.innerHTML = '';
    
    // Берем только 3 варианта (первые 3 из перемешанного массива)
    const variants = shuffleArray([...wordData.variants]).slice(0, 3);
    const correctVariant = wordData.lowercase;
    
    // Убедимся, что правильный ответ есть среди вариантов
    if (!variants.includes(correctVariant)) {
        // Если правильного ответа нет, заменяем первый вариант
        variants[0] = correctVariant;
    }
    
    variants.forEach(variant => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.onclick = () => checkAnswer(variant === correctVariant, card, correctVariant);
        
        // Форматируем слово с выделением буквосочетания AR
        const formattedWord = formatWordWithHighlight(variant);
        card.innerHTML = formattedWord;
        
        wordsGrid.appendChild(card);
    });
}

// Воспроизведение звука слова
function playWordSound() {
    if (!currentWordData) return;
    
    const wordToPlay = currentWordData.lowercase;
    const wordSound = new Audio(`../../assets/audio/words/${wordToPlay}.wav`);
    wordSound.volume = 0.8;
    
    wordSound.play().catch(e => {
        console.log('Ошибка воспроизведения звука:', e);
    });
}

// Переключение звука ответов
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundToggleIcon = document.getElementById('soundToggleIcon');
    const soundToggleText = document.getElementById('soundToggleText');
    
    if (soundEnabled) {
        soundToggleIcon.src = '../../assets/icon/sound-on.png';
        soundToggleText.textContent = 'Вкл';
    } else {
        soundToggleIcon.src = '../../assets/icon/sound-off.png';
        soundToggleText.textContent = 'Выкл';
    }
}

// Форматирование слова с выделением буквосочетания AR (сохраняя регистр)
function formatWordWithHighlight(word) {
    let result = '';
    const wordToFormat = word.toLowerCase();
    
    // Ищем сочетание "ar" в слове
    const arIndex = wordToFormat.indexOf('ar');
    
    if (arIndex !== -1) {
        // Выделяем "ar" специальным стилем, сохраняя оригинальный регистр
        const originalAR = word.substring(arIndex, arIndex + 2);
        result = word.substring(0, arIndex) + 
                `<span class="sound-ar">${originalAR}</span>` + 
                word.substring(arIndex + 2);
    } else {
        // Если "ar" не найдено, используем обычное отображение
        result = word;
    }
    
    return result;
}

// Получение эмодзи для слова (fallback)
function getEmojiForWord(word) {
    const emojiMap = {
        'car': '🚗', 'star': '⭐', 'far': '📏', 'jar': '🫙',
        'park': '🏞️', 'dark': '🌑', 'shark': '🦈', 'mark': '📍',
        'card': '🃏', 'hard': '💪', 'yard': '🏡', 'ward': '🛡️',
        'farm': '🚜', 'arm': '💪', 'harm': '⚠️', 'charm': '🔮',
        'art': '🎨', 'part': '🔧', 'cart': '🛒', 'smart': '🧠',
        'bark': '🐕'
    };
    return emojiMap[word] || '❓';
}

// Проверка ответа
function checkAnswer(isCorrect, card, correctWord) {
    const wordsGrid = document.getElementById('wordsGrid');
    wordsGrid.style.pointerEvents = 'none';
    
    answers[currentWordIndex] = isCorrect;
    
    if (isCorrect) {
        card.classList.add('correct');
        if (soundEnabled) {
            const correctSound = new Audio("../../assets/audio/sounds/correct.mp3");
            correctSound.volume = 0.7;
            correctSound.play().catch(e => console.log('Ошибка звука:', e));
        }
        score++;
        progressDots[currentWordIndex].classList.remove('current');
        progressDots[currentWordIndex].classList.add('correct');
    } else {
        card.classList.add('wrong');
        if (soundEnabled) {
            const wrongSound = new Audio("../../assets/audio/sounds/wrong.mp3");
            wrongSound.volume = 0.7;
            wrongSound.play().catch(e => console.log('Ошибка звука:', e));
        }
        progressDots[currentWordIndex].classList.remove('current');
        progressDots[currentWordIndex].classList.add('wrong');
    }
    
    setTimeout(() => {
        currentWordIndex++;
        if (currentWordIndex < totalWords) {
            progressDots[currentWordIndex].classList.add('current');
        }
        wordsGrid.style.pointerEvents = 'auto';
        showNextWord();
    }, 1500);
}

// Показать результаты
function showResult() {
    const overlay = document.getElementById('resultOverlay');
    const resultImage = document.getElementById('resultImage');
    const resultTitle = document.getElementById('resultTitle');
    const resultStats = document.getElementById('resultStats');
    const nextButton = document.getElementById('nextButton');
    
    const percentage = (score / totalWords) * 100;
    
    if (percentage >= 80) {
        resultImage.src = '../../assets/icon/result-success.png';
        resultTitle.textContent = 'Отлично!';
        if (soundEnabled) {
            const applauseSound = new Audio("../../assets/audio/sounds/applause.mp3");
            applauseSound.volume = 0.7;
            applauseSound.play().catch(e => console.log('Ошибка звука:', e));
        }
    } else if (percentage >= 60) {
        resultImage.src = '../../assets/icon/result-good.png';
        resultTitle.textContent = 'Хорошо!';
    } else {
        resultImage.src = '../../assets/icon/result-try-again.png';
        resultTitle.textContent = 'Попробуй еще!';
    }
    
    resultStats.textContent = `${score} из ${totalWords} правильных ответов`;
    
    const isLastLevel = (currentLevel + 1) >= 3;
    if (isLastLevel) {
        nextButton.textContent = 'Вернуться к играм';
        nextButton.onclick = () => window.location.href = '../../modules/magic-letter-a/games-rule-4.html';
    } else {
        nextButton.textContent = 'Следующий уровень';
        nextButton.onclick = nextLevel;
    }
    
    overlay.style.display = 'flex';
}

// Закрыть окно результатов
function closeResult() {
    document.getElementById('resultOverlay').style.display = 'none';
}

// Возврат в меню уровней
function backToMenu() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('levelSelect').style.display = 'block';
    closeResult();
}

// Повторить уровень
function retryLevel() {
    closeResult();
    startLevel(currentLevel + 1);
}

// Следующий уровень
function nextLevel() {
    closeResult();
    if (currentLevel < 2) {
        startLevel(currentLevel + 2);
    } else {
        window.location.href = '../../modules/magic-letter-a/games-rule-4.html';
    }
}

// Вспомогательные функции
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    console.log('Игра "Найди слово" с AR инициализируется...');
    
    loadGameData();
    
    document.getElementById('soundButton').addEventListener('click', playWordSound);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    
    document.getElementById('resultOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeResult();
        }
    });
    
    // Предзагрузка звуков
    const correctSound = new Audio("../../assets/audio/sounds/correct.mp3");
    const wrongSound = new Audio("../../assets/audio/sounds/wrong.mp3");
    const applauseSound = new Audio("../../assets/audio/sounds/applause.mp3");
    
    correctSound.preload = 'auto';
    wrongSound.preload = 'auto';
    applauseSound.preload = 'auto';
    
    console.log('Игра "Найди слово" с AR готова к работе');
});
// Глобальные переменные игры "Найди слово"
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

// Загрузка данных игры
async function loadGameData() {
    try {
        console.log('Загружаем данные для игры "Найди слово"...');
        const response = await fetch('../../data/a-words-data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        gameData = await response.json();
        console.log('Данные игры успешно загружены:', gameData);
        
    } catch (error) {
        console.error('Ошибка загрузки данных игры:', error);
        gameData = getFallbackData();
        console.log('Используем резервные данные');
    }
}

// Резервные данные (взять из первой игры)
function getFallbackData() {
    return {
        levels: [
            {
                name: "-at, -ad",
                words: [
                    {word: "RAT", lowercase: "rat", image: "../../assets/images/words/rat.png", variants: ["rat", "cat", "bat", "hat"]},
                    {word: "MAT", lowercase: "mat", image: "../../assets/images/words/mat.png", variants: ["mat", "hat", "cat", "rat"]},
                    {word: "HAT", lowercase: "hat", image: "../../assets/images/words/hat.png", variants: ["hat", "rat", "bat", "mat"]},
                    {word: "FAT", lowercase: "fat", image: "../../assets/images/words/fat.png", variants: ["fat", "cat", "rat", "hat"]},
                    {word: "CAT", lowercase: "cat", image: "../../assets/images/words/cat.png", variants: ["cat", "hat", "bat", "rat"]},
                    {word: "BAT", lowercase: "bat", image: "../../assets/images/words/bat.png", variants: ["bat", "rat", "cat", "mat"]},
                    {word: "DAD", lowercase: "dad", image: "../../assets/images/words/dad.png", variants: ["dad", "bad", "sad", "glad"]},
                    {word: "BAD", lowercase: "bad", image: "../../assets/images/words/bad.png", variants: ["bad", "dad", "sad", "glad"]},
                    {word: "SAD", lowercase: "sad", image: "../../assets/images/words/sad.png", variants: ["sad", "bad", "dad", "glad"]},
                    {word: "GLAD", lowercase: "glad", image: "../../assets/images/words/glad.png", variants: ["glad", "sad", "bad", "dad"]}
                ]
            },
            {
                name: "+ -ag, -ab", 
                words: [
                    {word: "BAG", lowercase: "bag", image: "../../assets/images/words/bag.png", variants: ["bag", "rag", "tag", "wag"]},
                    {word: "MAG", lowercase: "mag", image: "../../assets/images/words/mag.png", variants: ["mag", "bag", "rag", "tag"]},
                    {word: "FLAG", lowercase: "flag", image: "../../assets/images/words/flag.png", variants: ["flag", "bag", "rag", "drag"]},
                    {word: "CRAB", lowercase: "crab", image: "../../assets/images/words/crab.png", variants: ["crab", "grab", "drab", "stab"]},
                    {word: "CAB", lowercase: "cab", image: "../../assets/images/words/cab.png", variants: ["cab", "tab", "lab", "grab"]}
                ]
            },
            {
                name: "+ -an, -and",
                words: [
                    {word: "PAN", lowercase: "pan", image: "../../assets/images/words/pan.png", variants: ["pan", "can", "man", "fan"]},
                    {word: "HAND", lowercase: "hand", image: "../../assets/images/words/hand.png", variants: ["hand", "land", "sand", "band"]},
                    {word: "LAND", lowercase: "land", image: "../../assets/images/words/land.png", variants: ["land", "sand", "hand", "band"]},
                    {word: "SAND", lowercase: "sand", image: "../../assets/images/words/sand.png", variants: ["sand", "hand", "land", "band"]}
                ]
            },
            {
                name: "+ -am, -ck", 
                words: [
                    {word: "HAM", lowercase: "ham", image: "../../assets/images/words/ham.png", variants: ["ham", "jam", "ram", "dam"]},
                    {word: "JAM", lowercase: "jam", image: "../../assets/images/words/jam.png", variants: ["jam", "ham", "ram", "dam"]},
                    {word: "LAMP", lowercase: "lamp", image: "../../assets/images/words/lamp.png", variants: ["lamp", "camp", "damp", "ramp"]},
                    {word: "BLACK", lowercase: "black", image: "../../assets/images/words/black.png", variants: ["black", "back", "sack", "pack"]},
                    {word: "BACK", lowercase: "back", image: "../../assets/images/words/back.png", variants: ["back", "sack", "pack", "rack"]},
                    {word: "SNACK", lowercase: "snack", image: "../../assets/images/words/snack.png", variants: ["snack", "black", "back", "track"]}
                ]
            }
        ]
    };
}

// Функция для получения всех слов для уровня с накоплением
function getWordsForLevel(level) {
    let allWords = [];
    
    // Для уровня 5 (экзамен) берем ВСЕ слова из всех 4 уровней
    if (level === 5) {
        for (let i = 0; i < gameData.levels.length; i++) {
            // Для слов из предыдущих уровней используем lowercase
            const levelWords = gameData.levels[i].words.map(wordData => ({
                ...wordData,
                displayWord: wordData.lowercase, // Все слова в lowercase для экзамена
                isNew: false
            }));
            allWords = allWords.concat(levelWords);
        }
    } else {
        // Для обычных уровней (1-4) берем слова из всех предыдущих уровней + текущего
        for (let i = 0; i < level; i++) {
            const levelWords = gameData.levels[i].words.map(wordData => ({
                ...wordData,
                // Слова из текущего уровня - в UPPERCASE, из предыдущих - в lowercase
                displayWord: i === (level - 1) ? wordData.word : wordData.lowercase,
                isNew: i === (level - 1) // Помечаем новые слова текущего уровня
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
    
    // Получаем слова для текущего уровня с накоплением
    currentWords = getWordsForLevel(level);
    
    console.log(`Уровень ${level}: доступно ${currentWords.length} слов`);
    
    // Перемешиваем слова - ВСЕ слова будут показаны
    currentWords = shuffleArray(currentWords);
    
    // Для ВСЕХ уровней берем ВСЕ доступные слова
    totalWords = currentWords.length;
    
    // Обновляем интерфейс
    document.getElementById('levelSelect').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    if (level === 5) {
        document.getElementById('levelInfo').textContent = `Уровень 5: Тренировка-экзамен (${totalWords} слов)`;
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
        
        // Форматируем слово с выделением буквы A
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

// Форматирование слова с выделением буквы A
function formatWordWithHighlight(word) {
    let result = '';
    const wordToFormat = word.toLowerCase(); // Всегда работаем с lowercase для выделения
    
    for (let i = 0; i < wordToFormat.length; i++) {
        const char = wordToFormat[i];
        if (char === 'a') {
            result += `<span class="sound-a">${word[i] || char}</span>`;
        } else {
            result += word[i] || char;
        }
    }
    
    return result;
}

// Получение эмодзи для слова (fallback)
function getEmojiForWord(word) {
    const emojiMap = {
        'rat': '🐀', 'mat': '🧺', 'hat': '🎩', 'fat': '🐖', 'cat': '🐱', 'bat': '🦇',
        'dad': '👨', 'bad': '😠', 'sad': '😢', 'glad': '😊', 'bag': '🎒', 'mag': '📰',
        'flag': '🚩', 'crab': '🦀', 'cab': '🚕', 'pan': '🍳', 'hand': '✋', 'land': '🏝️',
        'sand': '🏖️', 'ham': '🍖', 'jam': '🍓', 'lamp': '💡', 'black': '⚫', 'back': '🔙',
        'snack': '🍪', 'rag': '🧹', 'tag': '🏷️', 'wag': '🐕', 'grab': '✊', 'drab': '🎨',
        'stab': '🗡️', 'tab': '📑', 'lab': '🔬', 'can': '🥫', 'man': '👨', 'fan': '🌀',
        'band': '🎸', 'ram': '🐏', 'dam': '🛑', 'camp': '⛺', 'damp': '💧', 'ramp': '🛹',
        'sack': '🎒', 'pack': '📦', 'rack': '🗄️', 'track': '🎯', 'drag': '🐉', 'stag': '🦌'
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
    
    // Настройка кнопки "Далее"
    if (currentLevel === 4) {
        nextButton.textContent = 'Вернуться к играм';
        nextButton.onclick = () => window.location.href = 'games-1.html';
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
    if (currentLevel < 4) {
        startLevel(currentLevel + 2);
    } else {
        window.location.href = 'games-1.html';
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
    console.log('Игра "Найди слово" инициализируется...');
    
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
    
    console.log('Игра "Найди слово" готова к работе');
});
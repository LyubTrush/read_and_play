// dictionary-core.js - универсальное ядро словаря
class DictionaryCore {
    constructor(config = {}) {
        this.currentGroupIndex = 0;
        this.currentWordIndex = 0;
        this.dictionaryData = null;
        this.currentViewMode = 'single';
        this.audioCache = new Map(); // Кэш для аудио объектов
        this.config = {
            dataPath: '',
            highlightType: 'letter',
            highlightTarget: 'a',
            emojiMap: {},
            soundEnabled: true,
            audioBasePath: '../../assets/audio/words', // Базовый путь к аудио
            ...config
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.init();
    }

    init() {
        console.log('Инициализация словаря...');
        this.setupGlobalFunctions();
    }

    setupGlobalFunctions() {
        window.playWordSound = (word) => this.playWordSound(word);
        window.nextWord = () => this.nextWord();
        window.prevWord = () => this.prevWord();
        window.setViewMode = (mode) => this.setViewMode(mode);
        window.switchGroup = (index) => this.switchGroup(index);
    }

    async loadDictionaryData() {
        try {
            console.log(`Загружаем данные словаря из: ${this.config.dataPath}`);
            
            const response = await fetch(this.config.dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.dictionaryData = await response.json();
            console.log('Данные словаря успешно загружены:', this.dictionaryData);
            
            // Предзагрузка аудио для первой группы
            this.preloadAudioForGroup(0);
            
            this.createGroupsNavigation();
            this.showCurrentGroup();
            this.setupKeyboardNavigation();
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.createFallbackData();
        }
    }

    // Предзагрузка аудио для группы
    async preloadAudioForGroup(groupIndex) {
        if (!this.dictionaryData?.levels[groupIndex]) return;
        
        const group = this.dictionaryData.levels[groupIndex];
        console.log(`Предзагрузка аудио для группы: ${group.name}`);
        
        for (const wordData of group.words) {
            const audioPath = this.getAudioPath(wordData.lowercase);
            await this.preloadAudio(wordData.lowercase, audioPath);
        }
    }

    // Предзагрузка одного аудиофайла
    async preloadAudio(word, audioPath) {
        return new Promise((resolve) => {
            if (this.audioCache.has(word)) {
                resolve();
                return;
            }

            const audio = new Audio();
            audio.preload = 'auto';
            
            audio.addEventListener('canplaythrough', () => {
                console.log(`Аудио загружено: ${word}`);
                this.audioCache.set(word, audio);
                resolve();
            });

            audio.addEventListener('error', (e) => {
                console.warn(`Ошибка загрузки аудио ${word}:`, audioPath, e);
                // Создаем пустой аудио объект для избежания повторных попыток
                this.audioCache.set(word, null);
                resolve();
            });

            audio.src = audioPath;
        });
    }

    // НОВЫЙ МЕТОД: Получение правильного пути к аудио
    getAudioPath(word) {
        // Проверяем, находимся ли мы на GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isGitHubPages) {
            // Для GitHub Pages
            const repoName = 'read_and_play'; 
            return `/${repoName}/assets/audio/words/${word}.mp3`;
        } else {
            // Для локальной разработки
            const isInPagesFolder = window.location.pathname.includes('/pages/');
            const basePath = isInPagesFolder 
                ? '../../assets/audio/words'
                : '../assets/audio/words';
            return `${basePath}/${word}.mp3`;
        }
    }

    createFallbackData() {
        console.log('Создаем fallback данные...');
        this.dictionaryData = {
            levels: [{
                name: "Основные слова",
                words: Object.keys(this.config.emojiMap).map(word => ({
                    word: word.charAt(0).toUpperCase() + word.slice(1),
                    lowercase: word,
                    translation: "перевод",
                    transcription: "/transcription/",
                    image: this.createWordImage(word)
                }))
            }]
        };
        
        this.createGroupsNavigation();
        this.showCurrentGroup();
        console.log('Fallback данные созданы');
    }

    // НОВЫЙ МЕТОД: Получение правильного пути к картинке
    getImagePath(word) {
        // Проверяем, находимся ли мы на GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isGitHubPages) {
            // Для GitHub Pages
            const repoName = 'read_and_play'; 
            return `/${repoName}/assets/images/words/${word}.png`;
        } else {
            // Для локальной разработки
            const isInPagesFolder = window.location.pathname.includes('/pages/');
            return isInPagesFolder 
                ? `../../assets/images/words/${word}.png`
                : `../assets/images/words/${word}.png`;
        }
    }

    createWordImage(word) {
        const emoji = this.getEmojiForWord(word);
        const svg = `
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#F3F4F6"/>
                <rect x="50" y="50" width="100" height="100" fill="#E1E2E3" rx="8"/>
                <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="24" fill="#666666">${emoji}</text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(event) {
        if (this.currentViewMode !== 'single') return;
        
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.prevWord();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextWord();
                break;
            case ' ':
                event.preventDefault();
                const currentGroup = this.dictionaryData.levels[this.currentGroupIndex];
                const currentWord = currentGroup.words[this.currentWordIndex];
                this.playWordSound(currentWord.lowercase);
                break;
        }
    }

    // Создание навигации по группам
    createGroupsNavigation() {
        const groupsNav = document.getElementById('groupsNavigation');
        if (!groupsNav) {
            console.warn('Элемент groupsNavigation не найден');
            return;
        }
        
        groupsNav.innerHTML = '';
        
        // ИСПРАВЛЕНИЕ: Используем реальные группы из dictionaryData
        this.dictionaryData.levels.forEach((group, index) => {
            const button = document.createElement('button');
            button.className = `group-button ${index === 0 ? 'active' : ''}`;
            button.textContent = group.name;
            button.onclick = () => this.switchGroup(index);
            groupsNav.appendChild(button);
        });
    }

    // Переключение группы
    async switchGroup(groupIndex) {
        this.currentGroupIndex = groupIndex;
        this.currentWordIndex = 0;
        
        document.querySelectorAll('.group-button').forEach((btn, index) => {
            btn.classList.toggle('active', index === groupIndex);
        });
        
        // Предзагрузка аудио для новой группы
        await this.preloadAudioForGroup(groupIndex);
        
        this.showCurrentGroup();
    }

    // Показать текущую группу
    showCurrentGroup() {
        if (!this.dictionaryData?.levels[this.currentGroupIndex]) {
            console.error('Данные не загружены или группа не найдена');
            return;
        }

        const currentGroup = this.dictionaryData.levels[this.currentGroupIndex];
        console.log('Показываем группу:', currentGroup.name, 'слов:', currentGroup.words.length);
        
        if (this.currentViewMode === 'single') {
            this.showSingleCardView(currentGroup);
        } else {
            this.showAllCardsView(currentGroup);
        }
    }

    // Режим одной карточки
    showSingleCardView(currentGroup) {
        const singleView = document.getElementById('singleCardView');
        const allView = document.getElementById('allCardsView');
        
        if (!singleView || !allView) {
            console.error('Элементы view не найдены');
            return;
        }
        
        singleView.style.display = 'flex';
        allView.style.display = 'none';
        
        this.showCurrentWord(currentGroup);
    }

    // Режим всех карточек
    showAllCardsView(currentGroup) {
        const singleView = document.getElementById('singleCardView');
        const allView = document.getElementById('allCardsView');
        const wordsGrid = document.getElementById('wordsGrid');
        
        if (!singleView || !allView || !wordsGrid) {
            console.error('Элементы view не найдены');
            return;
        }
        
        singleView.style.display = 'none';
        allView.style.display = 'flex';
        wordsGrid.innerHTML = '';
        
        // Создаем карточки для всех слов в текущей группе
        currentGroup.words.forEach(wordData => {
            const wordCard = this.createWordCard(wordData, 'grid');
            wordsGrid.appendChild(wordCard);
        });
        
        console.log(`Показано ${currentGroup.words.length} слов в режиме сетки`);
    }

    // Показать текущее слово
    showCurrentWord(currentGroup) {
        const wordDisplay = document.getElementById('currentWordDisplay');
        if (!wordDisplay) return;
        
        if (this.currentWordIndex >= currentGroup.words.length) {
            this.currentWordIndex = 0;
        }
        
        const wordData = currentGroup.words[this.currentWordIndex];
        console.log('Показываем слово:', wordData.word, 'из группы:', currentGroup.name);
        
        const wordCard = this.createWordCard(wordData, 'single');
        
        wordDisplay.innerHTML = '';
        wordDisplay.appendChild(wordCard);
    }

    // Создание карточки слова
    createWordCard(wordData, mode = 'single') {
        const card = document.createElement('div');
        card.className = mode === 'single' ? 'word-card-single' : 'word-card-grid';
        
        const formattedWord = this.formatWordWithHighlight(wordData.word);
        const emoji = this.getEmojiForWord(wordData.lowercase);
        
        // Используем динамический путь к картинке
        const imagePath = this.getImagePath(wordData.lowercase);
        
        card.innerHTML = `
            <div class="word-image">
                <img src="${imagePath}" alt="${wordData.lowercase}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="fallback-emoji" style="display: none;">${emoji}</div>
            </div>
            
            <div class="word-english">${formattedWord}</div>
            <div class="word-transcription">${wordData.transcription || '/transcription/'}</div>
            <div class="word-russian">${wordData.translation || 'перевод'}</div>
            
            <button class="sound-button" onclick="playWordSound('${wordData.lowercase}')">
                🔊 Прослушать
            </button>
        `;
        
        return card;
    }

    // Остальные методы без изменений
    formatWordWithHighlight(word) {
        const wordLower = word.toLowerCase();
        
        switch(this.config.highlightType) {
            case 'combination':
                return this.highlightCombination(word, wordLower);
            case 'magic-e':
                return this.highlightMagicE(word, wordLower);
            case 'letter':
            default:
                return this.highlightLetter(word, wordLower);
        }
    }

    highlightLetter(word, wordLower) {
        let result = '';
        const target = this.config.highlightTarget.toLowerCase();
        
        for (let i = 0; i < wordLower.length; i++) {
            const char = wordLower[i];
            if (char === target) {
                result += `<span class="sound-a">${word[i] || char}</span>`;
            } else {
                result += word[i] || char;
            }
        }
        return result;
    }

    highlightCombination(word, wordLower) {
        const target = this.config.highlightTarget.toLowerCase();
        const index = wordLower.indexOf(target);
        
        if (index !== -1) {
            return word.substring(0, index) + 
                   `<span class="sound-a">${word.substring(index, index + target.length)}</span>` +
                   word.substring(index + target.length);
        }
        return word;
    }

    highlightMagicE(word, wordLower) {
        if (wordLower.endsWith('e') && wordLower.length > 2) {
            const base = wordLower.slice(0, -1);
            const vowelIndex = base.length - 2;
            
            if (vowelIndex >= 0) {
                const beforeVowel = word.substring(0, vowelIndex);
                const vowel = word.substring(vowelIndex, vowelIndex + 1);
                const afterVowel = word.substring(vowelIndex + 1, word.length - 1);
                const finalE = word.substring(word.length - 1);
                
                return beforeVowel + 
                       `<span class="sound-a">${vowel}</span>` +
                       afterVowel +
                       `<span class="sound-e">${finalE}</span>`;
            }
        }
        return word;
    }

    setViewMode(mode) {
        this.currentViewMode = mode;
        
        document.querySelectorAll('.view-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[onclick="setViewMode('${mode}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        if (mode === 'single') {
            this.currentWordIndex = 0;
        }
        
        this.showCurrentGroup();
    }

    nextWord() {
        if (this.currentViewMode !== 'single') return;
        
        const currentGroup = this.dictionaryData.levels[this.currentGroupIndex];
        this.currentWordIndex = (this.currentWordIndex + 1) % currentGroup.words.length;
        this.showCurrentWord(currentGroup);
    }

    prevWord() {
        if (this.currentViewMode !== 'single') return;
        
        const currentGroup = this.dictionaryData.levels[this.currentGroupIndex];
        this.currentWordIndex = this.currentWordIndex === 0 ? 
            currentGroup.words.length - 1 : this.currentWordIndex - 1;
        this.showCurrentWord(currentGroup);
    }

    // ОБНОВЛЕННЫЙ МЕТОД: Воспроизведение звука из файлов
    playWordSound(word) {
        if (!this.config.soundEnabled) return;
        
        console.log(`Воспроизводим звук: ${word}`);
        
        // Останавливаем текущее воспроизведение
        this.stopCurrentAudio();
        
        // Проверяем кэш
        if (this.audioCache.has(word)) {
            const audio = this.audioCache.get(word);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => {
                    console.warn(`Ошибка воспроизведения аудио ${word}:`, e);
                    this.fallbackToTTS(word);
                });
            } else {
                this.fallbackToTTS(word);
            }
        } else {
            // Пытаемся загрузить и воспроизвести
            this.loadAndPlayAudio(word);
        }
    }

    // Загрузка и воспроизведение аудио
    async loadAndPlayAudio(word) {
        const audioPath = this.getAudioPath(word);
        const audio = new Audio();
        
        try {
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve);
                audio.addEventListener('error', reject);
                audio.src = audioPath;
                
                // Таймаут на загрузку
                setTimeout(() => reject(new Error('Timeout')), 3000);
            });
            
            this.audioCache.set(word, audio);
            audio.play().catch(e => {
                console.warn(`Ошибка воспроизведения:`, e);
                this.fallbackToTTS(word);
            });
            
        } catch (error) {
            console.warn(`Не удалось загрузить аудио ${word}:`, error);
            this.audioCache.set(word, null);
            this.fallbackToTTS(word);
        }
    }

    // Fallback на синтез речи
    fallbackToTTS(word) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
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
        }
    }

    // Остановка текущего аудио
    stopCurrentAudio() {
        this.audioCache.forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }

    getEmojiForWord(word) {
        return this.config.emojiMap[word] || '📖';
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.stopCurrentAudio();
        this.audioCache.clear();
    }
}

window.DictionaryCore = DictionaryCore;
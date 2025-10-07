// dictionary-core.js - универсальное ядро словаря
class DictionaryCore {
    constructor(config = {}) {
        this.currentGroupIndex = 0;
        this.currentWordIndex = 0;
        this.dictionaryData = null;
        this.currentViewMode = 'single';
        this.config = {
            dataPath: '',
            imageBasePath: '../../assets/images/words', // новый параметр
            highlightType: 'letter',
            highlightTarget: 'a',
            emojiMap: {},
            soundEnabled: true,
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
            console.log('Данные словаря успешно загружены');
            
            this.createGroupsNavigation();
            this.showCurrentGroup();
            this.setupKeyboardNavigation();
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.createFallbackData();
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

    // Создание карточки слова
    createWordCard(wordData, mode = 'single') {
        const card = document.createElement('div');
        card.className = mode === 'single' ? 'word-card-single' : 'word-card-grid';
        
        const formattedWord = this.formatWordWithHighlight(wordData.word);
        const emoji = this.getEmojiForWord(wordData.lowercase);
        // ИСПОЛЬЗУЕМ imageBasePath из конфига
        const imagePath = `${this.config.imageBasePath}/${wordData.lowercase}.png`;
        
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
                Прослушать
            </button>
        `;
        
        return card;
    }

    // Остальные методы остаются без изменений
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
        }
    }

    createGroupsNavigation() {
        const groupsNav = document.getElementById('groupsNavigation');
        if (!groupsNav) {
            console.warn('Элемент groupsNavigation не найден');
            return;
        }
        
        groupsNav.innerHTML = '';
        
        this.dictionaryData.levels.forEach((group, index) => {
            const button = document.createElement('button');
            button.className = `group-button ${index === 0 ? 'active' : ''}`;
            button.textContent = group.name;
            button.onclick = () => this.switchGroup(index);
            groupsNav.appendChild(button);
        });
    }

    switchGroup(groupIndex) {
        this.currentGroupIndex = groupIndex;
        this.currentWordIndex = 0;
        
        document.querySelectorAll('.group-button').forEach((btn, index) => {
            btn.classList.toggle('active', index === groupIndex);
        });
        
        this.showCurrentGroup();
    }

    showCurrentGroup() {
        if (!this.dictionaryData?.levels[this.currentGroupIndex]) {
            console.error('Данные не загружены или группа не найдена');
            return;
        }

        const currentGroup = this.dictionaryData.levels[this.currentGroupIndex];
        
        if (this.currentViewMode === 'single') {
            this.showSingleCardView(currentGroup);
        } else {
            this.showAllCardsView(currentGroup);
        }
    }

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
        
        currentGroup.words.forEach(wordData => {
            const wordCard = this.createWordCard(wordData, 'grid');
            wordsGrid.appendChild(wordCard);
        });
    }

    showCurrentWord(currentGroup) {
        const wordDisplay = document.getElementById('currentWordDisplay');
        if (!wordDisplay) return;
        
        if (this.currentWordIndex >= currentGroup.words.length) {
            this.currentWordIndex = 0;
        }
        
        const wordData = currentGroup.words[this.currentWordIndex];
        const wordCard = this.createWordCard(wordData, 'single');
        
        wordDisplay.innerHTML = '';
        wordDisplay.appendChild(wordCard);
    }

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

    playWordSound(word) {
        if (!this.config.soundEnabled) return;
        
        console.log(`Воспроизводим звук: ${word}`);
        
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

    getEmojiForWord(word) {
        return this.config.emojiMap[word] || '📖';
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }
}

window.DictionaryCore = DictionaryCore;
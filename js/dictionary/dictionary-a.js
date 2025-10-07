// a-words.js - конфигурация для A слов
document.addEventListener('DOMContentLoaded', function() {
    // Определяем правильный путь в зависимости от окружения
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = 'english-for-kids'; // замените на имя вашего репозитория
    
    let dataPath, imageBasePath;
    
    if (isGitHubPages) {
        // Для GitHub Pages
        dataPath = `/${repoName}/data/a-words-data.json`;
        imageBasePath = `/${repoName}/assets/images/words`;
    } else {
        // Для локальной разработки
        dataPath = '../../data/a-words-data.json';
        imageBasePath = '../../assets/images/words';
    }
    
    window.dictionaryCore = new DictionaryCore({
        dataPath: dataPath,
        imageBasePath: imageBasePath,
        highlightType: 'letter',
        highlightTarget: 'a',
        emojiMap: {
            'rat': '🐀', 'mat': '🧺', 'hat': '🎩', 'fat': '🐖', 'cat': '🐱', 'bat': '🦇',
            'dad': '👨', 'bad': '😠', 'sad': '😢', 'glad': '😊', 'bag': '🎒', 'mag': '📰',
            'flag': '🚩', 'crab': '🦀', 'cab': '🚕', 'pan': '🍳', 'hand': '✋', 'land': '🏝️',
            'sand': '🏖️', 'ham': '🍖', 'jam': '🍓', 'lamp': '💡', 'black': '⚫', 'back': '🔙',
            'snack': '🍪'
        }
    });
    
    window.dictionaryCore.loadDictionaryData();
    console.log('Словарь A готов к работе');
});
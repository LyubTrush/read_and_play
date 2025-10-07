// a-words.js - конфигурация для A слов
document.addEventListener('DOMContentLoaded', function() {
    // Определяем правильный путь к JSON
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = 'read_and_play'; 
    
    const dataPath = isGitHubPages 
        ? `/${repoName}/data/a-words-data.json`
        : '../../data/a-words-data.json';
    
    window.dictionaryCore = new DictionaryCore({
        dataPath: dataPath,
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
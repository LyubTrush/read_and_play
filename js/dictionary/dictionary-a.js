// a-words.js - конфигурация для A слов
document.addEventListener('DOMContentLoaded', function() {
    window.dictionaryCore = new DictionaryCore({
        dataPath: '../../data/a-words-data.json',
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
// dictionary-a-e.js - конфигурация для Magic E слов
document.addEventListener('DOMContentLoaded', function() {
    // Определяем правильный путь к JSON
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = 'read_and_play'; // имя вашего репозитория
    
    const dataPath = isGitHubPages 
        ? `/${repoName}/data/a-e-words-data.json`
        : '../../data/a-words-data.json';
    
    window.dictionaryCore = new DictionaryCore({
        dataPath: dataPath,
        highlightType: 'magic-e',
        emojiMap: {
            'cake': '🍰', 'lake': '🌊', 'snake': '🐍', 'rake': '🍂', 
            'bake': '🍞', 'wake': '⏰', 'name': '📛', 'game': '🎮',
            'flame': '🔥', 'plane': '✈️', 'crane': '🐦', 'grape': '🍇',
            'cape': '🧥', 'tape': '📼', 'shape': '🔷', 'gate': '🚪',
            'plate': '🍽️', 'skate': '⛸️', 'date': '📅', 'wave': '👋',
            'cave': '🕳️', 'save': '💾', 'face': '😀', 'lace': '👟',
            'race': '🏁', 'space': '🚀', 'bone': '🦴', 'stone': '🪨',
            'home': '🏠', 'rose': '🌹', 'nose': '👃', 'hose': '🚒'
        }
    });
    
    window.dictionaryCore.loadDictionaryData();
    console.log('Словарь Magic E готов к работе');
});
// dictionary-ar.js - конфигурация для AR слов
document.addEventListener('DOMContentLoaded', function() {
    // Определяем правильный путь к JSON
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = 'read_and_play'; // имя вашего репозитория
    
    const dataPath = isGitHubPages 
        ? `/${repoName}/data/ar-words-data.json`
        : '../../data/ar-words-data.json';
    
    window.dictionaryCore = new DictionaryCore({
        dataPath: dataPath,
        highlightType: 'combination',
        highlightTarget: 'ar',
        emojiMap: {
            'car': '🚗', 'star': '⭐', 'far': '↔️', 'jar': '🫙',
            'park': '🏞️', 'dark': '🌑', 'shark': '🦈', 'card': '🃏',
            'hard': '💪', 'farm': '🚜', 'arm': '💪', 'art': '🎨',
            'part': '🔧', 'bark': '🐕', 'yard': '🏡', 'chart': '📊',
            'start': '🚀', 'smart': '🧠', 'march': '🎵', 'starch': '🌽'
        }
    });
    
    window.dictionaryCore.loadDictionaryData();
    console.log('Словарь AR готов к работе');
});
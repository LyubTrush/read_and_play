// a-words.js - конфигурация для A слов
document.addEventListener('DOMContentLoaded', function() {
    window.dictionaryCore = new DictionaryCore({
        dataPath: '../../data/a-words-data.json',
        highlightType: 'letter',
        highlightTarget: 'a',
    });
    
    window.dictionaryCore.loadDictionaryData();
    console.log('Словарь A готов к работе');
});
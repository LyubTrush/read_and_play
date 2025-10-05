// learning-script.js

let currentPage = 1;
const totalPages = 7;
let isRecording = false;

// Аудио файлы (пути)
const audioFiles = {
    'sound-ae': 'assets/audio/sounds/ae-sound.mp3',
    'sound-cat': 'assets/audio/words/cat.mp3',
    'sound-man': 'assets/audio/words/man.mp3',
    'correct': 'assets/audio/sounds/correct.mp3',
    'wrong': 'assets/audio/sounds/wrong.mp3',
    'applause': 'assets/audio/sounds/applause.mp3'
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    initializeMonsterGame();
});

// Навигация по страницам
function nextPage() {
    if (currentPage < totalPages) {
        document.getElementById(`page${currentPage}`).classList.remove('active');
        currentPage++;
        document.getElementById(`page${currentPage}`).classList.add('active');
        updateProgress();
        
        // Инициализация игр при переходе на страницы
        if (currentPage === 5) {
            startMonsterGame();
        } else if (currentPage === 6) {
            setupWordBuilder();
        }
    }
}

function prevPage() {
    if (currentPage > 1) {
        document.getElementById(`page${currentPage}`).classList.remove('active');
        currentPage--;
        document.getElementById(`page${currentPage}`).classList.add('active');
        updateProgress();
    }
}

function updateProgress() {
    const progress = (currentPage / totalPages) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// Воспроизведение звуков
function playSound(soundId) {
    // В реальном приложении здесь будет Audio API
    console.log(`Playing: ${audioFiles[soundId]}`);
    
    // Эмуляция звуков для демо
    const audio = new Audio();
    switch(soundId) {
        case 'correct':
            // Победный звук
            break;
        case 'wrong':
            // Звук ошибки
            break;
        default:
            // Обычный звук
    }
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Запись голоса
function toggleRecording() {
    isRecording = !isRecording;
    const recordBtn = document.querySelector('.record-btn');
    const recordText = document.getElementById('recordText');
    
    if (isRecording) {
        recordBtn.classList.add('recording');
        recordText.textContent = 'Запись...';
        // Здесь будет Web Audio API для записи
        console.log('Recording started...');
    } else {
        recordBtn.classList.remove('recording');
        recordText.textContent = 'Записать мой голос';
        console.log('Recording stopped');
    }
}

// Страница 3: Угадай слово
function checkAnswer(word, element) {
    const correctAnswer = 'cat';
    
    if (word === correctAnswer) {
        element.classList.add('correct');
        playSound('correct');
        document.getElementById('nextBtn3').disabled = false;
    } else {
        element.classList.add('wrong');
        playSound('wrong');
        setTimeout(() => {
            element.classList.remove('wrong');
        }, 1000);
    }
}

// Страница 4: Drag and Drop
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add('dragging');
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    
    if (draggedElement) {
        ev.target.appendChild(draggedElement);
        draggedElement.classList.remove('dragging');
        
        // Проверка правильности
        checkSorting();
    }
}

function checkSorting() {
    const houseRed = document.getElementById('houseRed');
    const houseBlue = document.getElementById('houseBlue');
    
    const redWords = ['CAT', 'HAT', 'PAN'];
    const blueWords = ['CAKE', 'MAKE', 'NAME'];
    
    let allCorrect = true;
    
    // Проверяем красный дом
    const redChildren = Array.from(houseRed.children).filter(child => child.classList.contains('word-card'));
    redChildren.forEach(child => {
        if (!redWords.includes(child.textContent)) {
            allCorrect = false;
        }
    });
    
    // Проверяем синий дом
    const blueChildren = Array.from(houseBlue.children).filter(child => child.classList.contains('word-card'));
    blueChildren.forEach(child => {
        if (!blueWords.includes(child.textContent)) {
            allCorrect = false;
        }
    });
    
    if (allCorrect && redChildren.length + blueChildren.length === 6) {
        document.getElementById('nextBtn4').disabled = false;
        playSound('correct');
    }
}

// Страница 5: Покорми монстра
function initializeMonsterGame() {
    // Инициализация игры с монстром
}

function startMonsterGame() {
    const monsterGame = document.getElementById('monsterGame');
    const words = ['BAG', 'CAP', 'FACE', 'MAP', 'GAME', 'RAT'];
    let correctAnswers = 0;
    const neededAnswers = 3;
    
    words.forEach((word, index) => {
        setTimeout(() => {
            createFallingWord(word, monsterGame, () => {
                const isCorrect = ['BAG', 'CAP', 'MAP', 'RAT'].includes(word);
                if (isCorrect) {
                    correctAnswers++;
                    playSound('correct');
                    if (correctAnswers >= neededAnswers) {
                        document.getElementById('nextBtn5').disabled = false;
                    }
                } else {
                    playSound('wrong');
                }
            });
        }, index * 1500);
    });
}

function createFallingWord(word, container, onClick) {
    const wordElement = document.createElement('div');
    wordElement.className = 'falling-word';
    wordElement.textContent = word;
    wordElement.style.left = Math.random() * 70 + 15 + '%';
    
    wordElement.addEventListener('click', () => {
        wordElement.remove();
        onClick();
    });
    
    container.appendChild(wordElement);
    
    // Анимация падения
    let position = -50;
    const fallInterval = setInterval(() => {
        position += 2;
        wordElement.style.top = position + 'px';
        
        if (position > 350) {
            clearInterval(fallInterval);
            wordElement.remove();
        }
    }, 50);
}

// Страница 6: Собери слово
function setupWordBuilder() {
    const slots = document.querySelectorAll('.letter-slot');
    slots.forEach(slot => {
        slot.addEventListener('dragover', allowDrop);
        slot.addEventListener('drop', dropLetter);
    });
}

function dragLetter(ev) {
    ev.dataTransfer.setData("text", ev.target.textContent);
}

function dropLetter(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    ev.target.textContent = data;
    ev.target.style.background = '#FFFFFF';
    ev.target.style.border = '2px solid #E57140';
}

function checkWord() {
    const slots = document.querySelectorAll('.letter-slot');
    const word = Array.from(slots).map(slot => slot.textContent).join('');
    
    if (word === 'MAN') {
        playSound('correct');
        document.getElementById('nextBtn6').disabled = false;
        slots.forEach(slot => {
            slot.style.background = '#E8F5E8';
        });
    } else {
        playSound('wrong');
        slots.forEach(slot => {
            if (slot.textContent) {
                slot.style.background = '#FFEBEE';
            }
        });
    }
}

// Страница 7: Завершение
function restartLearning() {
    currentPage = 1;
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('page1').classList.add('active');
    updateProgress();
    
    // Сброс всех игр
    resetGames();
}

function goToNextRule() {
    window.location.href = '../magic-letter-a/index.html'; // Возврат к списку правил
}

function resetGames() {
    // Сброс состояния всех игр
    document.getElementById('nextBtn3').disabled = true;
    document.getElementById('nextBtn4').disabled = true;
    document.getElementById('nextBtn5').disabled = true;
    document.getElementById('nextBtn6').disabled = true;
}
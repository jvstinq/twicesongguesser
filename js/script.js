import songDatabase from '../data/songDatabase.js';

document.addEventListener('DOMContentLoaded', function() {
    // Game configuration
    const config = {
        clipDuration: 10 // seconds
    };
    
    // Game state
    let gameState = {
        currentRound: 1,
        correctAnswers: 0,
        currentSong: null,
        options: [],
        isPlaying: false,
        playedSongs: []
    };
    
    // DOM elements
    const elements = {
        accuracy: document.getElementById('accuracy'),
        round: document.getElementById('round'),
        totalRounds: document.getElementById('total-rounds'),
        songClip: document.getElementById('song-clip'),
        playBtn: document.getElementById('play-btn'),
        optionsContainer: document.getElementById('options'),
        albumDisplay: document.getElementById('album-display'),
        feedback: document.getElementById('feedback')
    };
    
    // Initialize game
    function initGame() {
        elements.totalRounds.textContent = songDatabase.length;
        updateStats();
        setupRound();
    }
    
    // Set up a new round
    function setupRound() {
        // Reset UI
        elements.feedback.textContent = '';
        elements.feedback.className = 'feedback';
        elements.albumDisplay.innerHTML = '';
        elements.albumDisplay.classList.remove('show');
        elements.optionsContainer.style.marginTop = '30px';
        
        // Select a random song not played yet
        let availableSongs = songDatabase.filter(song => 
            !gameState.playedSongs.includes(song.title)
        );
        
        gameState.currentSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
        gameState.playedSongs.push(gameState.currentSong.title);
        
        // Generate options (3 wrong + correct answer)
        gameState.options = [gameState.currentSong.title];
        while (gameState.options.length < 4) {
            const randomSong = songDatabase[Math.floor(Math.random() * songDatabase.length)].title;
            if (!gameState.options.includes(randomSong)) {
                gameState.options.push(randomSong);
            }
        }
        
        // Shuffle options
        gameState.options = shuffleArray(gameState.options);
        
        // Set up audio
        elements.songClip.src = gameState.currentSong.audio;
        elements.songClip.currentTime = getRandomStartTime();
        
        // Create option buttons
        renderOptions();
    }
    
    // Render option buttons
    function renderOptions() {
        elements.optionsContainer.innerHTML = '';
        gameState.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => handleAnswer(option));
            elements.optionsContainer.appendChild(button);
        });
    }
    
    // Handle user's answer
    function handleAnswer(selectedOption) {
        const isCorrect = selectedOption === gameState.currentSong.title;
        
        if (isCorrect) {
            gameState.correctAnswers++;
            elements.feedback.textContent = 'Correct! ✔️';
            elements.feedback.className = 'feedback correct';
        } else {
            elements.feedback.textContent = `Wrong! The correct answer was ${gameState.currentSong.title}.`;
            elements.feedback.className = 'feedback incorrect';
        }
        
        updateStats();
        
        // Disable option buttons after answer
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            button.disabled = true;
        });
        
        // Show album image
        showAlbumImage();
        
        // Move to next round or end game
        setTimeout(() => {
            if (gameState.currentRound < songDatabase.length) {
                gameState.currentRound++;
                elements.round.textContent = gameState.currentRound;
                setupRound();
            } else {
                endGame();
            }
        }, 3000);
    }
    
    // Show album image
    function showAlbumImage() {
        elements.albumDisplay.innerHTML = `
            <img src="${gameState.currentSong.albumImage}" alt="${gameState.currentSong.album}">
            <div class="album-title">${gameState.currentSong.album}</div>
        `;
        elements.albumDisplay.classList.add('show');
        elements.optionsContainer.style.marginTop = '20px';
    }
    
    // Update accuracy and round stats
    function updateStats() {
        const accuracy = gameState.currentRound === 1 ? 0 : 
            Math.round((gameState.correctAnswers / (gameState.currentRound - 1)) * 100);
        elements.accuracy.textContent = `${accuracy}%`;
    }
    
    // End game
    function endGame() {
        const finalAccuracy = Math.round((gameState.correctAnswers / songDatabase.length) * 100);
        elements.feedback.innerHTML = `
            <h3>Game Over!</h3>
            <p>Your final accuracy: ${finalAccuracy}%</p>
            <p>You got ${gameState.correctAnswers} out of ${songDatabase.length} correct!</p>
            <button id="restart-btn">Play Again</button>
        `;
        
        document.getElementById('restart-btn').addEventListener('click', restartGame);
    }
    
    // Restart game
    function restartGame() {
        gameState = {
            currentRound: 1,
            correctAnswers: 0,
            currentSong: null,
            options: [],
            isPlaying: false,
            playedSongs: []
        };
        elements.round.textContent = '1';
        initGame();
    }
    
    // Helper function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Helper function to get random start time for song clip
    function getRandomStartTime() {
        return Math.floor(Math.random() * 20);
    }
    
    // Play button event listener
    elements.playBtn.addEventListener('click', function() {
        if (gameState.isPlaying) {
            elements.songClip.pause();
            elements.playBtn.textContent = 'Play Clip';
            gameState.isPlaying = false;
        } else {
            elements.songClip.currentTime = getRandomStartTime();
            elements.songClip.play();
            elements.playBtn.textContent = 'Pause Clip';
            gameState.isPlaying = true;
            
            setTimeout(() => {
                elements.songClip.pause();
                elements.playBtn.textContent = 'Play Clip';
                gameState.isPlaying = false;
            }, config.clipDuration * 1000);
        }
    });
    
    // Initialize the game
    initGame();
});
import * as THREE from 'three';
import { Song1 } from './song1.js';
import { Song2 } from './song2.js'; 
import { InGameScreen } from './ingame_screen.js';
import { showResultScreen } from './result_screen.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 10, 25); 
camera.lookAt(0, 2, 10); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0.6); 

const container = document.getElementById('canvas-container');
container.appendChild(renderer.domElement);

let gameScreen = null;
let countdownInterval = null;
let currentSongData = Song1;
let currentSongId = "song1";
let videoStarted = false; 

const videoElement = document.getElementById('bg-video');

const startUi = document.getElementById('start-ui');
const selectUi = document.getElementById('select-ui');
const ingameUi = document.getElementById('ingame-ui');
const countdownEl = document.getElementById('countdown-display');

const startBtn = document.getElementById('start-btn');
const songBtn = document.getElementById('song-hoyohoyo');
const songBtn2 = document.getElementById('song-rinne'); 
const selectBackBtn = document.getElementById('select-back-btn'); 
const playSongBtn = document.getElementById('play-song-btn'); 
const ingameBackBtn = document.getElementById('ingame-back-btn');

startBtn.addEventListener('click', () => {
    startUi.style.display = 'none';
    selectUi.style.display = 'flex';
    showSongRecord("song1"); 
});

selectBackBtn.addEventListener('click', () => {
    selectUi.style.display = 'none';
    startUi.style.display = 'flex';
});

function showSongRecord(songId) {
    currentSongId = songId;
    document.querySelectorAll('.song-node-btn').forEach(btn => btn.classList.remove('active'));
    
    const difficultyEl = document.getElementById('board-difficulty');
    const scoreEl = document.getElementById('board-score');
    const comboEl = document.getElementById('board-combo');
    const medalEl = document.getElementById('board-medal');

    if (songId === "song1") {
        songBtn.classList.add('active');
        currentSongData = Song1;
        difficultyEl.innerText = "EASY";
        difficultyEl.style.color = "#39C5BB"; 
    } else if (songId === "song2") {
        songBtn2.classList.add('active');
        currentSongData = Song2;
        difficultyEl.innerText = "MEDIUM";
        difficultyEl.style.color = "#ffaa00"; 
    }

    // 🌟 영구 저장이 아닌, 브라우저 세션 중복을 초기화하는 sessionStorage 사용
    const savedData = sessionStorage.getItem(`HighScore_${songId}`);
    if (savedData) {
        const data = JSON.parse(savedData);
        scoreEl.innerText = String(data.score).padStart(6, '0');
        comboEl.innerText = data.maxCombo;
        
        medalEl.style.display = "block";
        medalEl.innerText = data.medal;
        
        if (data.medal === "ALL PERFECT!!") {
            medalEl.style.color = "#ffaa00";
            medalEl.style.border = "2px solid #ffaa00";
        } else if (data.medal === "FULL COMBO") {
            medalEl.style.color = "#39C5BB";
            medalEl.style.border = "2px solid #39C5BB";
        } else {
            medalEl.style.color = "#ffffff";
            medalEl.style.border = "2px solid #ffffff";
        }
    } else {
        scoreEl.innerText = "000,000";
        comboEl.innerText = "0";
        medalEl.style.display = "block";
        medalEl.innerText = "NO RECORD";
        medalEl.style.color = "#666";
        medalEl.style.border = "2px solid #444";
    }
}

songBtn.addEventListener('click', () => showSongRecord("song1"));
songBtn2.addEventListener('click', () => showSongRecord("song2"));

playSongBtn.addEventListener('click', () => {
    executeGamePlay(currentSongData, currentSongId);
});

async function executeGamePlay(songData, songId) {
    selectUi.style.display = 'none';
    
    // 🌟 인게임 화면 입장 시, 이전 게임의 기록 UI 흔적들을 남김없이 리셋
    document.getElementById('hp-fill').style.width = '100%';
    document.getElementById('hp-text').innerText = '100';
    document.getElementById('score-display').innerText = '000000';
    document.getElementById('combo-container').style.display = 'none';
    document.getElementById('combo-display').innerText = '0';
    document.getElementById('judge-text').innerText = '';

    videoElement.src = songData.audioFile;
    videoElement.style.display = 'block';
    videoElement.currentTime = 0;
    videoElement.muted = false; 
    videoStarted = false; 
    
    await songData.loadAudio(videoElement);

    gameScreen = new InGameScreen(scene, camera, songData);
    gameScreen.onGameOver = (stats) => endGameAndShowResult(stats, songId);
    gameScreen.onClear = (stats) => endGameAndShowResult(stats, songId);
    
    ingameUi.style.display = 'block';
    countdownEl.style.display = 'block';
    
    gameScreen.start(3);

    let count = 3;
    countdownEl.innerText = count;

    countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.innerText = count;
        } else if (count === 0) {
            countdownEl.innerText = 'START!';
        } else {
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdownEl.style.display = 'none';
        }
    }, 1000);
}

ingameBackBtn.addEventListener('click', () => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        countdownEl.style.display = 'none';
    }
    if (gameScreen) {
        gameScreen.isPlaying = false;
        gameScreen.cleanup();
        gameScreen = null;
    }
    stopVideo();
    ingameUi.style.display = 'none';
    backToSelect();
});

function stopVideo() {
    videoElement.pause();
    videoElement.style.display = 'none';
}

function endGameAndShowResult(stats, songId) {
    stopVideo();
    ingameUi.style.display = 'none';
    showResultScreen(stats, songId, backToSelect);
    
    if (gameScreen) {
        gameScreen.cleanup();
        gameScreen = null;
    }
}

function backToSelect() {
    selectUi.style.display = 'flex';
    showSongRecord(currentSongId); 
}

function animate() {
    requestAnimationFrame(animate);
    if (gameScreen) {
        gameScreen.update();
        
        if (!videoStarted && gameScreen.getCurrentTime() >= 0) {
            videoElement.play();
            videoStarted = true;
        }
    }
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

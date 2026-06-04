import * as THREE from 'three';
import { Song1 } from './song1.js';
import { InGameScreen } from './ingame_screen.js';
import { showResultScreen } from './result_screen.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

// 카메라 위치를 약간 더 위로 올려서 채보가 입체적으로 잘 보이게 세팅
camera.position.set(0, 10, 25); 
camera.lookAt(0, 2, 10); 

// alpha: true를 주어 비디오가 투과되게 하되, 
// 비디오가 너무 밝으면 채보가 안 보이므로 검은색 반투명(0.6) 필터를 깔아줍니다.
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0.6); 

// 캔버스를 전용 컨테이너에 확실하게 넣어줌 (Z-index 꼬임 방지)
const container = document.getElementById('canvas-container');
container.appendChild(renderer.domElement);

let gameScreen = null;
const videoElement = document.getElementById('bg-video');

const startUi = document.getElementById('start-ui');
const selectUi = document.getElementById('select-ui');
const ingameUi = document.getElementById('ingame-ui');

const startBtn = document.getElementById('start-btn');
const songBtn = document.getElementById('song-hoyohoyo');
const ingameBackBtn = document.getElementById('ingame-back-btn');

startBtn.addEventListener('click', () => {
    startUi.style.display = 'none';
    selectUi.style.display = 'flex';
});

songBtn.addEventListener('click', async () => {
    selectUi.style.display = 'none';
    
    document.getElementById('hp-fill').style.width = '100%';
    document.getElementById('score-display').innerText = '000000';
    document.getElementById('combo-container').style.display = 'none';
    document.getElementById('judge-text').innerText = '';

    videoElement.style.display = 'block';
    videoElement.currentTime = 0;
    videoElement.muted = false; 
    
    await Song1.loadAudio(videoElement);

    gameScreen = new InGameScreen(scene, camera, Song1);
    gameScreen.onGameOver = (stats) => endGameAndShowResult(stats);
    gameScreen.onClear = (stats) => endGameAndShowResult(stats);
    
    videoElement.play();
    gameScreen.start();
});

ingameBackBtn.addEventListener('click', () => {
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

function endGameAndShowResult(stats) {
    stopVideo();
    ingameUi.style.display = 'none';
    showResultScreen(stats, backToSelect);
    
    if (gameScreen) {
        gameScreen.cleanup();
        gameScreen = null;
    }
}

function backToSelect() {
    selectUi.style.display = 'flex';
}

function animate() {
    requestAnimationFrame(animate);
    if (gameScreen) gameScreen.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
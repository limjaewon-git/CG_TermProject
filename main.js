import * as THREE from 'three';
import { initStartScreen } from './start_screen.js';
import { YonseiLoveYou } from './yonsei_loveyou.js';
import { InGameScreen } from './ingame_screen.js';
import { showResultScreen } from './result_screen.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 25); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let startGroup = initStartScreen(scene);
let gameScreen = null;
let currentAudio = null;

const startBtn = document.getElementById('start-btn');
const songSelect = document.getElementById('song-select');
const yonseiBtn = document.getElementById('song-yonsei');
const ingameBackBtn = document.getElementById('ingame-back-btn');

// 1. 시작 버튼 클릭 -> 3D 로고 즉시 지우고 노래 선택 화면으로
startBtn.addEventListener('click', () => {
    document.getElementById('start-ui').style.display = 'none';
    scene.remove(startGroup); // AKARHYTHM 3D 로고 제거
    songSelect.style.display = 'flex';
});

// 2. 노래 선택 -> 게임 시작
yonseiBtn.addEventListener('click', async () => {
    songSelect.style.display = 'none';
    
    // UI 초기화 (HP바 리셋, 점수 리셋)
    document.getElementById('hp-fill').style.width = '100%';
    document.getElementById('score-display').innerText = '000000';
    document.getElementById('combo-container').style.display = 'none';
    document.getElementById('judge-text').innerText = '';

    currentAudio = await YonseiLoveYou.loadAudio(camera);
    gameScreen = new InGameScreen(scene, camera, YonseiLoveYou);
    
    // 게임 종료 이벤트 콜백
    gameScreen.onGameOver = (stats) => {
        endGameAndShowResult(stats);
    };

    // 곡 클리어 이벤트 콜백
    gameScreen.onClear = (stats) => {
        endGameAndShowResult(stats);
    };
    
    currentAudio.play();
    gameScreen.start();
});

// 3. 인게임 뒤로가기 버튼 클릭 (게임 포기)
ingameBackBtn.addEventListener('click', () => {
    if (gameScreen) {
        gameScreen.isPlaying = false;
        gameScreen.cleanup();
        gameScreen = null;
    }
    if (currentAudio) currentAudio.stop();
    document.getElementById('ingame-ui').style.display = 'none';
    backToSelect();
});

// 게임을 정리하고 결과창을 보여주는 함수
function endGameAndShowResult(stats) {
    if (currentAudio) currentAudio.stop();
    document.getElementById('ingame-ui').style.display = 'none';
    showResultScreen(stats, backToSelect);
    
    if (gameScreen) {
        gameScreen.cleanup();
        gameScreen = null;
    }
}

// 노래 선택창으로 돌아가는 함수
function backToSelect() {
    songSelect.style.display = 'flex';
}

function animate() {
    requestAnimationFrame(animate);
    if (startGroup && startGroup.userData.logo && startGroup.parent === scene) {
        startGroup.userData.logo.position.y = 5 + Math.sin(Date.now() * 0.002) * 0.5;
    }
    if (gameScreen) {
        gameScreen.update();
    }
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
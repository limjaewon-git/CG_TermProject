import * as THREE from 'three';

export const YonseiLoveYou = {
    title: "연세여 사랑한다",
    bpm: 120, 
    audioFile: "./yonsei_loveyou.mp3",
    notes: [], 
    
    loadAudio: function(camera) {
        const listener = new THREE.AudioListener();
        camera.add(listener);
        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        
        return new Promise((resolve) => {
            audioLoader.load(this.audioFile, (buffer) => {
                sound.setBuffer(buffer);
                sound.setVolume(0.8);
                resolve(sound);
            });
        });
    }
};

function generateDynamicBeatmap() {
    const generatedNotes = [];
    // 0~2분(120초) 구간 채보 알고리즘
    let time = 2.0;
    
    // 1. 도입부 (2~20초): 리듬 강조
    for (let i = 0; i < 20; i++) {
        generatedNotes.push({ time: time, lane: (i % 8) }); 
        time += 0.8;
    }

    // 2. 1절 (20~60초): 가사 리듬에 맞춘 패턴 (동시 치기 포함)
    for (let i = 0; i < 60; i++) {
        // 비트 강세에 따른 엇박 패턴
        if (i % 8 === 0) {
            generatedNotes.push({ time: time, lane: 0 }, { time: time, lane: 7 }); // 동시 입력
        } else if (i % 4 === 0) {
            generatedNotes.push({ time: time, lane: 2 }, { time: time, lane: 5 });
        } else {
            generatedNotes.push({ time: time, lane: Math.floor(Math.random() * 8) });
        }
        time += 0.6;
    }

    // 3. 하이라이트 (60~100초): 고차원 패턴 (폭포수 패턴)
    for (let i = 0; i < 80; i++) {
        // 좌우 대칭 폭포수 패턴
        generatedNotes.push({ time: time, lane: (i % 4) });
        generatedNotes.push({ time: time + 0.2, lane: (7 - (i % 4)) });
        time += 0.5;
    }

    // 4. 마무리 (100~120초): 리타르단도(점점 느려짐) 느낌의 마무리
    for (let i = 0; i < 10; i++) {
        generatedNotes.push({ time: time, lane: 3 }, { time: time, lane: 4 });
        time += 1.5;
    }

    return generatedNotes;
}
YonseiLoveYou.notes = generateDynamicBeatmap();
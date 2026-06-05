import * as THREE from 'three';

export const Song2 = {
    title: "いますぐ輪廻",
    bpm: 145, 
    audioFile: "./いますぐ輪廻.mp4", 
    notes: [], 
    
    loadAudio: function(videoElement) {
         return new Promise((resolve) => {
             if (videoElement.readyState >= 3) {
                 resolve(videoElement);
             } else {
                 videoElement.load();
                 videoElement.oncanplaythrough = () => {
                     resolve(videoElement);
                 };
             }
         });
    }
};

function generateRinneBeatmap() {
    const generatedNotes = [];
    
    // 145 BPM 기준 1박자는 약 0.4138초
    const beat = 60 / 145;        
    const halfBeat = beat / 2;    
    
    let time = 0.5;

    // 1. 도입부 (총 64박자 / 약 26.5초) : 가벼운 하단 단노트 위주
    for (let i = 0; i < 64; i++) {
        generatedNotes.push({ time: time, lane: 4 + (i % 4) }); 
        // 8박자마다 상단 노트 하나씩 섞어주기
        if (i % 8 === 7) {
            generatedNotes.push({ time: time, lane: i % 4 }); 
        }
        time += beat;
    }

    // 2. 1절 전개부 (총 64박자 / 약 26.5초) : 상단 롱노트 + 하단 단노트 조합
    for (let i = 0; i < 16; i++) {
        // 상단 2박자 롱노트
        generatedNotes.push({ time: time, endTime: time + (beat * 2), lane: i % 4, isLong: true });
        time += beat * 2;
        // 하단 1박자 단노트 2개
        generatedNotes.push({ time: time, lane: 5 });
        time += beat;
        generatedNotes.push({ time: time, lane: 6 });
        time += beat;
    }

    // 3. 프리코러스 / 브릿지 (총 32박자 / 약 13.2초) : 약간의 긴장감을 주는 동시치기
    for (let i = 0; i < 16; i++) {
        generatedNotes.push({ time: time, lane: 1 }, { time: time, lane: 6 });
        time += beat;
        generatedNotes.push({ time: time, lane: 2 }, { time: time, lane: 5 });
        time += beat;
    }

    // 4. 하이라이트 (총 64박자 / 약 26.5초) : 신나는 롱노트와 가벼운 반박자(8비트) 섞기
    for (let i = 0; i < 32; i++) {
        if (i % 4 === 0) {
            // 강렬한 양손 롱노트 (1.5박자)
            generatedNotes.push({ time: time, endTime: time + (beat * 1.5), lane: 0, isLong: true });
            generatedNotes.push({ time: time, endTime: time + (beat * 1.5), lane: 7, isLong: true });
            time += beat * 2;
        } else {
            // 가벼운 반박자(따-닥) 패턴
            generatedNotes.push({ time: time, lane: (i % 4) + 4 });
            generatedNotes.push({ time: time + halfBeat, lane: ((i + 1) % 4) + 4 });
            time += beat * 2;
        }
    }

    // 5. 아웃트로 (총 64박자 / 약 26.5초) : 영상 마무리를 향해 달려가는 구간
    for (let i = 0; i < 32; i++) {
        // 1박자 롱노트와 1박자 단노트의 번갈아치기
        generatedNotes.push({ time: time, endTime: time + beat, lane: i % 4, isLong: true });
        time += beat;
        generatedNotes.push({ time: time, lane: (i % 4) + 4 });
        time += beat;
    }

    // 6. 대망의 피니시 (총 6박자 할당 / 약 122초 부근에서 종료)
    time += beat * 2; // 2박자 숨 고르기
    // 4박자 길이의 거대한 롱노트
    generatedNotes.push({ time: time, endTime: time + (beat * 4), lane: 1, isLong: true });
    generatedNotes.push({ time: time, endTime: time + (beat * 4), lane: 6, isLong: true });

    return generatedNotes;
}

Song2.notes = generateRinneBeatmap();

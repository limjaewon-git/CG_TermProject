import * as THREE from 'three';

export const Song1 = {
    title: "HoYoHoYoにしてあげる♪",
    bpm: 150, 
    audioFile: "./HoYoHoYoにしてあげる♪.mp4", 
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

function generateEasyLongBeatmap() {
    const generatedNotes = [];
    let time = 3.0; // 3초부터 시작

    // 1. 도입부 (3초 ~ 35초)
    for (let i = 0; i < 20; i++) {
        generatedNotes.push({ time: time, lane: 4 + (i % 4) }); 
        time += 1.6; 
    }

    // 2. 전개부 (35초 ~ 68초) : 롱노트 패턴 횟수 최적화
    for (let i = 0; i < 6; i++) {
        generatedNotes.push({ time: time, lane: i % 4 }); 
        time += 1.5;

        generatedNotes.push({ time: time, endTime: time + 2.0, lane: 4 + (i % 4), isLong: true });
        time += 4.0; 
    }

    // 3. 하이라이트 (68초 ~ 100초) 
    for (let i = 0; i < 12; i++) {
        if (i % 3 === 0) {
            generatedNotes.push({ time: time, lane: 4 }, { time: time, lane: 7 }); 
            time += 2.0;
        } else {
            generatedNotes.push({ time: time, endTime: time + 1.5, lane: i % 4, isLong: true });
            time += 3.0;
        }
    }

    // 4. 아웃트로 (100초 ~ 110초) : 영상 길이(113초) 이전에 확실히 끝내기
    for (let i = 0; i < 5; i++) {
        generatedNotes.push({ time: time, lane: 5 });
        time += 2.0;
    }

    // 🌟 마지막 110초에 떨어지는 피니시 강렬한 동시치기 노트!
    generatedNotes.push({ time: time, lane: 4 });
    generatedNotes.push({ time: time, lane: 7 });

    return generatedNotes;
}

Song1.notes = generateEasyLongBeatmap();
import * as THREE from 'three';

export const Song3 = {
    title: "チェリーポップ",
    bpm: 192, 
    audioFile: "./チェリーポップ.mp4", 
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

function generateCherryPopBeatmap() {
    const generatedNotes = [];
    
    // 192 BPM 박자 단위 계산 (1박자 = 약 0.3125초)
    const beat = 60 / 192;        
    const halfBeat = beat / 2;    
    const quarterBeat = beat / 4; 
    
    let time = 0.5; // 시작 딜레이 오프셋

    function addWakuDokiPattern(startTime) {
        let t = startTime;
        for (let k = 0; k < 2; k++) {
            generatedNotes.push({ time: t, lane: 4 }); t += beat;
            generatedNotes.push({ time: t, lane: 5 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 6 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 5 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 6 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 7 }); t += beat;
            generatedNotes.push({ time: t, lane: 6 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 5 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 6 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 5 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 4 }); t += beat;
            generatedNotes.push({ time: t, lane: 5 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 6 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 5 }); t += halfBeat;
            generatedNotes.push({ time: t, lane: 6 }); t += halfBeat;
            for (let j = 0; j < 4; j++) {
                generatedNotes.push({ time: t, lane: 4 }); t += halfBeat;
                generatedNotes.push({ time: t, lane: 7 }); t += halfBeat;
            }
        }
        return t; // 이 패턴은 정확히 약 8.125초를 소모합니다.
    }

    generatedNotes.push({ time: time, lane: 5 }); time += beat;
    generatedNotes.push({ time: time, lane: 6 }); time += beat;
    generatedNotes.push({ time: time, lane: 5 }); time += beat;
    generatedNotes.push({ time: time, endTime: time + beat * 2, lane: 7, isLong: true }); 
    time += beat * 3; // 남은 간격 대기

    time = addWakuDokiPattern(time);

    while (time < 20.5) {
        generatedNotes.push({ time: time, lane: 4 });
        generatedNotes.push({ time: time + halfBeat, lane: 6 });
        time += beat * 2;
        generatedNotes.push({ time: time, lane: 7 });
        generatedNotes.push({ time: time + halfBeat, lane: 5 });
        time += beat * 2;
    }

    while (time < 31.5) {
        generatedNotes.push({ time: time, endTime: time + beat * 3, lane: 0, isLong: true });
        generatedNotes.push({ time: time + beat, lane: 6 });
        generatedNotes.push({ time: time + beat * 2, lane: 7 });
        time += beat * 4;
        
        generatedNotes.push({ time: time, endTime: time + beat * 3, lane: 3, isLong: true });
        generatedNotes.push({ time: time + beat, lane: 5 });
        generatedNotes.push({ time: time + beat * 2, lane: 4 });
        time += beat * 4;
    }

    while (time < 37.5) {
        generatedNotes.push({ time: time, lane: 4 }); time += halfBeat;
        generatedNotes.push({ time: time, lane: 5 }); time += halfBeat;
        generatedNotes.push({ time: time, lane: 6 }); time += halfBeat;
        generatedNotes.push({ time: time, lane: 7 }); time += halfBeat;
    }

    while (time < 59.5) {
        generatedNotes.push({ time: time, lane: 4 }, { time: time, lane: 7 });
        time += beat;
        generatedNotes.push({ time: time, lane: 5 }, { time: time, lane: 6 });
        time += beat;
        generatedNotes.push({ time: time, lane: 0 }, { time: time, lane: 3 });
        time += beat;
        generatedNotes.push({ time: time, lane: 1 }, { time: time, lane: 2 });
        time += beat;

        generatedNotes.push({ time: time, lane: 4 }); time += halfBeat;
        generatedNotes.push({ time: time, lane: 7 }); time += halfBeat;
        generatedNotes.push({ time: time, lane: 5 }); time += halfBeat;
        generatedNotes.push({ time: time, lane: 6 }); time += halfBeat;
    }

    time = addWakuDokiPattern(time);
    while (time < 69.5) {
        generatedNotes.push({ time: time, lane: 4 }); time += beat;
        generatedNotes.push({ time: time, lane: 7 }); time += beat;
    }

    while (time < 79.5) {
        generatedNotes.push({ time: time, lane: 5 });
        generatedNotes.push({ time: time + halfBeat, lane: 6 });
        time += beat * 2;
        generatedNotes.push({ time: time, lane: 4 });
        generatedNotes.push({ time: time + halfBeat, lane: 7 });
        time += beat * 2;
    }

    while (time < 90.5) {
        generatedNotes.push({ time: time, endTime: time + beat * 2, lane: 4, isLong: true }); 
        generatedNotes.push({ time: time + beat * 2.5, lane: 5 }); 
        generatedNotes.push({ time: time + beat * 3.0, lane: 6 }); 
        time += beat * 4;
    }

    while (time < 103.5) {
        generatedNotes.push({ time: time, lane: 4 }); time += quarterBeat;
        generatedNotes.push({ time: time, lane: 5 }); time += quarterBeat;
        generatedNotes.push({ time: time, lane: 6 }); time += quarterBeat;
        generatedNotes.push({ time: time, lane: 7 }); time += quarterBeat;
        time += beat;
        generatedNotes.push({ time: time, lane: 3 }); time += quarterBeat;
        generatedNotes.push({ time: time, lane: 2 }); time += quarterBeat;
        generatedNotes.push({ time: time, lane: 1 }); time += quarterBeat;
        generatedNotes.push({ time: time, lane: 0 }); time += quarterBeat;
        time += beat;
    }

    while (time < 115.5) {
        generatedNotes.push({ time: time, lane: 5 }, { time: time, lane: 6 }); time += beat;
        generatedNotes.push({ time: time, lane: 4 }, { time: time, lane: 7 }); time += beat;
        generatedNotes.push({ time: time, lane: 1 }, { time: time, lane: 2 }); time += beat;
        generatedNotes.push({ time: time, lane: 0 }, { time: time, lane: 3 }); time += beat;
    }

    while (time < 124.5) {
        generatedNotes.push({ time: time, endTime: time + beat * 1.5, lane: 4, isLong: true });
        generatedNotes.push({ time: time, endTime: time + beat * 1.5, lane: 7, isLong: true });
        time += beat * 2;
        generatedNotes.push({ time: time, lane: 1 }, { time: time, lane: 2 }); time += halfBeat;
        generatedNotes.push({ time: time, lane: 0 }, { time: time, lane: 3 }); time += halfBeat;
        generatedNotes.push({ time: time, lane: 1 }, { time: time, lane: 2 }); time += beat;
    }

    time = addWakuDokiPattern(time);
    while (time < 137.0) {
        generatedNotes.push({ time: time, lane: 5 }); time += beat;
        generatedNotes.push({ time: time, lane: 6 }); time += beat;
    }

    if(time < 138.0) time = 138.0; 

    generatedNotes.push({ time: time, lane: 4 }); time += beat;
    generatedNotes.push({ time: time, lane: 7 }); time += beat;
    
    generatedNotes.push({ time: time, endTime: time + beat * 2.5, lane: 1, isLong: true }); 
    generatedNotes.push({ time: time, endTime: time + beat * 2.5, lane: 2, isLong: true }); 
    time += beat * 3.5; // 숨 고르기 (약 1.1초)

    generatedNotes.push({ time: time, endTime: time + beat * 6, lane: 4, isLong: true });
    generatedNotes.push({ time: time, endTime: time + beat * 6, lane: 5, isLong: true });
    generatedNotes.push({ time: time, endTime: time + beat * 6, lane: 6, isLong: true });
    generatedNotes.push({ time: time, endTime: time + beat * 6, lane: 7, isLong: true });

    return generatedNotes;
}

Song3.notes = generateCherryPopBeatmap();
import * as THREE from 'three';

export class InGameScreen {
    constructor(scene, camera, songData) {
        this.scene = scene;
        this.camera = camera;
        this.songData = songData;
        this.gameGroup = new THREE.Group();
        
        // 게임 상태 관리 변수들
        this.score = 0;
        this.combo = 0;
        this.hp = 100;
        this.maxCombo = 0;
        this.missCount = 0;
        this.goodBadCount = 0;
        this.perfectCount = 0;
        this.totalNotes = songData.notes.length;

        this.activeNotes = [];
        this.startTime = 0;
        this.isPlaying = false;
        this.noteSpeed = 40; 
        
        // 조작키 E, R 적용 완료
        this.keyMap = { 'e': 0, 'r': 1, 'u': 2, 'i': 3, 'd': 4, 'f': 5, 'j': 6, 'k': 7 };
        
        this.lanePositions = [
            { x: -6, y: 6 }, { x: -2, y: 6 }, { x: 2, y: 6 }, { x: 6, y: 6 }, // 상단
            { x: -6, y: 0 }, { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 6, y: 0 }  // 하단
        ];
        
        this.targetZ = 10;
        this.initEnvironment();
        
        // 키보드 이벤트 바인딩 (나중에 삭제하기 위해 저장해둠)
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.boundHandleKeyDown);
    }

    initEnvironment() {
        this.scene.background = new THREE.Color(0x87CEEB); 
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(0, 20, 10);
        this.gameGroup.add(dirLight, new THREE.AmbientLight(0xffffff, 0.4));

        const targetGeo = new THREE.BoxGeometry(3, 3, 0.5);
        const targetMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        
        this.lanePositions.forEach(pos => {
            const target = new THREE.Mesh(targetGeo, targetMat);
            target.position.set(pos.x, pos.y, this.targetZ);
            this.gameGroup.add(target);
        });

        this.noteGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
        this.noteMatNavy = new THREE.MeshStandardMaterial({ color: 0x000080 });
        this.noteMatWhite = new THREE.MeshStandardMaterial({ color: 0xffffff });

        this.scene.add(this.gameGroup);
    }

    start() {
        document.getElementById('ingame-ui').style.display = 'block';
        this.startTime = performance.now() / 1000;
        this.isPlaying = true;
        
        this.songData.notes.forEach(note => {
            const isNavy = note.lane < 4; 
            const mesh = new THREE.Mesh(this.noteGeo, isNavy ? this.noteMatNavy : this.noteMatWhite);
            
            const spawnDistance = (note.time * this.noteSpeed);
            mesh.position.set(this.lanePositions[note.lane].x, this.lanePositions[note.lane].y, this.targetZ - spawnDistance);
            
            this.gameGroup.add(mesh);
            this.activeNotes.push({ mesh, time: note.time, lane: note.lane, hit: false });
        });
    }

    handleKeyDown(event) {
        if (!this.isPlaying) return;
        const key = event.key.toLowerCase();
        const lane = this.keyMap[key];
        
        if (lane !== undefined) {
            this.checkHit(lane);
        }
    }

    checkHit(lane) {
    const currentTime = (performance.now() / 1000) - this.startTime;
    const validNotes = this.activeNotes.filter(n => n.lane === lane && !n.hit);
    if (validNotes.length === 0) return;

    validNotes.sort((a, b) => Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime));
    const targetNote = validNotes[0];
    const timeDiff = targetNote.time - currentTime;

    // 판정 완화: targetNote.time - currentTime 이 양수(아직 도달 전)거나
    // 음수여도 -0.4초(판정선 지나간 후)까지는 BAD로 인정하도록 변경
    if (timeDiff > 0.4 || timeDiff < -0.4) return;

    const absDiff = Math.abs(timeDiff);

    if (absDiff < 0.15) { this.showJudgment('PERFECT', 100); this.perfectCount++; }
    else if (absDiff < 0.25) this.showJudgment('GREAT', 60);
    else if (absDiff < 0.35) { this.showJudgment('GOOD', 30); this.goodBadCount++; }
    else { this.showJudgment('BAD', 10); this.goodBadCount++; }

    targetNote.hit = true;
    targetNote.mesh.visible = false; 
}

    showJudgment(text, scoreAdd) {
        const judgeEl = document.getElementById('judge-text');
        const comboContainer = document.getElementById('combo-container');
        const comboEl = document.getElementById('combo-display');
        judgeEl.innerText = text;
        
        if(text === 'PERFECT') judgeEl.style.color = '#ff0000';
        else if(text === 'GREAT') judgeEl.style.color = '#ffaa00';
        else judgeEl.style.color = '#cccccc';

        if (text === 'MISS' || text === 'BAD' || text === 'GOOD') {
            this.combo = 0;
            if(text === 'MISS') this.hp -= 5;
            if(text === 'BAD') this.hp -= 3;
            if(text === 'GOOD') this.hp -= 1;
        } else {
            this.combo += 1;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        }

        this.score += scoreAdd;
        
        document.getElementById('score-display').innerText = String(this.score).padStart(6, '0');
        document.getElementById('hp-fill').style.width = `${Math.max(0, this.hp)}%`;
        
        if (this.combo > 1) {
            comboContainer.style.display = 'block';
            comboEl.innerText = this.combo;
        } else {
            comboContainer.style.display = 'none';
        }
        
        judgeEl.style.transform = 'translate(-50%, -50%) scale(1.2)';
        setTimeout(() => judgeEl.style.transform = 'translate(-50%, -50%) scale(1)', 100);

        // 게임 오버 체크
        if (this.hp <= 0 && this.isPlaying) {
            this.hp = 0;
            this.isPlaying = false;
            if (this.onGameOver) this.onGameOver(this.getStats());
        }
    }

    getStats() {
        return {
            hp: this.hp,
            maxCombo: this.maxCombo,
            missCount: this.missCount,
            goodBadCount: this.goodBadCount,
            perfectCount: this.perfectCount,
            totalNotes: this.totalNotes
        };
    }

    cleanup() {
        window.removeEventListener('keydown', this.boundHandleKeyDown);
        this.scene.remove(this.gameGroup);
        this.noteGeo.dispose();
        this.noteMatNavy.dispose();
        this.noteMatWhite.dispose();
        this.activeNotes = [];
    }

    update() {
        if (!this.isPlaying) return;
        const currentTime = (performance.now() / 1000) - this.startTime;
        let allNotesProcessed = true;

        this.activeNotes.forEach(note => {
            if (!note.hit) {
                allNotesProcessed = false;
                const distanceLeft = (note.time - currentTime) * this.noteSpeed;
                note.mesh.position.z = this.targetZ - distanceLeft;
                note.mesh.rotation.x += 0.05;

                if (distanceLeft < -2) { 
                    note.hit = true;
                    note.mesh.visible = false;
                    this.missCount++;
                    this.showJudgment('MISS', 0);
                }
            }
        });

        // 클리어 체크 (모든 노트가 지나가고 2초 대기 후)
        const lastNoteTime = this.songData.notes[this.songData.notes.length - 1].time;
        if (allNotesProcessed && currentTime > lastNoteTime + 2 && this.isPlaying) {
            this.isPlaying = false;
            if (this.onClear) this.onClear(this.getStats());
        }
    }
}
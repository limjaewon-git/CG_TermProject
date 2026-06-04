import * as THREE from 'three';

export class InGameScreen {
    constructor(scene, camera, songData) {
        this.scene = scene;
        this.camera = camera;
        this.songData = songData;
        this.gameGroup = new THREE.Group();
        
        this.score = 0;
        this.combo = 0;
        this.hp = 100;
        this.maxCombo = 0;
        this.perfectCount = 0;
        this.greatCount = 0;
        this.goodCount = 0;
        this.badCount = 0;
        this.missCount = 0;
        this.totalNotes = songData.notes.length;

        this.activeNotes = [];
        this.lines = []; 
        this.particles = []; // 🌟 파티클 이펙트를 저장할 배열 추가
        
        this.startTime = 0;
        this.isPlaying = false;
        this.noteSpeed = 40; 
        
        this.keyMap = { 'e': 0, 'r': 1, 'u': 2, 'i': 3, 'd': 4, 'f': 5, 'j': 6, 'k': 7 };
        
        this.lanePositions = [
            { x: -6, y: 6 }, { x: -2, y: 6 }, { x: 2, y: 6 }, { x: 6, y: 6 }, 
            { x: -6, y: 0 }, { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 6, y: 0 }  
        ];
        
        this.targetZ = 10;
        this.initEnvironment();
        
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.boundHandleKeyUp = this.handleKeyUp.bind(this);
        
        window.addEventListener('keydown', this.boundHandleKeyDown);
        window.addEventListener('keyup', this.boundHandleKeyUp); 
    }

    initEnvironment() {
        this.scene.background = null; 

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(0, 20, 20);
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.gameGroup.add(dirLight, ambientLight);

        const targetGeo = new THREE.BoxGeometry(3, 3, 0.5);
        const targetMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 });
        
        this.lanePositions.forEach(pos => {
            const target = new THREE.Mesh(targetGeo, targetMat);
            target.position.set(pos.x, pos.y, this.targetZ);
            this.gameGroup.add(target);
        });

        const railMat = new THREE.LineBasicMaterial({ color: 0x39C5BB, transparent: true, opacity: 0.4 });
        this.lanePositions.forEach(pos => {
            const points = [];
            points.push(new THREE.Vector3(pos.x, pos.y, this.targetZ + 5)); 
            points.push(new THREE.Vector3(pos.x, pos.y, -500)); 
            const railGeo = new THREE.BufferGeometry().setFromPoints(points);
            const rail = new THREE.Line(railGeo, railMat);
            this.gameGroup.add(rail);
        });

        this.cubeGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
        this.sphereGeo = new THREE.SphereGeometry(1.5, 32, 32);
        
        this.noteMatMikuBlue = new THREE.MeshStandardMaterial({ color: 0x39C5BB, metalness: 0.3, roughness: 0.2 }); 
        this.noteMatWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.5 });

        this.scene.add(this.gameGroup);
    }

    start() {
        document.getElementById('ingame-ui').style.display = 'block';
        this.startTime = performance.now() / 1000;
        this.isPlaying = true;
        
        this.songData.notes.forEach(note => {
            let mesh;
            if (note.isLong) {
                const length = (note.endTime - note.time) * this.noteSpeed;
                const geometry = new THREE.CylinderGeometry(1.8, 1.8, length, 32);
                geometry.rotateX(Math.PI / 2); 
                geometry.translate(0, 0, -length / 2); 

                const material = new THREE.MeshStandardMaterial({ color: 0x39C5BB, emissive: 0x113333, transparent: true, opacity: 0.8 });
                mesh = new THREE.Mesh(geometry, material);
            } else {
                const isTopLane = note.lane < 4; 
                const geometry = isTopLane ? this.cubeGeo : this.sphereGeo;
                const material = isTopLane ? this.noteMatMikuBlue : this.noteMatWhite;
                mesh = new THREE.Mesh(geometry, material);
            }

            const spawnDistance = (note.time * this.noteSpeed);
            mesh.position.set(this.lanePositions[note.lane].x, this.lanePositions[note.lane].y, this.targetZ - spawnDistance);
            this.gameGroup.add(mesh);
            
            this.activeNotes.push({ 
                mesh, time: note.time, endTime: note.endTime, lane: note.lane, 
                isLong: note.isLong || false, hit: false, holding: false 
            });
        });

        const groupedNotes = this.groupNotesByTime(this.activeNotes);
        groupedNotes.forEach(group => {
            if (group.length > 1) {
                const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
                const lineGeo = new THREE.BufferGeometry();
                const line = new THREE.Line(lineGeo, lineMat);
                this.gameGroup.add(line);
                this.lines.push({ line, notes: group, time: group[0].time });
            }
        });
    }

    groupNotesByTime(notes) {
        const map = new Map();
        notes.forEach(n => {
            const timeKey = n.time.toFixed(2);
            if (!map.has(timeKey)) map.set(timeKey, []);
            map.get(timeKey).push(n);
        });
        return Array.from(map.values());
    }

    // 🌟 파티클 이펙트 생성 함수
    createParticles(lane, colorHex) {
        const pos = this.lanePositions[lane];
        const particleCount = 20; // 튀어오르는 파티클 갯수
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for(let i=0; i<particleCount; i++) {
            // 판정선 박스 내에 무작위 분포
            positions[i*3] = pos.x + (Math.random() - 0.5) * 2;
            positions[i*3+1] = pos.y + (Math.random() - 0.5) * 2;
            positions[i*3+2] = this.targetZ;

            // 터져나가는 방향 설정 (카메라 쪽으로 살짝 날아옴)
            velocities.push({
                x: (Math.random() - 0.5) * 1.5,
                y: (Math.random() - 0.5) * 1.5,
                z: (Math.random() * 2) 
            });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const mat = new THREE.PointsMaterial({
            color: colorHex, size: 0.6, transparent: true, opacity: 1, blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geo, mat);
        this.gameGroup.add(points);
        this.particles.push({ mesh: points, velocities, life: 1.0 });
    }

    // 판정에 따른 색깔 반환
    getColorFromJudge(judge) {
        if (judge === 'PERFECT') return 0xff4444; // 빨강
        if (judge === 'GREAT') return 0xffaa00; // 주황
        if (judge === 'GOOD') return 0xffff00; // 노랑
        return 0xaaaaaa; // 회색 (BAD/MISS)
    }

    handleKeyDown(event) {
        if (!this.isPlaying) return;
        const key = event.key.toLowerCase();
        const lane = this.keyMap[key];
        if (lane !== undefined) this.checkHit(lane);
    }

    handleKeyUp(event) {
        if (!this.isPlaying) return;
        const key = event.key.toLowerCase();
        const lane = this.keyMap[key];
        if (lane === undefined) return;

        const holdingNote = this.activeNotes.find(n => n.lane === lane && n.holding);
        if (holdingNote) {
            holdingNote.holding = false;
            holdingNote.hit = true;
            holdingNote.mesh.visible = false;
            this.addStatCount('MISS'); 
            this.showJudgment('MISS', 0); // RELEASE MISS 대신 그냥 MISS
        }
    }

    checkHit(lane) {
        const currentTime = (performance.now() / 1000) - this.startTime;
        
        // 🌟 콤보 끊김 버그 해결 파트: 이미 홀딩중인 롱노트는 키보드 반복입력을 무시하도록 !n.holding 조건 추가
        const validNotes = this.activeNotes.filter(n => n.lane === lane && !n.hit && !n.holding);
        if (validNotes.length === 0) return;

        validNotes.sort((a, b) => Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime));
        const targetNote = validNotes[0];
        const timeDiff = targetNote.time - currentTime;

        if (timeDiff > 0.4 || timeDiff < -0.6) return; 
        const absDiff = Math.abs(timeDiff);

        let judge = 'PERFECT';
        let score = 100;
        if (absDiff < 0.15) { judge = 'PERFECT'; score = 100; }
        else if (absDiff < 0.25) { judge = 'GREAT'; score = 60; }
        else if (absDiff < 0.40) { judge = 'GOOD'; score = 30; }
        else { judge = 'BAD'; score = 10; }

        this.addStatCount(judge);
        this.createParticles(lane, this.getColorFromJudge(judge)); // 타격 파티클 이펙트 폭발!

        if (targetNote.isLong) {
            targetNote.holding = true;
            this.showJudgment(judge, score / 2); // LONG 텍스트 없이 깔끔하게
        } else {
            this.showJudgment(judge, score);
            targetNote.hit = true;
            targetNote.mesh.visible = false; 
        }
    }

    addStatCount(judge) {
        if (judge === 'PERFECT') this.perfectCount++;
        else if (judge === 'GREAT') this.greatCount++;
        else if (judge === 'GOOD') this.goodCount++;
        else if (judge === 'BAD') this.badCount++;
        else if (judge === 'MISS') this.missCount++;
    }

    showJudgment(text, scoreAdd) {
        const judgeEl = document.getElementById('judge-text');
        const comboContainer = document.getElementById('combo-container');
        const comboEl = document.getElementById('combo-display');
        judgeEl.innerText = text;
        
        // 글씨 색상
        if(text === 'PERFECT') judgeEl.style.color = '#ff4444'; 
        else if(text === 'GREAT') judgeEl.style.color = '#ffaa00'; 
        else judgeEl.style.color = '#ffff00';

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

        // 🌟 글씨 임팩트 팝(Pop) 효과 및 페이드 아웃
        judgeEl.style.transition = 'none'; // 이전 애니메이션 취소
        judgeEl.style.transform = 'translate(-50%, -50%) scale(1.6)'; // 확 커지게
        judgeEl.style.opacity = '1';

        // 즉시 적용을 위해 브라우저 렌더링 강제 업데이트
        void judgeEl.offsetWidth;

        // 자연스럽게 제 크기로 돌아온 뒤 사라지는 트랜지션
        judgeEl.style.transition = 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s 0.5s ease-out';
        judgeEl.style.transform = 'translate(-50%, -50%) scale(1)';
        judgeEl.style.opacity = '0';

        if (this.hp <= 0 && this.isPlaying) {
            this.isPlaying = false;
            if (this.onGameOver) this.onGameOver(this.getStats());
        }
    }

    getStats() {
        return { 
            hp: this.hp, maxCombo: this.maxCombo, totalNotes: this.totalNotes,
            perfectCount: this.perfectCount, greatCount: this.greatCount, 
            goodCount: this.goodCount, badCount: this.badCount, missCount: this.missCount 
        };
    }

    cleanup() {
        window.removeEventListener('keydown', this.boundHandleKeyDown);
        window.removeEventListener('keyup', this.boundHandleKeyUp);
        this.scene.remove(this.gameGroup);
        this.activeNotes = [];
        this.lines.forEach(l => this.gameGroup.remove(l.line));
        this.particles.forEach(p => this.gameGroup.remove(p.mesh));
        this.particles = [];
        this.cubeGeo.dispose();
        this.sphereGeo.dispose();
        this.noteMatMikuBlue.dispose();
        this.noteMatWhite.dispose();
    }

    update() {
        if (!this.isPlaying) return;
        const currentTime = (performance.now() / 1000) - this.startTime;
        let allNotesProcessed = true;

        this.activeNotes.forEach(note => {
            if (!note.hit) {
                allNotesProcessed = false;
                const startDistanceLeft = (note.time - currentTime) * this.noteSpeed;
                
                // 🌟 롱노트 슬라이딩 자연스럽게 유지되도록 개선
                note.mesh.position.z = this.targetZ - startDistanceLeft;

                if (note.holding) {
                    if (currentTime >= note.endTime) {
                        note.holding = false;
                        note.hit = true;
                        note.mesh.visible = false;
                        this.addStatCount('PERFECT'); 
                        this.showJudgment('PERFECT', 100);
                        this.createParticles(note.lane, 0xff4444); // 롱노트 완주 시 터지는 이펙트
                    }
                } else {
                    if (!note.isLong) {
                        note.mesh.rotation.x += 0.05;
                        note.mesh.rotation.y += 0.02;
                    }

                    // 지나친 노트 통과 계산 (롱노트면 꼬리가, 일반노트면 머리가 지나갔을 때 기준)
                    const passTime = note.isLong ? note.endTime : note.time;
                    const passDistance = (passTime - currentTime) * this.noteSpeed;

                    if (passDistance < -30) { 
                        note.hit = true;
                        note.mesh.visible = false;
                        this.missCount++;
                        this.showJudgment('MISS', 0);
                    }
                }
            }
        });

        this.lines.forEach(l => {
            const distanceLeft = (l.time - currentTime) * this.noteSpeed;
            const aliveNotes = l.notes.filter(n => !n.hit);

            if (distanceLeft < -30 || aliveNotes.length < 2) {
                l.line.visible = false;
            } else {
                const points = aliveNotes.map(n => n.mesh.position);
                l.line.geometry.setFromPoints(points);
                l.line.visible = true;
            }
        });

        // 🌟 업데이트 안에서 파티클 애니메이션 프레임 제어
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= 0.04;
            if (p.life <= 0) {
                this.gameGroup.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.particles.splice(i, 1);
            } else {
                const positions = p.mesh.geometry.attributes.position.array;
                for(let j=0; j<positions.length/3; j++) {
                    positions[j*3] += p.velocities[j].x;
                    positions[j*3+1] += p.velocities[j].y;
                    positions[j*3+2] += p.velocities[j].z;
                }
                p.mesh.geometry.attributes.position.needsUpdate = true;
                p.mesh.material.opacity = p.life;
            }
        }

        if(this.songData.notes.length > 0) {
           const lastNoteTime = this.songData.notes[this.songData.notes.length - 1].endTime || this.songData.notes[this.songData.notes.length - 1].time;
           if (allNotesProcessed && currentTime > lastNoteTime + 2 && this.isPlaying) {
               this.isPlaying = false;
               if (this.onClear) this.onClear(this.getStats());
           }
        }
    }
}
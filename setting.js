export const GameSettings = {
    volume: 0.5,
    noteSpeed: 40,

    init: function() {
        // 게임 첫 실행 시 무조건 기본값으로 세팅
        this.resetToDefault();
    },

    // 게임 시작 시 강제 호출할 기본값 초기화 함수
    resetToDefault: function() {
        this.volume = 0.5;
        this.noteSpeed = 40;
        this.save();
    },

    save: function() {
        localStorage.setItem('MikuRhythmSettings', JSON.stringify({
            volume: this.volume,
            noteSpeed: this.noteSpeed
        }));
    }
};
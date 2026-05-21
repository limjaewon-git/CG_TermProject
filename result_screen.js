export function showResultScreen(stats, onGoToSelect) {
    const resultUi = document.getElementById('result-ui');
    const statusEl = document.getElementById('result-status');
    const comboEl = document.getElementById('result-max-combo');
    const backBtn = document.getElementById('result-back-btn');

    resultUi.style.display = 'flex';

    // 결과 상태 텍스트 판정
    if (stats.hp <= 0) {
        statusEl.innerText = "Game Over";
        statusEl.style.color = "#ff4444";
    } else {
        if (stats.perfectCount === stats.totalNotes) {
            statusEl.innerText = "ALL PERFECT!!";
            statusEl.style.color = "#ffaa00";
        } else if (stats.maxCombo === stats.totalNotes) {
            statusEl.innerText = "Full Combo!";
            statusEl.style.color = "#00ffff";
        } else {
            statusEl.innerText = "Song Cleared!";
            statusEl.style.color = "#ffffff";
        }
    }

    comboEl.innerText = `MAX COMBO: ${stats.maxCombo}`;

    // 노래 선택창으로 버튼 클릭 이벤트
    backBtn.onclick = () => {
        resultUi.style.display = 'none';
        onGoToSelect();
    };
}
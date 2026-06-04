export function showResultScreen(stats, onGoToSelect) {
    const resultUi = document.getElementById('result-ui');
    const statusEl = document.getElementById('result-status');
    const comboEl = document.getElementById('result-max-combo');
    const backBtn = document.getElementById('result-back-btn');

    resultUi.style.display = 'flex';

    if (stats.hp <= 0) {
        statusEl.innerText = "Game Over";
        statusEl.style.color = "#ff4444";
    } else {
        if (stats.perfectCount === stats.totalNotes) {
            statusEl.innerText = "ALL PERFECT!!";
            statusEl.style.color = "#ffaa00";
        } else if (stats.maxCombo === stats.totalNotes) {
            statusEl.innerText = "Full Combo!";
            statusEl.style.color = "#39C5BB";
        } else {
            statusEl.innerText = "Song Cleared!";
            statusEl.style.color = "#ffffff";
        }
    }

    comboEl.innerText = `MAX COMBO: ${stats.maxCombo}`;

    // 인게임 스탯 데이터를 결과창 UI 엘리먼트에 매핑
    document.getElementById('res-perfect').innerText = stats.perfectCount;
    document.getElementById('res-great').innerText = stats.greatCount;
    document.getElementById('res-good').innerText = stats.goodCount;
    document.getElementById('res-bad').innerText = stats.badCount;
    document.getElementById('res-miss').innerText = stats.missCount;

    backBtn.onclick = () => {
        resultUi.style.display = 'none';
        onGoToSelect();
    };
}
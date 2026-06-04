export function showResultScreen(stats, songId, onGoToSelect) {
    const resultUi = document.getElementById('result-ui');
    const statusEl = document.getElementById('result-status');
    const comboEl = document.getElementById('result-max-combo');
    const backBtn = document.getElementById('result-back-btn');

    resultUi.style.display = 'flex';
    let medalText = "CLEAR";

    if (stats.hp <= 0) {
        statusEl.innerText = "Game Over";
        statusEl.style.color = "#ff4444";
        medalText = "FAILED";
    } else {
        if (stats.greatCount === 0 && stats.goodCount === 0 && stats.badCount === 0 && stats.missCount === 0) {
            statusEl.innerText = "ALL PERFECT!!";
            statusEl.style.color = "#ffaa00";
            medalText = "ALL PERFECT!!";
        } 
        else if (stats.goodCount === 0 && stats.badCount === 0 && stats.missCount === 0) {
            statusEl.innerText = "FULL COMBO";
            statusEl.style.color = "#39C5BB";
            medalText = "FULL COMBO";
        } 
        else {
            statusEl.innerText = "Song Cleared!";
            statusEl.style.color = "#ffffff";
            medalText = "CLEAR";
        }
    }

    comboEl.innerText = `MAX COMBO: ${stats.maxCombo}`;

    document.getElementById('res-perfect').innerText = stats.perfectCount;
    document.getElementById('res-great').innerText = stats.greatCount;
    document.getElementById('res-good').innerText = stats.goodCount;
    document.getElementById('res-bad').innerText = stats.badCount;
    document.getElementById('res-miss').innerText = stats.missCount;

    // 🌟 영구 저장소가 아닌 세션(임시) 저장소 사용
    if (stats.hp > 0) {
        const savedRecord = sessionStorage.getItem(`HighScore_${songId}`);
        let currentHighScore = -1; 

        if (savedRecord) {
            const parsed = JSON.parse(savedRecord);
            currentHighScore = parsed.score || 0;
        }

        // 이번 연주 점수가 기존 최고 점수보다 "높을 때" 덮어쓰기!
        if (stats.score > currentHighScore) {
            const recordObj = {
                score: stats.score,
                maxCombo: stats.maxCombo,
                medal: medalText
            };
            sessionStorage.setItem(`HighScore_${songId}`, JSON.stringify(recordObj));
        }
    }

    backBtn.onclick = () => {
        resultUi.style.display = 'none';
        onGoToSelect();
    };
}

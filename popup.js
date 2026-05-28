const statusEl = document.getElementById('status');
const countdownEl = document.getElementById('countdown');
const startBtn = document.getElementById('startBtn');
const cancelBtn = document.getElementById('cancelBtn');

let countdownTimer = null;
let currentRunAt = 0;

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? '#dc2626' : '#334155';
}

function formatMs(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function renderRunningState(isRunning) {
  startBtn.style.display = isRunning ? 'none' : 'block';
  cancelBtn.style.display = isRunning ? 'block' : 'none';
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdownEl.textContent = '';
  currentRunAt = 0;
}

function startCountdown(runAt) {
  stopCountdown();
  currentRunAt = runAt;
  renderRunningState(true);

  const tick = () => {
    const remain = currentRunAt - Date.now();
    if (remain <= 0) {
      stopCountdown();
      renderRunningState(false);
      setStatus('Đã đến giờ, đang thực thi...');
      return;
    }
    countdownEl.textContent = `Còn lại: ${formatMs(remain)}`;
  };

  tick();
  countdownTimer = setInterval(tick, 500);
}

function loadStatus() {
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (resp) => {
    if (chrome.runtime.lastError || !resp?.ok) return;

    const schedule = resp.schedule || { isScheduled: false, runAt: 0 };
    if (schedule.isScheduled && schedule.runAt > Date.now()) {
      setStatus(`Đã hẹn giờ. Sẽ chạy lúc ${new Date(schedule.runAt).toLocaleTimeString()}.`);
      startCountdown(schedule.runAt);
    } else {
      renderRunningState(false);
      stopCountdown();
      setStatus('Chưa có lịch hẹn giờ nào.');
    }
  });
}

startBtn.addEventListener('click', () => {
  const minutes = Number(document.getElementById('minutes').value || 0);
  const seconds = Number(document.getElementById('seconds').value || 0);

  const delayMs = (minutes * 60 + seconds) * 1000;

  if (delayMs <= 0) {
    setStatus('Thời gian phải lớn hơn 0 giây.', true);
    return;
  }

  const payload = {
    delayMs,
    createdAt: Date.now()
  };

  chrome.runtime.sendMessage({ type: 'SCHEDULE_TASK', payload }, (resp) => {
    if (chrome.runtime.lastError) {
      setStatus(`Lỗi: ${chrome.runtime.lastError.message}`, true);
      return;
    }

    if (!resp?.ok) {
      setStatus(resp?.error || 'Không thể tạo lịch.', true);
      return;
    }

    const runAt = resp.runAt;
    setStatus(`Đã hẹn giờ. Sẽ chạy lúc ${new Date(runAt).toLocaleTimeString()}.`);
    startCountdown(runAt);
  });
});

cancelBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'CANCEL_TASK' }, (resp) => {
    if (chrome.runtime.lastError || !resp?.ok) {
      setStatus('Không hủy được lịch.', true);
      return;
    }

    stopCountdown();
    renderRunningState(false);
    setStatus('Đã hủy hẹn giờ.');
  });
});

loadStatus();

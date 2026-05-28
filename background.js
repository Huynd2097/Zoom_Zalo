const ALARM_NAME = 'zoom-zalo-schedule';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findFirstTabByUrl(patterns) {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      const found = tabs.find((t) => {
        const url = t.url || '';
        return patterns.some((p) => p.test(url));
      });
      resolve(found || null);
    });
  });
}

function sendToTab(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (resp) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(resp || { ok: false, error: 'No response from content script.' });
    });
  });
}

async function runTask() {
  const data = await chrome.storage.local.get(['schedule']);
  const schedule = data.schedule || { isScheduled: false, runAt: 0 };
  if (!schedule.isScheduled) return;

  const zoomTab = await findFirstTabByUrl([/\.zoom\.us\//i]);
  if (zoomTab?.id) {
    await chrome.tabs.update(zoomTab.id, { active: true });
    await sleep(300);
    await sendToTab(zoomTab.id, { type: 'ZOOM_END' });
    await sleep(1800);
  }

  const zaloTab = await findFirstTabByUrl([/chat\.zalo\.me/i]);
  if (zaloTab?.id) {
    await chrome.tabs.update(zaloTab.id, { active: true });
    await sleep(500);
    await sendToTab(zaloTab.id, { type: 'ZALO_SEND' });
  }
}

function clearSchedule() {
  chrome.alarms.clear(ALARM_NAME);
  chrome.storage.local.set({ schedule: { isScheduled: false, runAt: 0 } });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  try {
    await runTask();
  } catch (err) {
    console.error('Run task error', err);
  } finally {
    clearSchedule();
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get(['schedule']);
  const schedule = data.schedule || { isScheduled: false, runAt: 0 };
  if (!schedule.isScheduled) return;

  if (schedule.runAt <= Date.now()) {
    try {
      await runTask();
    } finally {
      clearSchedule();
    }
    return;
  }

  chrome.alarms.create(ALARM_NAME, { when: schedule.runAt });
});

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['schedule']);
  const schedule = data.schedule || { isScheduled: false, runAt: 0 };
  if (schedule.isScheduled && schedule.runAt > Date.now()) {
    chrome.alarms.create(ALARM_NAME, { when: schedule.runAt });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'GET_STATUS') {
    chrome.storage.local.get(['schedule'], (data) => {
      const schedule = data.schedule || { isScheduled: false, runAt: 0 };
      sendResponse({ ok: true, schedule });
    });
    return true;
  }

  if (message?.type === 'CANCEL_TASK') {
    clearSchedule();
    sendResponse({ ok: true });
    return;
  }

  if (message?.type !== 'SCHEDULE_TASK') return;

  const payload = message.payload;
  if (!payload?.delayMs) {
    sendResponse({ ok: false, error: 'Payload invalid.' });
    return;
  }

  const runAt = Date.now() + payload.delayMs;

  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, { when: runAt });
    chrome.storage.local.set({
      schedule: {
        isScheduled: true,
        runAt
      }
    });
    sendResponse({ ok: true, runAt });
  });

  return true;
});

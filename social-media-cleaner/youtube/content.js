function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let deletedCount = 0;
let stopFlag = false;
const deletedLog = [];

function updateProgressCounter() {
  let counter = document.getElementById("yt-delete-counter");
  if (!counter) {
    counter = document.createElement("div");
    counter.id = "yt-delete-counter";
    Object.assign(counter.style, {
      position: 'fixed',
      top: '60px',
      left: '20px',
      zIndex: 9999999,
      background: '#000',
      color: '#0f0',
      padding: '8px 12px',
      borderRadius: '6px',
      fontFamily: 'monospace',
      fontSize: '13px'
    });
    document.body.appendChild(counter);
  }
  counter.textContent = `🗑️ Deleted: ${deletedCount}`;
}

function generateTimestampFilename(prefix = "yt") {
  const now = new Date();
  const ts = now.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/[^\d]/g, '');
  return `${prefix}_${ts}.json`;
}

function downloadLog(logData) {
  if (!logData.length) return;
  const filename = generateTimestampFilename("yt");
  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`📦 Downloaded: ${filename}`);
}

function getReadableDateForButton(buttonEl) {
  const activityItem = buttonEl.closest('c-wiz[data-date]');
  if (!activityItem) return null;
  const dateId = activityItem.getAttribute('data-date');
  const dateHeader = document.querySelector(`div.CW0isc[data-date="${dateId}"] h2.rp10kf`);
  return dateHeader ? dateHeader.textContent.trim() : null;
}

async function deleteYouTubeComments() {
  const selector = 'button[aria-label^="Delete activity item"]';

  while (!stopFlag) {
    const deleteButtons = Array.from(document.querySelectorAll(selector))
      .filter(btn => btn.offsetParent !== null);

    if (deleteButtons.length === 0) {
      alert("⚠️ No delete buttons found. Are you on the correct YouTube comment activity page?");
      break;
    }

    const button = deleteButtons[0];
    const commentText = button.getAttribute('aria-label')?.replace('Delete activity item ', '') || '[unknown comment]';
    const readableDate = getReadableDateForButton(button) || '[unknown date]';

    const container = button.closest('c-wiz');
    const videoLink = container?.querySelector('.SiEggd a');
    const videoTitle = videoLink?.textContent?.trim() || '';
    const videoUrl = videoLink?.href || '';

    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(300);
    button.click();
    console.log(`🗑️ Deleted on: ${readableDate} — ${commentText}`);

    deletedLog.push({
      date: readableDate,
      comment: commentText,
      //deletedAt: new Date().toISOString(),
      videoTitle,
      videoUrl
    });

    deletedCount++;
    updateProgressCounter();

    if (deletedLog.length >= 100) {
      downloadLog(deletedLog);
      deletedLog.length = 0;
    }

    await sleep(1200);
  }

  if (deletedLog.length > 0) {
    downloadLog(deletedLog);
  }

  console.log("🏁 Deletion complete.");
}

function addControlButtons() {
  if (document.getElementById('yt-delete-btn')) return;

  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 9999999,
    display: 'flex',
    gap: '10px',
    flexDirection: 'row'
  });

  const startBtn = document.createElement('button');
  startBtn.id = 'yt-delete-btn';
  startBtn.innerText = '🗑️ Start Deleting';
  Object.assign(startBtn.style, {
    background: '#cc0000',
    color: 'white',
    fontSize: '14px',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  });

  const stopBtn = document.createElement('button');
  stopBtn.id = 'yt-stop-btn';
  stopBtn.innerText = '⛔ Stop';
  Object.assign(stopBtn.style, {
    background: '#444',
    color: 'white',
    fontSize: '14px',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  });

  startBtn.onclick = () => {
    stopFlag = false;
    deletedCount = 0;
    deletedLog.length = 0;
    updateProgressCounter();
    deleteYouTubeComments();
  };

  stopBtn.onclick = () => {
    stopFlag = true;
    console.log("🛑 Stop button clicked.");
  };

  container.appendChild(startBtn);
  container.appendChild(stopBtn);
  document.body.appendChild(container);
  updateProgressCounter();
  console.log("🟢 Start/Stop buttons injected.");
}

window.addEventListener("load", () => {
  setTimeout(addControlButtons, 1000);
});

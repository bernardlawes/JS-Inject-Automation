function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let deletedCount = 0;
let stopFlag = false;
const deletedLog = [];

function updateProgressCounter() {
  let counter = document.getElementById("ig-delete-counter");
  if (!counter) {
    counter = document.createElement("div");
    counter.id = "ig-delete-counter";
    Object.assign(counter.style, {
      position: 'fixed',
      top: '60px',
      left: '20px',
      zIndex: 2147483647,
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

function getVisibleCheckboxes() {
  return Array.from(document.querySelectorAll('div[style*="mask-image"][style*="circle__outline__24"]'))
    .filter(box => box.offsetParent !== null);
}

function downloadLogBatch(cycleNumber) {
  const blob = new Blob([JSON.stringify(deletedLog, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deleted_comments_cycle${cycleNumber}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function deleteInstagramComments(batchSize = 5, maxCycles = 100) {
  for (let cycle = 0; cycle < maxCycles; cycle++) {
    if (stopFlag) {
      console.log("🛑 Deletion stopped.");
      break;
    }

    console.log(`🔁 Starting deletion cycle ${cycle + 1}`);

    const selectButton = Array.from(document.querySelectorAll('span'))
      .find(el => el.textContent.trim() === 'Select');
    if (selectButton) {
      selectButton.click();
      await sleep(1000);
    } else {
      console.warn("⚠️ 'Select' button not found.");
      break;
    }

    const checkboxes = getVisibleCheckboxes();
    if (checkboxes.length === 0) {
      console.log("✅ No more comments to delete.");
      break;
    }

    const selectedText = [];
    for (let i = 0; i < Math.min(batchSize, checkboxes.length); i++) {
      const box = checkboxes[i];
      const comment = box.closest('div[role="button"]')?.parentElement?.innerText || "[unknown comment]";
      selectedText.push({ comment: comment.trim(), deletedAt: new Date().toISOString() });
      box.click();
      await sleep(300);
    }

    const deleteButton = Array.from(document.querySelectorAll('span'))
      .find(el => el.textContent.trim().toLowerCase() === 'delete' &&
                  getComputedStyle(el).color === 'rgb(237, 73, 86)');
    if (deleteButton) {
      deleteButton.click();
      console.log("🟠 Clicked red delete. Waiting for modal to appear...");
      await sleep(2000);
    } else {
      console.warn("⚠️ Red delete button not found.");
      break;
    }

    let confirmDeleteBtn = null;
    for (let i = 0; i < 67; i++) { // 67 × 300ms = 20s max wait
      confirmDeleteBtn = Array.from(document.querySelectorAll('div._a9-v button')).find(btn =>
        btn.innerText.trim().toLowerCase() === 'delete'
      );
      if (confirmDeleteBtn && confirmDeleteBtn.offsetParent !== null) break;
      await sleep(300);
    }

    if (confirmDeleteBtn) {
      confirmDeleteBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      confirmDeleteBtn.click();
      console.log("✅ Confirmed deletion. Waiting 20 seconds...");
      deletedCount += selectedText.length;
      deletedLog.push(...selectedText);
      updateProgressCounter();
      await sleep(20000); // ← Wait here for IG to clean up
    } else {
      console.warn("⚠️ Could not find or click confirmation delete button.");
      break;
    }

    downloadLogBatch(cycle + 1);
  }

  console.log("🏁 Finished all deletion cycles.");
}

function addControlButtons() {
  if (document.getElementById('ig-delete-btn')) return;

  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 2147483647,
    display: 'flex',
    gap: '10px'
  });

  const startBtn = document.createElement('button');
  startBtn.id = 'ig-delete-btn';
  startBtn.innerText = '🗑️ Start Deleting Comments';
  Object.assign(startBtn.style, {
    background: '#ed4956',
    color: 'white',
    fontSize: '14px',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  });

  const stopBtn = document.createElement('button');
  stopBtn.id = 'ig-stop-btn';
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
    deleteInstagramComments();
  };

  stopBtn.onclick = () => {
    stopFlag = true;
    console.log("🛑 Stop button clicked.");
  };

  container.appendChild(startBtn);
  container.appendChild(stopBtn);
  document.body.appendChild(container);
  console.log("🟢 Start/Stop buttons injected");
}

// Ensure button shows up whether DOM is ready or not
function ensureControlButtonsVisible() {
  const alreadyThere = document.getElementById('ig-delete-btn');
  if (!alreadyThere) addControlButtons();
}

if (document.readyState !== 'loading') {
  setTimeout(ensureControlButtonsVisible, 3000);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(ensureControlButtonsVisible, 3000);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let deletedCount = 0;
let stopFlag = false;
const deletedLog = [];
const skippedLog = [];

function updateProgressCounter() {
  let counter = document.getElementById("fb-delete-counter");
  if (!counter) {
    counter = document.createElement("div");
    counter.id = "fb-delete-counter";
    Object.assign(counter.style, {
      position: 'fixed',
      top: '60px',
      left: '20px',
      zIndex: 2147483647,
      background: '#000',
      color: '#FFF',
      padding: '8px 12px',
      borderRadius: '6px',
      fontFamily: 'monospace',
      fontSize: '13px'
    });
    document.body.appendChild(counter);
  }
  counter.textContent = `🗑️ Deleted: ${deletedCount}`;
}

function highlightElement(el) {
  if (!el) return;
  el.style.transition = 'background-color 0.3s ease, outline 0.3s ease';
  el.style.backgroundColor = '#fffb91';
  el.style.outline = '2px solid red';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => {
    el.style.backgroundColor = '';
    el.style.outline = '';
  }, 2000);
}

function downloadLogFile(logArray, filenamePrefix = 'fb_deleted_comments') {
  if (!logArray.length) return;
  const filename = `${filenamePrefix}_${Date.now()}_${logArray.length}.json`;
  const blob = new Blob([JSON.stringify(logArray, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`📦 Log saved: ${filename}`);
}

async function deleteFacebookComments(maxCycles = 10000) {
  let cycle = 0;
  let batchsize = 50;
  let verbose = false;
  let currentIndex = 0;

  console.log("🗑️ Starting Facebook comment deletion...");

  while (cycle < maxCycles && !stopFlag) {
    const buttons = Array.from(document.querySelectorAll('[aria-label="Action options"]'));

    if (buttons.length === 0 || currentIndex >= buttons.length) {
      console.log("✅ No more comments to process.");
      break;
    }

    const btn = buttons[currentIndex];
    if (!btn) {
      console.warn("⚠️ Button not found at current index.");
      currentIndex++;
      continue;
    }

    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightElement(btn);
    btn.click();
    await sleep(300);

    const deleteSpan = Array.from(document.querySelectorAll('span'))
      .find(el => el.textContent.trim().toLowerCase() === 'delete');

    if (!deleteSpan) {
      console.log(`⚠️ Skipping index ${currentIndex}: No 'Delete' option.`);
      currentIndex++;
      continue;
    }

    // Get context
    let commentText = '[unknown comment]';
    const container = btn.closest('[data-visualcompletion]') || btn.parentElement?.parentElement;
    if (container && container.innerText) {
      commentText = container.innerText.trim().replace(/\s+/g, ' ');
    }

    deleteSpan.click();
    await sleep(800);

    // Detect toast
    const failureToast = Array.from(document.querySelectorAll('span')).find(
      span => span.textContent.trim().includes("Something went wrong")
    );

    if (failureToast) {
      console.warn(`❌ Deletion failed at index ${currentIndex}. Skipping.`);

      const closeBtn = document.querySelector('[aria-label="Close"]');
      if (closeBtn) closeBtn.click();

      skippedLog.push({
        comment: commentText,
        skippedAt: new Date().toISOString(),
        reason: "Deletion failed - toast error"
      });

      currentIndex++;
      continue;
    }

    // Deletion succeeded
    deletedLog.push({
      comment: commentText,
      deletedAt: new Date().toISOString()
    });

    deletedCount++;
    updateProgressCounter();

    if (verbose) {
      console.log("🗑️ Deleted:", commentText);
    } else if (deletedCount % 25 === 0) {
      console.log(`🔁 Progress: ${deletedCount} deletions`);
    }

    if (deletedCount % batchsize === 0) {
      downloadLogFile(deletedLog, 'fb_deleted_batch');
      deletedLog.length = 0;
    }

    // ✅ Don't increment index — DOM has shifted
    await sleep(300);
    cycle++;
  }

  downloadLogFile(deletedLog, 'fb_deleted_batch');
  downloadLogFile(skippedLog, 'fb_skipped_comments');
  console.log("🏁 Finished deleting Facebook comments.");
}


function addControlButtons() {
  if (document.getElementById('fb-delete-btn')) return;

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
  startBtn.id = 'fb-delete-btn';
  startBtn.innerText = '🗑️ Start Facebook Deletion';
  Object.assign(startBtn.style, {
    background: '#4267B2',
    color: 'white',
    fontSize: '14px',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  });

  const stopBtn = document.createElement('button');
  stopBtn.id = 'fb-stop-btn';
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
    skippedLog.length = 0;
    updateProgressCounter();
    deleteFacebookComments();
  };

  stopBtn.onclick = () => {
    stopFlag = true;
    downloadLogFile(deletedLog, 'fb_deleted_batch');
    downloadLogFile(skippedLog, 'fb_skipped_comments');
    console.log("🛑 Manual stop triggered. Final logs saved.");
  };

  container.appendChild(startBtn);
  container.appendChild(stopBtn);
  document.body.appendChild(container);
  console.log("🟢 Facebook comment cleaner buttons injected");
}

if (document.readyState !== 'loading') {
  setTimeout(addControlButtons, 3000);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(addControlButtons, 3000);
  });
}

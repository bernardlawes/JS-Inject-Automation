function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let deletedCount = 0;
let stopFlag = false;
const deletedLog = [];

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
  const filename = `${filenamePrefix}_${Date.now()}.json`;
  const blob = new Blob([JSON.stringify(logArray, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`📦 Log saved: ${filename}`);
}

function downloadFinalMasterLog() {

  if (!deletedLog.length) return;
  const filename = `fb_deleted_comments_${Date.now()}.json`;
  const blob = new Blob([JSON.stringify(deletedLog, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`📦 Final master log saved: ${filename}`);
}

async function deleteFacebookComments(maxCycles = 1000) {

  let batchsize = 100;

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    if (stopFlag) {
      console.log("🛑 Deletion stopped by user.");
      break;
    }

    console.log(`🔁 Cycle ${cycle + 1}`);

    const firstBtn = document.querySelector('[aria-label="Action options"]');
    if (!firstBtn) {
      console.log("✅ No more comments to process.");
      break;
    }

    firstBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstBtn.click();
    await sleep(1500);

    const deleteSpan = Array.from(document.querySelectorAll('span'))
      .find(el => el.textContent.trim().toLowerCase() === 'delete');

    if (deleteSpan) {
      let commentText = '[unknown context]';

      let node = firstBtn;
      let container = null;

      for (let i = 0; i < 6; i++) {
        if (!node || !node.parentElement) break;
        node = node.parentElement;
        const text = node.innerText?.trim();
        if (text && text.length > 20) {
          container = node;
          break;
        }
      }

      if (container) {
        commentText = container.innerText.trim().replace(/\s+/g, ' ');
        console.log("📄 Captured raw comment context:", commentText);
      } else {
        console.warn("⚠️ Could not find a parent container with usable comment text.");
      }

      /*
      // 🔍 Try to locate the row
      let activityRow = firstBtn.closest('[role="article"]') || firstBtn.closest('[data-visualcompletion]');
      if (!activityRow) {
        //console.warn("❌ Could not locate activityRow container.");
      } else {
        console.log("✅ Found activityRow container:", activityRow);

        const allSpans = Array.from(activityRow.querySelectorAll('span'));
        console.log(`🔍 Found ${allSpans.length} spans:`);

        allSpans.forEach((span, index) => {
          const style = span.getAttribute('style') || '[no style]';
          const text = span.textContent.trim();
          console.log(`🧪 [${index}] "${text}" — style: ${style}`);
        });

        // 🔧 Manually set the index after inspection
        const commentIndex = -1; // ← Replace with correct index from console

        if (commentIndex >= 0 && commentIndex < allSpans.length) {
          const commentSpan = allSpans[commentIndex];
          commentText = commentSpan.textContent.trim();
          highlightElement(commentSpan);
          console.log("✅ Captured comment by index:", commentText);
        } else {
          console.warn("⚠️ Comment index not selected or out of bounds.");
        }

        // ⏱ Timestamp
        const timeSpan = allSpans.find(span => /\d{1,2}:\d{2}/.test(span.textContent));
        if (timeSpan) {
          timestamp = timeSpan.textContent.trim();
        }

        // 🎯 Post target name
        const strongs = activityRow.querySelectorAll('strong a');
        if (strongs && strongs.length > 1) {
          targetName = strongs[1].textContent.trim();
        }

        // 🔗 Link to original post
        const postAnchor = Array.from(activityRow.querySelectorAll('a'))
          .find(a => a.href.includes('facebook.com') && a.href.includes('/posts/'));
        if (postAnchor) {
          postLink = postAnchor.href;
        }
      }
      */
      deleteSpan.click();
      await sleep(1000);

      deletedLog.push({
        comment: commentText,
        deletedAt: new Date().toISOString()
      });

      deletedCount++;
      if (deletedCount % batchsize === 0) {
        downloadLogFile(deletedLog, 'fb_deleted_batch');
        deletedLog.length = 0; // Reset log
      }
      updateProgressCounter();
      console.log("🗑️ Deleted:", commentText);
      await sleep(2000);
    }
  }

  downloadLogFile(deletedLog, 'fb_deleted_batch');
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
    updateProgressCounter();
    deleteFacebookComments();
  };

  stopBtn.onclick = () => {
    stopFlag = true;
    downloadLogFile(deletedLog, 'fb_deleted_batch');
    console.log("🛑 Manual stop triggered. Final log saved.");
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

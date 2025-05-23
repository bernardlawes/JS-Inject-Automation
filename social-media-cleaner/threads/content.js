function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let deletedCount = 0;

function updateProgressCounter() {
  let counter = document.getElementById("threads-delete-counter");
  if (!counter) {
    counter = document.createElement("div");
    counter.id = "threads-delete-counter";
    Object.assign(counter.style, {
      position: 'fixed',
      top: '60px',
      right: '10px',
      zIndex: 9999,
      background: '#000',
      color: '#0f0',
      padding: '8px 12px',
      borderRadius: '5px',
      fontFamily: 'monospace'
    });
    document.body.appendChild(counter);
  }
  counter.textContent = `🗑️ Deleted: ${deletedCount}`;
}

function getVisibleMoreButtons() {
  const allButtons = Array.from(document.querySelectorAll('div[role="button"] svg[aria-label="More"]'))
    .map(svg => svg.closest('div[role="button"]'))
    .filter(btn => btn && !btn.dataset.processed);

  allButtons.forEach(btn => {
    btn.style.outline = "2px solid red"; // Visual debug
  });

  console.log(`🕵️ Found ${allButtons.length} More buttons.`);
  return allButtons;
}

async function deleteVisibleReplies() {
  const buttons = getVisibleMoreButtons();

  for (let btn of buttons) {
    try {
      btn.dataset.processed = "true";

      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(1000);

      btn.click(); // Open ⋯ menu
      await sleep(1200);

      const deleteOption = Array.from(document.querySelectorAll('span')).find(
        el => el.textContent.trim().toLowerCase() === "delete"
      );

      if (!deleteOption) {
        console.warn("⚠️ Delete option not found in ⋯ menu.");
        continue;
      }

      deleteOption.click(); // Click first Delete
      console.log("🟠 Clicked menu Delete, waiting for modal...");
      await sleep(800);

      // 🔄 Wait until confirmation modal's Delete appears
      let confirmDelete = null;
      for (let i = 0; i < 10; i++) {
        confirmDelete = Array.from(document.querySelectorAll('span')).find(
          el => el.textContent.trim().toLowerCase() === "delete"
        );
        if (confirmDelete) break;
        await sleep(400);
      }

      if (!confirmDelete) {
        console.warn("⚠️ Confirmation Delete not found.");
        continue;
      }

      confirmDelete.click();
      console.log("✅ Clicked confirm Delete");

      deletedCount++;
      updateProgressCounter();

      // ⏳ Wait until modal disappears
      for (let i = 0; i < 10; i++) {
        const stillThere = Array.from(document.querySelectorAll('span')).some(
          el => el.textContent.trim().toLowerCase() === "delete"
        );
        if (!stillThere) break;
        await sleep(500);
      }

      await sleep(1000); // Buffer before next post

    } catch (err) {
      console.warn("⚠️ Failed to delete reply:", err);
    }
  }
}




async function scrollAndDelete(maxScrolls = 50) {
  let previousHeight = 0;
  let retrySame = 0;

  for (let i = 0; i < maxScrolls && retrySame < 3; i++) {
    await deleteVisibleReplies();

    window.scrollBy(0, 1000);
    await sleep(2500);

    const newHeight = document.body.scrollHeight;
    if (newHeight === previousHeight) {
      retrySame++;
      console.log(`⏳ No new height detected. Retry ${retrySame}/3`);
    } else {
      retrySame = 0;
    }
    previousHeight = newHeight;
  }

  await deleteVisibleReplies();
  console.log("✅ Done deleting replies.");
}

function createStartButton() {
  const btn = document.createElement('button');
  btn.textContent = '🗑️ Start Deleting Threads Replies';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: 9999,
    background: '#ff0033',
    color: '#fff',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  });
  btn.onclick = () => {
    deletedCount = 0;
    updateProgressCounter();
    scrollAndDelete(100);
  };
  document.body.appendChild(btn);
}

window.addEventListener("load", () => {
  setTimeout(() => {
    createStartButton();
    console.log("🟢 Threads delete button added.");
  }, 3000);
});

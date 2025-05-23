function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getVisibleMoreButtons() {
  const allButtons = Array.from(document.querySelectorAll('button[aria-label="More"][data-testid="caret"]'));

  console.log(`🕵️ Found ${allButtons.length} "More" buttons on screen.`);

  const unprocessed = allButtons.filter(btn => !btn.dataset.processed);

  unprocessed.forEach(btn => {
    btn.style.outline = "2px solid orange";
  });

  return unprocessed;
}


async function deleteVisibleReplies() {
  const buttons = getVisibleMoreButtons();

  for (let btn of buttons) {
    try {
      btn.dataset.processed = "true";

      // Scroll into view and simulate a real click
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(600);

      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });

      btn.dispatchEvent(clickEvent);
      await sleep(800);

      // Find and click the "Delete" option
      const deleteItem = Array.from(document.querySelectorAll('span')).find(
        s => s.textContent.trim() === "Delete"
      );

      if (deleteItem) {
        deleteItem.dispatchEvent(clickEvent);
        await sleep(800);

        const confirmDelete = Array.from(document.querySelectorAll('span')).find(
          s => s.textContent.trim() === "Delete"
        );

        if (confirmDelete) {
          confirmDelete.dispatchEvent(clickEvent);
          deletedCount++;
          updateProgressCounter();
          console.log(`✅ Deleted reply #${deletedCount}`);
          await sleep(1500);
        }
      } else {
        console.warn("⚠️ 'Delete' option not found after More button click.");
      }
    } catch (err) {
      console.warn("⚠️ Error processing reply:", err);
    }
  }
}




async function deleteVisibleReplies_virtual_click() {
  const buttons = getVisibleMoreButtons();

  for (let btn of buttons) {
    try {
      btn.dataset.processed = "true"; // Mark so we don’t repeat
      btn.click();
      await sleep(500);

      const deleteItem = Array.from(document.querySelectorAll('span')).find(
        s => s.textContent.trim() === "Delete"
      );

      if (deleteItem) {
        deleteItem.click();
        await sleep(500);

        const confirmDelete = Array.from(document.querySelectorAll('span')).find(
          s => s.textContent.trim() === "Delete"
        );

        if (confirmDelete) {
          confirmDelete.click();
          console.log("✅ Deleted a reply.");
          await sleep(1500);
        }
      }
    } catch (err) {
      console.warn("⚠️ Error processing a reply:", err);
    }
  }
}

async function scrollAndDeleteReplies(maxScrolls = 50) {
  let scrollCount = 0;
  let previousHeight = 0;
  let retrySameHeight = 0;

  while (scrollCount < maxScrolls && retrySameHeight < 3) {
    await deleteVisibleReplies();

    window.scrollBy(0, 1000);
    await sleep(2500); // Give it time to load new tweets

    const currentHeight = document.body.scrollHeight;

    if (currentHeight === previousHeight) {
      retrySameHeight++;
      console.log(`⏳ No new height detected, retrying... (${retrySameHeight}/3)`);
    } else {
      retrySameHeight = 0;
    }

    previousHeight = currentHeight;
    scrollCount++;
  }

  await deleteVisibleReplies(); // Final pass
  console.log("✅ Done deleting and scrolling.");
}

function createStartButton() {
  const btn = document.createElement('button');
  btn.textContent = '🗑️ Start Deleting Replies';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: 9999,
    padding: '10px',
    background: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer'
  });
  btn.onclick = () => scrollAndDeleteReplies(100); // Adjust max scrolls if needed
  document.body.appendChild(btn);
}

window.addEventListener("load", () => {
  setTimeout(() => {
    createStartButton();
    console.log("🟢 Delete button added to page.");
  }, 3000);
});

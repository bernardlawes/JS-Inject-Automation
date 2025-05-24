(function () {
  let stop = false;
  let processed = new Set();

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function processPosts() {
  const posts = Array.from(document.querySelectorAll('[role="article"]'));

  for (const post of posts) {
    if (stop) {
      console.log("🛑 Stopped by user.");
      return;
    }

    if (processed.has(post)) continue;

    // 🔍 Find "More" button by exact aria-label
    const moreBtn = post.querySelector('[role="button"][aria-label="Actions for this post"]');
    if (!moreBtn) {
      console.warn("⚠️ 'More' button not found in post.");
      continue;
    }

    processed.add(post);
    moreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    moreBtn.click();
    console.log("🔘 Clicked More...");
    await sleep(1500);

    // 📂 Find and click "Edit audience"/"Edit privacy"
    const editOption = Array.from(document.querySelectorAll('*')).find(el =>
      el.textContent?.toLowerCase().includes('edit audience') ||
      el.textContent?.toLowerCase().includes('edit privacy')
    );

    if (editOption) {
      editOption.click();
      console.log("🧩 Clicked 'Edit Audience/Privacy'");
      await sleep(1500);
    } else {
      console.warn("⚠️ 'Edit Audience' not found, skipping post.");
      continue;
    }

    // 🔒 Find and click "Only Me"
    const onlyMeOption = Array.from(document.querySelectorAll('*')).find(el =>
      el.textContent?.toLowerCase().includes('only me')
    );

    if (onlyMeOption) {
      onlyMeOption.click();
      console.log("🔒 Set post to Only Me.");
      await sleep(1500);
    } else {
      console.warn("⚠️ 'Only Me' option not found.");
    }

    await sleep(1500);
  }

  // Scroll down to load more posts
  window.scrollBy(0, 1000);
  await sleep(2000);
  return processPosts();
}



  function addControls() {
    if (document.getElementById('reel-lock-controls')) return;

    const panel = document.createElement("div");
    panel.id = "reel-lock-controls";
    Object.assign(panel.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 99999,
      background: '#000',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'sans-serif',
      cursor: 'pointer'
    });

    panel.textContent = "🔒 Lock Reels to Only Me";
    panel.onclick = () => {
      stop = false;
      processed.clear();
      processPosts();
    };

    const stopBtn = document.createElement("div");
    Object.assign(stopBtn.style, {
      marginTop: '8px',
      background: '#444',
      padding: '6px 10px',
      borderRadius: '6px',
      cursor: 'pointer'
    });
    stopBtn.textContent = "⛔ Stop";
    stopBtn.onclick = () => {
      stop = true;
    };

    panel.appendChild(stopBtn);
    document.body.appendChild(panel);
    console.log("🟢 Profile Reels privacy control panel injected");
  }

  if (document.readyState !== 'loading') {
    setTimeout(() => {
      console.log("🧠 Profile Reels privacy script loaded");
      addControls();
    }, 3000);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        console.log("🧠 Profile Reels privacy script loaded");
        addControls();
      }, 3000);
    });
  }
})();

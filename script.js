// ===============================================
// PMO Smart Assistant — Chatbot Frontend Script
// ===============================================

// Gunakan hanya PRODUCTION WEBHOOK URL
const WEBHOOK_URL = "https://webhook-alpha-explore.digibox.ai/webhook/ce1e4dd5-a036-47c6-a79e-434deff91aaf";

// Ambil elemen-elemen HTML
const chatWindow = document.getElementById("chat-window");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");

// Event untuk tombol kirim
sendBtn.addEventListener("click", sendMessage);

// Event ENTER
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// Tambahkan pesan ke UI
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = `<p style="white-space: pre-wrap;">${text}</p>`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// =======================================================
// Loading Indicator (tiga titik)
// =======================================================
function addLoadingIndicator() {
  const loading = document.createElement("div");
  loading.classList.add("message", "bot", "loading-indicator");
  loading.innerHTML = `
        <div class="dot-container">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
  chatWindow.appendChild(loading);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return loading;
}

// =======================================================
// Fungsi utama untuk mengirim pesan
// =======================================================
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // tampilkan pesan user
  addMessage(text, "user");
  userInput.value = "";

  // Nonaktifkan input sementara
  userInput.disabled = true;
  sendBtn.disabled = true;

  // Tampilkan loading indicator
  const loadingBubble = addLoadingIndicator();

  // -------------------------------------------------
  // SESSION ID (Mengikuti pola script kedua)
  // -------------------------------------------------
  let sessionId = sessionStorage.getItem("ai_session_id");

  if (!sessionId) {
    sessionId = "sesi_" + Date.now();
    sessionStorage.setItem("ai_session_id", sessionId);
  }
  // -------------------------------------------------

  try {
    const payload = {
      message: text,
      sessionId: sessionId,
    };

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Hapus loading dots
    loadingBubble.remove();

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    const finalText =
      data.reply ||
      data.text ||
      data.output ||
      data.response ||
      "No response received.";

    addMessage(finalText, "bot");

  } catch (err) {
    console.error("Fetch error:", err);
    loadingBubble.remove();
    addMessage("Error connecting to server", "bot");
  } finally {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

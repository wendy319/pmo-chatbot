// ===============================================
// PMO Smart Assistant — Chatbot Frontend Script
// ===============================================

// Gunakan hanya PRODUCTION WEBHOOK URL (TIDAK boleh pakai /webhook-test/)
const WEBHOOK_URL = "https://webhook-alpha-explore.digibox.ai/webhook/ce1e4dd5-a036-47c6-a79e-434deff91aaf";

// Ambil elemen-elemen HTML
const chatWindow = document.getElementById("chat-window");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");

// Event untuk tombol kirim
sendBtn.addEventListener("click", sendMessage);

// Event untuk tombol ENTER
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();    // supaya tidak bikin line break
    sendMessage();
  }
});

// Fungsi untuk menambah pesan ke UI
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Fungsi utama untuk mengirim pesan
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // tampilkan pesan user
  addMessage(text, "user");
  userInput.value = "";

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();

    // tampilkan pesan bot
    addMessage(
      data.reply || data.text || data.output || "No response received.",
      "bot"
    );

  } catch (err) {
    addMessage("Error connecting to server", "bot");
    console.error("Fetch error:", err);
  }
}

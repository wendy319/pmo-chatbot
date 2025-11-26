import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, MessageSquarePlus } from "lucide-react";

export default function ChatbotUI({ webhookUrl = "https://webhook-alpha-explore.digibox.ai/webhook/webhook/chat" }) {
  const [messages, setMessages] = useState([
    {
      id: "bot-1",
      role: "bot",
      text: "Halo! Saya SMART. Ada yang bisa saya bantu?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(["Percakapan Baru"]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMessage(role, text) {
    setMessages((prev) => [
      ...prev,
      { id: `${role}-${Date.now()}`, role, text },
    ]);
  }

  function newChat() {
    setMessages([]);
    const title = `Chat ${history.length + 1}`;
    setHistory((prev) => [title, ...prev]);
    addMessage("bot", "Halo! Saya SMART. Ada yang bisa saya bantu?");
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    addMessage("user", userMsg);
    setInput("");
    setLoading(true);
    addMessage("bot", "•••");

    try {
      const payload = {
        message: userMsg,
        sessionId:
          localStorage.getItem("chat_session") ||
          Math.random().toString(36).slice(2),
      };

      if (!localStorage.getItem("chat_session"))
        localStorage.setItem("chat_session", payload.sessionId);

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      setMessages((prev) => {
        const cleaned = prev.filter((m) => m.text !== "•••");
        return [
          ...cleaned,
          {
            id: `bot-${Date.now()}`,
            role: "bot",
            text: data.reply || "Tidak ada respon dari server.",
          },
        ];
      });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.text !== "•••"));
      addMessage("bot", "Terjadi kesalahan. Coba lagi.");
    }

    setLoading(false);
  }

  return (
    <div className="w-full h-screen bg-white flex overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-72 h-full border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-indigo-700">SMART</h1>
          <button
            onClick={newChat}
            className="mt-3 flex items-center gap-2 bg-white border rounded-xl px-4 py-2 shadow hover:bg-gray-100 transition"
          >
            <MessageSquarePlus size={18} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-white shadow text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
            >
              {item}
            </div>
          ))}
        </div>

        {/* USER FOOTER */}
        <div className="p-4 border-t flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
            U
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">User</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 h-full flex flex-col items-center">
        {/* HEADER TITLE */}
        <div className="pt-10 text-center">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
            🤖 SMART — How can I help you?
          </h1>
        </div>

        {/* MESSAGE AREA */}
        <div className="flex-1 w-full max-w-3xl mx-auto mt-6 px-4 overflow-y-auto space-y-4 pb-32">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar */}
              {m.role === "bot" && (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                  S
                </div>
              )}

              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm whitespace-pre-wrap
                ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }
              `}
              >
                {m.text}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                  U
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <form
          onSubmit={sendMessage}
          className="fixed bottom-10 left-72 right-0 flex justify-center px-4"
        >
          <div className="w-full max-w-3xl bg-white shadow-xl border rounded-2xl flex items-center px-4 py-3 gap-3">
            <Paperclip size={18} className="text-gray-400" />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message SMART"
              className="flex-1 outline-none text-gray-700"
            />

            <button
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

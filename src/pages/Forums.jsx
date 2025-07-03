import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import {
  fetchDiscussions,
  sendDiscussionMessage,
  verifyToken,              // existing helper
} from "../api";

import "../styles/Forums.css";

const POLL_INTERVAL_MS = 5000; // 5-second refresh

const Forums = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  /* ---------- helper: scroll to bottom ---------- */
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  /* ---------- load current user ---------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user } = await verifyToken();
        setCurrentUser(user); // { id, first_name, last_name, ... }
      } catch (_) {
        toast.error("Unable to verify user – please log in again.");
      }
    };
    loadUser();
  }, []);

  /* ---------- poll for new messages ---------- */
  useEffect(() => {
    let loop;

    const loadMessages = async () => {
      try {
        const data = await fetchDiscussions(); // { total, items }
        setMessages(data.items);               // already newest → oldest
      } catch (_) {
        toast.error("Failed to load messages.");
      }
    };

    // initial fetch
    loadMessages();

    // polling loop
    loop = setInterval(loadMessages, POLL_INTERVAL_MS);

    return () => clearInterval(loop);
  }, []);

  /* ---------- auto-scroll on change ---------- */
  useEffect(scrollToBottom, [messages]);

  /* ---------- send message ---------- */
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const sent = await sendDiscussionMessage(newMessage.trim());
      // optimistic append (backend returns the new row)
      setMessages((prev) => [sent, ...prev]);
      setNewMessage("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to send message."
      );
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Mentorship Discussion</h1>
        <p>Connect with mentors and peers in real-time!</p>
      </div>

      <div className="messages-container">
        <div className="chat-room">
          <h2>Group Chat</h2>
          {messages.length === 0 ? (
            <p>No messages yet…</p>
          ) : (
            messages
              .slice()                 // copy for stable reverse
              .reverse()               // oldest → newest for display
              .map((m) => {
                const isMe = m.user_id === currentUser?.id;
                const dt = new Date(m.created_at).toLocaleString();
                return (
                  <div
                    key={m.id}
                    className={`message ${isMe ? "sent" : "received"}`}
                  >
                    <div className="message-content">
                      <p>{m.message}</p>
                    </div>
                    <span className="message-timestamp">{dt}</span>
                  </div>
                );
              })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder="Type a message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Forums;

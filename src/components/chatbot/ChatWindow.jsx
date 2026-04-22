import { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import AIMessage from "./AIMessage";
import { runAIBrain } from "../../ai/aiBrain";
import {
  getAIUserContext,
  getAIStudentContext,
  getAIEventContext,
} from "../../firebase/aiContext";

const STORAGE_KEY = "clubhub_ai_temp_session";

const generateId = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

export default function ChatWindow({ onClose }) {
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // useEffect(() => {
  //   function handleClickOutside(e) {
  //     if (chatRef.current && !chatRef.current.contains(e.target)) {
  //       onClose();
  //     }
  //   }

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [onClose]);

  const sendMessage = async (text) => {
    const userMessage = {
      id: generateId(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const student = await getAIStudentContext();

      const aiData = await runAIBrain({
        message: text,
        user: getAIUserContext(),
        student,
        events: await getAIEventContext(student?.preferences?.interests || []),
      });

      const aiMessage = {
        id: generateId(),
        role: "ai",
        data: aiData,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "ai",
          data: {
            text: "AI is temporarily unavailable.",
            events: [],
            notes: ["Please try again later."],
            followUps: [],
          },
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div
      ref={chatRef}
      className="
        fixed bottom-24 right-6
        w-[360px] h-[520px]
        bg-white
        border
        rounded-2xl
        shadow-xl
        flex flex-col
        z-50
      "
    >
      <div className="px-4 py-3 border-b flex items-center">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mr-4 ml-2">
          <span className="text-blue-600 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#4285F4"
            >
              <path d="M296-270q-42 35-87.5 32T129-269q-34-28-46.5-73.5T99-436l75-124q-25-22-39.5-53T120-680q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47q-9 0-18-1t-17-3l-77 130q-11 18-7 35.5t17 28.5q13 11 31 12.5t35-12.5l420-361q42-35 88-31.5t80 31.5q34 28 46 73.5T861-524l-75 124q25 22 39.5 53t14.5 67q0 66-47 113t-113 47q-66 0-113-47t-47-113q0-66 47-113t113-47q9 0 17.5 1t16.5 3l78-130q11-18 7-35.5T782-630q-13-11-31-12.5T716-630L296-270Zm-16-330q33 0 56.5-23.5T360-680q0-33-23.5-56.5T280-760q-33 0-56.5 23.5T200-680q0 33 23.5 56.5T280-600Zm400 400q33 0 56.5-23.5T760-280q0-33-23.5-56.5T680-360q-33 0-56.5 23.5T600-280q0 33 23.5 56.5T680-200ZM280-680Zm400 400Z" />
            </svg>
          </span>
        </div>
        <div className="font-medium text-gray-800">ClubHub</div>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#4285F4"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-4">
        {messages.map((msg) =>
          msg.role === "user" ? (
            <ChatMessage key={msg.id} text={msg.text} />
          ) : (
            <AIMessage
              key={msg.id}
              data={msg.data}
              onFollowUpClick={sendMessage}
            />
          )
        )}

        {loading && <div className="text-xs text-gray-400">Thinking…</div>}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import ChatBubble from '@/components/chat/ChatBubble';
import type { ChatMessageWithUser, SessionUser } from '@/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch('/api/chat', { cache: 'no-store' });
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
  }, []);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      setUser(meData.user);
      await fetchMessages();

      if (meData.user?.campaign_id) {
        const supabase = createBrowserClient();
        const channel = supabase
          .channel(`chat-${meData.user.campaign_id}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: `campaign_id=eq.${meData.user.campaign_id}`,
            },
            () => {
              fetchMessages();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }

    const cleanup = init();
    const poll = setInterval(fetchMessages, 2000);

    return () => {
      clearInterval(poll);
      cleanup.then((fn) => fn?.());
    };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const draft = text.trim();
    setSending(true);
    setText('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: draft }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
      fetchMessages();
    } else {
      setText(draft);
    }
    setSending(false);
  }

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      <h2 className="mb-3 text-xl font-bold">Kamp Sohbeti</h2>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-gray-100 p-3">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isOwn={msg.user_id === user?.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mesajınızı yazın..."
          className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="min-h-[48px] min-w-[48px] rounded-xl bg-emerald-600 px-4 text-lg font-semibold text-white disabled:opacity-50"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

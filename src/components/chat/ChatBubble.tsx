import type { ChatMessageWithUser } from '@/types';

interface ChatBubbleProps {
  message: ChatMessageWithUser;
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  if (message.is_system) {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-600">
          {message.message}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isOwn
            ? 'rounded-br-sm bg-emerald-600 text-white'
            : 'rounded-bl-sm bg-white border border-gray-200 text-gray-900'
        }`}
      >
        {!isOwn && message.user && (
          <p className="mb-1 text-xs font-semibold text-emerald-700">
            {message.user.name}
          </p>
        )}
        <p className="text-lg">{message.message}</p>
        <p className={`mt-1 text-xs ${isOwn ? 'text-emerald-200' : 'text-gray-400'}`}>
          {new Date(message.created_at).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { MessageData, InlineNote } from "@/types/conversation";
import { blocksToText } from "@/types/conversation";
import type { FloatingNote } from "@/types/notes";
import { useStreamPost } from "@/hooks/useStreamPost";
import { useSidebar } from "./SidebarContext";
import { streamIntoVersion } from "@/utils/streamIntoVersion";

const API_URL = "http://localhost:3001";

interface ConversationContextValue {
  responding: boolean;
  responseError: string | null;
  title: string;
  subtitle: string;
  messages: MessageData[];
  floatingNotes: FloatingNote[];
  inlineNotes: InlineNote[];
  sendMessage: (text: string) => void;
  editMessage: (id: string, text: string) => void;
  retryMessage: (id: string) => void;
  setVersionIndex: (id: string, index: number) => void;
  addNote: (kind: FloatingNote["kind"], x: number, y: number) => void;
  moveNote: (id: string, x: number, y: number) => void;
  updateNote: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  setInlineNote: (messageId: string, text: string) => void;
  removeInlineNote: (messageId: string) => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(
  null,
);

let _noteId = 0;
const makeNoteId = () => `note-${++_noteId}`;

let _msgId = 0;
const makeMsgId = () => `msg-new-${++_msgId}`;

const NOTE_DEFAULTS: Record<FloatingNote["kind"], { w: number; rot: number }> =
  {
    sticky: { w: 180, rot: -1.5 },
    scribble: { w: 220, rot: -2 },
  };

export function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeConversationId, conversationList } = useSidebar();

  const messagesRef = useRef<MessageData[]>([]);
  const {
    streaming: responding,
    error: responseError,
    execute: streamChat,
  } = useStreamPost(`${API_URL}/api/chat`);

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [floatingNotes, setFloatingNotes] = useState<FloatingNote[]>([]);
  const [inlineNotes, setInlineNotes] = useState<InlineNote[]>([]);

  // Reset conversation state when active conversation changes
  useEffect(() => {
    setMessages([]);
    setFloatingNotes([]);
    setInlineNotes([]);
    messagesRef.current = [];
  }, [activeConversationId]);

  const activeConversation = conversationList.find(
    (c) => c.id === activeConversationId,
  );
  const title = activeConversation?.title ?? "";
  const subtitle = activeConversation?.subtitle ?? "";

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: MessageData = { id: makeMsgId(), role: "user", blocks: [{ kind: 'text', content: text }] };
      const updatedMessages = [...messagesRef.current, userMsg];
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;

      const assistantId = makeMsgId();
      const assistantMsg: MessageData = {
        id: assistantId,
        role: "assistant",
        blocks: [],
        versions: [[]],
        versionIndex: 0,
      };
      setMessages((ms) => [...ms, assistantMsg]);
      messagesRef.current = [...messagesRef.current, assistantMsg];

      const history = updatedMessages.map((m) => ({ role: m.role, content: blocksToText(m.blocks) }));
      await streamIntoVersion({ id: assistantId, versionIndex: 0, history, streamChat, setMessages, messagesRef });
    },
    [streamChat],
  );

  const editMessage = useCallback(
    async (id: string, text: string) => {
      const idx = messagesRef.current.findIndex((m) => m.id === id);
      if (idx === -1) return;

      const withEdit = messagesRef.current.map((m) =>
        m.id === id ? { ...m, blocks: [{ kind: 'text' as const, content: text }] } : m,
      );
      setMessages(withEdit);
      messagesRef.current = withEdit;

      const historyUpToEdit = withEdit
        .slice(0, idx + 1)
        .map((m) => ({ role: m.role, content: blocksToText(m.blocks) }));

      // Find the next assistant message (N+1) to append a new version to
      const nextMsg = messagesRef.current[idx + 1];
      if (nextMsg?.role === "assistant") {
        const prevVersions = nextMsg.versions ?? [nextMsg.blocks];
        const newVersionIndex = prevVersions.length;
        const withNewVersion = messagesRef.current.map((m) =>
          m.id === nextMsg.id
            ? { ...m, blocks: [], versions: [...prevVersions, []], versionIndex: newVersionIndex }
            : m,
        );
        setMessages(withNewVersion);
        messagesRef.current = withNewVersion;

        await streamIntoVersion({ id: nextMsg.id, versionIndex: newVersionIndex, history: historyUpToEdit, streamChat, setMessages, messagesRef });
      } else {
        const assistantId = makeMsgId();
        const assistantMsg: MessageData = {
          id: assistantId,
          role: "assistant",
          blocks: [],
          versions: [[]],
          versionIndex: 0,
        };
        setMessages((ms) => [...ms, assistantMsg]);
        messagesRef.current = [...messagesRef.current, assistantMsg];

        await streamIntoVersion({ id: assistantId, versionIndex: 0, history: historyUpToEdit, streamChat, setMessages, messagesRef });
      }
    },
    [streamChat],
  );

  const retryMessage = useCallback(async (id: string) => {
    const idx = messagesRef.current.findIndex((m) => m.id === id);
    if (idx === -1) return;

    const msg = messagesRef.current[idx];
    if (!msg) return;
    const prevVersions = msg.versions ?? [msg.blocks];
    const newVersionIndex = prevVersions.length;

    const withNewVersion = messagesRef.current.map((m) =>
      m.id === id
        ? { ...m, blocks: [], versions: [...prevVersions, []], versionIndex: newVersionIndex }
        : m,
    );
    setMessages(withNewVersion);
    messagesRef.current = withNewVersion;

    const history = messagesRef.current
      .slice(0, idx)
      .map((m) => ({ role: m.role, content: blocksToText(m.blocks) }));
    await streamIntoVersion({ id, versionIndex: newVersionIndex, history, streamChat, setMessages, messagesRef });
  }, [streamChat]);

  const setVersionIndex = useCallback((id: string, index: number) => {
    setMessages((ms) =>
      ms.map((m) => {
        if (m.id !== id || !m.versions) return m;
        return { ...m, versionIndex: index, blocks: m.versions[index] ?? [] };
      }),
    );
    messagesRef.current = messagesRef.current.map((m) => {
      if (m.id !== id || !m.versions) return m;
      return { ...m, versionIndex: index, blocks: m.versions[index] ?? [] };
    });
  }, []);

  const addNote = useCallback(
    (kind: FloatingNote["kind"], x: number, y: number) => {
      const note: FloatingNote = {
        id: makeNoteId(),
        conversationId: activeConversationId,
        kind,
        x,
        y,
        text: "",
        ...NOTE_DEFAULTS[kind],
      };
      setFloatingNotes((ns) => [...ns, note]);
    },
    [activeConversationId],
  );

  const moveNote = useCallback((id: string, x: number, y: number) => {
    setFloatingNotes((ns) => ns.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  const updateNote = useCallback((id: string, text: string) => {
    setFloatingNotes((ns) => ns.map((n) => (n.id === id ? { ...n, text } : n)));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setFloatingNotes((ns) => ns.filter((n) => n.id !== id));
  }, []);

  const setInlineNote = useCallback((messageId: string, text: string) => {
    setInlineNotes((ns) => {
      const exists = ns.find((n) => n.messageId === messageId);
      if (exists)
        return ns.map((n) => (n.messageId === messageId ? { ...n, text } : n));
      return [...ns, { id: `inline-${messageId}`, messageId, text }];
    });
  }, []);

  const removeInlineNote = useCallback((messageId: string) => {
    setInlineNotes((ns) => ns.filter((n) => n.messageId !== messageId));
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        responding,
        responseError,
        title,
        subtitle,
        messages,
        floatingNotes,
        inlineNotes,
        sendMessage,
        editMessage,
        retryMessage,
        setVersionIndex,
        addNote,
        moveNote,
        updateNote,
        deleteNote,
        setInlineNote,
        removeInlineNote,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const ctx = useContext(ConversationContext);
  if (!ctx)
    throw new Error("useConversation must be used within ConversationProvider");
  return ctx;
}

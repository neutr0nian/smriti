import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { MessageData, InlineNote, MessageBlock } from "@/types/conversation";
import { blocksToText } from "@/types/conversation";
import type { FloatingNote } from "@/types/notes";
import { useStreamPost } from "@/hooks/useStreamPost";
import { useSidebar } from "./SidebarContext";
import { streamIntoVersion } from "@/utils/streamIntoVersion";
import { listMessages, appendMessage, upsertAssistantMessage, updateMessageBlocks, updateMessageVersions } from "@/api/messages";
import {
  listInlineNotes, listFloatingNotes,
  setInlineNote as apiSetInlineNote, removeInlineNote as apiRemoveInlineNote,
  addFloatingNote as apiAddFloatingNote, moveFloatingNote as apiMoveFloatingNote,
  resizeFloatingNote as apiResizeFloatingNote,
  updateFloatingNote as apiUpdateFloatingNote, deleteFloatingNote as apiDeleteFloatingNote,
} from "@/api/notes";
import { touchConversation } from "@/api/conversations";

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
  commitNoteMove: (id: string, x: number, y: number) => Promise<void>;
  resizeNote: (id: string, w: number, h: number) => void;
  commitNoteResize: (id: string, w: number, h: number) => Promise<void>;
  updateNote: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  setInlineNote: (messageId: string, text: string) => void;
  removeInlineNote: (messageId: string) => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

const NOTE_DEFAULTS: Record<FloatingNote["kind"], { w: number; rot: number }> = {
  sticky: { w: 180, rot: -1.5 },
  scribble: { w: 220, rot: -2 },
};

export function ConversationProvider({ children }: { children: React.ReactNode }) {
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

  useEffect(() => {
    let cancelled = false;
    if (!activeConversationId) {
      setMessages([]);
      setFloatingNotes([]);
      setInlineNotes([]);
      messagesRef.current = [];
      return;
    }
    Promise.all([
      listMessages(activeConversationId),
      listInlineNotes(activeConversationId),
      listFloatingNotes(activeConversationId),
    ]).then(([msgs, inline, floating]) => {
      if (cancelled) return;
      setMessages(msgs);
      messagesRef.current = msgs;
      setInlineNotes(inline);
      setFloatingNotes(floating);
    });
    return () => { cancelled = true };
  }, [activeConversationId]);

  const activeConversation = conversationList.find(c => c.id === activeConversationId);
  const title = activeConversation?.title ?? "";
  const subtitle = activeConversation?.subtitle ?? "";

  const persistAssistantMessage = useCallback(async (id: string) => {
    const msg = messagesRef.current.find(m => m.id === id);
    if (!msg) return;
    await upsertAssistantMessage(activeConversationId, msg);
  }, [activeConversationId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!activeConversationId) return;

    const userMsg: MessageData = {
      id: crypto.randomUUID(),
      role: "user",
      blocks: [{ kind: "text", content: text }],
    };
    const updatedMessages = [...messagesRef.current, userMsg];
    setMessages(updatedMessages);
    messagesRef.current = updatedMessages;
    await appendMessage(activeConversationId, userMsg);
    void touchConversation(activeConversationId);

    const assistantMsg: MessageData = {
      id: crypto.randomUUID(),
      role: "assistant",
      blocks: [],
      versions: [[]],
      versionIndex: 0,
    };
    setMessages(ms => [...ms, assistantMsg]);
    messagesRef.current = [...messagesRef.current, assistantMsg];

    const history = updatedMessages.map(m => ({ role: m.role, content: blocksToText(m.blocks) }));
    await streamIntoVersion({ id: assistantMsg.id, versionIndex: 0, history, streamChat, setMessages, messagesRef });
    await persistAssistantMessage(assistantMsg.id);
  }, [activeConversationId, streamChat, persistAssistantMessage]);

  const editMessage = useCallback(async (id: string, text: string) => {
    if (!activeConversationId) return;
    const idx = messagesRef.current.findIndex(m => m.id === id);
    if (idx === -1) return;

    const newBlocks: MessageBlock[] = [{ kind: "text", content: text }];
    const withEdit = messagesRef.current.map(m => m.id === id ? { ...m, blocks: newBlocks } : m);
    setMessages(withEdit);
    messagesRef.current = withEdit;
    await updateMessageBlocks(id, newBlocks);
    void touchConversation(activeConversationId);

    const historyUpToEdit = withEdit
      .slice(0, idx + 1)
      .map(m => ({ role: m.role, content: blocksToText(m.blocks) }));

    const nextMsg = messagesRef.current[idx + 1];
    if (nextMsg?.role === "assistant") {
      const prevVersions = nextMsg.versions ?? [nextMsg.blocks];
      const newVersionIndex = prevVersions.length;
      const withNewVersion = messagesRef.current.map(m =>
        m.id === nextMsg.id
          ? { ...m, blocks: [], versions: [...prevVersions, []], versionIndex: newVersionIndex }
          : m,
      );
      setMessages(withNewVersion);
      messagesRef.current = withNewVersion;

      await streamIntoVersion({ id: nextMsg.id, versionIndex: newVersionIndex, history: historyUpToEdit, streamChat, setMessages, messagesRef });
      await persistAssistantMessage(nextMsg.id);
    } else {
      const assistantMsg: MessageData = {
        id: crypto.randomUUID(),
        role: "assistant",
        blocks: [],
        versions: [[]],
        versionIndex: 0,
      };
      setMessages(ms => [...ms, assistantMsg]);
      messagesRef.current = [...messagesRef.current, assistantMsg];

      await streamIntoVersion({ id: assistantMsg.id, versionIndex: 0, history: historyUpToEdit, streamChat, setMessages, messagesRef });
      await persistAssistantMessage(assistantMsg.id);
    }
  }, [activeConversationId, streamChat, persistAssistantMessage]);

  const retryMessage = useCallback(async (id: string) => {
    if (!activeConversationId) return;
    const idx = messagesRef.current.findIndex(m => m.id === id);
    if (idx === -1) return;

    const msg = messagesRef.current[idx];
    if (!msg) return;
    const prevVersions = msg.versions ?? [msg.blocks];
    const newVersionIndex = prevVersions.length;

    const withNewVersion = messagesRef.current.map(m =>
      m.id === id
        ? { ...m, blocks: [], versions: [...prevVersions, []], versionIndex: newVersionIndex }
        : m,
    );
    setMessages(withNewVersion);
    messagesRef.current = withNewVersion;
    void touchConversation(activeConversationId);

    const history = messagesRef.current
      .slice(0, idx)
      .map(m => ({ role: m.role, content: blocksToText(m.blocks) }));
    await streamIntoVersion({ id, versionIndex: newVersionIndex, history, streamChat, setMessages, messagesRef });
    await persistAssistantMessage(id);
  }, [activeConversationId, streamChat, persistAssistantMessage]);

  const setVersionIndex = useCallback(async (id: string, index: number) => {
    const updateOne = (m: MessageData) => {
      if (m.id !== id || !m.versions) return m;
      return { ...m, versionIndex: index, blocks: m.versions[index] ?? [] };
    };
    setMessages(ms => ms.map(updateOne));
    messagesRef.current = messagesRef.current.map(updateOne);

    const msg = messagesRef.current.find(m => m.id === id);
    if (msg?.versions) {
      await updateMessageVersions(id, msg.blocks, msg.versions, index);
    }
  }, []);

  const addNote = useCallback(async (kind: FloatingNote["kind"], x: number, y: number) => {
    if (!activeConversationId) return;
    const note: FloatingNote = {
      id: crypto.randomUUID(),
      conversationId: activeConversationId,
      kind, x, y,
      text: "",
      ...NOTE_DEFAULTS[kind],
    };
    setFloatingNotes(ns => [...ns, note]);
    await apiAddFloatingNote(note);
  }, [activeConversationId]);

  const moveNote = useCallback((id: string, x: number, y: number) => {
    setFloatingNotes(ns => ns.map(n => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  const commitNoteMove = useCallback(async (id: string, x: number, y: number) => {
    await apiMoveFloatingNote(id, Math.round(x), Math.round(y));
  }, []);

  const resizeNote = useCallback((id: string, w: number, h: number) => {
    setFloatingNotes(ns => ns.map(n => (n.id === id ? { ...n, w, h } : n)));
  }, []);

  const commitNoteResize = useCallback(async (id: string, w: number, h: number) => {
    await apiResizeFloatingNote(id, Math.round(w), Math.round(h));
  }, []);

  const updateNote = useCallback(async (id: string, text: string) => {
    setFloatingNotes(ns => ns.map(n => (n.id === id ? { ...n, text } : n)));
    await apiUpdateFloatingNote(id, text);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setFloatingNotes(ns => ns.filter(n => n.id !== id));
    await apiDeleteFloatingNote(id);
  }, []);

  const setInlineNote = useCallback(async (messageId: string, text: string) => {
    if (!activeConversationId) return;
    setInlineNotes(ns => {
      const exists = ns.find(n => n.messageId === messageId);
      if (exists) return ns.map(n => (n.messageId === messageId ? { ...n, text } : n));
      return [...ns, { id: `inline-${messageId}`, messageId, text }];
    });
    await apiSetInlineNote(activeConversationId, messageId, text);
  }, [activeConversationId]);

  const removeInlineNote = useCallback(async (messageId: string) => {
    setInlineNotes(ns => ns.filter(n => n.messageId !== messageId));
    await apiRemoveInlineNote(messageId);
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
        commitNoteMove,
        resizeNote,
        commitNoteResize,
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
  if (!ctx) throw new Error("useConversation must be used within ConversationProvider");
  return ctx;
}

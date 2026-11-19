"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ArrowUp,
  Paperclip,
  Loader2,
  X,
  Sparkles,
  Wand2,
  Square,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import type { Message, StatusStep } from "@/types/workspace";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { BlueTitle } from "@/components/reusables/reusable";
import { PricingModal } from "@/components/common/pricing-modal";
import "./style.scss";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

interface ChatPanelProps {
  messages: Message[];
  isGenerating: boolean;
  isImproving: boolean;
  statusLog: StatusStep[];
  credits: number;
  initialPrompt: string | null;
  onGenerate: (prompt: string, imageUrl?: string) => Promise<void>;
  onStop: () => void;
  userId: string;
  workspaceId: string | null;
  appTitle: string | null;
}

export function ChatPanel({
  messages,
  isGenerating,
  isImproving,
  statusLog,
  credits,
  initialPrompt,
  onGenerate,
  onStop,
  userId,
  workspaceId,
  appTitle,
}: ChatPanelProps) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredInitialPrompt = useRef(false);

  const noCredits = credits <= 0;

  useEffect(() => {
    if (initialPrompt && !hasTriggeredInitialPrompt.current) {
      hasTriggeredInitialPrompt.current = true;
      onGenerate(initialPrompt);
    }
  }, [initialPrompt, onGenerate]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, statusLog, isGenerating, isImproving]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating || isImproving || noCredits) return;
    const imgUrl = pendingImageUrl ?? undefined;
    setInput("");
    setPendingImageUrl(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await onGenerate(trimmed, imgUrl);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (!supabase) return;
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${workspaceId ?? "new"}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("workspace-images")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage
        .from("workspace-images")
        .getPublicUrl(path);
      setPendingImageUrl(data.publicUrl);
    } catch {
      // silent
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const canSubmit =
    input.trim().length > 0 && !isGenerating && !isImproving && !noCredits;

  const isStreamingAssistant = isImproving;

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <BlueTitle>{appTitle}</BlueTitle>
        <PricingModal reason={noCredits ? "credits" : "upgrade"}>
          <span
            className={`credit-badge ${noCredits ? "no-credits" : "has-credits"}`}
          >
            {noCredits
              ? "No credits · Upgrade"
              : `${credits} credit${credits !== 1 ? "s" : ""}`}
          </span>
        </PricingModal>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="chat-messages-container">
        {messages.length === 0 && !isGenerating && (
          <div className="chat-empty-state">
            <p>Describe what you want to build…</p>
          </div>
        )}

        <div className="messages-list">
          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const isLiveStream = isLast && isStreamingAssistant;

            return (
              <div key={i}>
                {msg.role === "user" ? (
                  <div className="message-user">
                    <div className="user-bubble">
                      {msg.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={msg.imageUrl}
                          alt="uploaded"
                          className="user-image"
                        />
                      )}
                      <div className="user-text-box">
                        <p className="user-text">{msg.content}</p>
                      </div>
                    </div>
                    {user?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.imageUrl}
                        alt={user.fullName ?? "You"}
                        className="user-avatar"
                      />
                    ) : (
                      <div className="user-avatar-fallback">
                        {user?.firstName?.[0] ?? "U"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="message-assistant">
                    <Image
                      src="/logo-short.jpeg"
                      alt="Forge"
                      width={24}
                      height={24}
                      className="assistant-avatar"
                    />
                    <div className="assistant-bubble">
                      {isLiveStream && !msg.content ? (
                        <div className="thinking-placeholder">
                          <Wand2 className="h-3 w-3 animate-pulse" />
                          <span>Cline is thinking…</span>
                        </div>
                      ) : isLiveStream && msg.content ? (
                        <div className="reasoning-box">
                          <div className="reasoning-header">
                            <Wand2 className="h-3 w-3" />
                            <span>Agent reasoning</span>
                          </div>
                          <p className="reasoning-text">
                            {msg.content}
                            <span className="cursor-blink" />
                          </p>
                        </div>
                      ) : (
                        <div className="markdown-content">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Live status steps */}
          {isGenerating && (
            <div className="message-assistant">
              <Image
                src="/logo-short.jpeg"
                alt="Forge"
                width={24}
                height={24}
                className="assistant-avatar"
              />
              <div className="assistant-bubble status-log-bubble">
                <div className="status-steps-list">
                  {statusLog.map((step, i) => (
                    <div key={i} className="status-step-item">
                      <div className="step-icon-wrapper">
                        {step.status === "running" ? (
                          <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                        ) : (
                          <svg
                            className="h-3 w-3 text-white/25"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`step-label ${
                          step.status === "running" ? "running" : "done"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* No-credits alert banner */}
      {noCredits && (
        <div className="no-credits-alert">
          <p className="alert-text">You&apos;ve used all your credits</p>
          <PricingModal reason="credits">
            <span className="upgrade-pill">
              <Sparkles className="h-3 w-3" />
              Upgrade plan
            </span>
          </PricingModal>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-wrapper">
        {pendingImageUrl && (
          <div className="image-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImageUrl}
              alt="pending upload"
              className="image-preview-img"
            />
            <button
              onClick={() => setPendingImageUrl(null)}
              className="image-preview-remove"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        )}

        <div className={`input-box ${noCredits ? "disabled" : ""}`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating || isImproving || noCredits}
            placeholder={
              noCredits
                ? "Upgrade to keep building…"
                : isImproving
                ? "Cline is improving your app…"
                : isGenerating
                ? "Generating…"
                : "Ask AI to modify…"
            }
            rows={1}
            className="chat-textarea"
            style={{ maxHeight: 160 }}
          />

          <div className="input-toolbar">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileRef.current?.click()}
              disabled={isGenerating || isImproving || isUploading || noCredits}
              className="attach-btn"
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Paperclip className="h-3.5 w-3.5" />
              )}
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {isGenerating || isImproving ? (
              <Button size="icon" onClick={onStop} className="stop-btn">
                <Square className="h-3 w-3 fill-current" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`send-btn ${canSubmit ? "active" : "inactive"}`}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <p className="input-hint">
          {isGenerating || isImproving
            ? "Click ■ to stop generation"
            : "⏎ to send · Shift+⏎ for new line"}
        </p>
      </div>
    </div>
  );
}

export default ChatPanel;

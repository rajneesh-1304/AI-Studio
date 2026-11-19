// CodePanel.tsx
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";
import {
  Eye,
  Code2,
  Download,
  AlertTriangle,
  Bot,
  Loader2,
  ArrowUp,
} from "lucide-react";
import { RingLoader } from "react-spinners";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { exportWorkspace } from "@/actions/workspace";
import type { FileData, StatusStep } from "@/types/workspace";
import { PricingModal } from "@/components/common/pricing-modal";
import "./style.scss";

// ─── Placeholder ──────────────────────────────────────────────────────────────

const PLACEHOLDER_FILES = {
  "/App.js": {
    code: `export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
        <p style={{ fontSize: 14 }}>Your app will appear here</p>
      </div>
    </div>
  );
}`,
  },
};

// ─── Base dependencies ────────────────────────────────────────────────────────

const BASE_DEPENDENCIES: Record<string, string> = {
  "react-is": "latest",
  "react-router-dom": "latest",
  "lucide-react": "latest",
  recharts: "latest",
  "date-fns": "latest",
  "framer-motion": "latest",
  "react-hook-form": "latest",
  "@hookform/resolvers": "latest",
  zod: "latest",
  "@radix-ui/react-dialog": "latest",
  "@radix-ui/react-dropdown-menu": "latest",
  "@radix-ui/react-tabs": "latest",
  "@radix-ui/react-tooltip": "latest",
  "@radix-ui/react-accordion": "latest",
  "@radix-ui/react-select": "latest",
  axios: "latest",
  clsx: "latest",
  "class-variance-authority": "latest",
  "tailwind-merge": "latest",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = "preview" | "code";

interface CodePanelProps {
  fileData: FileData | null;
  isGenerating: boolean;
  statusLog: StatusStep[];
  onImprove: (userRequest: string) => Promise<void>;
  onFixError: (error: string) => Promise<void>;
  onFilePatch: (patches: FileData) => void;
  appTitle: string | null;
  isImproving: boolean;
  isProUser: boolean;
  workspaceId: string | null;
  userId: string;
}

// ─── SandpackInner ────────────────────────────────────────────────────────────

function SandpackInner({
  isGenerating,
  statusLog,
  activeTab,
  setActiveTab,
  onImprove,
  onFixError,
  fileData,
  appTitle,
  isImproving,
  isProUser,
  workspaceId,
  userId,
}: {
  isGenerating: boolean;
  statusLog: StatusStep[];
  activeTab: ActiveTab;
  setActiveTab: (t: ActiveTab) => void;
  onImprove: (userRequest: string) => Promise<void>;
  onFixError: (error: string) => Promise<void>;
  fileData: FileData | null;
  appTitle: string | null;
  isImproving: boolean;
  isProUser: boolean;
  workspaceId: string | null;
  userId: string;
}) {
  const { sandpack, listen } = useSandpack();
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingWorkspace, setIsExportingWorkspace] = useState(false);
  const [improveInput, setImproveInput] = useState("");
  const [showImproveInput, setShowImproveInput] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const prevFilesRef = useRef<Record<string, { code: string }>>({});
  useEffect(() => {
    if (!fileData?.files) return;
    const prev = prevFilesRef.current;
    for (const [path, { code }] of Object.entries(fileData.files)) {
      if (prev[path]?.code !== code) {
        sandpack.updateFile(path, code);
      }
    }
    prevFilesRef.current = fileData.files;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileData?.files]);

  useEffect(() => {
    unsubscribeRef.current = listen((msg: any) => {
      if (
        msg.type === "action" &&
        "action" in msg &&
        msg.action === "show-error"
      ) {
        const errMsg =
          "message" in msg && typeof msg.message === "string"
            ? msg.message
            : "An error occurred in the preview.";
        setPreviewError(errMsg);
        return;
      }
      if (msg.type === "compile") {
        const errMsg =
          "message" in msg && typeof msg.message === "string"
            ? msg.message
            : "Compile error in preview.";
        setPreviewError(errMsg);
        return;
      }
      if (msg.type === "success") {
        setPreviewError(null);
      }
    });
    return () => unsubscribeRef.current?.();
  }, [listen]);

  useEffect(() => {
    if (isGenerating) setPreviewError(null);
  }, [isGenerating]);

  const handleImproveSubmit = async () => {
    const trimmed = improveInput.trim();
    if (!trimmed || isImproving) return;
    setImproveInput("");
    setShowImproveInput(false);
    await onImprove(trimmed);
  };

  // ── Export to ZIP ──────────────────────────────────────────────────────────
  const handleExportZip = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const filesToZip =
        Object.keys(sandpack.files).length > 0
          ? sandpack.files
          : fileData?.files ?? {};

      const dependencies = {
        ...BASE_DEPENDENCIES,
        ...(fileData?.dependencies ?? {}),
      };

      const zip = new JSZip();

      const packageJson = {
        name: "forge-app",
        version: "1.0.0",
        private: true,
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          ...dependencies,
        },
        scripts: {
          start: "react-scripts start",
          build: "react-scripts build",
        },
      };

      zip.file("package.json", JSON.stringify(packageJson, null, 2));

      zip.file(
        "public/index.html",
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Forge App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
      );

      for (const [filePath, fileObj] of Object.entries(filesToZip)) {
        const code =
          typeof fileObj === "object" && fileObj !== null && "code" in fileObj
            ? (fileObj as { code: string }).code
            : "";
        const zipPath = filePath.startsWith("/")
          ? `src${filePath}`
          : `src/${filePath}`;
        zip.file(zipPath, code);
      }

      zip.file(
        "src/index.js",
        `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);`
      );

      zip.file(
        "README.md",
        `# Forge App\n\nGenerated with [Forge](https://forge.app).\n\n## Getting started\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\``
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const zipName = appTitle
        ? `${appTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}.zip`
        : "forge-app.zip";
      a.download = zipName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // ── Export workspace as JSON ───────────────────────────────────────────────
  const handleExportWorkspace = async () => {
    if (isExportingWorkspace || !workspaceId) return;
    setIsExportingWorkspace(true);
    try {
      const data = await exportWorkspace(workspaceId, userId);
      if (!data) return;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const slug = appTitle
        ? appTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        : "forge-app";
      a.download = `${slug}-workspace.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Workspace export failed:", err);
    } finally {
      setIsExportingWorkspace(false);
    }
  };

  const currentStepLabel =
    statusLog[statusLog.length - 1]?.label ?? "Generating…";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as ActiveTab)}
      className="code-panel-tabs"
    >
      {/* Tabs + Actions bar */}
      <div className="code-panel-toolbar">
        <TabsList variant="line" className="toolbar-tabs-list">
          <TabsTrigger className="toolbar-tab-trigger" value="code">
            <Code2 />
            Code
          </TabsTrigger>
          <TabsTrigger className="toolbar-tab-trigger" value="preview">
            <Eye />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="toolbar-actions">
          {isProUser ? (
            showImproveInput ? (
              <div className="improve-form">
                <div className="improve-input-wrapper">
                  <Bot className="improve-icon" />
                  <input
                    autoFocus
                    value={improveInput}
                    onChange={(e) => setImproveInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleImproveSubmit();
                      if (e.key === "Escape") setShowImproveInput(false);
                    }}
                    placeholder="What should I improve?"
                    className="improve-input"
                  />
                </div>
                <button
                  onClick={handleImproveSubmit}
                  disabled={!improveInput.trim() || isImproving}
                  className="improve-submit-btn"
                >
                  {isImproving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowImproveInput(true)}
                disabled={isImproving || !fileData}
                className="improve-trigger-btn"
              >
                {isImproving ? (
                  <Loader2 className="agent-icon animate-spin" />
                ) : (
                  <Bot className="agent-icon" />
                )}
                <span className="agent-text">
                  {isImproving ? "Improving…" : "Improve with Agent"}
                </span>
                {!isImproving && <span className="pro-badge">PRO</span>}
              </button>
            )
          ) : (
            <PricingModal reason="upgrade">
              <span className="improve-trigger-btn">
                <Bot className="agent-icon" />
                <span className="agent-text">Improve with Agent</span>
                <span className="pro-badge">PRO</span>
              </span>
            </PricingModal>
          )}

          <Button
            variant="ghost"
            onClick={handleExportZip}
            disabled={isExporting || !fileData}
            className="action-btn"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download ZIP
          </Button>

          <Button
            variant="ghost"
            onClick={handleExportWorkspace}
            disabled={isExportingWorkspace || !workspaceId}
            className="action-btn"
          >
            {isExportingWorkspace ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export Workspace
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="code-panel-body">
        {(isGenerating || isImproving) && (
          <div className="loading-overlay">
            <RingLoader color="#60a5fa" size={64} speedMultiplier={0.8} />
            <div className="loading-text-group">
              <p className="loading-step-label">
                {isImproving ? "Improving with Cline AI…" : currentStepLabel}
              </p>
              <p className="loading-hint">This usually takes 10–20 seconds</p>
            </div>
          </div>
        )}

        <SandpackLayout
          style={{
            height: "100%",
            border: "none",
            borderRadius: 0,
            background: "transparent",
          }}
        >
          <TabsContent value="preview" keepMounted className="mt-0 h-full w-full">
            <SandpackPreview
              style={{ height: "100%" }}
              showOpenInCodeSandbox={false}
            />
          </TabsContent>

          <TabsContent value="code" keepMounted className="mt-0 flex h-full w-full">
            <SandpackFileExplorer
              style={{
                height: "100%",
                width: "180px",
                borderRight: "0.5px solid rgba(255,255,255,0.08)",
              }}
            />
            <SandpackCodeEditor
              style={{ height: "100%", flex: 1 }}
              showTabs
              showLineNumbers
              showInlineErrors
              closableTabs
              readOnly
            />
          </TabsContent>
        </SandpackLayout>
      </div>

      {/* Preview error banner */}
      {previewError &&
        !isGenerating &&
        !isImproving &&
        activeTab === "preview" && (
          <div className="preview-error-bar">
            <AlertTriangle className="error-icon" />
            <div className="error-content">
              <p className="error-title">Preview error</p>
              <p className="error-message">{previewError}</p>
            </div>
            <Button
              onClick={() => onFixError(previewError)}
              variant="destructive"
              className="fix-btn"
            >
              <Bot className="h-3 w-3" />
              Fix with AI
            </Button>
          </div>
        )}
    </Tabs>
  );
}

// ─── CodePanel (outer) ────────────────────────────────────────────────────────

export function CodePanel({
  fileData,
  isGenerating,
  statusLog,
  onImprove,
  onFixError,
  onFilePatch: _onFilePatch,
  appTitle,
  isImproving,
  isProUser,
  workspaceId,
  userId,
}: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("preview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (fileData) setActiveTab("preview");
  }, [fileData]);

  if (!mounted) {
    return (
      <div className="code-panel flex items-center justify-center">
        <div className="text-center text-white/30">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-white/40" />
          <p className="text-sm">Loading workspace preview...</p>
        </div>
      </div>
    );
  }

  const files = fileData?.files ?? PLACEHOLDER_FILES;
  const dependencies = {
    ...BASE_DEPENDENCIES,
    ...(fileData?.dependencies ?? {}),
  };

  const filePathKey = Object.keys(files).sort().join("|");

  return (
    <div className="code-panel">
      <SandpackProvider
        key={filePathKey}
        template="react"
        theme={dracula}
        files={files}
        customSetup={{ dependencies }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          recompileMode: "delayed",
          recompileDelay: 500,
        }}
      >
        <SandpackInner
          isGenerating={isGenerating}
          statusLog={statusLog}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onImprove={onImprove}
          onFixError={onFixError}
          fileData={fileData}
          appTitle={appTitle}
          isImproving={isImproving}
          isProUser={isProUser}
          workspaceId={workspaceId}
          userId={userId}
        />
      </SandpackProvider>
    </div>
  );
}

export default CodePanel;

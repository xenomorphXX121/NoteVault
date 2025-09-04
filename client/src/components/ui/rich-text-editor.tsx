import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Link, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing...", className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const formatButton = (command: string, icon: React.ReactNode, title: string) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => execCommand(command)}
      title={title}
      className="h-8 w-8"
      data-testid={`button-format-${command.toLowerCase()}`}
    >
      {icon}
    </Button>
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-2 border-b border-border bg-card">
        <div className="flex items-center space-x-1 border-r border-border pr-3">
          {formatButton("bold", <Bold className="h-4 w-4" />, "Bold")}
          {formatButton("italic", <Italic className="h-4 w-4" />, "Italic")}
          {formatButton("underline", <Underline className="h-4 w-4" />, "Underline")}
        </div>

        <div className="flex items-center space-x-1 border-r border-border pr-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => execCommand("formatBlock", "h1")}
            title="Heading 1"
            className="h-8 w-8"
            data-testid="button-format-heading1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          {formatButton("insertUnorderedList", <List className="h-4 w-4" />, "Bullet List")}
          {formatButton("insertOrderedList", <ListOrdered className="h-4 w-4" />, "Numbered List")}
        </div>

        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) execCommand("createLink", url);
            }}
            title="Insert Link"
            className="h-8 w-8"
            data-testid="button-format-link"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => execCommand("formatBlock", "pre")}
            title="Code Block"
            className="h-8 w-8"
            data-testid="button-format-code"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-6 bg-background text-foreground resize-none border-none outline-none focus:ring-0 overflow-y-auto min-h-[500px] leading-relaxed"
        style={{ fontFamily: "var(--font-sans)" }}
        data-placeholder={placeholder}
        data-testid="editor-content"
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        
        [contenteditable] pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.375rem;
          margin: 1rem 0;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          overflow-x: auto;
        }
        
        [contenteditable] a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}

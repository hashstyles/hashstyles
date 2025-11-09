import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SearchBar() {
  const [open, setOpen] = React.useState(false);
  const [sp] = useSearchParams();
  const [q, setQ] = React.useState(sp.get("q") || "");
  const nav = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const submit = () => {
    const cat = sp.get("cat");
    const params = new URLSearchParams();
    if (cat) params.set("cat", cat);
    if (q.trim()) params.set("q", q.trim());
    nav(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
    if (e.key === "Escape") setOpen(false);
  };

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  return (
    <>
      {/* Trigger: only when closed */}
      {!open && (
        <button
          className="h-10 w-10 flex items-center justify-center"
          aria-label="Search"
          onClick={() => setOpen(true)}
        >
          <span className="material-symbols-outlined">search</span>
        </button>
      )}

      {/* Flat top bar: no outer rounded box, no shadow */}
      {open && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--border)]">
          <div className="mx-auto max-w-screen-sm px-3 py-2">
            <div className="flex items-center gap-2">
              {/* close (replaces extra lens or outer box look) */}
              <button
                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-black/5"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              {/* input */}
              <div className="flex-1">
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Search products..."
                  className="w-full h-10 rounded-xl border border-[var(--border)] px-3 outline-none bg-white"
                />
              </div>

              {/* action */}
              <button
                className="h-10 px-4 rounded-xl bg-primary-500 text-white font-semibold"
                onClick={submit}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

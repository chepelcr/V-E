import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, RotateCcw, Download } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson, hydrateInventory } from "@/lib/admin-store";
import { getInventory } from "@/repositories/inventory.repository";
import { useT } from "@/lib/admin-i18n";

/**
 * Inventory map (Pattern 7 — tooling). Interactive pan/zoom SVG dependency graph
 * built from `inventory.json` ({ nodes, edges }). Columns run data→logic→UI by
 * the node `type`; category chips toggle layer visibility; a search highlights
 * matches; clicking a node highlights its neighborhood; a detail panel lists
 * uses / used-by; wheel-zoom is a non-passive listener; a Fullscreen toggle blows
 * the canvas up to the viewport. Read-only — the only action is a download.
 */

interface Node {
  id: string;
  label: string;
  type: string;
  group: string;
  path: string;
}
interface Edge {
  from: string;
  to: string;
  kind: string;
}

/** Category → column index (data→logic→UI) + legend color. */
const TYPE_META: Record<string, { col: number; color: string; label: string }> = {
  content: { col: 0, color: "#0ea5e9", label: "content" },
  repository: { col: 1, color: "#8b5cf6", label: "repository" },
  service: { col: 1, color: "#a78bfa", label: "service" },
  context: { col: 2, color: "#f59e0b", label: "context" },
  hook: { col: 2, color: "#fbbf24", label: "hook" },
  lib: { col: 2, color: "#64748b", label: "lib" },
  component: { col: 3, color: "#10b981", label: "component" },
  page: { col: 4, color: "#ef4444", label: "page" },
};
const FALLBACK = { col: 2, color: "#64748b", label: "other" };
const meta = (type: string) => TYPE_META[type] ?? FALLBACK;

const COL_W = 240;
const ROW_H = 34;
const NODE_W = 180;
const NODE_H = 24;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function InventoryPage() {
  const { t } = useT();
  // Hydrate the admin-only inventory graph from the (admin-only) repository so
  // its heavy node/edge data never lands in the public bundle.
  useEffect(() => {
    hydrateInventory(getInventory());
  }, []);
  const inv = useAdminStore((s) => s.inventory) as unknown as {
    generatedAt: string;
    counts: { nodes: number; edges: number };
    nodes: Node[];
    edges: Edge[];
  };

  const allTypes = useMemo(() => {
    const set = new Set(inv.nodes.map((n) => n.type));
    return Array.from(set).sort((a, b) => meta(a).col - meta(b).col);
  }, [inv.nodes]);

  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  // Pan/zoom transform.
  const [tx, setTx] = useState(40);
  const [ty, setTy] = useState(20);
  const [scale, setScale] = useState(0.8);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [isFull, setIsFull] = useState(false);

  // Layout: stack visible nodes vertically within their type's column.
  const layout = useMemo(() => {
    const visible = inv.nodes.filter((n) => !hidden.has(n.type));
    const byCol = new Map<number, Node[]>();
    for (const n of visible) {
      const c = meta(n.type).col;
      (byCol.get(c) ?? byCol.set(c, []).get(c)!).push(n);
    }
    const pos = new Map<string, { x: number; y: number }>();
    for (const [col, nodes] of byCol) {
      nodes.sort((a, b) => a.label.localeCompare(b.label));
      nodes.forEach((n, i) => pos.set(n.id, { x: col * COL_W, y: i * ROW_H }));
    }
    const height = Math.max(...Array.from(byCol.values()).map((a) => a.length), 1) * ROW_H + 40;
    return { pos, height, visible };
  }, [inv.nodes, hidden]);

  const visibleIds = useMemo(() => new Set(layout.visible.map((n) => n.id)), [layout.visible]);
  const edges = useMemo(
    () => inv.edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [inv.edges, visibleIds],
  );

  // Neighborhood of the selected node.
  const neighborhood = useMemo(() => {
    if (!selected) return null;
    const uses = edges.filter((e) => e.from === selected).map((e) => e.to);
    const usedBy = edges.filter((e) => e.to === selected).map((e) => e.from);
    return { uses, usedBy, set: new Set([selected, ...uses, ...usedBy]) };
  }, [selected, edges]);

  const matches = (n: Node) => {
    const q = query.trim().toLowerCase();
    return !!q && (n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
  };

  // Non-passive wheel zoom (React onWheel is passive → preventDefault ignored).
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => clamp(s * (e.deltaY < 0 ? 1.1 : 0.9), 0.25, 3));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Fullscreen tracking.
  useEffect(() => {
    const onFs = () => setIsFull(document.fullscreenElement === boxRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void boxRef.current?.requestFullscreen();
  };

  const toggleType = (type: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });

  const reset = () => {
    setTx(40);
    setTy(20);
    setScale(0.8);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, tx, ty };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setTx(drag.current.tx + (e.clientX - drag.current.x));
    setTy(drag.current.ty + (e.clientY - drag.current.y));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const nodeById = useMemo(() => new Map(inv.nodes.map((n) => [n.id, n])), [inv.nodes]);
  const selNode = selected ? nodeById.get(selected) : null;

  const dimNode = (n: Node) => {
    if (query.trim()) return !matches(n);
    if (neighborhood) return !neighborhood.set.has(n.id);
    return false;
  };
  const dimEdge = (e: Edge) => {
    if (neighborhood) return !(e.from === selected || e.to === selected);
    return false;
  };

  return (
    <div data-testid="admin-inventory-page">
      <PageHeader
        title={t("admin.inventory")}
        description={`${inv.counts.nodes} ${t("admin.inv_nodes")} · ${inv.counts.edges} ${t("admin.inv_edges")}`}
        action={
          <button
            onClick={() => downloadJson("inventory.json", inv)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-input text-sm font-medium transition-colors"
            data-testid="inv-download"
          >
            <Download className="w-4 h-4" />
            {t("admin.download")}
          </button>
        }
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("admin.inv_search")}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:border-primary w-48"
          data-testid="inv-search"
        />
        {allTypes.map((type) => {
          const m = meta(type);
          const off = hidden.has(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`flex items-center gap-1.5 h-8 px-2.5 rounded-full border text-xs font-medium transition-colors ${
                off ? "border-border text-muted-foreground/50 line-through" : "border-input text-foreground"
              }`}
              data-testid={`inv-chip-${type}`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
              {type}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_18rem] gap-4">
        {/* Graph canvas */}
        <div
          ref={boxRef}
          className={`relative rounded-2xl border border-border bg-card overflow-hidden ${isFull ? "" : "h-[560px]"}`}
          style={isFull ? { width: "100vw", height: "100vh" } : undefined}
        >
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground bg-background/80 rounded px-2 py-1">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={reset}
              className="p-1.5 rounded-lg border border-border bg-background/80 text-muted-foreground hover:text-foreground"
              title={t("admin.inv_reset")}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleFull}
              className="p-1.5 rounded-lg border border-border bg-background/80 text-muted-foreground hover:text-foreground"
              title={t("admin.inv_fullscreen")}
            >
              {isFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          <svg
            ref={svgRef}
            className="w-full h-full touch-none"
            style={{ cursor: drag.current ? "grabbing" : "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onClick={(e) => {
              if (e.target === svgRef.current) setSelected(null);
            }}
          >
            <g transform={`translate(${tx},${ty}) scale(${scale})`}>
              {edges.map((e, i) => {
                const a = layout.pos.get(e.from);
                const b = layout.pos.get(e.to);
                if (!a || !b) return null;
                return (
                  <line
                    key={i}
                    x1={a.x + NODE_W}
                    y1={a.y + NODE_H / 2}
                    x2={b.x}
                    y2={b.y + NODE_H / 2}
                    stroke="currentColor"
                    className={dimEdge(e) ? "text-border opacity-20" : "text-muted-foreground/40"}
                    strokeWidth={1}
                  />
                );
              })}
              {layout.visible.map((n) => {
                const p = layout.pos.get(n.id)!;
                const m = meta(n.type);
                const dim = dimNode(n);
                const isSel = n.id === selected;
                const hit = matches(n);
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x},${p.y})`}
                    className="cursor-pointer"
                    opacity={dim ? 0.2 : 1}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelected(n.id === selected ? null : n.id);
                    }}
                    data-testid={`inv-node-${n.id}`}
                  >
                    <rect
                      width={NODE_W}
                      height={NODE_H}
                      rx={5}
                      fill={hit ? m.color : "var(--card)"}
                      stroke={isSel || hit ? m.color : "var(--border)"}
                      strokeWidth={isSel ? 2.5 : 1.5}
                    />
                    <rect width={4} height={NODE_H} rx={2} fill={m.color} />
                    <text
                      x={10}
                      y={NODE_H / 2 + 4}
                      fontSize={11}
                      className="fill-foreground"
                      style={{ pointerEvents: "none" }}
                    >
                      {n.label.length > 24 ? n.label.slice(0, 23) + "…" : n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Detail panel */}
        <div className="rounded-2xl border border-border bg-card p-4 h-fit">
          {selNode ? (
            <div className="space-y-3">
              <div>
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                  style={{ background: meta(selNode.type).color }}
                >
                  {selNode.type}
                </span>
                <h3 className="text-sm font-semibold text-foreground mt-2 break-words">{selNode.label}</h3>
                <code className="text-[11px] font-mono text-muted-foreground break-all">{selNode.path}</code>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("admin.inv_uses")} ({neighborhood?.uses.length ?? 0})
                </p>
                <ul className="space-y-0.5">
                  {neighborhood?.uses.map((id) => (
                    <li key={id}>
                      <button
                        onClick={() => setSelected(id)}
                        className="text-xs text-primary hover:underline truncate block w-full text-left"
                      >
                        {nodeById.get(id)?.label ?? id}
                      </button>
                    </li>
                  ))}
                  {!neighborhood?.uses.length && <li className="text-xs text-muted-foreground">—</li>}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {t("admin.inv_usedBy")} ({neighborhood?.usedBy.length ?? 0})
                </p>
                <ul className="space-y-0.5">
                  {neighborhood?.usedBy.map((id) => (
                    <li key={id}>
                      <button
                        onClick={() => setSelected(id)}
                        className="text-xs text-primary hover:underline truncate block w-full text-left"
                      >
                        {nodeById.get(id)?.label ?? id}
                      </button>
                    </li>
                  ))}
                  {!neighborhood?.usedBy.length && <li className="text-xs text-muted-foreground">—</li>}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("admin.inv_clickPrompt")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

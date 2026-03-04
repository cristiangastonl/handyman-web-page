import { useState, useRef, useCallback } from "react";

/**
 * Smooth drag-and-drop reorderable list.
 * The ENTIRE row is draggable (not just the handle).
 * Clicks on buttons/inputs inside items still work normally.
 * All drag logic is synchronous via refs + direct DOM to prevent event leaking.
 */
export default function DragList({ items, keyFn, renderItem, onReorder }) {
  const [, forceRender] = useState(0);
  const listRef = useRef(null);
  const stateRef = useRef({ dragging: false, dragIdx: null, overIdx: null });
  const overlayRef = useRef(null);
  const dragStarted = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  // Track whether we need to block the next click — persists AFTER cleanup
  const shouldBlockClick = useRef(false);

  const getItemAtY = useCallback((y) => {
    if (!listRef.current) return null;
    const children = listRef.current.querySelectorAll("[data-drag-item]");
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (y < mid) return i;
    }
    return children.length - 1;
  }, []);

  const update = () => forceRender(c => c + 1);

  const handlePointerDown = useCallback((e, idx) => {
    // Don't start drag from buttons, inputs, textareas, or select elements
    const tag = e.target.tagName;
    if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea")) return;

    e.preventDefault();

    // Record start position - we'll only start drag after 4px movement
    startPos.current = { x: e.clientX, y: e.clientY };
    dragStarted.current = false;
    shouldBlockClick.current = false;
    window.__dragActive = true;

    const startDrag = () => {
      dragStarted.current = true;
      shouldBlockClick.current = true;
      stateRef.current = { dragging: true, dragIdx: idx, overIdx: idx };

      // Create overlay IMMEDIATELY via DOM to block all interaction outside list
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;z-index:9999;cursor:grabbing;";
      document.body.appendChild(overlay);
      overlayRef.current = overlay;

      if (listRef.current) {
        listRef.current.style.zIndex = "10000";
        listRef.current.style.position = "relative";
        listRef.current.style.userSelect = "none";
      }

      update();
    };

    const onMove = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      if (!dragStarted.current) {
        const dx = ev.clientX - startPos.current.x;
        const dy = ev.clientY - startPos.current.y;
        if (Math.abs(dx) + Math.abs(dy) < 4) return;
        startDrag();
      }

      const overIdx = getItemAtY(ev.clientY);
      if (overIdx !== null && overIdx !== stateRef.current.overIdx) {
        stateRef.current.overIdx = overIdx;
        update();
      }
    };

    const onUp = (ev) => {
      if (dragStarted.current) {
        ev.preventDefault();
        ev.stopPropagation();

        const { dragIdx, overIdx } = stateRef.current;
        if (overIdx !== null && overIdx !== dragIdx) {
          const reordered = [...items];
          const [moved] = reordered.splice(dragIdx, 1);
          reordered.splice(overIdx, 0, moved);
          onReorder(reordered);
        }
      }

      cleanup();
    };

    // Block ALL clicks unconditionally while this listener is active
    const blockClick = (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
    };

    document.addEventListener("pointermove", onMove, { capture: true });
    document.addEventListener("pointerup", onUp, { capture: true });
    document.addEventListener("click", blockClick, { capture: true });

    const cleanup = () => {
      document.removeEventListener("pointermove", onMove, { capture: true });
      document.removeEventListener("pointerup", onUp, { capture: true });

      // Keep click blocker active for 500ms after drag ends
      // This ensures any delayed click events get blocked
      setTimeout(() => {
        document.removeEventListener("click", blockClick, { capture: true });
        window.__dragActive = false;
        shouldBlockClick.current = false;
      }, 500);

      if (overlayRef.current) {
        overlayRef.current.remove();
        overlayRef.current = null;
      }
      if (listRef.current) {
        listRef.current.style.zIndex = "";
        listRef.current.style.position = "";
        listRef.current.style.userSelect = "";
      }

      stateRef.current = { dragging: false, dragIdx: null, overIdx: null };
      dragStarted.current = false;
      update();
    };
  }, [items, onReorder, getItemAtY]);

  const { dragging, dragIdx, overIdx } = stateRef.current;

  const getPreviewOrder = () => {
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) {
      return items.map((_, i) => i);
    }
    const order = items.map((_, i) => i);
    const [moved] = order.splice(dragIdx, 1);
    order.splice(overIdx, 0, moved);
    return order;
  };

  return (
    <div ref={listRef}>
      {getPreviewOrder().map((originalIdx) => {
        const item = items[originalIdx];
        const isBeingDragged = originalIdx === dragIdx;

        return (
          <div
            key={keyFn(item, originalIdx)}
            data-drag-item
            onPointerDown={(e) => handlePointerDown(e, originalIdx)}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "10px 8px",
              borderBottom: "1px solid #f0f0f0",
              borderRadius: isBeingDragged ? 8 : 0,
              background: isBeingDragged ? "#FFF8F0" : "transparent",
              boxShadow: isBeingDragged ? "0 2px 12px rgba(0,0,0,.1)" : "none",
              transform: isBeingDragged ? "scale(1.01)" : "scale(1)",
              transition: isBeingDragged ? "none" : "transform .2s ease, background .15s ease, box-shadow .15s ease",
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
          >
            {/* Drag handle indicator */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexShrink: 0,
                color: isBeingDragged ? "#999" : "#ccc",
                fontSize: 16,
                lineHeight: 1,
                userSelect: "none",
                padding: "4px 2px",
              }}
            >
              ⠿
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {renderItem(item, originalIdx)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

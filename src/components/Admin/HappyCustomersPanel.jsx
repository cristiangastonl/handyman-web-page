import { useState, useEffect, useCallback, useRef } from "react";
import { colors, spacing, typography, radii, A } from "../../lib/adminStyles";
import { AdminButton } from "./adminUI";
import DragList from "./DragList";
import {
  uploadImage, fetchHappyCustomers, addHappyCustomer,
  removeHappyCustomer, updateHappyCustomerOrder,
} from "../../lib/supabase";

/**
 * Happy Customers vive dentro de la pestaña Carousels, pero su cuerpo es distinto
 * al de los otros tres: no se curan fotos del portfolio, se suben propias.
 *
 * Son piezas que Anibal arma aparte (selfie con el cliente, marco y texto quemados
 * en la imagen). No son trabajos, no tienen categoría, y si fueran work_items
 * aparecerían en /portfolio. Por eso tienen tabla propia — happy-customers-migration.sql.
 */
export default function HappyCustomersPanel({ photos, setPhotos, flash, adminLoading, setAdminLoading }) {
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      try {
        const data = await fetchHappyCustomers();
        if (data) setPhotos(data);
      } catch (err) {
        console.warn("Happy customers load error:", err.message);
        loadedRef.current = false;
      }
    })();
  }, [setPhotos]);

  const handleUpload = async (e) => {
    const files = [...(e.target.files || [])];
    if (files.length === 0) return;
    setAdminLoading(true);
    // De a una y en orden: así el sort_order sigue el orden en que las elegiste,
    // y si una falla las anteriores ya quedaron guardadas.
    let added = 0;
    for (const [i, file] of files.entries()) {
      setUploading(files.length - i);
      try {
        const url = await uploadImage(file, "happy");
        const saved = await addHappyCustomer(url, "", photos.length + added);
        if (saved) {
          setPhotos(prev => [...prev, saved]);
          added++;
        }
      } catch (err) {
        flash(`Error subiendo ${file.name}: ${err.message}`);
      }
    }
    setUploading(0);
    setAdminLoading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (added > 0) flash(added === 1 ? "Photo added" : `${added} photos added`);
  };

  const handleRemove = async (id) => {
    setAdminLoading(true);
    try {
      await removeHappyCustomer(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
      flash("Photo removed");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleReorder = useCallback(async (reordered) => {
    setPhotos(reordered);
    try {
      await updateHappyCustomerOrder(reordered.map(p => p.id));
      flash("Order saved");
    } catch (err) { flash("Error saving order: " + err.message); }
  }, [setPhotos, flash]);

  return (
    <div>
      <div style={{ ...A.infoBox, marginBottom: spacing.lg, fontSize: 11, lineHeight: 1.6 }}>
        <strong>Happy Customers:</strong> these are your own photos with customers, not portfolio work —
        upload them here instead of picking from the Portfolio. Drag to reorder.
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg, flexWrap: "wrap" }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          disabled={adminLoading}
          style={{ fontSize: 11 }}
        />
        {uploading > 0 && (
          <span style={{ ...typography.caption, color: colors.brand }}>
            Uploading… {uploading} left
          </span>
        )}
      </div>

      <p style={typography.label}>Photos ({photos.length})</p>

      {photos.length === 0 ? (
        <p style={{ ...A.emptyState, padding: `${spacing.lg}px 0` }}>
          No photos yet. Upload your customer photos above.
        </p>
      ) : (
        <DragList
          items={photos}
          keyFn={(p) => p.id}
          onReorder={handleReorder}
          renderItem={(p) => (
            <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
              <img
                src={p.src}
                alt=""
                style={{ width: 48, height: 48, objectFit: "cover", borderRadius: radii.sm, background: colors.gray200, flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}/>
              <AdminButton variant="danger" size="small" onClick={() => handleRemove(p.id)} loading={adminLoading}>
                Remove
              </AdminButton>
            </div>
          )}
        />
      )}
    </div>
  );
}

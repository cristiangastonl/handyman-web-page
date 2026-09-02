import { createClient } from "@supabase/supabase-js";
import { escribir, sinFilas } from "./dbWrite";

// ─── Supabase client (nullable if not configured) ───
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Image upload ───
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadImage(file, folder) {
  if (!supabase) return null;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 5MB.`);
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type "${file.type}". Allowed types: JPEG, PNG, WebP, GIF.`);
  }
  const ext = file.name.split(".").pop();
  const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(name, file);
  if (error) throw error;
  const { data } = supabase.storage.from("images").getPublicUrl(name);
  return data.publicUrl;
}

// ─── Storage usage ───
export async function fetchStorageUsage() {
  if (!supabase) return null;
  const folders = ["work", "categories", "subcategories"];
  let totalBytes = 0;
  let totalFiles = 0;
  for (const folder of folders) {
    const { data } = await supabase.storage.from("images").list(folder, { limit: 1000 });
    if (data) {
      for (const f of data) {
        if (f.metadata?.size) { totalBytes += f.metadata.size; totalFiles++; }
      }
    }
  }
  return { bytes: totalBytes, files: totalFiles };
}

// ─── Categories ───
export async function fetchCategories() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
export async function addCategory(id, label, headerImage, playlistId) {
  if (!supabase) return;
  const { error } = await supabase.from("categories").insert({ id, label, header_image: headerImage, playlist_id: playlistId || null });
  if (error) throw error;
}
export async function updateCategory(id, updates) {
  if (!supabase) return;
  await escribir(supabase.from("categories").update(updates).eq("id", id), "actualizar la categoría");
}
export async function deleteCategory(id) {
  if (!supabase) return;
  await escribir(supabase.from("categories").delete().eq("id", id), "borrar la categoría");
}

// ─── Work items ───
export async function fetchWorkItems() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("work_items").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
export async function addWorkItem(item) {
  if (!supabase) return;
  const { data, error } = await supabase.from("work_items").insert(item).select().single();
  if (error) throw error;
  return data;
}
export async function updateWorkItem(id, updates) {
  if (!supabase) return;
  const { data, error } = await supabase.from("work_items").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteWorkItem(id) {
  if (!supabase) return;
  await escribir(supabase.from("work_items").delete().eq("id", id), "borrar el trabajo");
}
export async function updateWorkItemsOrder(orderedIds) {
  if (!supabase) return;
  await Promise.all(orderedIds.map((id, i) =>
    escribir(supabase.from("work_items").update({ sort_order: i }).eq("id", id), "reordenar los trabajos")
  ));
}

// ─── FAQs ───
export async function fetchFaqs() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
export async function addFaqRow(question, answer, translations = {}) {
  if (!supabase) return;
  const { data, error } = await supabase.from("faqs").insert({ question, answer, ...translations }).select().single();
  if (error) throw error;
  return data;
}
export async function updateFaqRow(id, question, answer, translations = {}) {
  if (!supabase) return;
  await escribir(supabase.from("faqs").update({ question, answer, ...translations }).eq("id", id), "actualizar la FAQ");
}
export async function deleteFaqRow(id) {
  if (!supabase) return;
  await escribir(supabase.from("faqs").delete().eq("id", id), "borrar la FAQ");
}
export async function updateFaqOrder(orderedIds) {
  if (!supabase) return;
  await Promise.all(orderedIds.map((id, i) =>
    escribir(supabase.from("faqs").update({ sort_order: i }).eq("id", id), "reordenar las FAQs")
  ));
}

// ─── Site config ───
export async function fetchSiteConfig() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_config").select("*");
  if (error) throw error;
  return data ? Object.fromEntries(data.map(r => [r.key, r.value])) : {};
}
export async function upsertSiteConfig(key, value) {
  if (!supabase) return;
  await escribir(supabase.from("site_config").upsert({ key, value }), "guardar la configuración");
}

// ─── Subcategories ───
export async function fetchSubcategories() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("subcategories").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
export async function addSubcategory(categoryId, name, headerImage, playlistId) {
  if (!supabase) return;
  const { data, error } = await supabase.from("subcategories").insert({ category_id: categoryId, name, header_image: headerImage, playlist_id: playlistId || null }).select().single();
  if (error) throw error;
  return data;
}
export async function updateSubcategory(id, updates) {
  if (!supabase) return;
  await escribir(supabase.from("subcategories").update(updates).eq("id", id), "actualizar la subcategoría");
}
export async function deleteSubcategory(id) {
  if (!supabase) return;
  await escribir(supabase.from("subcategories").delete().eq("id", id), "borrar la subcategoría");
}

// ─── Highlights ───
export async function fetchHighlights() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("highlights").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
export async function addHighlight(title, imageUrl, description) {
  if (!supabase) return;
  const { data, error } = await supabase.from("highlights").insert({ title, image_url: imageUrl, description }).select().single();
  if (error) throw error;
  return data;
}
export async function deleteHighlight(id) {
  if (!supabase) return;
  await escribir(supabase.from("highlights").delete().eq("id", id), "borrar el highlight");
}

// ─── Returning customers ───
export async function fetchReturningCustomers() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("returning_customers").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
export async function addReturningCustomer(title, imageUrl, description) {
  if (!supabase) return;
  const { data, error } = await supabase.from("returning_customers").insert({ title, image_url: imageUrl, description }).select().single();
  if (error) throw error;
  return data;
}
export async function deleteReturningCustomer(id) {
  if (!supabase) return;
  await escribir(supabase.from("returning_customers").delete().eq("id", id), "borrar el returning customer");
}

// ─── Facebook reviews ───
export async function fetchFbReviews() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("facebook_reviews").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
export async function addFbReview(name, rating, text, reviewDate) {
  if (!supabase) return;
  const { data, error } = await supabase.from("facebook_reviews").insert({ name, rating, text, review_date: reviewDate }).select().single();
  if (error) throw error;
  return data;
}
export async function updateFbReview(id, fields) {
  if (!supabase) return;
  await escribir(supabase.from("facebook_reviews").update(fields).eq("id", id), "actualizar la reseña de Facebook");
}
export async function deleteFbReview(id) {
  if (!supabase) return;
  await escribir(supabase.from("facebook_reviews").delete().eq("id", id), "borrar la reseña de Facebook");
}

// ─── Google reviews ───
export async function fetchGoogleReviews() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("google_reviews").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
// review_date is added by client-feedback-migration.sql. Until that runs the write is
// rejected — PostgREST reports PGRST204 from its schema cache on insert/update, Postgres
// reports 42703 directly. Degrade to saving without the column rather than failing the
// whole write, so the admin keeps working in the meantime.
const MISSING_COLUMN_CODES = new Set(["PGRST204", "42703"]);
const isMissingColumn = (error) => MISSING_COLUMN_CODES.has(error?.code);

export async function addGoogleReview(name, rating, text, timeLabel, reviewDate) {
  if (!supabase) return;
  const base = { name, rating, text, time_label: timeLabel };
  const { data, error } = await supabase.from("google_reviews")
    .insert({ ...base, review_date: reviewDate || null })
    .select().single();
  if (!error) return data;
  if (!isMissingColumn(error)) throw error;

  console.warn("google_reviews.review_date missing — run client-feedback-migration.sql");
  const retry = await supabase.from("google_reviews").insert(base).select().single();
  if (retry.error) throw retry.error;
  return retry.data;
}
/** Returns { dateSaved } so callers can tell the user the date did not persist. */
export async function updateGoogleReview(id, fields) {
  if (!supabase) return { dateSaved: false };
  const { data, error } = await supabase.from("google_reviews").update(fields).eq("id", id).select();
  if (!error) {
    // No usa escribir() porque abajo necesita inspeccionar el error para el caso de
    // la columna que falta, pero el chequeo de filas tiene que ser el mismo.
    if (!data?.length) throw new Error(sinFilas("actualizar la reseña de Google"));
    return { dateSaved: true };
  }
  if (!isMissingColumn(error) || !("review_date" in fields)) throw error;

  console.warn("google_reviews.review_date missing — run client-feedback-migration.sql");
  const { review_date, ...rest } = fields;
  await escribir(supabase.from("google_reviews").update(rest).eq("id", id), "actualizar la reseña de Google");
  return { dateSaved: false };
}
export async function deleteGoogleReview(id) {
  if (!supabase) return;
  await escribir(supabase.from("google_reviews").delete().eq("id", id), "borrar la reseña de Google");
}

// ─── Carousel items (curated views of work_items) ───
export async function fetchCarouselItems(carouselName) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("carousel_items")
    .select("id, carousel_name, sort_order, work_item_id, work_items(*)")
    .eq("carousel_name", carouselName)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function addCarouselItem(carouselName, workItemId, sortOrder) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("carousel_items")
    .insert({ carousel_name: carouselName, work_item_id: workItemId, sort_order: sortOrder })
    .select("id, carousel_name, sort_order, work_item_id, work_items(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function removeCarouselItem(id) {
  if (!supabase) return;
  await escribir(supabase.from("carousel_items").delete().eq("id", id), "borrar el item del carrusel");
}

export async function updateCarouselOrder(orderedIds) {
  if (!supabase) return;
  await Promise.all(orderedIds.map((id, i) =>
    escribir(supabase.from("carousel_items").update({ sort_order: i }).eq("id", id), "reordenar el carrusel")
  ));
}

// ─── Happy Customers ───
// Tabla propia y no carousel_items: estas fotos no son portfolio, no tienen
// categoría, y como work_items no tiene flag de visibilidad, meterlas ahí las
// publicaría en /portfolio. Ver happy-customers-migration.sql.

export async function fetchHappyCustomers() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("happy_customers")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function addHappyCustomer(src, altText, sortOrder) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("happy_customers")
    .insert({ src, alt_text: altText || null, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHappyCustomer(id, fields) {
  if (!supabase) return;
  await escribir(supabase.from("happy_customers").update(fields).eq("id", id), "actualizar el happy customer");
}

export async function removeHappyCustomer(id) {
  if (!supabase) return;
  await escribir(supabase.from("happy_customers").delete().eq("id", id), "borrar el happy customer");
}

export async function updateHappyCustomerOrder(orderedIds) {
  if (!supabase) return;
  await Promise.all(orderedIds.map((id, i) =>
    escribir(supabase.from("happy_customers").update({ sort_order: i }).eq("id", id), "reordenar los happy customers")
  ));
}

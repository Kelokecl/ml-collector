const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ML_SITE_ID = process.env.ML_SITE_ID || 'MLC';
const LIMIT = parseInt(process.env.SEARCH_LIMIT || '50', 10);

async function getCategories() {
  const resp = await fetch(`https://api.mercadolibre.com/sites/${ML_SITE_ID}/categories`);
  if (!resp.ok) throw new Error(`Failed categories: ${resp.status}`);
  return await resp.json();
}

async function searchItems(categoryId, limit) {
  const url = `https://api.mercadolibre.com/sites/${ML_SITE_ID}/search?category=${categoryId}&limit=${limit}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed search ${resp.status}`);
  const data = await resp.json();
  return Array.isArray(data.results) ? data.results : [];
}

async function getItemDetails(itemId) {
  const res = await fetch(`https://api.mercadolibre.com/items/${itemId}`);
  if (!res.ok) throw new Error(`Failed item details ${itemId}: ${res.status}`);
  const item = await res.json();
  let ratingAverage = null;
  let ratingsTotal = null;
  try {
    const reviewsRes = await fetch(`https://api.mercadolibre.com/reviews/item/${itemId}`);
    if (reviewsRes.ok) {
      const reviews = await reviewsRes.json();
      ratingAverage = reviews.rating_average ?? null;
      ratingsTotal = reviews.reviews_count ?? null;
    }
  } catch (err) {
    // ignore
  }
  return { item, ratingAverage, ratingsTotal };
}

function computeFacts(details) {
  const { item, ratingAverage, ratingsTotal } = details;
  const soldQuantity =
    item.sold_quantity ??
    (item.initial_quantity && item.available_quantity !== undefined
      ? item.initial_quantity - item.available_quantity
      : null);
  const brandAttr = (item.attributes || []).find(
    (attr) => attr.id === 'BRAND' || attr.id === 'MELI_BRAND'
  );
  return {
    id: item.id,
    site_id: item.site_id,
    category_id: item.category_id,
    title: item.title || null,
    price: item.price || null,
    currency_id: item.currency_id || null,
    sold_quantity: soldQuantity,
    rating_average: ratingAverage,
    rating_total: ratingsTotal,
    seller_id: item.seller_id || null,
    listing_type_id: item.listing_type_id || null,
    condition: item.condition || null,
    brand: brandAttr ? brandAttr.value_name : null,
    permalink: item.permalink || null,
    attributes: item.attributes || null,
  };
}

async function upsertFacts(sb, rows) {
  const { error } = await sb.from('meli_items_facts').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

async function run() {
  console.log('Collector start at', new Date().toISOString());
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const categories = await getCategories();
  for (const cat of categories) {
    console.log(`Category ${cat.id} - ${cat.name}`);
    let items = [];
 const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ML_SITE_ID = process.env.ML_SITE_ID || 'MLC';
const LIMIT = parseInt(process.env.SEARCH_LIMIT || '50', 10);

async function getCategories() {
  const resp = await fetch(`https://api.mercadolibre.com/sites/${ML_SITE_ID}/categories`);
  if (!resp.ok) throw new Error(`Failed categories: ${resp.status}`);
  return await resp.json();
}

async function searchItems(categoryId, limit) {
  const url = `https://api.mercadolibre.com/sites/${ML_SITE_ID}/search?category=${categoryId}&limit=${limit}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed search ${resp.status}`);
  const data = await resp.json();
  return Array.isArray(data.results) ? data.results : [];
}

async function getItemDetails(itemId) {
  const res = await fetch(`https://api.mercadolibre.com/items/${itemId}`);
  if (!res.ok) throw new Error(`Failed item details ${itemId}: ${res.status}`);
  const item = await res.json();
  let ratingAverage = null;
  let ratingsTotal = null;
  try {
    const reviewsRes = await fetch(`https://api.mercadolibre.com/reviews/item/${itemId}`);
    if (reviewsRes.ok) {
      const reviews = await reviewsRes.json();
      ratingAverage = reviews.rating_average ?? null;
      ratingsTotal = reviews.reviews_count ?? null;
    }
  } catch (err) {
    // ignore
  }
  return { item, ratingAverage, ratingsTotal };
}

function computeFacts(details) {
  const { item, ratingAverage, ratingsTotal } = details;
  const soldQuantity =
    item.sold_quantity ??
    (item.initial_quantity && item.available_quantity !== undefined
      ? item.initial_quantity - item.available_quantity
      : null);
  const brandAttr = (item.attributes || []).find(
    (attr) => attr.id === 'BRAND' || attr.id === 'MELI_BRAND'
  );
  return {
    id: item.id,
    site_id: item.site_id,
    category_id: item.category_id,
    title: item.title || null,
    price: item.price || null,
    currency_id: item.currency_id || null,
    sold_quantity: soldQuantity,
    rating_average: ratingAverage,
    rating_total: ratingsTotal,
    seller_id: item.seller_id || null,
    listing_type_id: item.listing_type_id || null,
    condition: item.condition || null,
    brand: brandAttr ? brandAttr.value_name : null,
    permalink: item.permalink || null,
    attributes: item.attributes || null,
  };
}

async function upsertFacts(sb, rows) {
  const { error } = await sb.from('meli_items_facts').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

async function run() {
  console.log('Collector start at', new Date().toISOString());
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const categories = await getCategories();
  for (const cat of categories) {
    console.log(`Category ${cat.id} - ${cat.name}`);
    let items = [];
    try {
      items = await searchItems(cat.id, LIMIT);
    } catch (err) {
      console.error('search error', err.message);
      continue;
    }
    const facts = [];
    for (const item of items) {
      try {
        const details = await getItemDetails(item.id);
        const fact = computeFacts(details);
        facts.push(fact);
      } catch (err) {
        console.error(`error item ${item.id}`, err.message);
      }
    }
    if (facts.length) {
      try {
        await upsertFacts(sb, facts);
        console.log(`Saved ${facts.length} facts for category ${cat.id}`);
      } catch (err) {
        console.error('Upsert error', err.message);
      }
    }
  }
  console.log('Collector finished at', new Date().toISOString());
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});   try {
      items = await searchItems(cat.id, LIMIT);
    } catch (err) {
      console.error('search error', err.message);
      continue;
    }
    const facts = [];
    for (const item of items) {
      try {
        const details = await getItemDetails(item.id);
        const fact = computeFacts(details);
        facts.push(fact);
      } catch (err) {
        console.error(`error item ${item.id}`, err.message);
      }
    }
    if (facts.length) {
      try {
        await upsertFacts(sb, facts);
        console.log(`Saved ${facts.length} facts for category ${cat.id}`);
      } catch (err) {
        console.error('Upsert error', err.message);
      }
    }
  }
  console.log('Collector finished at', new Date().toISOString());
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

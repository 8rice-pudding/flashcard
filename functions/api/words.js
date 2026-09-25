function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function normalizeDbRow(row = {}) {
  return {
    id: row.id,
    type: row.type || 'word',
    word: row.word || row.english || '',
    english: row.english || row.word || '',
    chinese: row.chinese || row.translation || row.meaning || '',
    meaning: row.meaning || row.chinese || row.translation || '',
    translation: row.translation || row.chinese || row.meaning || '',
    sentence: row.sentence || '',
    sentenceCn: row.sentence_cn || row.sentenceCn || '',
    imageDataUrl: row.image_data_url || row.imageDataUrl || '',
    pronunciation: row.pronunciation || '',
    box: Number(row.box) || 1,
    nextReviewDate: row.next_review_date || row.nextReviewDate || '',
    created_at: row.created_at || null
  };
}

function normalizeIncomingRow(record = {}) {
  const word = String(record.word || record.english || record.name || '').trim();
  const english = String(record.english || record.word || record.name || '').trim();
  const chinese = String(record.chinese || record.translation || record.meaning || '').trim();
  const meaning = String(record.meaning || record.chinese || record.translation || '').trim();
  const translation = String(record.translation || chinese || meaning).trim();
  const nextReviewDate = String(record.nextReviewDate || record.next_review_date || '').trim();

  return {
    id: record.id,
    type: record.type || 'word',
    word,
    english,
    chinese,
    meaning,
    translation,
    sentence: String(record.sentence || '').trim(),
    sentence_cn: String(record.sentenceCn || record.sentence_cn || '').trim(),
    image_data_url: String(record.imageDataUrl || record.image_data_url || '').trim(),
    pronunciation: String(record.pronunciation || '').trim(),
    box: Number(record.box) || 1,
    next_review_date: nextReviewDate,
    created_at: record.created_at || new Date().toISOString()
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

  if (method === 'GET') {
    const sql = 'SELECT * FROM words ORDER BY id DESC';
    const result = await env.DB.prepare(sql).all();
    return jsonResponse({ items: (result.results || []).map(normalizeDbRow) });
  }

  if (method === 'POST') {
    let payload = {};

    try {
      payload = await request.json();
    } catch (error) {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400);
    }

    const list = Array.isArray(payload) ? payload : [payload];
    if (!list.length) {
      return jsonResponse({ error: 'No word payload provided.' }, 400);
    }

    const saved = [];

    for (const item of list) {
      const row = normalizeIncomingRow(item);
      const normalizedWord = row.word || row.english || 'untitled';
      const normalizedTranslation = row.translation || row.chinese || row.meaning || '';
      const numericId = Number(row.id);
      const hasExplicitId = row.id !== undefined && row.id !== null && row.id !== '' && Number.isFinite(numericId);

      if (hasExplicitId) {
        await env.DB.prepare(`
          INSERT INTO words (id, word, translation, english, chinese, meaning, sentence, sentence_cn, image_data_url, pronunciation, type, box, next_review_date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            word = excluded.word,
            translation = excluded.translation,
            english = excluded.english,
            chinese = excluded.chinese,
            meaning = excluded.meaning,
            sentence = excluded.sentence,
            sentence_cn = excluded.sentence_cn,
            image_data_url = excluded.image_data_url,
            pronunciation = excluded.pronunciation,
            type = excluded.type,
            box = excluded.box,
            next_review_date = excluded.next_review_date,
            created_at = excluded.created_at
        `).bind(
          numericId,
          normalizedWord,
          normalizedTranslation,
          row.english || normalizedWord,
          row.chinese || normalizedTranslation,
          row.meaning || normalizedTranslation,
          row.sentence,
          row.sentence_cn,
          row.image_data_url,
          row.pronunciation,
          row.type,
          row.box,
          row.next_review_date || '',
          row.created_at
        ).run();
      } else {
        const insertResult = await env.DB.prepare(`
          INSERT INTO words (word, translation, english, chinese, meaning, sentence, sentence_cn, image_data_url, pronunciation, type, box, next_review_date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          normalizedWord,
          normalizedTranslation,
          row.english || normalizedWord,
          row.chinese || normalizedTranslation,
          row.meaning || normalizedTranslation,
          row.sentence,
          row.sentence_cn,
          row.image_data_url,
          row.pronunciation,
          row.type,
          row.box,
          row.next_review_date || '',
          row.created_at
        ).run();

        saved.push({
          id: insertResult.meta.last_row_id,
          ...normalizeDbRow({
            id: insertResult.meta.last_row_id,
            word: normalizedWord,
            translation: normalizedTranslation,
            english: row.english || normalizedWord,
            chinese: row.chinese || normalizedTranslation,
            meaning: row.meaning || normalizedTranslation,
            sentence: row.sentence,
            sentence_cn: row.sentence_cn,
            image_data_url: row.image_data_url,
            pronunciation: row.pronunciation,
            type: row.type,
            box: row.box,
            next_review_date: row.next_review_date || '',
            created_at: row.created_at
          })
        });
      }
    }

    return jsonResponse({ success: true, items: saved.length ? saved : list.map((item) => normalizeIncomingRow(item)) });
  }

  if (method === 'DELETE') {
    let payload = {};

    try {
      payload = await request.json();
    } catch (error) {
      payload = {};
    }

    const idValues = [];
    const directId = payload.id ?? new URL(request.url).searchParams.get('id');

    if (directId !== undefined && directId !== null && directId !== '') {
      idValues.push(directId);
    }

    if (Array.isArray(payload.ids)) {
      for (const item of payload.ids) {
        if (item !== undefined && item !== null && item !== '') {
          idValues.push(item);
        }
      }
    }

    if (!idValues.length) {
      return jsonResponse({ error: 'Word id is required for deletion.' }, 400);
    }

    for (const id of idValues) {
      const numericId = Number(id);
      if (Number.isFinite(numericId)) {
        await env.DB.prepare('DELETE FROM words WHERE id = ?').bind(numericId).run();
      }
    }

    return jsonResponse({ success: true, deleted: idValues.length });
  }

  return jsonResponse({ error: 'Method not allowed.' }, 405);
}

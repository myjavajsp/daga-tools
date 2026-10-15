module.exports = function (router, db, authMiddleware, getFields) {
  /* ── 解析接口 CRUD ────────────────────────── */

  router.get('/interfaces', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT id, name, url, type, sort_order, is_active FROM parse_interfaces ORDER BY sort_order ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/interfaces:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/interfaces', authMiddleware, async (req, res) => {
    try {
      const { name, url, type, sort_order } = getFields(req.body, { name: '', url: '', type: 'video', sort_order: 0 });
      if (!name || !url) {
        return res.status(400).json({ success: false, error: '名称和URL不能为空' });
      }
      const result = await db.prepare(
        'INSERT INTO parse_interfaces (name, url, type, sort_order, is_active) VALUES (?, ?, ?, ?, 1)'
      ).run(name, url, type, sort_order);
      const row = await db.prepare('SELECT id, name, url, type, sort_order, is_active FROM parse_interfaces WHERE id = ?').get(result.insertId);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/interfaces:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/interfaces/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM parse_interfaces WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });

      const { name, url, type, sort_order, is_active } = getFields(req.body, { name: null, url: null, type: null, sort_order: null, is_active: null });
      const sets = []; const vals = [];
      if (name !== null) { sets.push('name = ?'); vals.push(name); }
      if (url !== null) { sets.push('url = ?'); vals.push(url); }
      if (type !== null) { sets.push('type = ?'); vals.push(type); }
      if (sort_order !== null) { sets.push('sort_order = ?'); vals.push(sort_order); }
      if (is_active !== null) { sets.push('is_active = ?'); vals.push(is_active); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });

      vals.push(id);
      await db.prepare(`UPDATE parse_interfaces SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      const row = await db.prepare('SELECT id, name, url, type, sort_order, is_active FROM parse_interfaces WHERE id = ?').get(id);
      res.json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/interfaces:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/interfaces/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM parse_interfaces WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      await db.prepare('DELETE FROM parse_interfaces WHERE id = ?').run(id);
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/interfaces:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 广告 CRUD ────────────────────────────── */

  router.get('/ads', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT id, name, position, code, is_active FROM ads ORDER BY id ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/ads:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/ads', authMiddleware, async (req, res) => {
    try {
      const { position, name, code } = getFields(req.body, { position: '', name: '', code: '' });
      if (!position || !code) return res.status(400).json({ success: false, error: '位置和代码不能为空' });
      const result = await db.prepare('INSERT INTO ads (position, name, code, is_active) VALUES (?, ?, ?, 1)').run(position, name, code);
      const row = await db.prepare('SELECT id, name, position, code, is_active FROM ads WHERE id = ?').get(result.insertId);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/ads:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/ads/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM ads WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      const { position, name, code, is_active } = getFields(req.body, { position: null, name: null, code: null, is_active: null });
      const sets = []; const vals = [];
      if (position !== null) { sets.push('position = ?'); vals.push(position); }
      if (name !== null) { sets.push('name = ?'); vals.push(name); }
      if (code !== null) { sets.push('code = ?'); vals.push(code); }
      if (is_active !== null) { sets.push('is_active = ?'); vals.push(is_active); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      await db.prepare(`UPDATE ads SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      const row = await db.prepare('SELECT id, name, position, code, is_active FROM ads WHERE id = ?').get(id);
      res.json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/ads:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/ads/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM ads WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      await db.prepare('DELETE FROM ads WHERE id = ?').run(id);
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/ads:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 推荐链接 CRUD ───────────────────────── */

  router.get('/links', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT id, name, icon_url, link_url, sort_order, is_active FROM recommend_links ORDER BY sort_order ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/links:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/links', authMiddleware, async (req, res) => {
    try {
      const { name, icon_url, link_url, sort_order } = getFields(req.body, { name: '', icon_url: '', link_url: '', sort_order: 0 });
      if (!name || !link_url) return res.status(400).json({ success: false, error: '名称和链接不能为空' });
      const result = await db.prepare('INSERT INTO recommend_links (name, icon_url, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, 1)').run(name, icon_url, link_url, sort_order);
      const row = await db.prepare('SELECT id, name, icon_url, link_url, sort_order, is_active FROM recommend_links WHERE id = ?').get(result.insertId);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/links:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/links/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM recommend_links WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      const { name, icon_url, link_url, sort_order, is_active } = getFields(req.body, { name: null, icon_url: null, link_url: null, sort_order: null, is_active: null });
      const sets = []; const vals = [];
      if (name !== null) { sets.push('name = ?'); vals.push(name); }
      if (icon_url !== null) { sets.push('icon_url = ?'); vals.push(icon_url); }
      if (link_url !== null) { sets.push('link_url = ?'); vals.push(link_url); }
      if (sort_order !== null) { sets.push('sort_order = ?'); vals.push(sort_order); }
      if (is_active !== null) { sets.push('is_active = ?'); vals.push(is_active); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      await db.prepare(`UPDATE recommend_links SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      const row = await db.prepare('SELECT id, name, icon_url, link_url, sort_order, is_active FROM recommend_links WHERE id = ?').get(id);
      res.json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/links:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/links/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM recommend_links WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      await db.prepare('DELETE FROM recommend_links WHERE id = ?').run(id);
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/links:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 系统设置 CRUD ───────────────────────── */

  router.get('/settings', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT `key`, `value` FROM site_settings').all();
      const settings = {};
      for (const row of rows) settings[row.key] = row.value;
      res.json({ success: true, data: settings });
    } catch (err) {
      console.error('[admin/settings:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/settings', authMiddleware, async (req, res) => {
    try {
      const items = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: '请提供 [{key, value}, ...] 格式的设置数组' });
      }
      for (const item of items) {
        if (!item.key) continue;
        await db.prepare(
          'INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = CURRENT_TIMESTAMP'
        ).run(item.key, item.value);
      }
      res.json({ success: true, message: '设置已保存' });
    } catch (err) {
      console.error('[admin/settings:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 使用步骤 CRUD ───────────────────────── */

  router.get('/guide', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT id, step_number, content, sort_order FROM guide_steps ORDER BY sort_order ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/guide:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/guide', authMiddleware, async (req, res) => {
    try {
      const { step_number, content, sort_order } = getFields(req.body, { step_number: 0, content: '', sort_order: 0 });
      if (!content) return res.status(400).json({ success: false, error: '内容不能为空' });
      const result = await db.prepare('INSERT INTO guide_steps (step_number, content, sort_order) VALUES (?, ?, ?)').run(step_number, content, sort_order);
      const row = await db.prepare('SELECT id, step_number, content, sort_order FROM guide_steps WHERE id = ?').get(result.insertId);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/guide:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/guide/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM guide_steps WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      const { step_number, content, sort_order } = getFields(req.body, { step_number: null, content: null, sort_order: null });
      const sets = []; const vals = [];
      if (step_number !== null) { sets.push('step_number = ?'); vals.push(step_number); }
      if (content !== null) { sets.push('content = ?'); vals.push(content); }
      if (sort_order !== null) { sets.push('sort_order = ?'); vals.push(sort_order); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      await db.prepare(`UPDATE guide_steps SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      const row = await db.prepare('SELECT id, step_number, content, sort_order FROM guide_steps WHERE id = ?').get(id);
      res.json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/guide:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/guide/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM guide_steps WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      await db.prepare('DELETE FROM guide_steps WHERE id = ?').run(id);
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/guide:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── FAQ CRUD ─────────────────────────────── */

  router.get('/faq', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT id, question, answer, sort_order FROM faqs ORDER BY sort_order ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/faq:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/faq', authMiddleware, async (req, res) => {
    try {
      const { question, answer, sort_order } = getFields(req.body, { question: '', answer: '', sort_order: 0 });
      if (!question || !answer) return res.status(400).json({ success: false, error: '问题和答案不能为空' });
      const result = await db.prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)').run(question, answer, sort_order);
      const row = await db.prepare('SELECT id, question, answer, sort_order FROM faqs WHERE id = ?').get(result.insertId);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/faq:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/faq/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM faqs WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      const { question, answer, sort_order } = getFields(req.body, { question: null, answer: null, sort_order: null });
      const sets = []; const vals = [];
      if (question !== null) { sets.push('question = ?'); vals.push(question); }
      if (answer !== null) { sets.push('answer = ?'); vals.push(answer); }
      if (sort_order !== null) { sets.push('sort_order = ?'); vals.push(sort_order); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      await db.prepare(`UPDATE faqs SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      const row = await db.prepare('SELECT id, question, answer, sort_order FROM faqs WHERE id = ?').get(id);
      res.json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/faq:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/faq/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM faqs WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      await db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/faq:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });
};

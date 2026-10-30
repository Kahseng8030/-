'use strict';
// 可以单独修改本功能；该模块通过 registerModule 加入主导航。
function managePage(){
 if(route.manageTab==='modules'){
  return `${head('MODULAR EXPANSION / 模块工坊','模块扩展中心','这里列出已连接的功能模块；以后增添新功能，只需要复制一个模块文件。')}
  <div class="manage-tabs">
    <button class="chip" data-manage-tab="materials">📚 资料管理</button>
    <button class="chip" data-manage-tab="cards">🧠 记忆卡管理</button>
    <button class="chip" data-manage-tab="backup">💾 备份 / 恢复</button>
    <button class="chip" data-manage-tab="site">🎨 网站文字设置</button>
    <button class="chip active" data-manage-tab="modules">🧩 扩展模块</button>
  </div>
  <div class="manage-card">
    <div class="section-head"><div><span class="eyebrow">MODULE DIRECTORY</span><h3>已接入 ${NAV.length} 个模块</h3><p>以下功能彼此独立，导航自动连接。</p></div></div>
    <div class="resource-grid">${NAV.map(m=>`<article class="resource"><div class="resource-icon">${m.icon}</div><div class="resource-main"><h4>${esc(m.text)}</h4><p>模块 ID：${esc(m.id)} · 已连接主导航</p><button class="btn small secondary" data-nav="${esc(m.id)}">打开模块 ↗</button></div></article>`).join('')}</div>
  </div>
  <div class="manage-card" style="margin-top:16px">
    <h3>未来新增功能：照着这 4 步做</h3>
    <div class="info-note">① 复制 <code>modules/template.example.js</code>，改名为例如 <code>modules/probability.js</code>。</div>
    <div class="info-note">② 用记事本打开新文件，修改里面的标题、id、内容。</div>
    <div class="info-note">③ 用记事本打开 <code>index.html</code>，在 <code>assets/js/bootstrap.js</code> 前方添加 <code>&lt;script src="modules/probability.js"&gt;&lt;/script&gt;</code>。</div>
    <div class="info-note">④ 保存并刷新网页，新的模块会自动出现在侧边导航。完整步骤也在 ZIP 内的《开始使用-操作说明.txt》。</div>
    <p class="desc">提醒：修改网页文件不会自动备份学习资料。上传过的文件与记忆卡，请定期使用「备份 / 恢复」导出 JSON。</p>
  </div>`;
 }
 return `${head('GARDENER’S DESK / 知识园丁','管理中心','不懂代码也可以添加、修改、删除资料或记忆卡；也可以导出备份。')}<div class="manage-tabs"><button class="chip ${route.manageTab==='materials'?'active':''}" data-manage-tab="materials">📚 资料管理</button><button class="chip ${route.manageTab==='cards'?'active':''}" data-manage-tab="cards">🧠 记忆卡管理</button><button class="chip ${route.manageTab==='backup'?'active':''}" data-manage-tab="backup">💾 备份 / 恢复</button><button class="chip ${route.manageTab==='site'?'active':''}" data-manage-tab="site">🎨 网站文字设置</button><button class="chip" data-manage-tab="modules">🧩 扩展模块</button></div>${route.manageTab==='materials'?`<section class="manage-card"><div class="toolline"><div><h3>学习资料清单</h3><p>你可以上传 PDF、图片或其他文件；也可以只填写文字笔记。</p></div><button class="btn small" data-add="material">＋ 新增资料</button></div><div class="resource-grid">${state.materials.map(materialCard).join('')||emptyBlock('这里还没有资料','点击「新增资料」开始建立知识库。')}</div></section>`:route.manageTab==='cards'?`<section class="manage-card"><div class="toolline"><div><h3>记忆卡清单</h3><p>每张卡都有正面问题、背面答案，可以按年级使用。</p></div><button class="btn small" data-add="card">＋ 新增记忆卡</button></div><div class="resource-grid">${state.cards.map(c=>`<article class="resource"><div class="resource-icon">🧠</div><div class="resource-main"><h4>${esc(c.q)}</h4><p>${esc(c.a.slice(0,80))}</p><div class="resource-meta"><span>${esc(c.grade)}</span><span>${esc(c.topic)}</span></div><div class="resource-actions"><button class="mini-btn" data-edit-card="${esc(c.id)}">编辑</button><button class="mini-btn danger" data-delete-card="${esc(c.id)}">删除</button></div></div></article>`).join('')||emptyBlock('还没有记忆卡','点击新增，自己设计一张问题卡。')}</div></section>` : route.manageTab==='site'?`<section class="manage-card"><h3>修改网页标题与主页标语</h3><p>这些文字可以直接在这里修改，不用打开代码编辑器。保存后刷新页面也会保留。</p><div class="form-grid"><div class="field full"><label for="siteName">网站名称</label><input id="siteName" maxlength="30" value="${esc(state.site.name)}"/></div><div class="field full"><label for="heroOne">主页大标题 · 第一行</label><input id="heroOne" maxlength="50" value="${esc(state.site.hero1)}"/></div><div class="field full"><label for="heroTwo">主页大标题 · 第二行</label><input id="heroTwo" maxlength="50" value="${esc(state.site.hero2)}"/></div><div class="field full"><label for="heroDesc">主页介绍文字</label><textarea id="heroDesc" maxlength="300">${esc(state.site.heroDesc)}</textarea></div></div><div class="foot-actions"><button class="btn small secondary" data-reset-site>恢复默认文案</button><button class="btn small" data-save-site>保存网站文字 ✓</button></div></section>` : `<section class="manage-card"><h3>备份与恢复资料</h3><p>内容在此电脑、此浏览器中保存。换浏览器、清除浏览器数据，或换电脑时，必须先导出备份再导入。备份将尽量包含已上传附件。</p><div class="backup-grid"><div class="backup-card"><h4>① 导出完整备份</h4><p>把资料、答案、考题、记忆卡、掌握进度及上传的附件打包成一个 JSON 文件。</p><button class="btn small" data-export>↓ 导出全部数据</button></div><div class="backup-card"><h4>② 导入备份文件</h4><p>选择之前导出的 .json 文件进行恢复。导入会覆盖当前内容，请先备份当前资料。</p><input id="importFile" type="file" accept=".json,application/json" aria-label="选择备份文件" style="margin:10px 0"/><br/><button class="btn small secondary" data-import>↑ 导入并恢复</button></div></div><div class="info-note">📌 这个网站完全不需要上传到服务器也能使用，但浏览器存储不等于云端同步。请定期备份，并保存好原始 HTML 文件。</div></section>`}<section class="manage-card"><h3>🌿 给新手的快速说明</h3><p>① 进入年级页，选「学习资料 / 答案 / 历届考题 / 学习拓展」。<br>② 点击「新增资料」输入标题和说明，可加笔记或选择要附上的文件。<br>③ 点击「编辑」修正内容，点击「阅读」查看笔记或下载附件。<br>④ 需要换电脑时，记得到「备份 / 恢复」导出并导入数据。</p><div class="info-note">如果要修改网站的颜色、标题或布局：在电脑上用「记事本」或 VS Code 打开 index.html，查找对应文字，保存后刷新网页即可。建议修改前复制一份原文件。</div></section>`}

registerModule({id:'manage', label:'管理中心', icon:'⚙', render:managePage});

'use strict';
// 可以单独修改本功能；该模块通过 registerModule 加入主导航。
function savedPage(){const f=FORMULAS.filter(x=>state.favorites.includes(x.id));return `${head('SAVED EXPLORATIONS / 收藏夹','我的收藏','把喜欢的公式推导放进收藏夹，方便随时回来复习。')}<div class="resource-grid">${f.length?f.map(x=>`<article class="resource"><div class="resource-icon">💚</div><div class="resource-main"><h4>${esc(x.title)}</h4><p>${esc(x.formula)}</p><div class="resource-actions"><button class="mini-btn" data-formula="${x.id}">查看推演 →</button><button class="mini-btn danger" data-favorite="${x.id}">取消收藏</button></div></div></article>`).join(''):emptyBlock('尚未收藏公式','打开「公式秘境」，点击右上角的收藏公式。')}</div>`}

registerModule({id:'saved', label:'我的收藏', icon:'♡', render:savedPage});

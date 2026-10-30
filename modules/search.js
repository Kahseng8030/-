'use strict';
// 可以单独修改本功能；该模块通过 registerModule 加入主导航。
function searchPage(){const q=route.search.trim().toLowerCase();const materials=q?state.materials.filter(m=>[m.title,m.summary,m.content,m.grade,CATEGORY[m.category]?.name].join(' ').toLowerCase().includes(q)):[];return `${head('SEARCH / 雨林寻踪',`搜索：${route.search}`,'在你保存的笔记、试卷、答案和其他资源中寻找关键词。')}<div class="toolline"><strong>找到 ${materials.length} 份相关资料</strong><button class="btn small secondary" data-nav="grades">返回年级地图</button></div><div class="resource-grid">${materials.length?materials.map(materialCard).join(''):emptyBlock('暂时没有找到对应资料','换一个关键词，或者在年级资料区添加相关内容。')}</div>`}

registerModule({id:'search', label:'搜索资料', icon:'⌕', hidden:true, render:searchPage});

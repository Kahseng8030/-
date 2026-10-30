
'use strict';
// 可以单独修改本功能；该模块通过 registerModule 加入主导航。
function allFormulas(){return [...FORMULAS,...(Array.isArray(state.customFormulas)?state.customFormulas:[])];}
let formulaDraft=null;
function formulaCurrent(){return allFormulas().find(x=>x.id===route.formulaId)||FORMULAS[0]}
function formulaFlowDiagram(f){
  const steps=Array.isArray(f.steps)?f.steps:[];
  return `<div class="formula-flow">${steps.map((st,i)=>`<div class="formula-flow-node"><div>第 ${i+1} 步 · ${esc(st[0])}</div><strong>${esc(st[2]||st[1])}</strong></div>${i<steps.length-1?'<div class="formula-flow-arrow">↓</div>':''}`).join('')}</div>`;
}
function formulaPage(){
 const f=formulaCurrent(),n=Math.max(0,Math.min(route.formulaStep,f.steps.length-1)),step=f.steps[n];route.formulaStep=n;
 const custom=String(f.id).startsWith('formula-');
 const list=allFormulas();
 return `${head('FORMULA SANCTUARY / 探究之地','公式秘境','可搜索已有公式、自行新增与修改推导，也可连接在线 AI 研究助手。',`<span class="pill">${list.length} 个推导主题</span>`)}
 <div class="formula-ai-panel"><span class="eyebrow">FORMULA EXPLORER / 公式研究助手</span><h3>🔎 想知道哪个公式是怎样推导出来的？</h3>
 <p>先搜索本地知识库；如果没有，可以打开网络资料，或启动附带的 AI 服务自动检索并生成可审核的逐步推导。</p>
 <div class="graph-point-form"><label>研究主题<input id="formulaQuery" type="text" placeholder="例如：二项式定理、等比数列求和、圆的面积"></label><button class="lab-action" data-formula-web>🌐 搜索网络资料</button><button class="lab-action primary" data-formula-ai>✨ AI 研究并生成草稿</button></div>
 <div id="formulaAiStatus" class="formula-ai-result">离线模式：可以自己添加公式，也可以搜索已有内容。在线 AI 需运行压缩包中的「启动AI公式助手.bat」，并配置自己的 API 密钥（费用由服务方计收）。</div>
 <div class="formula-actions"><button class="lab-action" data-formula-draft-save style="display:none">检查 AI 草稿并存入秘境</button></div></div>
 <div class="formulas-layout"><div class="formula-list"><div class="formula-tools"><label style="font-size:12px">搜索秘境中的公式<input id="formulaFilter" type="search" placeholder="名称、关键词或表达式"></label><button class="btn small" data-formula-new>＋ 自己添加公式</button></div><div id="formulaChoices">${list.map(x=>`<button class="formula-option ${x.id===f.id?'active':''}" data-formula="${esc(x.id)}" data-formula-text="${esc((x.title+' '+x.formula+' '+x.desc).toLowerCase())}"><b>${esc(x.title)} ${String(x.id).startsWith('formula-')?'✍️':''}</b><small>${esc(x.formula)}</small></button>`).join('')}</div></div>
 <section class="formula-main"><div class="inline-actions" style="justify-content:space-between"><span class="eyebrow">${esc(f.tag)}</span><div class="inline-actions"><button class="btn small ${state.favorites.includes(f.id)?'':'secondary'}" data-favorite="${esc(f.id)}">${state.favorites.includes(f.id)?'♥ 已收藏':'♡ 收藏公式'}</button>${custom?`<button class="btn small secondary" data-formula-edit="${esc(f.id)}">✎ 修改</button><button class="btn small warn" data-formula-delete="${esc(f.id)}">删除</button>`:''}</div></div>
 <h3>${esc(f.title)}</h3><p class="formula-description">${esc(f.desc)}</p><div class="equation">${esc(f.formula)}</div>
 <div class="step-top"><h4>沿着线索，一步一步理解</h4><span class="step-bullet">STEP ${n+1} / ${f.steps.length}</span></div>
 <div class="formula-steps"><div class="formula-step"><div class="n">探索节点 ${String(n+1).padStart(2,'0')}</div><h4>${esc(step[0])}</h4><p>${esc(step[1])}</p><div class="math">${esc(step[2])}</div></div></div>
 <div class="foot-actions"><button class="btn small secondary" data-formula-prev ${n===0?'disabled':''}>← 上一步</button><button class="btn small" data-formula-next ${n===f.steps.length-1?'disabled':''}>下一步 →</button></div>
 <div class="step-top"><h4>🌿 数学图解</h4><span class="small-muted">图解和文字同时观察</span></div>
 <div class="illustration large-illustration">${f.diagramData&&/^data:image\/(?:png|jpeg|webp);base64,/.test(f.diagramData)?`<img style="max-width:100%;max-height:540px;object-fit:contain" src="${f.diagramData}" alt="${esc(f.title)}推导图解">`:f.diagram==='flow'?formulaFlowDiagram(f):diagram(f.diagram)}</div>
 ${Array.isArray(f.sources)&&f.sources.length?`<div class="info-note">参考资料（AI 草稿请自行核对）：${f.sources.map(s=>{let u;try{u=new URL(s.url)}catch(_){return ''}return ['https:','http:'].includes(u.protocol)?`<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">${esc(s.title||u.hostname)}</a>`:''}).join(' · ')}</div>`:''}
 <div class="info-note">所有自建公式都保存在当前浏览器，可通过「管理中心 → 导出全部数据」备份。AI 结果请核对正确性后再供学生使用。</div>
 </section></div>`;
}
function formulaEditModal(existing=null){
 const f=existing||{title:'',formula:'',tag:'自建公式',desc:'',steps:[['第一步','在这里解释思路','写出算式']],diagram:'flow'};
 showModal(`<div class="top"><span class="eyebrow">${existing?'EDIT':'NEW'} FORMULA</span><button class="close" data-close>×</button></div><h3>${existing?'编辑公式':'新增一个公式'}</h3>
 <form id="formulaCustomForm" class="formula-form"><label>公式名称 *<input id="formulaTitle" required maxlength="90" value="${esc(f.title)}" placeholder="例如：等比数列求和"></label>
 <label>数学公式 *<input id="formulaExpression" required maxlength="250" value="${esc(f.formula)}" placeholder="例如 Sₙ = a(1-rⁿ)/(1-r)"></label>
 <label>类别 / 标签<input id="formulaTag" maxlength="90" value="${esc(f.tag||'自建公式')}"></label>
 <label>公式说明<textarea id="formulaDescription" maxlength="1800">${esc(f.desc||'')}</textarea></label>
 <label>推导步骤，每行：标题 | 解释 | 算式 *<textarea id="formulaSteps" rows="8" required placeholder="设定条件 | 令 r≠1 | Sₙ=a+ar+...\n乘以 r | 等式左右乘 r | rSₙ=ar+ar²+...">${esc((f.steps||[]).map(s=>s.join(' | ')).join('\n'))}</textarea></label>
 <label>图解类型<select id="formulaDiagram">${[['flow','逐步流程图'],['square','完全平方面积图'],['pythagoras','勾股面积图'],['arithmetic','数列配对图'],['quadratic','配方法示意'],['difference','平方差面积图']].map(([value,text])=>`<option value="${value}" ${f.diagram===value?'selected':''}>${text}</option>`).join('')}</select></label>
 <label>可选：添加自己的图解（PNG/JPG/WebP，小于 300KB）<input type="file" id="formulaImage" accept="image/png,image/jpeg,image/webp"></label>
 <div class="foot-actions"><button type="button" class="btn small secondary" data-close>取消</button><button type="submit" class="btn small">保存到公式秘境 ✓</button></div></form>`);
 $('#formulaCustomForm').addEventListener('submit',async e=>{
  e.preventDefault();const title=$('#formulaTitle').value.trim(),formula=$('#formulaExpression').value.trim();const steps=$('#formulaSteps').value.split(/\r?\n/).filter(x=>x.trim()).map(x=>x.split('|').map(y=>y.trim()));
  if(!title||!formula||!steps.length||steps.some(x=>x.length<3||!x[0]))return toast('每个步骤都必须有：标题 | 解释 | 算式');
  const file=$('#formulaImage').files?.[0];let diagramData=existing?.diagramData||'';
  if(file){if(file.size>300000)return toast('图解图片请小于 300KB');if(!['image/png','image/jpeg','image/webp'].includes(file.type))return toast('图片格式不支持');diagramData=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(file)})}
  const item={id:existing?.id||'formula-'+Date.now().toString(36),title,formula,tag:$('#formulaTag').value.trim()||'自建公式',desc:$('#formulaDescription').value.trim(),steps,diagram:$('#formulaDiagram').value,diagramData,sources:Array.isArray(existing?.sources)?existing.sources:[]};
  if(!Array.isArray(state.customFormulas))state.customFormulas=[];
  state.customFormulas=state.customFormulas.filter(x=>x.id!==item.id).concat(item);persist();closeModal();route.formulaId=item.id;route.formulaStep=0;setPage('formula',{formulaId:item.id});toast('公式已添加到秘境');
 });
}
async function formulaAIResearch(){
 const q=$('#formulaQuery')?.value.trim();if(!q)return toast('请先输入想研究的公式');
 const output=$('#formulaAiStatus');output.textContent='正在检索和组织推导，请勿关闭此页面…';formulaDraft=null;
 try{
  const res=await fetch('/api/formula',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:q}),signal:AbortSignal.timeout(90000)});
  const data=await res.json();if(!res.ok)throw Error(data.error||'在线研究失败');
  if(!data.title||!Array.isArray(data.steps)||!data.steps.length)throw Error('AI 返回的格式不完整');
  formulaDraft={...data,id:null,tag:data.tag||'AI 辅助研究',diagram:'flow'};
  output.textContent='AI 已生成待审核草稿：'+data.title+'\n'+data.formula+'\n\n'+data.steps.map((s,i)=>`${i+1}. ${s[0]}：${s[1]}\n${s[2]}`).join('\n\n')+'\n\n请检查每一步，确定正确后点击下方按钮导入。';
  const btn=$('[data-formula-draft-save]');if(btn)btn.style.display='';
 }catch(err){
  output.textContent='在线 AI 暂不可用：'+(err.message||err)+'\n\n直接双击 HTML 时不支持在线 AI。请先运行「启动AI公式助手.bat」并使用它打开的网站地址。你仍可使用上方网络搜索或手动新增公式。';
 }
}
document.addEventListener('input',e=>{if(e.target.id==='formulaFilter'){const q=e.target.value.toLowerCase().trim();document.querySelectorAll('[data-formula-text]').forEach(b=>{b.hidden=!b.dataset.formulaText.includes(q)})}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||route.page!=='formula')return;
 if(b.hasAttribute('data-formula-new')){formulaEditModal();return}
 if(b.dataset.formulaEdit){const f=state.customFormulas?.find(x=>x.id===b.dataset.formulaEdit);if(f)formulaEditModal(f);return}
 if(b.dataset.formulaDelete){if(!confirm('确定删除这条自建公式吗？'))return;state.customFormulas=(state.customFormulas||[]).filter(x=>x.id!==b.dataset.formulaDelete);state.favorites=state.favorites.filter(x=>x!==b.dataset.formulaDelete);persist();setPage('formula',{formulaId:'square',formulaStep:0});return}
 if(b.hasAttribute('data-formula-web')){const q=$('#formulaQuery')?.value.trim();if(!q)return toast('请先输入公式名称');window.open('https://www.google.com/search?q='+encodeURIComponent(q+' 数学 公式 推导 证明'),'_blank','noopener,noreferrer');return}
 if(b.hasAttribute('data-formula-ai')){formulaAIResearch();return}
 if(b.hasAttribute('data-formula-draft-save')&&formulaDraft){formulaEditModal(formulaDraft);return}
});
function diagram(which){const style='font-family:Georgia,serif;fill:#ecf3d8';if(which==='square')return `<div><svg viewBox="0 0 640 340" role="img" aria-label="边长 a 加 b 的正方形，分成 a平方、两个 ab 和 b平方"><rect x="150" y="18" width="300" height="300" rx="4" fill="#9dca8b" stroke="#eef4d2" stroke-width="3"/><rect x="150" y="18" width="182" height="182" fill="#498e64"/><rect x="332" y="18" width="118" height="182" fill="#75b595"/><rect x="150" y="200" width="182" height="118" fill="#75b595"/><rect x="332" y="200" width="118" height="118" fill="#d8ce88"/><g font-size="34" text-anchor="middle" style="${style}"><text x="241" y="127">a²</text><text x="391" y="127">ab</text><text x="241" y="271">ab</text><text x="391" y="271" fill="#17382b">b²</text></g><g font-size="24" style="${style}"><text x="235" y="14">a</text><text x="383" y="14">b</text><text x="118" y="125">a</text><text x="118" y="265">b</text></g></svg><p>整个面积 (a+b)² = a² + ab + ab + b²</p></div>`;if(which==='pythagoras')return `<div><svg viewBox="0 0 650 360" role="img" aria-label="大正方形含四个相同直角三角形和一个中间边长 c 的正方形"><g transform="translate(150 20)"><rect width="300" height="300" fill="#254f3f" stroke="#dce6c0" stroke-width="3"/><path d="M0 0L184 0 0 116Z" fill="#77aa76"/><path d="M184 0L300 0 300 184Z" fill="#9bc995"/><path d="M300 184L300 300 116 300Z" fill="#77aa76"/><path d="M116 300L0 300 0 116Z" fill="#9bc995"/><path d="M184 0L300 184 116 300 0 116Z" fill="#335e51" stroke="#ddf0bd" stroke-width="3"/><g text-anchor="middle" style="${style}" font-size="28"><text x="150" y="160">c²</text><text x="92" y="40">ab/2</text><text x="264" y="92">ab/2</text><text x="208" y="278">ab/2</text><text x="40" y="224">ab/2</text></g><text x="80" y="-6" style="${style}" font-size="24">a</text><text x="225" y="-6" style="${style}" font-size="24">b</text></g></svg><p>(a+b)² = 4 × (ab/2) + c²　→　a² + b² = c²</p></div>`;if(which==='arithmetic')return `<div><svg viewBox="0 0 760 300" role="img" aria-label="等差数列顺序和倒序配对，各列和相同"><g style="${style}" font-size="34" text-anchor="middle"><text x="76" y="78">a₁</text><text x="224" y="78">a₂</text><text x="380" y="78">···</text><text x="540" y="78">aₙ₋₁</text><text x="680" y="78">aₙ</text><text x="76" y="156">aₙ</text><text x="224" y="156">aₙ₋₁</text><text x="380" y="156">···</text><text x="540" y="156">a₂</text><text x="680" y="156">a₁</text></g><g stroke="#9ddd9e" stroke-width="3"><path d="M30 104H730"/><path d="M30 182H730"/></g><g fill="#bce69e" font-family="Georgia,serif" font-size="27" text-anchor="middle"><text x="76" y="240">a₁+aₙ</text><text x="224" y="240">a₁+aₙ</text><text x="380" y="240">···</text><text x="540" y="240">a₁+aₙ</text><text x="680" y="240">a₁+aₙ</text></g></svg><p>上下两行相加：2Sₙ = n(a₁+aₙ)</p></div>`;if(which==='quadratic')return `<div><svg viewBox="0 0 650 280" role="img" aria-label="配方法将 x 的二次式改写为完整平方"><rect x="60" y="38" width="210" height="210" rx="4" fill="#528f69" stroke="#b6ed9e" stroke-width="3"/><rect x="270" y="38" width="96" height="210" fill="#82b58a"/><rect x="60" y="38" width="306" height="210" fill="none" stroke="#cce7ba" stroke-width="3"/><g style="${style}" font-size="36" text-anchor="middle"><text x="165" y="150">x²</text><text x="318" y="150">kx</text><text x="430" y="150">+</text><text x="550" y="150">□</text></g><text x="472" y="55" font-size="23" fill="#d3eac6">补上一块</text></svg><p>配方法的核心：补一个平方项，使代数式成为 (x+k)²。</p></div>`;return `<div><svg viewBox="0 0 620 320" role="img" aria-label="一个边长 a 的正方形去除边长 b 的部分"><rect x="110" y="28" width="260" height="260" fill="#69a780" stroke="#e7e7c4" stroke-width="3"/><rect x="255" y="173" width="115" height="115" fill="#193a30" stroke="#ccdab5" stroke-width="2"/><g font-size="34" style="${style}"><text x="150" y="120">a²</text><text x="293" y="237">b²</text><text x="420" y="170">→</text><text x="495" y="142" font-size="24">(a+b)</text><text x="495" y="184" font-size="24">(a−b)</text></g></svg><p>剩余面积是 a²−b²，可按乘法展开理解 (a+b)(a−b)。</p></div>`}
registerModule({id:'formula', label:'公式秘境', icon:'∑', render:formulaPage});

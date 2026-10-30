
'use strict';
// 可以单独修改本功能；该模块通过 registerModule 加入主导航。
const DEFAULT_GRAPH = [
  {id:'plot-1', expr:'y = x^2 - 4', color:'#b5f39a', visible:true},
  {id:'plot-2', expr:'y = 2sin(x)', color:'#f5cf8e', visible:true}
];
const DEFAULT_GRAPH_DOMAIN={xmin:-10,xmax:10};
const GRAPH_PALETTE=['#b5f39a','#f5cf8e','#91d8fa','#f0a6cc','#c7b6ff','#ffb38b','#81e0c6','#e8e9ad'];
let graphView={cx:0,cy:0,ppu:44}, graphTrace=null, graphPointers=new Map(), graphPan=null;
let graphCompiled=[];
let graphPinned=null, graphTapStart=null;
function graphStateDomain(){
  const raw=state.graphDomain||DEFAULT_GRAPH_DOMAIN;
  let xmin=Number(raw.xmin),xmax=Number(raw.xmax);
  if(!Number.isFinite(xmin)||!Number.isFinite(xmax)||xmax<=xmin){xmin=DEFAULT_GRAPH_DOMAIN.xmin;xmax=DEFAULT_GRAPH_DOMAIN.xmax}
  return {xmin,xmax};
}
function graphStoreDomain(xmin,xmax){
  state.graphDomain={xmin:Number(xmin),xmax:Number(xmax)};
  persist();
}
/* ==== 函数绘图室 ==== */
function graphPage(){
  const graph=state.graph||DEFAULT_GRAPH;
  const domain=graphStateDomain();
  return `${head('CANOPY LAB / 数学探索工具','函数绘图室','像图形计算器一样，输入函数便能实时看到坐标图。现在还会自动近似标出最高点、最低点、x / y 截距，并允许你自订定义域。','<span class="pill">2D FUNCTION EXPLORER</span>')}
    <section class="tool-hero"><span class="eyebrow">THE LIVING COORDINATE FOREST</span><h3>输入一个函数，看它在雨林里生长。</h3><p>可输入 <b>y = x^2 - 4</b>、<b>sin(x)</b>、<b>1/x</b>、<b>abs(x)</b>、<b>sqrt(x)</b>。输入后立即刷新图像，不必按下确定。</p></section>
    <div class="lab-layout">
      <aside class="lab-panel"><h3>✦ 我的函数</h3><p class="lab-subtitle">每一行对应图上的一条曲线，最多 8 条。</p>
        <div id="graphFunctions">${graph.map((item,j)=>graphRow(item,j)).join('')}</div>
        <div class="lab-row"><button class="lab-action primary" data-graph-add>＋ 新增函数</button><button class="lab-action" data-graph-clear>清空</button></div>
        <div class="lab-divider"></div><h3>🍃 快速尝试</h3>
        <div class="lab-row">${[['x^2','y = x^2'],['正弦','y = sin(x)'],['绝对值','y = abs(x)'],['分式','y = 1/x'],['根号','y = sqrt(x)']].map(([a,b])=>`<button class="lab-chip" data-graph-example="${esc(b)}">${a}</button>`).join('')}</div>
        <div class="lab-divider"></div><h3>定义域 / X 范围</h3>
        <div class="graph-domain-grid">
          <label><span>x 最小值</span><input type="number" step="any" id="graphXMin" data-graph-domain="xmin" value="${esc(domain.xmin)}"></label>
          <label><span>x 最大值</span><input type="number" step="any" id="graphXMax" data-graph-domain="xmax" value="${esc(domain.xmax)}"></label>
        </div>
        <div class="lab-row"><button class="lab-action" data-graph-fit>套用定义域</button><button class="lab-action" data-graph-reset-domain>恢复默认</button></div>
        <div class="lab-divider"></div><h3>角度单位</h3>
        <div class="lab-row"><button class="lab-action ${route.graphAngle==='RAD'?'selected':''}" data-graph-angle="RAD">RAD 弧度</button><button class="lab-action ${route.graphAngle==='DEG'?'selected':''}" data-graph-angle="DEG">DEG 角度</button></div>
        <p class="lab-help">支持多项式、sin / cos / tan、asin、log、ln、sqrt、abs、e、π、幂次 (^)、隐式乘法（如 2x）。图中标示的最高点、最低点、截距为<strong>当前定义域内的近似值</strong>。<br><b>注意：</b>三角函数默认使用弧度；如果使用角度制，可以切到 DEG。</p>
      </aside>
      <div class="lab-panel"><div class="lab-row" style="justify-content:space-between;gap:14px"><div><h3>直角坐标系</h3><div class="lab-subtitle">点击曲线固定坐标 · 拖动平移 · 双指缩放</div></div><div class="lab-row"><button class="lab-action" data-graph-zoom="in">＋</button><button class="lab-action" data-graph-zoom="out">－</button><button class="lab-action" data-graph-reset>重置视图</button></div></div>
        <div class="graph-stage"><canvas id="graphCanvas" aria-label="可缩放、可拖动的函数直角坐标系"></canvas><div class="graph-badge">LIVE GRAPH · x / y</div><div id="graphCoord" class="graph-coord">x: 0.00 · y: 0.00</div></div>
        <section class="graph-teacher-panel"><div class="graph-teacher-head"><div><h3>📐 课堂标点与连线</h3><p class="lab-subtitle">直接输入精确坐标；可以按顺序把多个点连接成折线。</p></div><label class="graph-line-toggle"><input id="graphConnect" type="checkbox" ${state.graphConnect?'checked':''}> 连线</label></div>
<div class="graph-point-form"><label>X 坐标<input id="graphPointX" type="number" step="any" value="1"></label><label>Y 坐标<input id="graphPointY" type="number" step="any" value="2"></label><button class="lab-action primary" data-graph-point-add>＋ 添加坐标点</button></div>
<div class="graph-point-form"><label>曲线上的 X<input id="graphFunctionX" type="number" step="any" value="1"></label><label>选择函数<select id="graphFunctionSelect">${graph.filter(z=>z.expr.trim()).map(z=>`<option value="${esc(z.id)}">${esc(z.expr)}</option>`).join('')}</select></label><button class="lab-action" data-graph-fnpoint-add>计算并标记</button></div>
<div id="graphPointList" class="graph-point-list"></div>
<div class="lab-row"><button class="lab-action" data-graph-points-undo>撤销最后一点</button><button class="lab-action" data-graph-points-clear>清除课堂点</button><button class="lab-action" data-graph-points-center>适应全部点</button></div></section>
        <div class="graph-picked"><div><span class="graph-picked-kicker">📍 点击曲线上的任意一点，即可固定坐标</span><strong id="graphPickedValue">尚未选点</strong><small id="graphPickedFormula">支持鼠标点击或 iPad 轻点</small></div><button class="lab-action" data-graph-unpin>清除标记</button></div>
        <div class="graph-toolbar"><button class="lab-action primary" data-graph-download>↓ 保存图像 PNG</button><button class="lab-action" data-nav="calc">🧮 打开科学计算器</button></div>
        <div id="graphMessage" class="graph-message">🌱 输入函数，曲线会即时生长。</div>
        <div id="graphAnalysis" class="graph-analysis"></div>
      </div>
    </div>`;
}
function graphRow(item,i){return `<div class="graph-fn" data-graph-row="${esc(item.id)}"><span class="swatch" style="background:${GRAPH_PALETTE.includes(item.color)?item.color:GRAPH_PALETTE[0]}"></span><input aria-label="第 ${i+1} 条函数" type="text" spellcheck="false" autocomplete="off" data-graph-input="${esc(item.id)}" placeholder="例如 y = x^2" value="${esc(item.expr)}"><button title="${item.visible?'隐藏':'显示'}这条曲线" data-graph-toggle="${esc(item.id)}" aria-label="显示或隐藏函数" style="opacity:${item.visible?1:.45}">${item.visible?'◉':'◯'}</button><button data-graph-remove="${esc(item.id)}" aria-label="删除这条函数" title="删除">×</button></div>`}
function graphMount(){graphPointers.clear();graphPan=null;graphTrace=null;graphRecompile();const canvas=$('#graphCanvas');if(!canvas)return;
  canvas.addEventListener('pointerdown',e=>{graphTapStart={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};canvas.setPointerCapture(e.pointerId);graphPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});graphPan={cx:graphView.cx,cy:graphView.cy,x:e.clientX,y:e.clientY};if(graphPointers.size===2)graphPan=null;canvas.style.cursor='grabbing'});
  canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();graphTrace={sx:e.clientX-rect.left,sy:e.clientY-rect.top};const before=graphPointers.get(e.pointerId);if(before){graphPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(graphPointers.size===1&&graphPan){graphView.cx=graphPan.cx-(e.clientX-graphPan.x)/graphView.ppu;graphView.cy=graphPan.cy+(e.clientY-graphPan.y)/graphView.ppu}
      else if(graphPointers.size===2){const ids=[...graphPointers.keys()];const points=[...graphPointers.values()];const oldPoints=points.map((p,idx)=>ids[idx]===e.pointerId?before:p);const dNew=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y),dOld=Math.hypot(oldPoints[0].x-oldPoints[1].x,oldPoints[0].y-oldPoints[1].y);if(dOld>0)graphScale(dNew/dOld)} }graphDraw()});
  function end(e){if(e.type==='pointerup'&&graphTapStart&&graphTapStart.id===e.pointerId&&Math.hypot(e.clientX-graphTapStart.x,e.clientY-graphTapStart.y)<10&&performance.now()-graphTapStart.time<800){const box=canvas.getBoundingClientRect();graphPinAt(e.clientX-box.left,e.clientY-box.top,e.pointerType)}graphTapStart=null;graphPointers.delete(e.pointerId);graphPan=null;canvas.style.cursor='crosshair';if(graphPointers.size===1){const p=[...graphPointers.values()][0];graphPan={cx:graphView.cx,cy:graphView.cy,x:p.x,y:p.y}}}
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('pointerleave',()=>{if(!graphPointers.size){graphTrace=null;graphDraw()}});
  canvas.addEventListener('wheel',e=>{e.preventDefault();const box=canvas.getBoundingClientRect();graphScale(Math.exp(-e.deltaY*0.0014),e.clientX-box.left,e.clientY-box.top)},{passive:false});
  requestAnimationFrame(()=>{graphFitToDomain();graphDraw();graphUpdatePinnedReadout();graphRenderTeacherList()});
}
function graphRecompile(){graphCompiled=(state.graph||[]).map(item=>{try{return {...item,fn:item.expr.trim()?mathCompile(item.expr):null,error:'',analysis:null}}catch(e){return {...item,fn:null,error:e.message,analysis:null}}});graphAnalyzeAll();graphFeedback();graphRenderAnalysis();}
function graphFeedback(){if(route.page!=='graph')return;const errors=graphCompiled.filter(g=>g.expr.trim()&&g.error);for(const item of graphCompiled){const row=document.querySelector(`[data-graph-row="${item.id}"]`);if(row)row.classList.toggle('error',!!item.error)}const el=$('#graphMessage');if(el){const d=graphStateDomain();el.classList.toggle('bad',!!errors.length);el.textContent=errors.length?'⚠ '+errors[0].expr+'：'+errors[0].error:`✔ 已绘制 ${graphCompiled.filter(g=>g.visible&&g.fn).length} 条函数 · 当前定义域 [${mathFormat(d.xmin)}, ${mathFormat(d.xmax)}]`}}
function graphScale(factor,sx,sy){const canvas=$('#graphCanvas');if(!canvas)return;const rect=canvas.getBoundingClientRect();const w=rect.width,h=rect.height;const x=Number.isFinite(sx)?sx:w/2,y=Number.isFinite(sy)?sy:h/2;const old=graphView.ppu,newScale=Math.min(650,Math.max(0.5,old*factor));const wx=graphView.cx+(x-w/2)/old,wy=graphView.cy-(y-h/2)/old;graphView.ppu=newScale;graphView.cx=wx-(x-w/2)/newScale;graphView.cy=wy+(y-h/2)/newScale;graphDraw()}
function gridStep(target){const power=Math.pow(10,Math.floor(Math.log10(Math.max(.000001,target))));const f=target/power;return(f<1.5?1:f<3.5?2:f<7.5?5:10)*power}
function graphEval(fn,x){try{const y=fn({x,ans:calcState?.lastAns||0,m:calcState?.memory||0},route.graphAngle);return Number.isFinite(y)?y:NaN}catch(e){return NaN}}
function graphSamplePoints(fn,xmin,xmax,count=520){const pts=[];if(!(count>1))count=2;for(let i=0;i<count;i++){const x=xmin+(xmax-xmin)*i/(count-1);const y=graphEval(fn,x);if(Number.isFinite(y))pts.push({x,y})}return pts}
function graphBisectRoot(fn,a,b){let fa=graphEval(fn,a),fb=graphEval(fn,b);if(!Number.isFinite(fa)||!Number.isFinite(fb))return null;if(Math.abs(fa)<1e-7)return {x:a,y:fa};if(Math.abs(fb)<1e-7)return {x:b,y:fb};if(fa*fb>0)return null;let left=a,right=b;for(let i=0;i<38;i++){const mid=(left+right)/2;const fm=graphEval(fn,mid);if(!Number.isFinite(fm))break;if(Math.abs(fm)<1e-9)return {x:mid,y:fm};if(fa*fm<=0){right=mid;fb=fm}else{left=mid;fa=fm}}const x=(left+right)/2;const y=graphEval(fn,x);return Number.isFinite(y)&&Math.abs(y)<1e-5?{x,y}:null}
function graphRefineExtremum(fn,left,right,mode){let a=left,b=right;const phi=.61803398875;for(let i=0;i<34;i++){const c=b-(b-a)*phi,d=a+(b-a)*phi;const yc=graphEval(fn,c),yd=graphEval(fn,d);if(!Number.isFinite(yc)||!Number.isFinite(yd))break;if(mode==='max'?(yc<yd):(yc>yd))a=c;else b=d}const x=(a+b)/2;const y=graphEval(fn,x);return Number.isFinite(y)?{x,y}:null}
function graphMergeRoots(list){const out=[];for(const r of list.sort((a,b)=>a.x-b.x)){const prev=out[out.length-1];if(prev&&Math.abs(prev.x-r.x)<1e-3){if(Math.abs(r.y)<Math.abs(prev.y))out[out.length-1]=r}else out.push(r)}return out.slice(0,6)}
function graphAnalyzeFn(fn){
  const {xmin,xmax}=graphStateDomain();
  const pts=graphSamplePoints(fn,xmin,xmax,700);
  if(!pts.length)return null;
  let maxPoint=pts[0],minPoint=pts[0];
  for(let i=1;i<pts.length;i++){if(pts[i].y>maxPoint.y)maxPoint=pts[i];if(pts[i].y<minPoint.y)minPoint=pts[i]}
  const idxMax=pts.indexOf(maxPoint),idxMin=pts.indexOf(minPoint);
  if(idxMax>0&&idxMax<pts.length-1){const refined=graphRefineExtremum(fn,pts[idxMax-1].x,pts[idxMax+1].x,'max');if(refined)maxPoint=refined}
  if(idxMin>0&&idxMin<pts.length-1){const refined=graphRefineExtremum(fn,pts[idxMin-1].x,pts[idxMin+1].x,'min');if(refined)minPoint=refined}
  const roots=[];
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1],b=pts[i];
    if(Math.abs(a.y)<1e-4)roots.push({x:a.x,y:a.y});
    if(a.y===0||b.y===0||a.y*b.y<0){const root=graphBisectRoot(fn,a.x,b.x);if(root)roots.push(root)}
  }
  const y0=(xmin<=0&&xmax>=0)?graphEval(fn,0):NaN;
  return {roots:graphMergeRoots(roots),yIntercept:Number.isFinite(y0)?{x:0,y:y0}:null,maxPoint,minPoint,domain:{xmin,xmax}};
}
function graphAnalyzeAll(){for(const line of graphCompiled){line.analysis=line.fn?graphAnalyzeFn(line.fn):null}}
function graphRenderAnalysis(){
  const host=$('#graphAnalysis'); if(!host||route.page!=='graph')return;
  const cards=[];
  for(const line of graphCompiled){
    if(line.error){cards.push(`<article class="ga-card error"><div class="ga-head"><span class="swatch" style="background:${line.color}"></span><b>${esc(line.expr||'未命名函数')}</b></div><p>无法分析：${esc(line.error)}</p></article>`);continue}
    if(!line.visible||!line.fn)continue;
    const a=line.analysis;
    const roots=a?.roots?.length?a.roots.map(r=>`(${mathFormat(Number(r.x.toFixed(6)))}, 0)`).join('，'):'无';
    const yint=a?.yIntercept?`(0, ${mathFormat(Number(a.yIntercept.y.toFixed(6)))})`:'无';
    const max=a?.maxPoint?`(${mathFormat(Number(a.maxPoint.x.toFixed(6)))}, ${mathFormat(Number(a.maxPoint.y.toFixed(6)))})`:'无法确定';
    const min=a?.minPoint?`(${mathFormat(Number(a.minPoint.x.toFixed(6)))}, ${mathFormat(Number(a.minPoint.y.toFixed(6)))})`:'无法确定';
    cards.push(`<article class="ga-card"><div class="ga-head"><span class="swatch" style="background:${line.color}"></span><b>${esc(line.expr||'函数')}</b></div><div class="ga-body"><div><span>定义域</span><strong>[${mathFormat(a.domain.xmin)}, ${mathFormat(a.domain.xmax)}]</strong></div><div><span>x 截距</span><strong>${esc(roots)}</strong></div><div><span>y 截距</span><strong>${esc(yint)}</strong></div><div><span>最高点（近似）</span><strong>${esc(max)}</strong></div><div><span>最低点（近似）</span><strong>${esc(min)}</strong></div></div></article>`);
  }
  host.innerHTML=cards.length?`<div class="ga-title">自动分析结果（当前定义域内）</div><div class="ga-grid">${cards.join('')}</div>`:'<div class="ga-empty">暂无可分析的函数。输入函数后，这里会自动显示极值与截距。</div>';
}
function graphFitToDomain(){
  const canvas=$('#graphCanvas'); if(!canvas)return;
  const rect=canvas.getBoundingClientRect(); if(!rect.width||!rect.height)return;
  const {xmin,xmax}=graphStateDomain();
  const visible=graphCompiled.filter(x=>x.visible&&x.fn&&!x.error);
  let ymin=Infinity,ymax=-Infinity;
  for(const line of visible){
    const pts=graphSamplePoints(line.fn,xmin,xmax,220);
    for(const p of pts){if(Math.abs(p.y)>1e4)continue; ymin=Math.min(ymin,p.y); ymax=Math.max(ymax,p.y)}
  }
  if(!Number.isFinite(ymin)||!Number.isFinite(ymax)||ymin===ymax){ymin=-10;ymax=10}
  const padY=Math.max(1,(ymax-ymin)*0.12), padX=Math.max(1,(xmax-xmin)*0.05);
  const spanX=(xmax-xmin)+padX*2, spanY=(ymax-ymin)+padY*2;
  graphView.cx=(xmin+xmax)/2;
  graphView.cy=(ymin+ymax)/2;
  graphView.ppu=Math.min((rect.width-18)/Math.max(spanX,1),(rect.height-18)/Math.max(spanY,1));
  if(!Number.isFinite(graphView.ppu)||graphView.ppu<=0)graphView.ppu=44;else graphView.ppu=Math.max(0.5,Math.min(650,graphView.ppu));
}
function graphDraw(){const canvas=$('#graphCanvas');if(!canvas||route.page!=='graph')return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const W=rect.width,H=rect.height,dpr=Math.min(2,window.devicePixelRatio||1);const cw=Math.round(W*dpr),ch=Math.round(H*dpr);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0b261f';ctx.fillRect(0,0,W,H);
  const {cx,cy,ppu}=graphView;const sx=x=>W/2+(x-cx)*ppu,sy=y=>H/2-(y-cy)*ppu;const minX=cx-W/(2*ppu),maxX=cx+W/(2*ppu),minY=cy-H/(2*ppu),maxY=cy+H/(2*ppu);const step=gridStep(75/ppu);
  for(let k=Math.ceil(minX/step);k<=Math.floor(maxX/step);k++){
    const n=k*step,x=sx(n);ctx.strokeStyle=Math.abs(n)<step*1e-8?'#a9d19b':'#385c4c';ctx.lineWidth=Math.abs(n)<step*1e-8?1.6:.7;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();if(Math.abs(n)>step*1e-8){ctx.fillStyle='#9fc0a9';ctx.font='11px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText(mathFormat(Number(n.toPrecision(5))),x,Math.max(14,Math.min(H-8,sy(0)+16)))}}
  for(let k=Math.ceil(minY/step);k<=Math.floor(maxY/step);k++){
    const n=k*step,y=sy(n);ctx.strokeStyle=Math.abs(n)<step*1e-8?'#a9d19b':'#385c4c';ctx.lineWidth=Math.abs(n)<step*1e-8?1.6:.7;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();if(Math.abs(n)>step*1e-8){ctx.fillStyle='#9fc0a9';ctx.font='11px ui-monospace,monospace';ctx.textAlign='left';ctx.fillText(mathFormat(Number(n.toPrecision(5))),Math.max(9,Math.min(W-38,sx(0)+8)),y-5)}}
  const domain=graphStateDomain();
  ctx.save();ctx.strokeStyle='#d8efc066';ctx.setLineDash([7,6]);ctx.lineWidth=1.2;for(const b of [domain.xmin,domain.xmax]){const x=sx(b);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();ctx.fillStyle='#e2f6d8';ctx.font='12px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText('x='+mathFormat(b),x,18)}ctx.restore();
  ctx.font='bold 15px Georgia';ctx.fillStyle='#c7f6ad';if(sy(0)>=0&&sy(0)<=H)ctx.fillText('x',W-20,Math.min(H-8,sy(0)+20));if(sx(0)>=0&&sx(0)<=W)ctx.fillText('y',Math.min(W-20,sx(0)+10),18);
  for(const line of graphCompiled){if(!line.visible||!line.fn)continue;ctx.strokeStyle=line.color;ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.beginPath();let drawing=false,lastY=null;for(let px=0;px<=W;px+=1.5){const x=cx+(px-W/2)/ppu;if(x<domain.xmin||x>domain.xmax){drawing=false;lastY=null;continue}let y=graphEval(line.fn,x);const py=sy(y);if(!Number.isFinite(y)||!Number.isFinite(py)||Math.abs(py)>H*12||(lastY!==null&&Math.abs(py-lastY)>H*.9)){drawing=false;lastY=null;continue}if(!drawing){ctx.moveTo(px,py);drawing=true}else ctx.lineTo(px,py);lastY=py}ctx.stroke();graphDrawMarkers(ctx,sx,sy,line)}
  graphDrawTeacher(ctx,sx,sy,W,H);
  graphDrawPinned(ctx,sx,sy,W,H);
  if(graphTrace){const x=cx+(graphTrace.sx-W/2)/ppu,y=cy-(graphTrace.sy-H/2)/ppu;const co=$('#graphCoord');if(co)co.textContent='x: '+x.toFixed(3)+' · y: '+y.toFixed(3);ctx.strokeStyle='#e3eece66';ctx.setLineDash([4,5]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(graphTrace.sx,0);ctx.lineTo(graphTrace.sx,H);ctx.moveTo(0,graphTrace.sy);ctx.lineTo(W,graphTrace.sy);ctx.stroke();ctx.setLineDash([])}else{const co=$('#graphCoord');if(co)co.textContent='中心 ('+cx.toFixed(2)+', '+cy.toFixed(2)+')'}
}
function graphDrawMarkers(ctx,sx,sy,line){
  const a=line.analysis; if(!a)return;
  const pts=[];
  if(a.maxPoint)pts.push({p:a.maxPoint,label:'最高点',fill:'#ffd7a0'});
  if(a.minPoint)pts.push({p:a.minPoint,label:'最低点',fill:'#9ee4ff'});
  if(a.yIntercept)pts.push({p:a.yIntercept,label:'y截距',fill:'#d2f2bb'});
  for(const r of (a.roots||[]).slice(0,4))pts.push({p:{x:r.x,y:0},label:'x截距',fill:'#f6d4ea'});
  ctx.save();ctx.font='11px ui-monospace,monospace';
  for(const item of pts){const px=sx(item.p.x),py=sy(item.p.y);if(px<-10||px>ctx.canvas.width+10||py<-10||py>ctx.canvas.height+10)continue;ctx.beginPath();ctx.fillStyle=item.fill;ctx.strokeStyle='#103228';ctx.lineWidth=1.2;ctx.arc(px,py,4.2,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f1f6de';ctx.textAlign='left';ctx.fillText(item.label,px+7,py-7)}
  ctx.restore();
}
// 曲线点击：仅当点击位置足够接近真实曲线才锁定坐标。与平移手势分离。
function graphPinAt(px,py,pointerType='mouse'){
  const canvas=$('#graphCanvas');if(!canvas||route.page!=='graph')return false;
  const box=canvas.getBoundingClientRect(),W=box.width,H=box.height,{cx,cy,ppu}=graphView,d=graphStateDomain();
  const tolerance=pointerType==='touch'?30:18;
  let best=null;
  for(const line of graphCompiled){
    if(!line.visible||!line.fn)continue;
    for(let offset=-12;offset<=12;offset+=2){
      const sx=px+offset,x=cx+(sx-W/2)/ppu;
      if(x<d.xmin||x>d.xmax)continue;
      const y=graphEval(line.fn,x),sy=H/2-(y-cy)*ppu;
      if(!Number.isFinite(y)||!Number.isFinite(sy))continue;
      const distance=Math.hypot(sx-px,sy-py);
      if(distance<=tolerance&&(!best||distance<best.distance))best={id:line.id,expr:line.expr,color:line.color,x,y,distance};
    }
  }
  if(!best)return false;
  graphPinned=best;graphUpdatePinnedReadout();graphDraw();return true;
}
function graphUpdatePinnedReadout(){
  const val=$('#graphPickedValue'),formula=$('#graphPickedFormula');if(!val||!formula)return;
  if(!graphPinned){val.textContent='尚未选点';formula.textContent='在曲线上轻点一次，坐标会一直保留';return}
  val.textContent=`(${mathFormat(Number(graphPinned.x.toPrecision(7)))}, ${mathFormat(Number(graphPinned.y.toPrecision(7)))})`;
  formula.textContent=graphPinned.expr;
}
function graphDrawPinned(ctx,sx,sy,W,H){
  if(!graphPinned)return;
  const item=graphCompiled.find(x=>x.id===graphPinned.id);
  if(!item||!item.visible||!item.fn)return;
  const d=graphStateDomain();if(graphPinned.x<d.xmin||graphPinned.x>d.xmax)return;
  const x=sx(graphPinned.x),y=sy(graphPinned.y);
  if(x<0||x>W||y<0||y>H)return;
  ctx.save();ctx.strokeStyle='#fff2c6a9';ctx.lineWidth=1.3;ctx.setLineDash([5,5]);
  ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fillStyle='#fff8d2';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=item.color;ctx.stroke();
  const label=`(${mathFormat(Number(graphPinned.x.toPrecision(6)))}, ${mathFormat(Number(graphPinned.y.toPrecision(6)))})`;
  ctx.font='bold 13px ui-monospace, Consolas, monospace';const tw=ctx.measureText(label).width;
  const bx=Math.max(8,Math.min(W-tw-26,x+15)),by=Math.max(10,Math.min(H-40,y-48));
  ctx.fillStyle='#faefd0';ctx.beginPath();ctx.roundRect(bx,by,tw+18,30,8);ctx.fill();
  ctx.fillStyle='#17382c';ctx.fillText(label,bx+9,by+20);ctx.restore();
}
function graphTryApplyDomain(){const minEl=$('#graphXMin'),maxEl=$('#graphXMax');if(!minEl||!maxEl)return false;const xmin=Number(minEl.value),xmax=Number(maxEl.value);if(!Number.isFinite(xmin)||!Number.isFinite(xmax)||xmax<=xmin)return false;graphStoreDomain(xmin,xmax);graphPinned=null;graphUpdatePinnedReadout();graphAnalyzeAll();graphFeedback();graphRenderAnalysis();graphFitToDomain();graphDraw();return true}
function graphCommand(b){
  if(b.hasAttribute('data-graph-point-add')){const x=Number($('#graphPointX')?.value),y=Number($('#graphPointY')?.value);if(!Number.isFinite(x)||!Number.isFinite(y))return toast('请输入有效的 x 和 y');graphAddTeacherPoint(x,y);return true}
  if(b.hasAttribute('data-graph-fnpoint-add')){const x=Number($('#graphFunctionX')?.value),key=$('#graphFunctionSelect')?.value;const line=graphCompiled.find(z=>z.id===key);if(!Number.isFinite(x)||!line?.fn)return toast('请选择函数并输入有效的 X');if(x<graphStateDomain().xmin||x>graphStateDomain().xmax)return toast('X 超出当前定义域');const y=graphEval(line.fn,x);if(!Number.isFinite(y))return toast('该 x 处函数值无定义');graphPinned={id:line.id,expr:line.expr,color:line.color,x,y};graphAddTeacherPoint(x,y);graphUpdatePinnedReadout();return true}
  if(b.hasAttribute('data-graph-points-undo')){state.graphMarks=(state.graphMarks||[]).slice(0,-1);persist();graphRenderTeacherList();graphDraw();return true}
  if(b.hasAttribute('data-graph-points-clear')){state.graphMarks=[];persist();graphRenderTeacherList();graphDraw();return true}
  if(b.hasAttribute('data-graph-points-center')){graphFitTeacherPoints();return true}
  if(b.dataset.graphPointDelete){state.graphMarks=(state.graphMarks||[]).filter(z=>z.id!==b.dataset.graphPointDelete);persist();graphRenderTeacherList();graphDraw();return true}
  if(b.hasAttribute('data-graph-add')){if(state.graph.length>=8)return toast('最多同时保存 8 条函数');state.graph.push({id:id(),expr:'',color:GRAPH_PALETTE[state.graph.length%GRAPH_PALETTE.length],visible:true});persist();render();const all=document.querySelectorAll('[data-graph-input]');all[all.length-1]?.focus();return true}
  if(b.hasAttribute('data-graph-clear')){graphPinned=null;state.graph=[];persist();render();return true}
  if(b.dataset.graphExample){if(state.graph.length>=8)return toast('最多 8 条函数，先删除一条');state.graph.push({id:id(),expr:b.dataset.graphExample,color:GRAPH_PALETTE[state.graph.length%GRAPH_PALETTE.length],visible:true});persist();render();return true}
  if(b.dataset.graphRemove){if(graphPinned?.id===b.dataset.graphRemove)graphPinned=null;state.graph=state.graph.filter(g=>g.id!==b.dataset.graphRemove);persist();render();return true}
  if(b.dataset.graphToggle){const g=state.graph.find(g=>g.id===b.dataset.graphToggle);if(g)g.visible=!g.visible;persist();graphRecompile();graphDraw();render();return true}
  if(b.hasAttribute('data-graph-unpin')){graphPinned=null;graphUpdatePinnedReadout();graphDraw();return true}
  if(b.dataset.graphAngle){route.graphAngle=b.dataset.graphAngle;graphPinned=null;graphAnalyzeAll();render();return true}
  if(b.dataset.graphZoom){graphScale(b.dataset.graphZoom==='in'?1.35:1/1.35);return true}
  if(b.hasAttribute('data-graph-reset')){graphFitToDomain();graphDraw();return true}
  if(b.hasAttribute('data-graph-fit')){if(!graphTryApplyDomain())toast('请确保定义域左端 < 右端');return true}
  if(b.hasAttribute('data-graph-reset-domain')){graphStoreDomain(DEFAULT_GRAPH_DOMAIN.xmin,DEFAULT_GRAPH_DOMAIN.xmax);render();return true}
  if(b.hasAttribute('data-graph-download')){graphDraw();const canvas=$('#graphCanvas');if(canvas){const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='数学雨林-函数图像-'+today()+'.png';a.click();toast('已保存坐标图 PNG')}return true}
  return false;
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(route.page==='graph')graphCommand(b);});
document.addEventListener('input',e=>{
  if(e.target.matches('[data-graph-input]')){const item=state.graph.find(x=>x.id===e.target.dataset.graphInput);if(item){graphPinned=null;graphUpdatePinnedReadout();item.expr=e.target.value;persist();graphRecompile();graphDraw()}}
  if(e.target.matches('[data-graph-domain]'))graphTryApplyDomain();
});
window.addEventListener('resize',()=>{if(route.page==='graph'){graphFitToDomain();graphDraw()}});

function graphAddTeacherPoint(x,y){
  if(!Array.isArray(state.graphMarks))state.graphMarks=[];
  if(state.graphMarks.length>=80)return toast('最多 80 个课堂点，请先清除一些');
  state.graphMarks.push({id:id(),x,y});persist();graphRenderTeacherList();graphFitTeacherPoints();graphDraw();toast('已添加 ('+mathFormat(x)+', '+mathFormat(y)+')');
}
function graphRenderTeacherList(){const el=$('#graphPointList');if(!el)return;const marks=state.graphMarks||[];el.innerHTML=marks.length?marks.map((p,i)=>`<div class="graph-point-entry"><span><b>${String.fromCharCode(65+i%26)}${i>=26?Math.floor(i/26):''}</b> (${esc(mathFormat(p.x))}, ${esc(mathFormat(p.y))})</span><button class="lab-action" data-graph-point-delete="${esc(p.id)}">删除</button></div>`).join(''):'<span class="small-muted">还没有课堂标点</span>'}
function graphDrawTeacher(ctx,sx,sy,W,H){const marks=state.graphMarks||[];if(!marks.length)return;ctx.save();const pts=marks.map(p=>({...p,px:sx(p.x),py:sy(p.y)}));
 if(state.graphConnect&&pts.length>1){ctx.strokeStyle='#ffcf7a';ctx.lineWidth=3;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.px,p.py):ctx.moveTo(p.px,p.py));ctx.stroke()}
 pts.forEach((p,i)=>{if(p.px<0||p.px>W||p.py<0||p.py>H)return;
 ctx.strokeStyle='#fff2be';ctx.lineWidth=1;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(p.px,sy(0));ctx.lineTo(p.px,p.py);ctx.lineTo(sx(0),p.py);ctx.stroke();ctx.setLineDash([]);
 ctx.beginPath();ctx.arc(p.px,p.py,6.2,0,Math.PI*2);ctx.fillStyle='#ffd071';ctx.fill();ctx.strokeStyle='#223a2b';ctx.lineWidth=2;ctx.stroke();
 const label=String.fromCharCode(65+i%26)+(i>=26?Math.floor(i/26):'')+' ('+mathFormat(p.x)+', '+mathFormat(p.y)+')';ctx.font='bold 12px system-ui';const w=ctx.measureText(label).width;const tx=Math.min(W-w-8,Math.max(7,p.px+11)),ty=Math.max(16,Math.min(H-8,p.py-13));ctx.fillStyle='#ffecb5';ctx.fillText(label,tx,ty)}) ;ctx.restore()}
function graphFitTeacherPoints(){const pts=state.graphMarks||[];if(!pts.length)return toast('请先添加点');const canvas=$('#graphCanvas');if(!canvas)return;let loX=Math.min(0,...pts.map(p=>p.x)),hiX=Math.max(0,...pts.map(p=>p.x)),loY=Math.min(0,...pts.map(p=>p.y)),hiY=Math.max(0,...pts.map(p=>p.y));const gapX=Math.max(2,(hiX-loX)*.3),gapY=Math.max(2,(hiY-loY)*.3);graphView={cx:(loX+hiX)/2,cy:(loY+hiY)/2,ppu:Math.max(.5,Math.min(650,(canvas.clientWidth-40)/(hiX-loX+gapX),(canvas.clientHeight-40)/(hiY-loY+gapY)))};graphDraw()}
document.addEventListener('change',e=>{if(e.target.id==='graphConnect'){state.graphConnect=e.target.checked;persist();graphDraw()}});
registerModule({id:'graph', label:'函数绘图室', icon:'⌁', render:graphPage, mount:graphMount});

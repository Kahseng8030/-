'use strict';
// 可以单独修改本功能；该模块通过 registerModule 加入主导航。
let calcState={input:'',result:'0',lastAns:0,memory:0,angle:'DEG',tab:'COMP',isFraction:false,history:[],error:''};
/* ==== MS 风格科学计算器 ==== */
const CALC_KEYS = [
  ['DEG','unit'],['sin','func','sin('],['cos','func','cos('],['tan','func','tan('],['(', 'func'],[')', 'func'],
  ['asin','func','asin('],['acos','func','acos('],['atan','func','atan('],['√','func','sqrt('],['x²','func','^2'],['xʸ','func','^'],
  ['ln','func','ln('],['log','func','log('],['10ˣ','func','10^('],['eˣ','func','exp('],['x!','func','!'],['1/x','func','^(-1)'],
  ['nCr','func',' nCr '],['nPr','func',' nPr '],['π','func','pi'],['e','func','e'],['%','func','%'],['Ans','func','Ans'],
  ['7','num'],['8','num'],['9','num'],['÷','op','/'],['DEL','special'],['AC','special'],
  ['4','num'],['5','num'],['6','num'],['×','op','*'],['M+','func'],['M−','func'],
  ['1','num'],['2','num'],['3','num'],['−','op','-'],['MR','func'],['MC','func'],
  ['0','num'],['.','num'],['(−)','func','-'],['+','op','+'],['a b/c','func'],['=','equal']
];
function calculatorPage(){return `${head('MS CALCULATOR / 掌中实验室','570MS 风格科学计算器','独立离线科学计算器：常用科学运算、角度制、答案记忆、分数显示，还有方程和统计工具。','<span class="pill">非官方教学模拟器</span>')}
    <section class="tool-hero"><span class="eyebrow">POCKET MATHEMATICS LAB</span><h3>把一台科学计算器，带进雨林。</h3><p>参考 fx-570MS 常见运算逻辑设计，按键或直接输入表达式都可以。<b>并非原厂模拟器，也不支持原机全部 401 项功能。</b></p></section>
    <div class="calc-layout">
      <section class="calc-machine" aria-label="科学计算器">
        <div class="calc-brand"><b>MS · SCIENTIFIC LAB</b><small>570MS 风格 · OFFLINE</small></div>
        <div class="calc-face"><div class="calc-status"><span id="calcAngleBadge">${calcState.angle}</span><span id="calcModeBadge">${calcState.tab}</span><span id="calcMemoryBadge">${calcState.memory?'M':'　'}&nbsp; HISTORY</span></div>
          <input id="calcInput" spellcheck="false" type="text" aria-label="计算器表达式" placeholder="输入 2sin(30) 或用按键..." value="${esc(calcState.input)}" autocomplete="off">
          <div id="calcResult" class="calc-result ${String(calcState.result).includes('ERROR')?'err':''}">${esc(calcState.result)}</div><div id="calcMini" class="calc-screen-help">${calcState.isFraction?'分数显示':'按 = 得到答案'}</div></div>
        <div class="calc-keyboard">${CALC_KEYS.map(([label,sty,ins])=>`<button class="calc-key ${['num','op','special','equal'].includes(sty)?sty:''}" data-calc-key="${esc(label)}" title="${esc(label)}">${esc(label)}</button>`).join('')}</div>
        <div class="calc-help">🔸 角度键切换 DEG → RAD → GRA　·　<b>DEL</b> 删除　·　<b>AC</b> 清空<br>🔸 <b>a b/c</b> 将计算结果切换为分数 / 小数（支持可近似为简单分数的数值）</div>
      </section>
      <div class="calc-pane"><div class="calc-tools">${[['COMP','基本运算'],['EQN','方程求解'],['STAT','统计计算'],['NUM','微积分']].map(([id,title])=>`<button class="lab-action ${calcState.tab===id?'selected':''}" data-calc-tab="${id}">${title}</button>`).join('')}</div><div id="calcToolPanel">${calcToolPage()}</div>
        <div class="lab-divider"></div><h3>计算历史</h3><div id="calcHistory">${calcHistoryPage()}</div>
        <p class="lab-help">本计算器使用浏览器数值运算，与实体机器在输入方式、舍入、显示精度等方面可能不同。考试练习请以实际计算器和考试规则为准。</p>
      </div>
    </div>`}
function calcHistoryPage(){return calcState.history.length?calcState.history.slice(0,8).map(h=>`<div style="border-bottom:1px solid #375747;padding:8px 0;font:12px/1.8 ui-monospace,monospace"><div style="color:#a7c3af">${esc(h.exp)}</div><strong style="color:#daf4c9">= ${esc(h.result)}</strong></div>`).join(''):'<p>暂无计算记录。输入表达式后按 = 开始。</p>'}
function calcToolPage(){switch(calcState.tab){
  case 'EQN':return `<h3>🧩 方程求解 · EQN</h3><p>输入系数计算 <b>ax² + bx + c = 0</b>。会显示实数根；若没有实数根，会显示复数形式。</p><div class="calc-form"><label>a<input id="eqA" type="number" step="any" value="1"></label><label>b<input id="eqB" type="number" step="any" value="-3"></label><label>c<input id="eqC" type="number" step="any" value="2"></label><button class="lab-action primary" data-calc-solve="quadratic">计算方程</button></div><div id="calcToolResult" class="calc-output">例如：x² − 3x + 2 = 0 → x = 1 或 2</div>
    <div class="lab-divider"></div><h3>二元一次联立方程</h3><p>a₁x + b₁y = c₁；a₂x + b₂y = c₂</p><div class="calc-form">${[['eqA1','a₁',2],['eqB1','b₁',1],['eqC1','c₁',7],['eqA2','a₂',1],['eqB2','b₂',-1],['eqC2','c₂',1]].map(([id,label,val])=>`<label>${label}<input id="${id}" type="number" step="any" value="${val}"></label>`).join('')}<button class="lab-action primary" data-calc-solve="system">解联立方程</button></div>`;
  case 'STAT':return `<h3>📊 单变量统计 · STAT</h3><p>输入数据（以逗号、空格或换行分隔），计算平均数、标准差、方差和中位数。</p><div class="calc-form"><label class="full">样本数据<textarea id="statData" placeholder="2, 4, 4, 6, 8">2, 4, 4, 6, 8</textarea></label><button class="lab-action primary" data-calc-solve="stat">计算统计量</button></div><div id="calcToolResult" class="calc-output">例如：2,4,4,6,8 → 平均数 4.8</div>`;
  case 'NUM':return `<h3>∫ 数值微积分 · CALC</h3><p>输入 f(x)，计算指定位置的近似导数，或指定区间的定积分（数值近似）。</p><div class="calc-form"><label class="full">函数 f(x)<input id="numFormula" type="text" value="x^2" spellcheck="false" /></label><label>x（求导点）<input id="numX" type="number" step="any" value="2" /></label><label>起点 a<input id="numA" type="number" step="any" value="0" /></label><label>终点 b<input id="numB" type="number" step="any" value="2" /></label><div class="full lab-row"><button class="lab-action primary" data-calc-solve="derivative">d/dx</button><button class="lab-action" data-calc-solve="integral">∫ f(x) dx</button></div></div><div id="calcToolResult" class="calc-output">例如：f(x)=x²，在 x=2 导数为 4，0～2 积分为 8/3。</div><p class="lab-help">数值法在不连续点、奇点以及变化剧烈的函数附近可能不准确。</p>`;
  default:return `<h3>🌿 常用科学计算</h3><p>支持数学表达式输入，也可以直接点计算器按键。默认 <b>DEG（角度）</b>，如需计算 <b>sin(π/2)</b>，先切换到 RAD。</p><div class="lab-row"><button class="lab-chip" data-calc-example="sin(30)">sin(30)</button><button class="lab-chip" data-calc-example="5 nCr 2">5 nCr 2</button><button class="lab-chip" data-calc-example="sqrt(144)">√144</button><button class="lab-chip" data-calc-example="log(1000)">log(1000)</button><button class="lab-chip" data-calc-example="2^8">2^8</button></div><div class="lab-divider"></div><h3>支持的常用功能</h3><p>四则运算、括号、幂次、开方、三角 / 反三角函数、对数、自然对数、阶乘、排列组合、百分数、π、e、Ans、M 记忆、分数近似显示。</p>`;
}}
function calcMount(){calcScreen();}
function calcScreen(){if(route.page!=='calc')return;const inp=$('#calcInput');if(inp&&inp.value!==calcState.input)inp.value=calcState.input;const r=$('#calcResult');if(r){r.textContent=calcState.result;r.classList.toggle('err',String(calcState.result).includes('ERROR'))}const badge=$('#calcAngleBadge');if(badge)badge.textContent=calcState.angle;const mb=$('#calcModeBadge');if(mb)mb.textContent=calcState.tab;const mc=$('#calcMemoryBadge');if(mc)mc.textContent=calcState.memory?'M · HISTORY':'HISTORY';const mini=$('#calcMini');if(mini)mini.textContent=calcState.error|| (calcState.isFraction?'分数显示 · a b/c 切换':'按 = 得到答案');const unit=$('[data-calc-key="DEG"]');if(unit)unit.textContent=calcState.angle;}
function calcCompute(){
  calcState.error='';try{let exp=calcState.input.trim();if(!exp)throw Error('请输入表达式');const balance=(exp.match(/\(/g)||[]).length-(exp.match(/\)/g)||[]).length;if(balance>0)exp+=')'.repeat(balance);const num=mathCompile(exp)({ans:calcState.lastAns,m:calcState.memory},calcState.angle);if(!Number.isFinite(num))throw Error('结果超出范围 / 分母为零');calcState.lastAns=num;calcState.result=(calcState.isFraction&&toFraction(num))||mathFormat(num);calcState.history.unshift({exp:calcState.input,result:calcState.result});calcState.history=calcState.history.slice(0,25);const h=$('#calcHistory');if(h)h.innerHTML=calcHistoryPage();}
  catch(e){calcState.result='Math ERROR';calcState.error=e.message||'表达式错误';}calcScreen();
}
function calcInsert(str){const inp=$('#calcInput');let start=inp?inp.selectionStart:calcState.input.length,end=inp?inp.selectionEnd:calcState.input.length;if(start==null)start=calcState.input.length;if(end==null)end=calcState.input.length;calcState.input=calcState.input.slice(0,start)+str+calcState.input.slice(end);calcScreen();if(inp){inp.focus();inp.setSelectionRange(start+str.length,start+str.length)}}
function calcKey(label){
  if(label==='AC'){calcState.input='';calcState.result='0';calcState.error='';calcScreen();$('#calcInput')?.focus();return}
  if(label==='DEL'){const inp=$('#calcInput'),a=inp?.selectionStart??calcState.input.length,b=inp?.selectionEnd??calcState.input.length;const from=a===b?Math.max(0,a-1):a;calcState.input=calcState.input.slice(0,from)+calcState.input.slice(b);calcScreen();inp?.focus();inp?.setSelectionRange(from,from);return}
  if(label==='='){calcCompute();return}
  if(label==='DEG'){calcState.angle=calcState.angle==='DEG'?'RAD':calcState.angle==='RAD'?'GRA':'DEG';calcScreen();return}
  if(label==='a b/c'){calcState.isFraction=!calcState.isFraction;if(Number.isFinite(calcState.lastAns))calcState.result=(calcState.isFraction&&toFraction(calcState.lastAns))||mathFormat(calcState.lastAns);calcScreen();return}
  if(['M+','M−'].includes(label)){if(!Number.isFinite(calcState.lastAns))return;calcState.memory+=label==='M+'?calcState.lastAns:-calcState.lastAns;calcScreen();toast('记忆 M = '+mathFormat(calcState.memory));return}
  if(label==='MR'){calcInsert('M');return}
  if(label==='MC'){calcState.memory=0;calcScreen();toast('记忆已清空');return}
  const key=CALC_KEYS.find(x=>x[0]===label);if(key)calcInsert(key[2]||label);
}
function valueOfInput(id){const el=document.getElementById(id),val=Number(el?.value);if(!el||el.value.trim()===''||!Number.isFinite(val))throw Error('请填写有效数值：'+id);return val}
function calcSolve(kind){const out=$('#calcToolResult');if(!out)return;
  try{let result='';if(kind==='quadratic'){
    const a=valueOfInput('eqA'),b=valueOfInput('eqB'),c=valueOfInput('eqC');if(Math.abs(a)<1e-14){if(Math.abs(b)<1e-14)result=c===0?'恒等式：任意实数都成立':'无解';else result='x = '+mathFormat(-c/b)}else{const d=b*b-4*a*c;if(Math.abs(d)<1e-12)result='判别式 Δ ≈ 0\nx = '+mathFormat(-b/(2*a))+'（重根）';else if(d>0)result='判别式 Δ = '+mathFormat(d)+'\nx₁ = '+mathFormat((-b+Math.sqrt(d))/(2*a))+'\nx₂ = '+mathFormat((-b-Math.sqrt(d))/(2*a));else result='判别式 Δ = '+mathFormat(d)+'\nx₁ = '+mathFormat(-b/(2*a))+' + '+mathFormat(Math.sqrt(-d)/Math.abs(2*a))+'i\nx₂ = '+mathFormat(-b/(2*a))+' − '+mathFormat(Math.sqrt(-d)/Math.abs(2*a))+'i';}}
    else if(kind==='system'){const a=valueOfInput('eqA1'),b=valueOfInput('eqB1'),c=valueOfInput('eqC1'),d=valueOfInput('eqA2'),e=valueOfInput('eqB2'),f=valueOfInput('eqC2'),det=a*e-b*d;if(Math.abs(det)<1e-12)result='行列式 ≈ 0：方程无唯一解（可能无解或有无穷多个解）。';else result='x = '+mathFormat((c*e-b*f)/det)+'\ny = '+mathFormat((a*f-c*d)/det)}
    else if(kind==='stat'){const raw=$('#statData').value.trim();const v=raw.split(/[,，;；\s]+/).filter(Boolean).map(Number);if(!v.length||v.some(x=>!Number.isFinite(x)))throw Error('请填写有效数字，以逗号或空格分隔');const n=v.length,sum=v.reduce((a,b)=>a+b,0),mean=sum/n,pvar=v.reduce((a,b)=>a+(b-mean)**2,0)/n,sorted=[...v].sort((a,b)=>a-b),median=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;result='数据量 n = '+n+'\nΣx = '+mathFormat(sum)+'\n平均数 x̄ = '+mathFormat(mean)+'\n中位数 = '+mathFormat(median)+'\n总体标准差 σ = '+mathFormat(Math.sqrt(pvar))+'\n样本标准差 s = '+(n>1?mathFormat(Math.sqrt(pvar*n/(n-1))):'n 必须大于 1')+'\n总体方差 σ² = '+mathFormat(pvar)}
    else if(kind==='derivative'||kind==='integral'){const f=mathCompile($('#numFormula').value);const g=x=>{const v=f({x,ans:calcState.lastAns,m:calcState.memory},calcState.angle);if(!Number.isFinite(v))throw Error('函数在计算区间存在无效值');return v};if(kind==='derivative'){const x=valueOfInput('numX'),h=1e-5*Math.max(1,Math.abs(x));result="f'("+x+") ≈ "+mathFormat((g(x-2*h)-8*g(x-h)+8*g(x+h)-g(x+2*h))/(12*h))+'\n（五点中心差分，近似值）'}else{const a=valueOfInput('numA'),b=valueOfInput('numB'),n=800,h=(b-a)/n;let sum=g(a)+g(b);for(let k=1;k<n;k++)sum+=(k%2?4:2)*g(a+k*h);result='∫₍'+a+'→'+b+'₎ f(x)dx ≈ '+mathFormat(sum*h/3)+'\n（辛普森法，数值近似）'}}
    out.textContent=result;
  }catch(e){out.textContent='⚠ '+(e.message||'输入不正确')}
}
function calcCommand(b){
  if(b.dataset.calcKey){calcKey(b.dataset.calcKey);return true}
  if(b.dataset.calcTab){calcState.tab=b.dataset.calcTab;render();return true}
  if(b.dataset.calcExample){calcState.input=b.dataset.calcExample;calcScreen();$('#calcInput')?.focus();return true}
  if(b.dataset.calcSolve){calcSolve(b.dataset.calcSolve);return true}
  return false;
}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&route.page==='calc')calcCommand(b)});
document.addEventListener('input',e=>{if(e.target.id==='calcInput'){calcState.input=e.target.value;calcState.result='…';calcState.error='';calcScreen()}});
document.addEventListener('keydown',e=>{if(route.page==='calc'&&e.target.id==='calcInput'&&e.key==='Enter'){e.preventDefault();calcCompute()}});
registerModule({id:'calc', label:'科学计算器', icon:'⊞', render:calculatorPage, mount:calcMount});

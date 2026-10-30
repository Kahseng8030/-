'use strict';
// 公共数学解析器，函数绘图室和计算器共用；不调用 eval。
/* ==== 通用数学语法解析器：不执行任意用户代码 ==== */
const MATH_FUNCS = new Set(['sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','asinh','acosh','atanh','sqrt','cbrt','abs','log','ln','exp','floor','ceil','round','sign','pow','root']);
const MATH_CONST = new Set(['pi','e','x','ans','m','a','b','c']);
function mathTokenize(raw){
  let s=String(raw||'').replace(/[−–]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/π/g,'pi').replace(/√/g,'sqrt').replace(/²/g,'^2').replace(/³/g,'^3').replace(/\u00a0/g,' ');
  s=s.replace(/^\s*(?:y|f\s*\(\s*x\s*\)|g\s*\(\s*x\s*\))\s*=\s*/i,'');
  const t=[];let p=0;
  while(p<s.length){
    if(/\s/.test(s[p])){p++;continue}
    const chunk=s.slice(p);
    const num=chunk.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if(num){t.push({type:'number',text:num[0],value:Number(num[0])});p+=num[0].length;continue}
    const name=chunk.match(/^[A-Za-z_]+/);
    if(name){t.push({type:'name',text:name[0].toLowerCase()});p+=name[0].length;continue}
    if('()+-*/^!%,'.includes(s[p])){t.push({type:s[p],text:s[p]});p++;continue}
    throw Error('无法识别字符「'+s[p]+'」，请检查公式');
  }
  const out=[];
  function isEnd(a){return a&&(a.type==='number'||a.type===')'||a.type==='!'||a.type==='%'||a.type==='name'&&MATH_CONST.has(a.text))}
  function isStart(b){return b&&(b.type==='number'||b.type==='('||b.type==='name'&&b.text!=='ncr'&&b.text!=='npr')}
  for(const token of t){const prev=out[out.length-1];if(isEnd(prev)&&isStart(token))out.push({type:'*',text:'*'});out.push(token)}
  return out;
}
function factorial(v){if(!Number.isInteger(v)||v<0||v>170)throw Error('阶乘仅支持 0～170 的整数');let n=1;for(let i=2;i<=v;i++)n*=i;return n}
function mathCall(fn,args,mode){
  const rad=mode==='DEG'?Math.PI/180:mode==='GRA'?Math.PI/200:1;
  const v=args[0];
  if(!args.length||args.some(a=>!Number.isFinite(a)))throw Error('函数参数错误');
  if(['sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','asinh','acosh','atanh','sqrt','cbrt','abs','ln','exp','floor','ceil','round','sign'].includes(fn)&&args.length!==1)throw Error(fn+'() 需要一个参数');
  switch(fn){
    case 'sin':return Math.sin(v*rad);case 'cos':return Math.cos(v*rad);case 'tan':return Math.tan(v*rad);
    case 'asin':return Math.asin(v)/rad;case 'acos':return Math.acos(v)/rad;case 'atan':return Math.atan(v)/rad;
    case 'sinh':return Math.sinh(v);case 'cosh':return Math.cosh(v);case 'tanh':return Math.tanh(v);
    case 'asinh':return Math.asinh(v);case 'acosh':return Math.acosh(v);case 'atanh':return Math.atanh(v);
    case 'sqrt':return Math.sqrt(v);case 'cbrt':return Math.cbrt(v);case 'abs':return Math.abs(v);
    case 'ln':return Math.log(v);case 'log':return args.length===1?Math.log10(v):args.length===2?Math.log(v)/Math.log(args[1]):NaN;
    case 'exp':return Math.exp(v);case 'floor':return Math.floor(v);case 'ceil':return Math.ceil(v);
    case 'round':return Math.round(v);case 'sign':return Math.sign(v);
    case 'pow':return args.length===2?Math.pow(args[0],args[1]):NaN;
    case 'root':return args.length===2?Math.pow(args[1],1/args[0]):NaN;
  }
  throw Error('不支持的函数：'+fn);
}
function mathCompile(formula){
  const t=mathTokenize(formula);let i=0;
  if(!t.length)throw Error('请输入表达式');
  const peek=()=>t[i];
  function parse(bp=0){
    const start=t[i++];if(!start)throw Error('表达式尚未输入完整');
    let left;
    if(start.type==='number')left=()=>start.value;
    else if(start.type==='+'||start.type==='-'){
      const child=parse(30);left=(vars,mode)=>start.type==='-'?-child(vars,mode):child(vars,mode);
    }else if(start.type==='('){
      left=parse(0);if(peek()?.type!==')')throw Error('缺少右括号 )');i++;
    }else if(start.type==='name'){
      const name=start.text;
      if(MATH_FUNCS.has(name)){
        if(peek()?.type!=='(')throw Error(name+' 后面请加括号，例如 '+name+'(30)');
        i++;const args=[];
        if(peek()?.type!==')'){
          do{args.push(parse(0));if(peek()?.type!==',')break;i++}while(true);
        }
        if(peek()?.type!==')')throw Error('函数 '+name+' 缺少右括号 )');i++;
        left=(vars,mode)=>mathCall(name,args.map(f=>f(vars,mode)),mode);
      }else if(MATH_CONST.has(name)){
        left=(vars)=>{
          if(name==='pi')return Math.PI;
          if(name==='e')return Math.E;
          if(Object.prototype.hasOwnProperty.call(vars,name))return vars[name];
          throw Error('变量 '+name.toUpperCase()+' 未设置值');
        };
      }else throw Error('未知名称：'+name+'，可用 sin(x)、sqrt(x) 等');
    }else throw Error('表达式格式有误：'+start.text);
    while(peek()){
      const next=peek();
      if(next.type==='!'||next.type==='%'){
        if(55<bp)break;i++;const old=left;
        left=next.type==='!'?(vars,mode)=>factorial(old(vars,mode)):(vars,mode)=>old(vars,mode)/100;
        continue;
      }
      const op=next.type==='name'&&(next.text==='ncr'||next.text==='npr')?next.text:next.type;
      const binding=op==='^'?[40,40]:op==='ncr'||op==='npr'?[25,26]:op==='*'||op==='/'?[20,21]:op==='+'||op==='-'?[10,11]:null;
      if(!binding||binding[0]<bp)break;
      i++;const right=parse(binding[1]),old=left;
      left=(vars,mode)=>{
        const a=old(vars,mode),b=right(vars,mode);
        switch(op){
          case '+':return a+b;case '-':return a-b;case '*':return a*b;case '/':return a/b;case '^':return Math.pow(a,b);
          case 'npr':case 'ncr':{
            if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||b>a||a>170)throw Error('nPr / nCr 需要 0 ≤ r ≤ n ≤ 170 的整数');
            let val=1;for(let k=1;k<=b;k++)val*=op==='ncr'?(a-k+1)/k:a-k+1;return val;
          }
        }
      };
    }
    return left;
  }
  const compiled=parse();
  if(i!==t.length)throw Error('无法解析「'+t[i].text+'」附近的内容');
  return (vars={},mode='RAD')=>compiled(vars,mode);
}
function mathFormat(n){
  if(!Number.isFinite(n))return 'Math ERROR';
  if(Object.is(n,-0)||Math.abs(n)<1e-13)return '0';
  if(Math.abs(n)>1e12||Math.abs(n)<1e-8)return n.toExponential(9).replace(/e\+?/,'E');
  return String(Number(n.toPrecision(12)));
}
function toFraction(value){
  if(!Number.isFinite(value))return null;
  const sign=value<0?-1:1;let x=Math.abs(value),h0=0,h1=1,k0=1,k1=0;
  for(let j=0;j<30;j++){
    const a=Math.floor(x);const h=a*h1+h0,k=a*k1+k0;
    if(k>1000000||!Number.isSafeInteger(h))break;
    if(Math.abs(value-sign*h/k)<1e-10)return k===1?String(sign*h):(sign*h)+' / '+k;
    h0=h1;h1=h;k0=k1;k1=k;
    const frac=x-a;if(frac<1e-14)break;x=1/frac;
  }
  return null;
}

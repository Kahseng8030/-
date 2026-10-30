'use strict';
// 展开图是可离线播放的教学示意：平面网格在最终帧按各面的真实相邻关系绘制。
// 平面动画采用“各面从中心分离”的教学表达，不模拟精确的三维铰链旋转。
let solidNetProgress=1,solidNetPlaying=false,solidNetRAF=0,solidNetStart=0,solidNetSelected='cube';
const NET_COLORS=['#8bd9bc','#f6b987','#a6bbff','#f4d782','#f2a7c6','#8dcfe8','#c7e29b','#e3b8ed'];
const netRect=(x,y,w,h,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${fill}" stroke="#174638" stroke-width="2.2"/>`;
const netPoly=(points,fill)=>`<polygon points="${points}" fill="${fill}" stroke="#174638" stroke-width="2.2" stroke-linejoin="round"/>`;
function netPiece(shape,cx,cy,index,label,progress){
  const dx=(300-cx)*(1-progress),dy=(180-cy)*(1-progress);
  const alpha=Math.max(.35,.55+progress*.45);
  return `<g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})" opacity="${alpha}">${shape}<text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="12" font-weight="800" fill="#174638">${label||('面 '+(index+1))}</text></g>`;
}
function solidNetDraw(type,params={},progress=1){
  const p=Math.min(1,Math.max(0,Number(progress)||0)),parts=[];
  const add=(shape,x,y,label='')=>parts.push(netPiece(shape,x,y,parts.length,label,p));
  const r=(x,y,w,h,col,label)=>add(netRect(x,y,w,h,NET_COLORS[col%NET_COLORS.length]),x+w/2,y+h/2,label);
  const tri=(pts,cx,cy,col,label)=>add(netPoly(pts,NET_COLORS[col%NET_COLORS.length]),cx,cy,label);
  let note='';
  if(type==='cube'){
    const a=70,x=230,y=146;
    r(x-a,y,a,a,1,'侧面');r(x,y,a,a,0,'底面');r(x+a,y,a,a,2,'侧面');r(x+a*2,y,a,a,3,'侧面');
    r(x,y-a,a,a,4,'侧面');r(x,y+a,a,a,5,'顶面');
    note='六个全等正方形，沿相接的棱折起来即可组成立方体。';
  }else if(type==='cuboid'){
    // 中间四个侧面构成宽度 w,l,w,l 的条带；上下底面为 l×w。
    const l=106,w=60,h=78,x=206,y=144;
    r(x-w,y,w,h,1,'侧面');r(x,y,l,h,0,'正面');r(x+l,y,w,h,2,'侧面');r(x+l+w,y,l,h,3,'背面');
    r(x,y-w,l,w,4,'顶面');r(x,y+h,l,w,5,'底面');
    note='两块长×宽、两块长×高、两块宽×高的长方形。';
  }else if(type==='pyramid'){
    const a=98,x=251,y=136,t=86;
    r(x,y,a,a,0,'底面');
    tri(`${x},${y} ${x+a},${y} ${x+a/2},${y-t}`,x+a/2,y-t*.34,1,'侧面');
    tri(`${x},${y+a} ${x+a},${y+a} ${x+a/2},${y+a+t}`,x+a/2,y+a+t*.34,2,'侧面');
    tri(`${x},${y} ${x},${y+a} ${x-t},${y+a/2}`,x-t*.4,y+a/2,3,'侧面');
    tri(`${x+a},${y} ${x+a},${y+a} ${x+a+t},${y+a/2}`,x+a+t*.4,y+a/2,4,'侧面');
    note='一个正方形底面，加上四块全等的等腰三角形侧面。';
  }else if(type==='triangularPrism'){
    const w1=77,b=102,w2=77,h=102,x=177,y=135,th=75;
    r(x,y,w1,h,1,'侧面');r(x+w1,y,b,h,0,'侧面');r(x+w1+b,y,w2,h,2,'侧面');
    tri(`${x+w1},${y} ${x+w1+b},${y} ${x+w1+b/2},${y-th}`,x+w1+b/2,y-th*.34,4,'底面');
    tri(`${x+w1},${y+h} ${x+w1+b},${y+h} ${x+w1+b/2},${y+h+th}`,x+w1+b/2,y+h+th*.34,5,'底面');
    note='三个长方形侧面 + 两个全等三角形底面。';
  }else if(type==='cylinder'){
    const r0=Number(params.r)||4.5,h0=Number(params.h)||9;
    const scale=Math.min(20,Math.min(262/(Math.PI*2*r0),124/h0)),R=Math.max(17,r0*scale),H=Math.max(64,h0*scale);
    const ww=2*Math.PI*R,x=300-ww/2,y=180-H/2;
    r(x,y,ww,H,0,'侧面');
    const xmid=300;
    add(`<circle cx="${xmid}" cy="${y-R}" r="${R}" fill="${NET_COLORS[1]}" stroke="#174638" stroke-width="2.2"/>`,xmid,y-R,'底面');
    add(`<circle cx="${xmid}" cy="${y+H+R}" r="${R}" fill="${NET_COLORS[2]}" stroke="#174638" stroke-width="2.2"/>`,xmid,y+H+R,'底面');
    note='侧面展开成长方形：宽=2πr，高=h；再加两个半径 r 的圆。';
  }else if(type==='cone'){
    const rr=Number(params.r)||4.5,hh=Number(params.h)||9,L=Math.hypot(rr,hh),angle=Math.PI*2*rr/L;
    const rad=120,px=238,py=190,start=-Math.PI/2-angle/2,end=-Math.PI/2+angle/2;
    let d=`M ${px} ${py} L ${(px+rad*Math.cos(start)).toFixed(2)} ${(py+rad*Math.sin(start)).toFixed(2)}`;
    for(let i=1;i<=70;i++){const a=start+(end-start)*i/70;d+=` L ${(px+rad*Math.cos(a)).toFixed(2)} ${(py+rad*Math.sin(a)).toFixed(2)}`}
    d+=' Z';add(`<path d="${d}" fill="${NET_COLORS[1]}" stroke="#174638" stroke-width="2.2"/>`,px,py-30,'扇形侧面');
    const circleR=rad*rr/L;add(`<circle cx="460" cy="205" r="${circleR}" fill="${NET_COLORS[0]}" stroke="#174638" stroke-width="2.2"/>`,460,205,'底面');
    note='侧面是半径为母线长 l=√(r²+h²) 的扇形，弧长=2πr；再加底面圆。';
  }else if(type==='sphere'){
    for(let i=0;i<10;i++){
      const x=90+i*43,top=78,bottom=294,ww=36,mid=(top+bottom)/2;
      const d=`M ${x+ww/2} ${top} C ${x+ww*.05} ${top+40} ${x} ${mid-38} ${x} ${mid} C ${x} ${mid+38} ${x+ww*.05} ${bottom-40} ${x+ww/2} ${bottom} C ${x+ww*.95} ${bottom-40} ${x+ww} ${mid+38} ${x+ww} ${mid} C ${x+ww} ${mid-38} ${x+ww*.95} ${top+40} ${x+ww/2} ${top} Z`;
      add(`<path d="${d}" fill="${NET_COLORS[i%NET_COLORS.length]}" stroke="#174638" stroke-width="1.5"/>`,x+ww/2,mid,`${i+1}`);
    }
    note='⚠ 球面不能无拉伸、无破裂地精确展开为平面。这里用经线分瓣作近似示意。';
  }else if(type==='hemisphere'){
    for(let i=0;i<8;i++){
      const x=95+i*51,top=124,bottom=252,ww=38;
      const d=`M ${x+ww/2} ${top} Q ${x-15} ${top+45} ${x} ${bottom} L ${x+ww} ${bottom} Q ${x+ww+15} ${top+45} ${x+ww/2} ${top} Z`;
      add(`<path d="${d}" fill="${NET_COLORS[i%NET_COLORS.length]}" stroke="#174638" stroke-width="1.5"/>`,x+ww/2,186,`${i+1}`);
    }
    add(`<circle cx="300" cy="322" r="32" fill="${NET_COLORS[0]}" stroke="#174638" stroke-width="2"/>`,300,322,'圆底面');
    note='⚠ 半球曲面也不能无变形地精确铺平。底面是完整圆，瓣形只是近似示意。';
  }
  const phase=p>.99?'已展开':p<.01?'折叠状态':'展开中';
  return `<rect width="600" height="360" rx="15" fill="#f7f6e9"/>`+
    `<path d="M 24 336 H 576" stroke="#d4ddcf" stroke-dasharray="4 7"/>`+
    `<text x="24" y="31" font-size="14" font-weight="800" fill="#396d60">${phase} · ${Math.round(p*100)}%</text>`+
    `<g>${parts.join('')}</g>`;
}
function solidNetNote(type){return ({cube:'6 个全等正方形可以沿边折成立方体。',cuboid:'长方体由 6 个长方形面组成。',pyramid:'正四棱锥由正方形底面与四块等腰三角形侧面组成。',cylinder:'侧面长方形宽度等于底面周长 2πr，长度等于高 h。',cone:'扇形半径是圆锥母线长，弧长等于底面周长。',sphere:'球面没有无变形的精确平面展开图；此处展示分瓣近似。',hemisphere:'半球曲面不能无变形展开；底面圆可精确画出。',triangularPrism:'三棱柱由 3 块长方形与 2 块相同的三角形组成。'})[type]||''}
function solidNetSetProgress(value){solidNetProgress=Math.max(0,Math.min(1,Number(value)||0));const d=solidDef(solidsState().selected);const svg=document.getElementById('solidNet');if(svg)svg.innerHTML=solidNetDraw(d.id,solidDefaultParams(d.id),solidNetProgress);const slider=document.getElementById('netSlider');if(slider)slider.value=String(Math.round(solidNetProgress*100));const output=document.getElementById('netPercent');if(output)output.textContent=`${Math.round(solidNetProgress*100)}%`}
function solidNetStop(){solidNetPlaying=false;cancelAnimationFrame(solidNetRAF);solidNetRAF=0;const btn=document.querySelector('[data-net-play]');if(btn)btn.textContent='▶ 播放展开动画'}
function solidNetPlay(){if(solidNetPlaying){solidNetStop();return}if(solidNetProgress>=.995)solidNetSetProgress(0);solidNetPlaying=true;const startProgress=solidNetProgress;solidNetStart=performance.now();const btn=document.querySelector('[data-net-play]');if(btn)btn.textContent='Ⅱ 暂停';function tick(now){if(!solidNetPlaying||route.page!=='solids')return;const x=Math.min(1,(now-solidNetStart)/3200),ease=x*x*(3-2*x);solidNetSetProgress(startProgress+(1-startProgress)*ease);if(x>=1){solidNetStop()}else solidNetRAF=requestAnimationFrame(tick)}solidNetRAF=requestAnimationFrame(tick)}
document.addEventListener('input',e=>{if(e.target.id==='netSlider'){solidNetStop();solidNetSetProgress(Number(e.target.value)/100)}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||route.page!=='solids')return;if(b.hasAttribute('data-net-play'))solidNetPlay();if(b.hasAttribute('data-net-reset')){solidNetStop();solidNetSetProgress(0)}if(b.hasAttribute('data-net-full')){solidNetStop();solidNetSetProgress(1)}});

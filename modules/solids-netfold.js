'use strict';
// 沿真实公共棱铰链旋转的折叠动画：适用于长/正方体、正四棱锥、三棱柱。
// 球、半球不可无变形展开；圆柱、圆锥使用相邻的精确平面网与三维体形交叉呈现。
function foldAdd3(v,a){return [v[0]+a[0],v[1]+a[1],v[2]+a[2]]}
function foldScale(v,s){return v.map(x=>x*s)}
function foldMesh(type,par,unfold){
 const faces=[];const add=p=>faces.push(geoFace(p,GEO_COLORS[faces.length%GEO_COLORS.length]));
 const q=1-unfold,theta=Math.PI/2*q;
 if(type==='cube'||type==='cuboid'||type==='pyramid'){
 const w=type==='cube'?par.a:type==='cuboid'?par.l:par.a,d=type==='cube'?par.a:type==='cuboid'?par.w:par.a,h=type==='cube'?par.a:par.h;
 const base=[[-w/2,-d/2,0],[w/2,-d/2,0],[w/2,d/2,0],[-w/2,d/2,0]];add(base);
 const edges=[];
 for(let i=0;i<4;i++){
   const a=base[i],b=base[(i+1)%4],ev=foldAdd3(b,foldScale(a,-1)),length=Math.hypot(ev[0],ev[1]);const norm=[ev[1]/length,-ev[0]/length,0];edges.push({a,b,ev,norm});
   if(type==='pyramid'){
    const slant=Math.hypot(h,d/2),angle=Math.acos(-(d/2)/slant)*q;
    const mid=foldScale(foldAdd3(a,b),.5),apex=foldAdd3(mid,[norm[0]*slant*Math.cos(angle),norm[1]*slant*Math.cos(angle),slant*Math.sin(angle)]);
    add([a,b,apex]);
   }else{
    const up=[norm[0]*h*Math.cos(theta),norm[1]*h*Math.cos(theta),h*Math.sin(theta)];
    add([a,b,foldAdd3(b,up),foldAdd3(a,up)]);
   }
 }
 if(type!=='pyramid'){
  const {a,b,norm,ev}=edges[0],up=[norm[0]*h*Math.cos(theta),norm[1]*h*Math.cos(theta),h*Math.sin(theta)];
  const across=[norm[0]*d*Math.cos(2*theta),norm[1]*d*Math.cos(2*theta),d*Math.sin(2*theta)];
  const aa=foldAdd3(a,up),bb=foldAdd3(b,up);add([aa,bb,foldAdd3(bb,across),foldAdd3(aa,across)]);
 }
 }else if(type==='triangularPrism'){
  const b=par.b,h=par.h,L=par.L;
  const base=[[-b/2,-h/3,0],[b/2,-h/3,0],[0,2*h/3,0]];add(base);
  const edges=[];
  for(let i=0;i<3;i++){
   const a=base[i],bb=base[(i+1)%3],ev=foldAdd3(bb,foldScale(a,-1)),length=Math.hypot(ev[0],ev[1]);const norm=[ev[1]/length,-ev[0]/length,0],up=[norm[0]*L*Math.cos(theta),norm[1]*L*Math.cos(theta),L*Math.sin(theta)];edges.push({a,b:bb,ev,norm,up});add([a,bb,foldAdd3(bb,up),foldAdd3(a,up)]);
  }
  const {a,b:bb,ev,norm,up}=edges[0],u=foldAdd3(a,up),v=foldAdd3(bb,up),third=base[2];
  const proj=((third[0]-a[0])*ev[0]+(third[1]-a[1])*ev[1])/(ev[0]**2+ev[1]**2);
  const w=-((third[0]-a[0])*norm[0]+(third[1]-a[1])*norm[1]);
  const newThird=foldAdd3(u,foldAdd3(foldScale(ev,proj),[norm[0]*w*Math.cos(2*theta),norm[1]*w*Math.cos(2*theta),w*Math.sin(2*theta)]));add([u,v,newThird]);
 }
 return faces;
}
function foldSvg(type,params,p){
 const isPoly=['cube','cuboid','pyramid','triangularPrism'].includes(type);
 const bg='<rect width="600" height="360" rx="15" fill="#f8f4e8"/>';
 if(!isPoly){
   const t=p,opacitySolid=Math.max(.04,1-t),opacityNet=Math.max(.05,t);
   const three=geoMesh(type,params);const mesh=`<g opacity="${opacitySolid}">${geoRenderFaces(three,160,186,19,.68,.42)}</g>`;
   const net=`<g opacity="${opacityNet}" transform="translate(0,0)">${solidNetDrawLegacy(type,params,1).replace(/^.*?<g>/s,'<g>').replace(/<\/g>\s*$/s,'</g>')}</g>`;
   // 右侧准确的网展开，左侧保持真实三维体轮廓，逐步渐显而不是伪装物理铰链。
   return bg+`<text x="18" y="29" fill="#346c60" font-size="15" font-weight="800">${p<.5?'立体形态':'展开图'} · ${Math.round(p*100)}%</text>`+mesh+`<g transform="translate(65 0) scale(.75)" opacity="${opacityNet}">${solidNetLegacyPure(type,params)}</g>`;
 }
 const faces=foldMesh(type,params,p);const max=Math.max(...Object.values(params).filter(x=>typeof x==='number'),1);const scale=Math.min(28,180/max)*(1-p)+Math.min(10,100/max)*p;const yaw=.65*(1-p),elev=.5+(Math.PI/2-.5)*p;
 return bg+`<text x="20" y="31" font-size="15" fill="#346c60" font-weight="800">${p<=.01?'已折成立体':p>=.99?'平面展开完成':'沿棱折叠 / 展开中'} · ${Math.round(p*100)}%</text>`+`<g class="net-polyfold">${geoRenderFaces(faces,300,195,scale,yaw,elev,p<.92)}</g>`;
}
const solidNetDrawLegacy=solidNetDraw;
function solidNetLegacyPure(type,p){const content=solidNetDrawLegacy(type,p,1);return content.replace(/^<rect[^>]+\/>/,'').replace(/^<path[^>]+\/>/,'').replace(/^<text[^>]+<\/text>/,'');}
solidNetDraw = foldSvg;

'use strict';
// 轻量离线立体投影：每条隐藏棱用虚线，旋转后会重新计算可见面。
function geoNorm(a,b,c){const u=b.map((v,i)=>v-a[i]),w=c.map((v,i)=>v-a[i]);const n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];const k=Math.hypot(...n)||1;return n.map(x=>x/k)}
function geoCamera(v,yaw=.6,elev=.5){const [x,y,z]=v;const c=Math.cos(yaw),s=Math.sin(yaw),e=Math.sin(elev),f=Math.cos(elev);return {x:x*c-y*s,y:-(x*s+y*c)*e-z*f,depth:(x*s+y*c)*f+z*e}}
function geoFace(points,color){return {points,color}}
const GEO_COLORS=['#a5e5cd','#f6c68b','#abcaff','#f6b1ce','#c9b6f1','#f5e5a1','#8bd7e5','#bfe8a8'];
function geoMesh(type,p){const faces=[];const add=(pts)=>faces.push(geoFace(pts,GEO_COLORS[faces.length%GEO_COLORS.length]));
 if(type==='cube'||type==='cuboid'){
 const a=type==='cube'?p.a:p.l,b=type==='cube'?p.a:p.w,h=type==='cube'?p.a:p.h;
 const v=(x,y,z)=>[x*a/2,y*b/2,z*h/2];
 const P=[v(-1,-1,-1),v(1,-1,-1),v(1,1,-1),v(-1,1,-1),v(-1,-1,1),v(1,-1,1),v(1,1,1),v(-1,1,1)];
 [[3,2,1,0],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].forEach(face=>add(face.map(i=>P[i])));
 }else if(type==='pyramid'){
 const a=p.a,h=p.h,P=[[-a/2,-a/2,0],[a/2,-a/2,0],[a/2,a/2,0],[-a/2,a/2,0]],T=[0,0,h];add([...P].reverse());for(let i=0;i<4;i++)add([P[i],P[(i+1)%4],T]);
 }else if(type==='triangularPrism'){
 const b=p.b,h=p.h,L=p.L,T=[[-b/2,-h/3,-L/2],[b/2,-h/3,-L/2],[0,2*h/3,-L/2]],U=T.map(v=>[v[0],v[1],L/2]);add([...T].reverse());add(U);for(let i=0;i<3;i++)add([T[i],T[(i+1)%3],U[(i+1)%3],U[i]]);
 }else if(type==='cylinder'||type==='cone'){
 const n=28,r=p.r,h=p.h;const ring=(i,z)=>[r*Math.cos(2*Math.PI*i/n),r*Math.sin(2*Math.PI*i/n),z];
 if(type==='cylinder') {for(let i=0;i<n;i++)add([ring(i,-h/2),ring((i+1)%n,-h/2),ring((i+1)%n,h/2),ring(i,h/2)]);add(Array.from({length:n},(_,i)=>ring(n-i-1,-h/2)));add(Array.from({length:n},(_,i)=>ring(i,h/2)))}
 else{for(let i=0;i<n;i++)add([ring(i,0),ring((i+1)%n,0),[0,0,h]]);add(Array.from({length:n},(_,i)=>ring(n-i-1,0)))}
 }else if(type==='sphere'||type==='hemisphere'){
 const n=28,m=12,r=p.r;const angle=type==='sphere'?Math.PI:Math.PI/2;
 const spherical=(i,j)=>{const theta=2*Math.PI*i/n,phi=angle*j/m;return [r*Math.sin(phi)*Math.cos(theta),r*Math.sin(phi)*Math.sin(theta),r*Math.cos(phi)]};
 for(let j=0;j<m;j++)for(let i=0;i<n;i++)add([spherical(i,j),spherical(i+1,j),spherical(i+1,j+1),spherical(i,j+1)]);
 if(type==='hemisphere')add(Array.from({length:n},(_,i)=>[r*Math.cos(2*Math.PI*(n-i-1)/n),r*Math.sin(2*Math.PI*(n-i-1)/n),0]));
 }
 return faces;
}
function geoRenderFaces(faces,cx,cy,sc,yaw,pitch,hideBack=true){
 const view=[Math.sin(yaw)*Math.cos(pitch),Math.cos(yaw)*Math.cos(pitch),Math.sin(pitch)];
 const mapped=faces.map((f,i)=>{const proj=f.points.map(v=>geoCamera(v,yaw,pitch));const normal=geoNorm(...f.points.slice(0,3));const dot=normal.reduce((s,v,j)=>s+v*view[j],0);return {...f,index:i,proj,dot,depth:proj.reduce((sum,p)=>sum+p.depth,0)/proj.length}}).sort((a,b)=>a.depth-b.depth);
 const drawn=mapped.map(f=>{
  const pts=f.proj.map(q=>(cx+q.x*sc).toFixed(2)+','+(cy+q.y*sc).toFixed(2)).join(' ');
  const back=hideBack&&f.dot<-.025;
  return `<polygon points="${pts}" fill="${f.color}" fill-opacity="${back?.055:.82}" stroke="${back?'#b3c8c4':'#f1f9e9'}" stroke-width="${back?1.35:1.8}" ${back?'stroke-dasharray="5 5"':''} stroke-linejoin="round"/>`;
 }).join('');
 // 小型多面体额外强调背面虚线轮廓，以供课堂观察；曲面细网格避免杂乱。
 const dashed=hideBack&&faces.length<=8?mapped.filter(f=>f.dot<-.025).map(f=>{
  const pts=f.proj.map(q=>(cx+q.x*sc).toFixed(2)+','+(cy+q.y*sc).toFixed(2)).join(' ');
  return `<polygon points="${pts}" fill="none" stroke="#dcefe0" stroke-opacity=".66" stroke-width="1.25" stroke-dasharray="5 6"/>`;
 }).join(''):'';
 return drawn+dashed;
}
function geoSolidSvg(type,p,cx,cy,scale=1,item={}){
 const yaw=(Number(item.yaw??38))*Math.PI/180,pitch=(Number(item.pitch??28))*Math.PI/180;
 const dims=Object.values(p).filter(v=>Number.isFinite(Number(v))).map(Number),max=Math.max(6,...dims);
 const ratio=(Math.max(.5,Math.min(2.3,scale))*67)/max;
 const faces=geoMesh(type,p);if(!faces.length)return '';
 return `<g>${geoRenderFaces(faces,cx,cy,ratio,yaw,pitch)}</g>`;
}
// 替换旧的固定视角 SVG：允许对每个立体自定义旋转角。
solidSvg = geoSolidSvg;

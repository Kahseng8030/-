'use strict';
// 新增模块示例：复制此文件并改名，例如 modules/probability.js
// ① 修改 id、label、icon、render 函数
// ② 在 index.html 中 bootstrap.js 前，添加：
//    <script src="modules/probability.js"></script>
// ③ 保存文件，刷新主页，新功能自动显示在导航中。
//    页面内部支持 data-nav="home" 这样的按钮跳转。

function exampleNewModulePage(){
  return `<div class="page-title"><div><span class="eyebrow">NEW ZONE</span>
    <h2>我的新功能</h2><p class="desc">在这里添加新模块的功能。</p></div></div>
    <div class="manage-card"><h3>模块已成功加载 🌿</h3>
    <button class="btn" data-nav="home">返回雨林入口</button></div>`;
}
registerModule({id:'example', label:'我的新功能', icon:'🧩', render:exampleNewModulePage});

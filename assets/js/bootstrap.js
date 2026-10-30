'use strict';
// 所有模块都已注册后，再加载旧数据并渲染。
initialize();
if(!Array.isArray(state.graph)){state.graph=DEFAULT_GRAPH.map(g=>({...g}));persist()}
if(!state.graphDomain)state.graphDomain={...DEFAULT_GRAPH_DOMAIN};
if(!state.solids)state.solids={selected:'cube',scene:[],active:null};
route={...route,...routeFromHash()};
$('#globalSearch').value=route.search||'';
render();

if(!Array.isArray(state.graphMarks))state.graphMarks=[];
if(!Array.isArray(state.customFormulas))state.customFormulas=[];

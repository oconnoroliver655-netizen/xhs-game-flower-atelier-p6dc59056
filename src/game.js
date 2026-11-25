(()=>{"use strict";
const g=window.GAME;if(!g||!g.scenes){document.body.textContent="游戏资源未加载";return;}
document.body.style.setProperty("--bg",g.colors[0]);
document.body.style.setProperty("--accent",g.colors[1]);
const $=id=>document.getElementById(id);
const key="xhs-h5-v1:"+g.slug;
let state={scene:"start",score:0,turns:0};
try{
  const old=JSON.parse(localStorage.getItem(key));
  if(old&&g.scenes[old.scene]&&Number.isInteger(old.score)&&Number.isInteger(old.turns))state=old;
}catch(_){}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch(_){}}
const fields={main:"main-flower",leaf:"leaf-flower",wrap:"wrap-flower"};
function customQuote(){
 const picks=Object.fromEntries(Object.entries(fields).map(([k,id])=>[k,$(id).value]));
 const items=Object.keys(fields).map(k=>g.order.materials[k][picks[k]]);
 if(items.some(x=>!x))return null;
 return {cost:items.reduce((n,x)=>n+x.cost,0),fit:picks.main==="freesia",name:items.map(x=>x.name).join("、"),picks};
}
function quote(){
 const b=customQuote();
 if(b){const preview=$("bouquet-preview");for(const [k,v] of Object.entries(b.picks))preview["data-"+k]=v; if(preview.setAttribute){for(const [k,v] of Object.entries(b.picks))preview.setAttribute("data-"+k,v);preview.setAttribute("aria-label",b.name+" 花束预览");}}
 $("quote").textContent=b?("合计 "+b.cost+" 元 · "+(b.cost<=g.order.budget?"余款 "+(g.order.budget-b.cost)+" 元":"超出预算 "+(b.cost-g.order.budget)+" 元")):"请选择花材";
 $("commit-bouquet").disabled=!b||b.cost>g.order.budget;
}
for(const [k,id] of Object.entries(fields)){
 const sel=$(id);
 for(const [v,m] of Object.entries(g.order.materials[k])){
 const opt=document.createElement("option");opt.value=v;opt.textContent=m.name+" · "+m.cost+" 元";sel.appendChild(opt);
 }
 const saved=state.draft?.[k];sel.value=Object.prototype.hasOwnProperty.call(g.order.materials[k],saved)?saved:Object.keys(g.order.materials[k])[0];
 sel.addEventListener("change",()=>{if(state.scene==="bouquet"){state.draft=customQuote()?.picks||null;save();}quote();});
}
$("commit-bouquet").addEventListener("click",()=>{
 if(state.scene!=="bouquet")return;
 const b=customQuote();if(!b||b.cost>g.order.budget)return;
 state.custom=b;delete state.draft;state.turns++;state.scene=b.fit?(state.score>=3?"ending_good":"ending_soft"):(state.score>=3?"ending_retry":"ending_window");save();render();
});
function render(){
  const scene=g.scenes[state.scene];
  $("mark").textContent=g.title;
  $("genre").textContent=g.genre;
  $("orb").textContent=g.symbol;
  $("chapter").textContent=scene.chapter;
  $("heading").textContent=scene.title;
  $("speaker").textContent=scene.speaker||"花房日记";
  const portrait=$("portrait"), person=scene.speaker?.startsWith("林晚")?"lin":scene.speaker?.startsWith("周岚")?"zhou":null;
  portrait.hidden=!person;
  if(person){portrait.src="src/portrait-"+person+".svg";portrait.alt=person==="lin"?"林晚":"周岚";}
  else{portrait.alt="";if(portrait.removeAttribute)portrait.removeAttribute("src");}

  $("story").textContent=scene.text;
  $("progress").textContent=g.stat+" "+Math.max(state.score,0)+" · 第 "+state.turns+" 次选择";
  $("builder").hidden=state.scene!=="bouquet";if(state.scene==="bouquet"){for(const [k,id] of Object.entries(fields)){const saved=state.draft?.[k];$(id).value=Object.prototype.hasOwnProperty.call(g.order.materials[k],saved)?saved:Object.keys(g.order.materials[k])[0];}quote();}
  const b=state.custom||g.order.bouquets[state.bouquet]; if(b) $("progress").textContent+=(b.name?" · "+b.name:"")+" · 支出 "+b.cost+" 元 · 余款 "+(g.order.budget-b.cost)+" 元"; const choices=$("choices");choices.replaceChildren();
  const list=scene.choices||[{label:"重新体验故事",next:"start",score:0,reset:true}];
  for(const choice of list){
    const button=document.createElement("button");
    button.className="choice";button.type="button";button.textContent=choice.label;
    button.addEventListener("click",()=>{
      if(choice.reset){state={scene:"start",score:0,turns:0};}
      else {
        state.score+=choice.score;state.turns++;
        if(choice.bouquet){state.bouquet=choice.bouquet;delete state.draft;} const fit=g.order.bouquets[state.bouquet]?.fit===true; state.scene=choice.next==="@ending"?(fit?(state.score>=3?"ending_good":"ending_soft"):(state.score>=3?"ending_retry":"ending_window")):choice.next;
      }
      save();render();
    },{once:true});
    choices.appendChild(button);
  }
}
$("reset").addEventListener("click",()=>{
  if(!confirm("重新开始本次旅程？"))return;
  state={scene:"start",score:0,turns:0};save();render();
});
render();
})();

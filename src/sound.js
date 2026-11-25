(()=>{"use strict";
const button=document.getElementById("sound"),key="xhs-h5-v1:xhs-game-flower-atelier:sound";
let enabled=false;
try{enabled=localStorage.getItem(key)==="on";}catch(_){}
const audio=new Audio("src/chime.wav");audio.preload="none";audio.volume=.45;
function draw(){button.textContent=enabled?"音效：开":"音效：关";button.setAttribute("aria-pressed",String(enabled));}
function play(){if(!enabled)return;try{audio.currentTime=0;audio.play().catch(()=>{});}catch(_){}}
button.addEventListener("click",()=>{enabled=!enabled;try{localStorage.setItem(key,enabled?"on":"off");}catch(_){}draw();if(enabled)play();else audio.pause();});
document.getElementById("choices").addEventListener("click",e=>{if(e.target.closest("button.choice"))play();});
draw();
})();
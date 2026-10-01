
const $=s=>document.querySelector(s),E=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function hl(s,l){s=E(s);if(l==='html')return s.replace(/(&lt;\/?)([\w-]+)/g,'$1<span class="t">$2</span>').replace(/([\w-]+)=("[^"]*")/g,'<span class="p">$1</span>=<span class="v">$2</span>');
return s.replace(/(\/\*[\s\S]*?\*\/)/g,'<span class="c">$1</span>').replace(/^([^{}\n:;]+)(?=\s*\{)/gm,'<span class="k">$1</span>').replace(/([\w-]+)(\s*:)/g,'<span class="p">$1</span>$2').replace(/:\s*([^;{}\n]+);/g,(m,v)=>': <span class="v">'+v+'</span>;')}
const code=(s,l='css')=>`<pre class="code">${hl(s,l)}</pre>`;
const ST=f=>{try{return f()}catch(e){}};
/* ---------- data ---------- */
let S={lessons:[],questions:[],scores:[]},admin=false;
let token=ST(()=>localStorage.getItem('cssHubToken'))||'';
async function api(p,m='GET',b){const r=await fetch('/api'+p,{method:m,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:b?JSON.stringify(b):undefined});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||r.statusText);return j}
/* ---------- nav ---------- */
const PAGES=[['home','Home'],['about','About CSS'],['basics','CSS Basics'],['selectors','Selectors'],['properties','Properties'],['layout','Layout'],['responsive','Responsive Design'],['examples','Examples'],['playground','Playground'],['quiz','Quiz'],['admin','Admin']];
$('#nav').innerHTML=PAGES.map(p=>`<button data-go="${p[0]}">${p[1]}</button>`).join('');
function go(id){document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id===id));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===id));$('#nav').classList.remove('open');scrollTo({top:0,behavior:'smooth'});if(id==='examples')ST(renderEx);if(id==='responsive')ST(rf)}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go)});
$('#burger').onclick=()=>$('#nav').classList.toggle('open');
$('#mode').onclick=()=>{const r=document.documentElement,d=getComputedStyle(r).getPropertyValue('--bg').trim()==='#0b1220';r.dataset.theme=d?'light':'dark'};
/* ---------- home / about ---------- */
$('#heroCode').innerHTML=hl('.hero {\n  color: #4f8cff;\n  display: grid;\n  border-radius: 16px;\n  animation: fade 1s;\n}','css');
$('#homeCards').innerHTML=PAGES.slice(1,10).map(p=>`<div class="card" style="cursor:pointer" data-go="${p[0]}"><h3>${p[1]}</h3><span class="tag">Open →</span></div>`).join('');
$('#abH').innerHTML=hl('<h1>Hello World</h1>','html');$('#abC').innerHTML=hl('h1 {\n  color: blue;\n  font-size: 32px;\n}');
$('#abP').innerHTML='<h1 style="color:blue;font-size:32px;margin:0">Hello World</h1>';
/* ---------- lessons ---------- */
function renderLessons(){$('#lessons').innerHTML=S.lessons.map(l=>`<div class="card"><span class="tag">${E(l.cat||'lesson')}</span><h3>${E(l.title)}</h3><p>${E(l.body)}</p>${code(l.code,/^\s*</.test(l.code)?'html':'css')}</div>`).join('')||'<p>No lessons yet.</p>'}
/* ---------- selectors ---------- */
const SEL=[['Element','Targets all elements of a type.','p {\n  color: navy;\n}'],['Class','Targets elements with class="x". Reusable.','.card {\n  padding: 16px;\n}'],['ID','Targets one unique element.','#header {\n  background: #2563eb;\n}'],['Universal','Targets everything.','* {\n  margin: 0;\n  box-sizing: border-box;\n}'],['Group','Same style for several selectors.','h1, h2, h3 {\n  font-family: Georgia;\n}'],['Attribute','Targets by attribute value.','input[type="text"] {\n  border: 1px solid gray;\n}'],['Pseudo-class','Targets a state.','a:hover {\n  color: red;\n}'],['Pseudo-element','Styles part of an element.','p::first-letter {\n  font-size: 2em;\n}']];
$('#selGrid').innerHTML=SEL.map(s=>`<div class="card"><h3>${s[0]} selector</h3><p>${s[1]}</p>${code(s[2])}</div>`).join('');
/* ---------- properties ---------- */
const PR=[['color','Text color.','#2563eb'],['background-color','Background fill.','#fde68a'],['font-size','Size of text.','28px'],['font-family','Typeface.','Georgia, serif'],['text-align','Horizontal text alignment.','center'],['width','Element width.','60%'],['height','Element height.','100px'],['margin','Outer space.','20px'],['padding','Inner space.','24px'],['border','Line around element.','3px dashed #2563eb'],['border-radius','Rounded corners.','24px'],['display','Layout behaviour.','inline-block'],['position','Positioning mode.','relative; top:10px;left:20px'],['opacity','Transparency 0 to 1.','0.4']];
$('#propGrid').innerHTML=PR.map((p,i)=>`<div class="card"><h3><code>${p[0]}</code></h3><p>${p[1]}</p><input data-pi="${i}" value="${E(p[2])}" style="width:100%"><div class="prev" style="margin-top:8px"><div id="pv${i}">Preview</div></div>${code(p[0]+': '+p[2]+';')}</div>`).join('');
const pvSet=i=>{const v=$('[data-pi="'+i+'"]').value;$('#pv'+i).style.cssText='background:#dbeafe;color:#12203a;'+PR[i][0]+':'+v};
PR.forEach((_,i)=>pvSet(i));document.addEventListener('input',e=>{if(e.target.dataset.pi!==undefined){pvSet(e.target.dataset.pi);e.target.parentNode.querySelector('pre').innerHTML=hl(PR[e.target.dataset.pi][0]+': '+e.target.value+';')}});
/* ---------- layout ---------- */
const sel=(id,o)=>`<select id="${id}">${o.map(x=>`<option>${x}</option>`).join('')}</select>`;
$('#layGrid').innerHTML=`
<div class="card"><h3>Box Model</h3><p>Content → padding → border → margin.</p><label>padding <input id="bmP" type="range" max="50" value="20"></label><label>border <input id="bmB" type="range" max="20" value="4"></label><label>margin <input id="bmM" type="range" max="50" value="20"></label><div class="prev" style="background:#fed7aa"><div id="bm" style="background:#93c5fd;color:#12203a;border:4px solid #1e40af">Content</div></div><div id="bmC"></div></div>
<div class="card"><h3>Flexbox</h3><p>One-dimensional rows or columns.</p><label>justify-content ${sel('fj',['flex-start','center','flex-end','space-between','space-around'])}</label><label>align-items ${sel('fa',['flex-start','center','flex-end','stretch'])}</label><label>direction ${sel('fd',['row','column'])}</label><div class="fl" id="fx"><i>1</i><i>2</i><i>3</i></div><div id="fxC"></div></div>
<div class="card"><h3>CSS Grid</h3><p>Two-dimensional layouts.</p><label>columns <input id="gc" type="range" min="1" max="5" value="3"></label><label>gap <input id="gg" type="range" max="30" value="6"></label><div class="gr" id="gx"><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i></div><div id="gxC"></div></div>
<div class="card"><h3>Positioning</h3><p>static, relative, absolute, fixed, sticky.</p><label>position ${sel('ps',['static','relative','absolute'])}</label><label>top/left <input id="pt" type="range" max="80" value="20"></label><div class="prev" style="position:relative;height:130px"><div id="px" style="background:#2563eb;color:#fff;padding:6px;width:80px;text-align:center">Box</div></div><div id="pxC"></div></div>
<div class="card"><h3>Width and Height</h3><label>width <input id="ww" type="range" min="20" max="100" value="60"></label><label>height <input id="wh" type="range" min="30" max="150" value="60"></label><div class="prev"><div id="wx" style="background:#2563eb"></div></div><div id="wxC"></div></div>
<div class="card"><h3>Alignment</h3><label>text-align ${sel('al',['left','center','right','justify'])}</label><div class="prev"><p id="ax" style="margin:0">Alignment controls where text or items sit inside their container.</p></div><div id="axC"></div></div>`;
function lay(){const v=id=>$('#'+id).value,set=(id,css,txt)=>{$('#'+id).style.cssText+=';'+css;$('#'+id+'C').innerHTML=code(txt)};
$('#bm').style.cssText=`background:#93c5fd;color:#12203a;padding:${v('bmP')}px;border:${v('bmB')}px solid #1e40af;margin:${v('bmM')}px`;$('#bmC').innerHTML=code(`.box {\n  padding: ${v('bmP')}px;\n  border: ${v('bmB')}px solid;\n  margin: ${v('bmM')}px;\n}`);
$('#fx').style.cssText=`display:flex;justify-content:${v('fj')};align-items:${v('fa')};flex-direction:${v('fd')}`;$('#fxC').innerHTML=code(`.box {\n  display: flex;\n  justify-content: ${v('fj')};\n  align-items: ${v('fa')};\n  flex-direction: ${v('fd')};\n}`);
$('#gx').style.cssText=`grid-template-columns:repeat(${v('gc')},1fr);gap:${v('gg')}px`;$('#gxC').innerHTML=code(`.grid {\n  display: grid;\n  grid-template-columns: repeat(${v('gc')}, 1fr);\n  gap: ${v('gg')}px;\n}`);
$('#px').style.cssText=`background:#2563eb;color:#fff;padding:6px;width:80px;text-align:center;position:${v('ps')};top:${v('pt')}px;left:${v('pt')}px`;$('#pxC').innerHTML=code(`.box {\n  position: ${v('ps')};\n  top: ${v('pt')}px;\n  left: ${v('pt')}px;\n}`);
$('#wx').style.cssText=`background:#2563eb;width:${v('ww')}%;height:${v('wh')}px`;$('#wxC').innerHTML=code(`.box {\n  width: ${v('ww')}%;\n  height: ${v('wh')}px;\n}`);
$('#ax').style.textAlign=v('al');$('#axC').innerHTML=code(`p {\n  text-align: ${v('al')};\n}`)}
$('#layGrid').addEventListener('input',lay);lay();
/* ---------- responsive ---------- */
const RC='.container {\n  width: 80%;\n}\n@media (max-width: 768px) {\n  .container {\n    width: 100%;\n  }\n}';$('#respCode').innerHTML=hl(RC);
function rf(){const w=$('#rr').value;$('#rw').textContent=w;$('#rf').style.width=w+'px';$('#rf').srcdoc='<style>body{font-family:sans-serif;margin:8px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.g div{background:#2563eb;color:#fff;padding:20px;border-radius:8px;text-align:center}@media(max-width:600px){.g{grid-template-columns:1fr}}</style><h3>Resize me</h3><div class="g"><div>1</div><div>2</div><div>3</div></div>'}
$('#rr').oninput=rf;
/* ---------- examples ---------- */
const EX=[['Styled button','<button class="btn">Click me</button>','.btn{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;border:0;padding:12px 28px;border-radius:999px;font-size:16px;cursor:pointer;transition:.2s}\n.btn:hover{transform:translateY(-3px);box-shadow:0 8px 20px #2563eb66}'],
['Navigation bar','<nav><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></nav>','nav{display:flex;gap:16px;background:#0f172a;padding:14px;border-radius:10px}\nnav a{color:#fff;text-decoration:none}\nnav a:hover{color:#60a5fa}'],
['Profile card','<div class="card"><div class="av">A</div><h3>Alex Cruz</h3><p>Web Developer</p></div>','.card{width:200px;margin:auto;text-align:center;padding:20px;border-radius:16px;box-shadow:0 4px 16px #0003;font-family:sans-serif}\n.av{width:64px;height:64px;border-radius:50%;background:#2563eb;color:#fff;font-size:28px;line-height:64px;margin:auto}'],
['Login form','<form><h3>Login</h3><input placeholder="Email"><input type="password" placeholder="Password"><button>Sign in</button></form>','form{max-width:240px;margin:auto;display:grid;gap:10px;font-family:sans-serif}\ninput{padding:10px;border:1px solid #ccc;border-radius:8px}\nbutton{padding:10px;background:#2563eb;color:#fff;border:0;border-radius:8px}'],
['Responsive webpage','<div class="wrap"><div class="box">A</div><div class="box">B</div><div class="box">C</div></div>','.wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}\n.box{background:#2563eb;color:#fff;padding:24px;text-align:center;border-radius:10px}\n@media(max-width:400px){.wrap{grid-template-columns:1fr}}'],
['Simple landing page','<header><h1>Acme</h1><p>Build faster.</p><a href="#">Get started</a></header>','header{text-align:center;padding:36px 16px;color:#fff;background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:14px;font-family:sans-serif}\nh1{margin:0}\na{display:inline-block;margin-top:8px;background:#fff;color:#1e3a8a;padding:8px 18px;border-radius:999px;text-decoration:none}']];
let exDone=0;function renderEx(){if(exDone)return;exDone=1;$('#exList').innerHTML=EX.map((e,i)=>`<div class="card" style="margin-bottom:14px"><h3>${i+1}. ${e[0]}</h3><div class="two"><div>${code(e[1],'html')}${code(e[2].replace(/\}(?!\n)/g,'}\n'))}</div><iframe id="ex${i}" style="height:180px"></iframe></div></div>`).join('');EX.forEach((e,i)=>$('#ex'+i).srcdoc=e[1]+'<style>body{margin:12px}'+e[2]+'</style>')}
/* ---------- playground ---------- */
const PH='<h1>Hello!</h1>\n<p class="note">Edit me.</p>',PC='h1 {\n  color: #2563eb;\n}\n.note {\n  background: #fef3c7;\n  padding: 12px;\n  border-radius: 8px;\n}';
function run(){$('#pF').srcdoc=$('#pH').value+'<style>body{font-family:sans-serif}'+$('#pC').value+'</style>'}
$('#run').onclick=run;$('#reset').onclick=()=>{$('#pH').value=PH;$('#pC').value=PC;run()};$('#pH').oninput=$('#pC').oninput=run;$('#pH').value=PH;$('#pC').value=PC;run();
/* ---------- quiz ---------- */
let qi=0,sc=0,ans=false,qs=[];
function quiz(){qs=S.questions;qi=0;sc=0;showQ()}
function showQ(){const b=$('#qbox');if(!qs.length){b.innerHTML='No questions yet.';return}
if(qi>=qs.length){b.innerHTML=`<h3>Final score: ${sc} / ${qs.length}</h3><div class="bar"><i style="width:${sc/qs.length*100}%"></i></div><p>${sc>=qs.length*.7?'Great job! 🎉':'Keep practicing!'}</p><div class="row"><input id="qn" placeholder="Your name" maxlength="30"><button class="btn" id="qs">Save score</button><button class="btn s" id="qr">Restart Quiz</button></div><div class="err" id="qe"></div>`;$('#qr').onclick=quiz;$('#qs').onclick=saveScore;return}
const q=qs[qi];ans=false;b.innerHTML=`<div class="row"><span>Question ${qi+1} / ${qs.length}</span><span style="margin-left:auto">Score: ${sc}</span></div><div class="bar"><i style="width:${qi/qs.length*100}%"></i></div><h3>${E(q.q)}</h3>${q.opts.map((o,i)=>`<button class="opt" data-o="${i}">${E(o)}</button>`).join('')}<div id="fb"></div><button class="btn" id="nx" style="display:none">${qi+1===qs.length?'Finish':'Next'}</button>`;
b.querySelectorAll('.opt').forEach(x=>x.onclick=()=>{if(ans)return;ans=true;const c=+x.dataset.o===q.a;if(c)sc++;x.classList.add(c?'ok':'no');b.querySelectorAll('.opt')[q.a].classList.add('ok');$('#fb').innerHTML=c?'<p style="color:var(--ok)">✔ Correct!</p>':'<p style="color:var(--bad)">✘ Incorrect.</p>';$('#nx').style.display='';$('#nx').onclick=()=>{qi++;showQ()}})}
async function saveScore(){const n=$('#qn').value.trim();if(n.length<2){$('#qe').textContent='Please enter your name (2+ characters).';return}
try{const r=await api('/scores','POST',{name:n,score:sc,total:qs.length});if(admin)S.scores.unshift(r);$('#qe').textContent='Score saved ✔';$('#qs').disabled=true;renderAdmin()}catch(e){$('#qe').textContent='Error: '+e.message}}
/* ---------- admin ---------- */
let eL=null,eQ=null;
const sel2=(id,o)=>sel(id,o);
function logout(){token='';admin=false;ST(()=>localStorage.removeItem('cssHubToken'));S.scores=[];renderAdmin()}
function renderAdmin(){admin=!!token;
if(!admin){$('#adminNote').textContent='Admin login required to manage lessons, questions and scores.';$('#adminBody').innerHTML='<div class="card" style="max-width:360px"><h3>Admin login</h3><input id="pw" type="password" placeholder="Password" style="width:100%"><div class="err" id="pe"></div><button class="btn" id="login">Log in</button></div>';return}
$('#adminNote').innerHTML='Signed in as admin. <button class="btn s sm" id="logout">Log out</button>';
const l=eL&&S.lessons.find(x=>x.id===eL)||{},q=eQ&&S.questions.find(x=>x.id===eQ)||{opts:[]};
$('#adminBody').innerHTML=`<div class="two"><div class="card"><h3>${eL?'Edit':'Add'} lesson</h3><input id="lt" placeholder="Title" value="${E(l.title||'')}" style="width:100%"><textarea id="lb" style="height:70px;background:var(--bg);color:var(--tx)" placeholder="Explanation">${E(l.body||'')}</textarea><textarea id="lc" style="height:80px" placeholder="Code example">${E(l.code||'')}</textarea><div class="err" id="le"></div><button class="btn sm" id="ls">${eL?'Update':'Add'}</button> ${eL?'<button class="btn s sm" id="lx">Cancel</button>':''}
<table>${S.lessons.map(x=>`<tr><td>${E(x.title)}</td><td><button class="btn s sm" data-el="${x.id}">Edit</button> <button class="btn d sm" data-dl="${x.id}">Del</button></td></tr>`).join('')}</table></div>
<div class="card"><h3>${eQ?'Edit':'Add'} question</h3><input id="qq" placeholder="Question" value="${E(q.q||'')}" style="width:100%">${[0,1,2,3].map(i=>`<input class="qo" placeholder="Choice ${i+1}" value="${E(q.opts[i]||'')}" style="width:100%;margin-top:4px">`).join('')}<label>Correct choice ${sel('qa',[1,2,3,4])}</label><div class="err" id="qer"></div><button class="btn sm" id="qsv">${eQ?'Update':'Add'}</button> ${eQ?'<button class="btn s sm" id="qx">Cancel</button>':''}
<table>${S.questions.map(x=>`<tr><td>${E(x.q)}</td><td><button class="btn s sm" data-eq="${x.id}">Edit</button> <button class="btn d sm" data-dq="${x.id}">Del</button></td></tr>`).join('')}</table></div></div>
<div class="card" style="margin-top:14px"><h3>Quiz scores</h3>${S.scores.length?`<table><tr><th>Student</th><th>Score</th><th>Date</th></tr>${S.scores.map(s=>`<tr><td>${E(s.name)}</td><td>${s.score}/${s.total}</td><td>${E(s.at)}</td></tr>`).join('')}</table>`:'No scores yet.'}</div>`;
if(q.a!==undefined)$('#qa').selectedIndex=q.a}
const up=(arr,o)=>{const i=arr.findIndex(x=>x.id===o.id);i<0?arr.push(o):arr[i]=o};
document.addEventListener('click',async e=>{const d=e.target.dataset,id=e.target.id;if(!d)return;
try{
if(id==='login'){try{const r=await api('/login','POST',{password:$('#pw').value});token=r.token;ST(()=>localStorage.setItem('cssHubToken',token));S.scores=await api('/scores');renderAdmin()}catch(x){$('#pe').textContent=x.message}return}
if(id==='logout'){logout();return}
if(d.el){eL=d.el;renderAdmin()}if(d.eq){eQ=d.eq;renderAdmin()}
if(d.dl&&confirm('Delete this lesson?')){await api('/lessons/'+d.dl,'DELETE');S.lessons=S.lessons.filter(x=>x.id!==d.dl);renderLessons();renderAdmin()}
if(d.dq&&confirm('Delete this question?')){await api('/questions/'+d.dq,'DELETE');S.questions=S.questions.filter(x=>x.id!==d.dq);quiz();renderAdmin()}
if(id==='lx'){eL=null;renderAdmin()}if(id==='qx'){eQ=null;renderAdmin()}
if(id==='ls'){const t=$('#lt').value.trim(),b=$('#lb').value.trim(),c=$('#lc').value.trim();if(t.length<3||b.length<5){$('#le').textContent='Title (3+) and explanation (5+ chars) are required.';return}
const o={title:t,cat:'basics',body:b,code:c};up(S.lessons,eL?await api('/lessons/'+eL,'PUT',o):await api('/lessons','POST',o));eL=null;renderLessons();renderAdmin()}
if(id==='qsv'){const t=$('#qq').value.trim(),os=[...document.querySelectorAll('.qo')].map(x=>x.value.trim());if(!t||os.some(x=>!x)){$('#qer').textContent='Enter a question and all four choices.';return}
const o={q:t,opts:os,a:$('#qa').selectedIndex};up(S.questions,eQ?await api('/questions/'+eQ,'PUT',o):await api('/questions','POST',o));eQ=null;quiz();renderAdmin()}
}catch(x){if(/token|auth/i.test(x.message))logout();alert('Error: '+x.message)}});
/* ---------- init ---------- */
(async()=>{try{S.lessons=await api('/lessons');S.questions=await api('/questions');if(token){try{S.scores=await api('/scores')}catch(e){token=''}}}
catch(e){$('#lessons').innerHTML='<p>Cannot reach the server. Run <code>npm start</code> inside the backend folder.</p>'}
renderLessons();quiz();renderAdmin();go('home')})();

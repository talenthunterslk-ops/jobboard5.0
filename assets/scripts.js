const STORAGE_KEY='th_jobs';
const ADMIN_USER='Admin9',ADMIN_PASS='J@n258';
const EMAIL='talenthunters.lk@gmail.com';

function loadJobs(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
function saveJobs(j){localStorage.setItem(STORAGE_KEY,JSON.stringify(j))}
function escapeHtml(s){return s? s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'):''}
function renderTech(raw){return raw?raw.split(',').map(t=>`<span class="pill">${escapeHtml(t.trim())}</span>`).join(' '):''}

function renderJobs(){
 const jobs=loadJobs();
 const cont=document.getElementById('jobs');
 if(!cont)return;
 cont.innerHTML='';
 if(!jobs.length){cont.innerHTML='<div class="muted">No jobs yet.</div>';return;}
 jobs.forEach(j=>{
  const card=document.createElement('div');
  card.className='job-card';
  card.innerHTML=`<h3 class="job-title">${escapeHtml(j.title)}</h3>
  <div class="company">${escapeHtml(j.company)}</div>
  <div class="muted">${escapeHtml(j.location)} • ${escapeHtml(j.jobType)}</div>
  <div class="tech">${renderTech(j.techStack)}</div>
  <div class="desc" data-id="${j.id}">${j.descriptionHtml||''}</div>
  <button class="show-btn" data-id="${j.id}">Show full description</button>
  <a class="apply" href="mailto:${EMAIL}?subject=${encodeURIComponent('Application: '+j.title+' at '+j.company)}">Apply</a>`;
  cont.appendChild(card);
 });
 document.querySelectorAll('.show-btn').forEach(btn=>{
   btn.onclick=()=>{
     const id=btn.dataset.id;
     const desc=document.querySelector('.desc[data-id="'+id+'"]');
     if(!desc)return;
     const expanded=desc.classList.toggle('expanded');
     btn.textContent=expanded?'Hide full description':'Show full description';
   };
 });
}

function initAdmin(){
 const loginBtn=document.getElementById('loginBtn');
 if(!loginBtn)return;
 loginBtn.onclick=()=>{
   const u=document.getElementById('username').value.trim();
   const p=document.getElementById('password').value.trim();
   if(u===ADMIN_USER&&p===ADMIN_PASS){
     document.getElementById('authPanel').style.display='none';
     document.getElementById('adminPanel').style.display='block';
     renderAdminJobs();
   } else alert('Invalid credentials');
 };
 document.querySelectorAll('.tb').forEach(b=>b.onclick=()=>document.execCommand(b.dataset.cmd));
 const fontSel=document.getElementById('fontSizeSel');
 if(fontSel)fontSel.onchange=()=>document.execCommand('fontSize',false,fontSel.value);
 document.getElementById('saveBtn').onclick=saveJob;
 document.getElementById('clearForm').onclick=clearForm;
}

let editingId=null;
function saveJob(){
 const jobs=loadJobs();
 const title=document.getElementById('jobTitle').value.trim();
 const company=document.getElementById('jobCompany').value.trim();
 if(!title||!company){alert('Enter title and company');return;}
 const location=document.getElementById('jobLocation').value.trim();
 const tech=document.getElementById('jobTech').value.trim();
 const type=document.getElementById('jobType').value;
 const descHtml=document.getElementById('editor').innerHTML;
 const descText=document.getElementById('editor').innerText;
 if(editingId){
   const idx=jobs.findIndex(x=>x.id===editingId);
   if(idx>-1)jobs[idx]={...jobs[idx],title,company,location,techStack:tech,jobType:type,descriptionHtml:descHtml,descriptionText:descText};
   editingId=null;
 }else jobs.unshift({id:'j_'+Date.now(),title,company,location,techStack:tech,jobType:type,descriptionHtml:descHtml,descriptionText:descText});
 saveJobs(jobs);
 renderAdminJobs();
 clearForm();
 alert('Saved successfully');
}
function clearForm(){['jobTitle','jobCompany','jobLocation','jobTech'].forEach(id=>document.getElementById(id).value='');document.getElementById('jobType').value='Remote';document.getElementById('editor').innerHTML='';editingId=null;}
function renderAdminJobs(){
 const list=loadJobs();
 const cont=document.getElementById('jobsList');
 cont.innerHTML='';
 if(!list.length){cont.innerHTML='<div class="muted small">No jobs yet.</div>';return;}
 list.forEach(j=>{
   const el=document.createElement('div');
   el.className='job-item';
   el.innerHTML=`<div><strong>${escapeHtml(j.title)}</strong><div class="small">${escapeHtml(j.company)}</div></div>
   <div><button data-id="${j.id}" class="tb" data-act="edit">Edit</button><button data-id="${j.id}" class="tb" data-act="delete">Delete</button></div>`;
   cont.appendChild(el);
 });
 cont.querySelectorAll('button[data-act]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.id;
   if(b.dataset.act==='edit')startEdit(id);
   else if(b.dataset.act==='delete')deleteJob(id);
 });
}
function startEdit(id){
 const j=loadJobs().find(x=>x.id===id);
 if(!j)return;
 editingId=id;
 document.getElementById('jobTitle').value=j.title;
 document.getElementById('jobCompany').value=j.company;
 document.getElementById('jobLocation').value=j.location;
 document.getElementById('jobTech').value=j.techStack;
 document.getElementById('jobType').value=j.jobType;
 document.getElementById('editor').innerHTML=j.descriptionHtml||'';
 window.scrollTo(0,0);
}
function deleteJob(id){
 if(!confirm('Delete this job?'))return;
 const jobs=loadJobs().filter(x=>x.id!==id);
 saveJobs(jobs);
 renderAdminJobs();
}
document.addEventListener('DOMContentLoaded',()=>{localStorage.setItem(STORAGE_KEY,'[]');renderJobs();initAdmin();});

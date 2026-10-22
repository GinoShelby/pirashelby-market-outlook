(() => {
'use strict';
const el=id=>document.getElementById(id), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=n=>new Intl.NumberFormat('zh-CN').format(n), cash=n=>'$'+Number(n).toFixed(2).replace(/\.00$/,'');
let data;
const PAGE_SIZE=3;
let page=Math.max(1,parseInt(new URLSearchParams(location.search).get('launch_page'),10)||1);
const params=new URLSearchParams(location.search);
document.querySelector('.launch-summary-note a').addEventListener('click',()=>{el('launch-method-disclosure').open=true;});
function filterValue(key,value){const s=el('launch-'+key),values=[...s.options].map(o=>o.value);return values.includes(value)?value:key==='price'&&values.includes('150–199')?'150–199':values[0];}
function control(key){const s=el('launch-'+key);s.value=filterValue(key,params.get('launch_'+key));s.addEventListener('change',()=>{page=1;const u=new URL(location.href);u.searchParams.set('launch_'+key,s.value);u.searchParams.delete('launch_page');history.pushState(null,'',u);render();});}
['window','filter','scale','type'].forEach(control);
function pagination(total){
 const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));page=Math.min(page,pages);
 const u=new URL(location.href);if(page>1)u.searchParams.set('launch_page',page);else u.searchParams.delete('launch_page');history.replaceState(null,'',u);
 const shown=[...new Set([1,Math.max(1,page-1),page,Math.min(pages,page+1),pages])].sort((a,b)=>a-b);
 const numbers=shown.map((p,i)=>(i&&p-shown[i-1]>1?'<span aria-hidden="true">…</span>':'')+`<button type="button" data-page="${p}" aria-label="案例第${p}页" ${page===p?'aria-current="page"':''}>${p}</button>`).join('');
 const markup=total?`<button type="button" data-page="${page-1}" ${page===1?'disabled':''}>← 上一页</button><div class="launch-page-numbers">${numbers}</div><span class="launch-page-label">第 ${page} / ${pages} 页</span><button type="button" data-page="${page+1}" ${page===pages?'disabled':''}>下一页 →</button>`:'';
 for(const id of ['launch-pagination-top','launch-pagination-bottom'])el(id).innerHTML=markup;
}
for(const id of ['launch-pagination-top','launch-pagination-bottom'])el(id).addEventListener('click',e=>{
 const button=e.target.closest('button[data-page]');if(!button||button.disabled)return;
 page=Number(button.dataset.page);const u=new URL(location.href);u.searchParams.set('launch_page',page);history.pushState(null,'',u);render();
 el('launch-cases-heading').focus({preventScroll:true});el('launch-cases-heading').scrollIntoView({block:'start',behavior:'instant'});
});
addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);for(const key of ['window','filter','scale','type','price']){el('launch-'+key).value=filterValue(key,p.get('launch_'+key));}page=Math.max(1,parseInt(p.get('launch_page'),10)||1);render();});
function graph(c,indices,common,idx){
 const w=380,h=202,l=42,r=22,t=24,b=34,vals=indices.map(i=>c.units[i]),peak=Math.max(...vals.filter(v=>v!==null),1);
 const cap=common||(peak<=10?10:peak<=100?Math.ceil(peak/20)*20:Math.ceil(peak/100)*100),x=j=>l+j*(w-l-r)/(indices.length-1),y=n=>h-b-n/cap*(h-t-b),ink='#6d3d59';
 let svg=[0,cap/2,cap].map(n=>`<line x1="${l}" x2="${w-r}" y1="${y(n)}" y2="${y(n)}" stroke="#dfd3cd"/><text x="${l-8}" y="${y(n)+4}" text-anchor="end">${nf(n)}</text>`).join(''),path='',connected=false;
 vals.forEach((v,j)=>{if(v===null){connected=false;return;}path+=`${connected?'L':'M'}${x(j)} ${y(v)} `;connected=true;});
 svg+=`<path d="${path}" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
 vals.forEach((v,j)=>{if(v!==null)svg+=`<circle cx="${x(j)}" cy="${y(v)}" r="4" fill="${ink}"><title>${data.months[indices[j]]}：${nf(v)}（估算）</title></circle>`;});
 indices.forEach((i,j)=>{if(indices.length===6||j%3===0||j===indices.length-1)svg+=`<text x="${x(j)}" y="${h-10}" text-anchor="middle">${data.months[i].slice(2).replace('-','/')}</text>`;});
 const last=vals.map(v=>v!==null).lastIndexOf(true);if(last>=0)svg+=`<text x="${x(last)}" y="${Math.max(14,y(vals[last])-10)}" text-anchor="end" fill="${ink}" font-weight="700">${nf(vals[last])}</text>`;
 const desc=indices.map((i,j)=>`${data.months[i]} ${vals[j]===null?'缺失':vals[j]}`).join('；');
 return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="ct-${idx} cd-${idx}" class="launch-chart"><title id="ct-${idx}">${esc(c.brand)}同系列各款合计月销量估算</title><desc id="cd-${idx}">${desc}。缺失不连线。</desc>${svg}</svg>`;
}
function render(){if(!data)return;
 const months=Number(el('launch-window').value),filter=el('launch-filter').value,band=el('launch-price').value,kind=el('launch-type').value,indices=data.months.map((_,i)=>i).slice(-months);
 const selected=data.candidates.filter(c=>(filter==='all'||(filter==='recent'?c.launch>='2026-04-01':c.launch<'2026-04-01'))&&(band==='all'||c.price_band===band)&&(kind==='all'||c.kind===kind));
 const common=el('launch-scale').value==='common',cap=common?Math.max(100,Math.ceil(Math.max(...selected.flatMap(c=>indices.map(i=>c.units[i]??0)),1)/100)*100):null;
 pagination(selected.length);
 const start=(page-1)*PAGE_SIZE,visible=selected.slice(start,start+PAGE_SIZE);
 el('launch-status').textContent=`${selected.length?`第 ${start+1}–${start+visible.length} 个 / 共 ${selected.length} 个案例，每页 ${PAGE_SIZE} 个`:'没有符合当前筛选的案例'} · ${data.months[indices[0]]}—${data.months.at(-1)} · ${common?'所有图统一使用销量刻度 0—'+nf(cap):'各图使用自己的销量刻度'} · 同系列各款合计月销量估算`;
 el('launch-grid').innerHTML=selected.length?visible.map((c,idx)=>{
  const obs=c.units.map((v,i)=>({v,i})).filter(x=>x.v!==null),first=obs[0],last=obs.at(-1),short=obs.length===2;
  return `<article class="launch-card">
   <div class="launch-card-top"><span class="launch-tag">${esc(c.price_band)} 美元</span><span class="performance-badge ${c.kind}">${c.kind==='stable'?'销量相对稳定':c.kind==='early'?'仅有两个月记录':'总体增长 · 每月有起伏'}</span><span class="window-badge">${obs.length}个月有记录</span></div>
   <div class="launch-name"><h3>${esc(c.brand)}</h3><b>${cash(c.price)}</b></div><p class="launch-meta">图示商品上架于 ${c.launch}</p>
   <a class="competitor-image" href="https://www.amazon.com/dp/${c.asin}" target="_blank" rel="noopener" aria-label="查看 ${esc(c.brand)} ${c.asin} 的 Amazon 商品页"><img src="assets/competitors/${c.asin}.jpg" alt="${esc(c.brand)} 麻将牌组或套装的商品主图" loading="lazy" width="600" height="600"><span>Amazon 商品页 ↗</span></a>
   <p class="launch-positioning">${esc(c.positioning)}</p>
   <div class="capacity-stats"><div><span>最新月 · 2026.09</span><b>${nf(last.v)}</b><small> 套 / 同系列各款合计估算</small></div><div><span>最近${c.recent_months.length}个有记录月份的月均销量</span><b>${nf(Math.round(c.recent_average))}</b><small> 套 / 同系列各款合计估算</small></div></div>
   <p class="launch-meta">用于计算月均销量的月份：${c.recent_months.map(m=>m.slice(2).replace('-','/')).join('、')}</p>
   <div class="launch-growth"><b>${nf(first.v)} → ${nf(last.v)}</b><span>最早与最新记录 · ${data.months[first.i].slice(2).replace('-','/')}—${data.months[last.i].slice(2).replace('-','/')}</span></div>
   ${graph(c,indices,cap,idx)}<p class="launch-takeaway">${esc(c.note)}</p>
   <details class="launch-detail"><summary>查看逐月数据和商品编号</summary><p>图示商品编号（ASIN）：${c.asin}<br>所属系列编号（父 ASIN）：${c.parent}</p><p>上架日期对应图示商品；销量为同系列各款合计的第三方估算。<a href="#launch-method-disclosure">日期、系列与估算口径 ↗</a></p>
   <div class="launch-table-wrap"><table><caption>${esc(c.brand)} · 同系列各款合计月销量估算</caption><thead><tr><th scope="col">月份</th><th scope="col">月销量估算</th></tr></thead><tbody>${data.months.map((m,i)=>`<tr><th scope="row">${m}</th><td>${c.units[i]===null?'未匹配 / 缺失':nf(c.units[i])}</td></tr>`).join('')}</tbody></table></div>
   ${c.mapping.length?`<p>这个商品历史上变更过所属系列；旧系列的销量没有拼接到当前曲线中。</p>`:''}</details></article>`;
 }).join(''):'<p class="launch-empty">当前筛选没有符合条件的案例。可选择其他表现类型、价格段或近一年范围。</p>';
}
fetch('launches.json?v=13').then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(d=>{data=d;
 el('launch-highlights').innerHTML=d.highlights.map(h=>`<article><span>${esc(h.label)}</span><b>${esc(h.metric)}</b><p>${esc(h.text)}</p></article>`).join('');
 const bands=[...new Set(d.candidates.map(c=>c.price_band))].sort((a,b)=>parseInt(a)-parseInt(b));
 el('launch-price').innerHTML='<option value="all">全部价格段</option>'+bands.map(b=>`<option value="${esc(b)}">$${esc(b)}</option>`).join('');control('price');
 el('launch-method').innerHTML=d.method.map(p=>`<p>${esc(p)}</p>`).join('');
 render();
}).catch(()=>el('launch-grid').innerHTML='<p>逐月数据暂时无法加载，请刷新重试。</p>');
})();


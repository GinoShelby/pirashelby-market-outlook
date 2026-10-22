(() => {
'use strict';
const el=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=v=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:1}).format(v);
const percent=v=>new Intl.NumberFormat('zh-CN',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1,signDisplay:'exceptZero'}).format(v);
let data;
const control=el('stats-window');
function sync(){control.value=new URLSearchParams(location.search).get('stats_window')==='6'?'6':'12';}
sync();
function growth(metric,total){
 if(!metric||metric.rate===null||metric.n===0)return '<strong class="no-data">暂无可比数据</strong><small>无完整可比样本，不补算增速</small>';
 return `<strong class="${metric.rate<0?'negative':''}">${percent(metric.rate)}</strong><small>${nf(metric.n)} / ${nf(total)} 个可比${metric.n<5?' · 样本较少':''}</small>`;
}
function volume(c){
 if(!c||!c.top_n)return '<strong class="no-data">无可排名记录</strong>';
 return `<strong>约 ${nf(Math.round(c.median_units))} 套/月</strong><small>组内范围 ${nf(c.min_units)}–${nf(c.max_units)} 套<br>销量前 ${nf(c.top_n)} / ${nf(c.rankable_n)} 个 · 门槛 ${nf(c.threshold_units)} 套</small>`;
}
function render(){
 if(!data)return;
 const window=control.value,rows=data.rows;
 const totals={12:rows.reduce((n,r)=>n+r.counts['12'],0),6:rows.reduce((n,r)=>n+r.counts['6'],0)};
 el('launch-overview').innerHTML=`<article><span>本次检索 · 近一年上架的新品</span><b>${nf(totals[12])}<small>个</small></b><p>2025年10月—2026年9月上架；含低销量、下滑与零销量记录，按父体去重。</p></article><article><span>其中 · 近半年上架的新品</span><b>${nf(totals[6])}<small>个</small></b><p>2026年4月—9月上架，是左侧近一年样本的子集，两项不能相加。</p></article>`;
 const tableRows=rows.map(r=>{const c=r.cohorts[window];return `<tr><th scope="row">$${esc(r.band)}</th><td class="count">${nf(r.counts['12'])}</td><td class="count">${nf(r.counts['6'])}</td><td>${volume(c)}</td><td>${growth(c.mom,c.top_n)}</td><td>${growth(c.cmgr,c.top_n)}</td></tr>`;}).join('');
 const mobile=rows.map(r=>{const c=r.cohorts[window];return `<article class="band-mobile-card"><h4>$${esc(r.band)}</h4><div class="band-mobile-counts"><span>一年内 <strong>${nf(r.counts['12'])}</strong>个</span><span>半年内 <strong>${nf(r.counts['6'])}</strong>个</span></div><dl><dt>销量前30%<br>典型月销量</dt><dd>${volume(c)}</dd><dt>8→9月<br>销量合计环比</dt><dd>${growth(c.mom,c.top_n)}</dd><dt>7→9月<br>销量合计月均增速</dt><dd>${growth(c.cmgr,c.top_n)}</dd></dl></article>`;}).join('');
 el('price-band-results').innerHTML=`<div class="band-table-wrap"><table class="band-table"><caption>右侧销量与增长：近${window==='12'?'一年':'半年'}上架新品中，按2026年9月销量选前30%。</caption><thead><tr><th scope="col">9月价格</th><th scope="col">一年内<br>发现新品</th><th scope="col">半年内<br>发现新品</th><th scope="col">销量前30%<br>典型月销量（9月）</th><th scope="col">8→9月<br>销量合计环比</th><th scope="col">7→9月<br>销量合计月均增速</th></tr></thead><tbody>${tableRows}</tbody></table></div><div class="stats-mobile-list" aria-label="各价格带统计，手机布局">${mobile}</div>`;
 el('stats-reading').textContent='读法：新品数看进入规模，前30%的典型销量看表现较好者能达到的量级；增速只比较其中有完整历史的同一批商品。各价带增长并不同步：正数为增长，负数为回落，“暂无可比数据”不等于零增长。';
 el('price-band-method').innerHTML=`<p><strong>新品数量：</strong>从9月导出记录中识别近一年或近半年上架的代表商品，按父ASIN去重后计数，包含增长、稳定、下滑、低销量及零销量。它并非该时间内曾经出现的全部上架商品，已不在9月检索结果中的商品没有计入。</p><p><strong>月销前30%：</strong>在每个价格带、所选上架窗口的可排名记录中，按9月父体月销量从高到低，取数量×30%向上取整。冲突或缺失导致无法比较的记录不参与排名；发现数与可排名数可能不同。并列按父ASIN排序取固定数量，不额外扩张组别。典型销量取前30%组的中位数（约一半高于它、一半低于它），展示时四舍五入；不是每款都达到这个销量；组内范围同时展示。</p><p><strong>8→9月环比：</strong>固定9月选出的前30%组，再取其中具有8、9月完整可比记录的子集，计算“9月销量合计÷8月销量合计−1”。</p><p><strong>7→9月月均增速：</strong>同样固定前30%组，取7、8、9月连续可比子集，以“(9月销量合计÷7月销量合计)的平方根−1”折算两个月的平均复合速度，不是全年增速。两个增长指标的有效样本可能不同；每个百分比下方均标出有效数量。</p><p><strong>可比条件：</strong>排除未满月的上架月、基期为零、缺失月份及身份或指标异常；不把缺失当零，不删去负增长。详细身份核验与剔除原因保留在内部审计。样本少于5个时特别标记，不能据此概括整个价带。</p><p><strong>不要外推：</strong>前30%组按9月表现选取，存在事后选择效应；增长率仅描述这批记录的历史变化，不能解释为全体新品的增长、行业增长或PiraShelby未来销量。</p>`;
}
control.addEventListener('change',()=>{const u=new URL(location.href);u.searchParams.set('stats_window',control.value);history.pushState(null,'',u);render();});
addEventListener('popstate',()=>{sync();render();});
fetch('launch-stats.json?v=4').then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(d=>{data=d;render();}).catch(()=>{el('launch-overview').innerHTML='';el('price-band-results').innerHTML='<p class="stats-error">价格带统计暂时无法加载，请刷新页面重试。</p>';});
})();

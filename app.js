const $ = (s) => document.querySelector(s);
const fmt = (n) => new Intl.NumberFormat('zh-CN', {maximumFractionDigits:0}).format(n);
const svgText = (x,y,text,extra='') => `<text x="${x}" y="${y}" ${extra}>${text}</text>`;
const colors = {ink:'#493142',muted:'#71616a',grid:'#dfd3cd',rose:'#ac7484',hero:'#6d3d59',gold:'#95763e'};
const mobileQuery=matchMedia('(max-width:760px)');
function updateQuery(key,value){const u=new URL(location.href);u.searchParams.set(key,value);history.replaceState(null,'',u);}
const initialRate=new URLSearchParams(location.search).get('growth');
if(initialRate!==null&&Number.isFinite(Number(initialRate))&&Number(initialRate)>=-10&&Number(initialRate)<=40)$('#growth').value=String(Math.round(Number(initialRate)/5)*5);

function renderScenario(){
  const rate=Number($('#growth').value)/100;
  const points=[0,1,2,3].map(t=>({t,n:100*Math.pow(1+rate,t)}));
  const ymax=300, w=mobileQuery.matches?360:800,h=245,left=mobileQuery.matches?35:50,right=mobileQuery.matches?30:70,top=28,bottom=42;
  const x=t=>left+t*(w-left-right)/3, y=n=>h-bottom-(n/ymax)*(h-top-bottom);
  const end=points[3].n;
  $('#growth-value').textContent=`${Math.round(rate*100)}%`;
  $('#scenario-number').textContent=fmt(end);
  $('#scenario-change').textContent=`较基期 ${end>=100?'+':''}${Math.round(end-100)}%`;
  let content=[0,100,200,300].map(n=>`<line x1="${left}" x2="${w-right}" y1="${y(n)}" y2="${y(n)}" stroke="${colors.grid}"/>${svgText(left-12,y(n)+4,n,'text-anchor="end"')}`).join('');
  content+=`<path d="M${x(0)} ${y(100)} L${x(3)} ${y(100)}" fill="none" stroke="${colors.gold}" stroke-dasharray="4 5"/>`;
  content+=`<path d="${points.map((p,i)=>`${i?'L':'M'}${x(p.t)} ${y(p.n)}`).join(' ')}" fill="none" stroke="${colors.hero}" stroke-width="3"/>`;
  points.forEach(p=>{content+=`<circle cx="${x(p.t)}" cy="${y(p.n)}" r="5" fill="${colors.hero}"/>${svgText(x(p.t),y(p.n)-14,fmt(p.n),`text-anchor="middle" fill="${colors.hero}" font-size="17"`)}${svgText(x(p.t),h-13,p.t===0?'基期':`第${p.t}年`,'text-anchor="middle"')}`;});
  $('#scenario-chart').innerHTML=`<svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="假设年增长${rate*100}%，三年后规模指数${Math.round(end)}，基期为100" style="font-family:inherit;font-size:12px;fill:${colors.muted}"><title>假设情景演示，非行业预测</title>${content}</svg>`;
}
$('#growth').addEventListener('input',renderScenario);$('#growth').addEventListener('change',()=>updateQuery('growth',$('#growth').value));mobileQuery.addEventListener('change',renderScenario);renderScenario();
$('#print').addEventListener('click',()=>window.print());

const priceRows=[
 {name:'PiraShelby 首套动物主题',sub:'品牌计划 · 套装 · 尚未上市',value:298,color:colors.hero},
 {name:'Oh My Mahjong Pearlescent',sub:'2026.10标价 · 含160枚麻将牌及收纳等，不含牌架',value:475,color:colors.rose},
 {name:'Neiman Marcus 礼品指南',sub:'2024假日季 · Oh My Mahjong Starter Kit',value:849,color:colors.gold}
];
$('#price-chart').innerHTML=`<p class="eyebrow">商品标价示例 · 美元 · 配置与时间不同</p>`+priceRows.map(r=>`<div class="price-item"><div><strong>${r.name}</strong><b>$${fmt(r.value)}</b></div><p>${r.sub}</p><div class="price-axis"><i style="width:${r.value/900*100}%;background:${r.color}"></i></div></div>`).join('')+`<div class="price-ticks"><span>$0</span><span>$300</span><span>$600</span><span>$900</span></div><p class="chart-caption">不同配置与渠道的挂牌价示例。<a href="#source-price-notes">配置、时间与来源说明 ↗</a></p>`;

const sources=[
 {id:'source-google',tag:'需求指标',title:'Google｜入门与找课搜索',body:'2026-07-28发布。“mahjong for beginners”（麻将入门）搜索在过去一年增长230%；“mahjong lessons near me”（附近的麻将课程）自年初以来增长105%。地域和玩法未明确，不能当作美国实体麻将套装的销量。',url:'https://blog.google/products-and-platforms/products/search/touch-grass-trends/',label:'Google 官方文章'},
 {id:'source-events',tag:'活动指标',title:'AP 引述 Eventbrite｜美国麻将活动',body:'AP 2025-09-06报道：Eventbrite美国麻将活动数2024年较2023年增长179%。覆盖多种麻将玩法，不等于人数或商品销量。',url:'https://apnews.com/article/b0dea60bce21804756c0d5c241571056',label:'AP 原始报道'},
 {id:'source-omm',tag:'企业自报',title:'Oh My Mahjong｜收入及教师网络',body:'该品牌于2025-10-16公告称，年度收入超过3,000万美元，同比增长360%，美国认证教师超过1,000名。本项目没有独立审计，公告也未明确会计期间；收入涵盖该品牌多类产品。',url:'https://www.prnewswire.com/news-releases/oh-my-mahjong-surpasses-30m-in-revenue-fueling-american-mahjongs-surge-302586314.html',label:'PR Newswire 企业公告'},
 {id:'source-seller',tag:'第三方估算',title:'SellerSprite｜Amazon 美国中高价样本',body:'数据于2026-10-20导出，03B新增案例于10月21日补充采集。主要样本使用american mahjong词组匹配、价格至少100美元、不设销量门槛，并关闭“展示全部变体”。按商品系列（父ASIN）去重，剔除无关商品；具体方法见本附录的Amazon样本说明。它不是美国全市场数据，也不是 Amazon 官方财报。',url:'https://www.sellersprite.com/v3/product-research',label:'SellerSprite 产品研究入口（需账户）'},
 {id:'source-clubs',tag:'经营案例',title:'ICSC｜麻将空间与社群',body:'2026-02-03的采访提到，Dallas的Charleston Club于2025年10月开业，Cleveland的Mahjong Maison于2026年1月开业。这些案例说明有人把课程、聚会和零售做成了门店，不代表全国门店数量。',url:'https://www.icsc.com/news-and-views/icsc-exchange/from-game-night-to-a-third-place-is-mahjong-the-next-pickleball',label:'ICSC 原始采访'},
 {id:'source-prices',tag:'历史挂牌',title:'Neiman Marcus｜2024 礼品指南',body:'2024 Holiday Guide第27页列出Oh My Mahjong Starter Kit，标价$849。它证明该产品曾进入礼品指南，不能说明当时销量或现在的售价。',url:'https://filecache.investorroom.com/mr5ir_neimanmarcusgroup/2246/Neiman%20Marcus%20Holiday%20Guide%202024.pdf',label:'零售商原始 PDF'},
 {id:'source-tiles',tag:'当前挂牌',title:'Oh My Mahjong｜Pearlescent 牌组',body:'2026-10-20查看时标价$475，包含160枚亚克力麻将牌及收纳等，不含四副牌架。页面上销售状态的文字有冲突，因此未判断现货或售罄。',url:'https://ohmymahjong.com/products/pearlescent-tile-set',label:'品牌商品页'},
 {id:'source-service',tag:'当前挂牌',title:'The Polished Tile｜课程与社交服务',body:'2026-10-20查看时，四节American Mahjong Confidence Series课程标价$200。课程服务单独观察，不与麻将商品混算平均价格或收入。',url:'https://thepolishedtile.bamgoodtime.com/memberships',label:'经营者课程与会员页面'},
 {id:'source-supply',tag:'供应链采访',title:'Sixth Tone｜制造商扩产与市场竞争',body:'2026-08-05的现场采访报道了制造商为满足美国麻将需求而扩产，也提到新竞争者增加、品质稳定性和价格竞争的问题。这是采访案例，不是全美消费者购买量的统计。',url:'https://www.sixthtone.com/news/1018856',label:'Sixth Tone 原始采访'},
 {id:'source-rules',tag:'官方商品',title:'NMJL｜年度规则牌卡',body:'官方商店销售2026年度规则牌卡，说明这项游戏仍有持续更新的规则用品。它不能用来推算玩家人数、会员增长或每年再次购买套装的人数。',url:'https://nationalmahjonggleague.org/store.aspx',label:'NMJL 官方商店'}
];
$('#source-list').innerHTML=sources.map(s=>`<details id="${s.id}"><summary><span class="source-tag">${s.tag}</span>${s.title}</summary><p>${s.body}</p><a href="${s.url}" target="_blank" rel="noopener">${s.label} ↗</a></details>`).join('');
document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]');if(!a)return;const d=document.getElementById(a.getAttribute('href').slice(1));if(d?.tagName==='DETAILS')d.open=true;});
function updateProgress(){
 const range=document.documentElement.scrollHeight-innerHeight;
 $('.reading-progress').style.setProperty('--progress',`${range?scrollY/range*100:0}%`);
}
addEventListener('scroll',updateProgress,{passive:true});updateProgress();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
 if(e.isIntersecting)document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${e.target.id}`));
}),{rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('main>section[id]').forEach(s=>observer.observe(s));

async function loadMarket(){
 try{
  const res=await fetch('market.json?v=13');if(!res.ok)throw new Error('market data unavailable');
  const data=await res.json();renderMarket(data);
 }catch(e){
  $('#amazon-content').innerHTML='<h3>数据文件暂时未能加载</h3><p>请刷新页面；其他章节及来源仍可阅读。</p>';
 }
}
function renderMarket(data){
 const current=data.current;
 $('#amazon-content').innerHTML=`
 <div class="market-metrics">
  <div><span>纳入统计的商品系列</span><b>${fmt(current.parents)}</b><small>按父体去重 · ${data.month}</small></div>
  <div><span>样本月销量估算</span><b>${(current.units/10000).toFixed(2)} 万</b><small>同系列各款合计 · 第三方估算</small></div>
  <div><span>样本月销售额估算</span><b>$${(current.revenue/10000).toFixed(1)} 万</b><small>美元 · 仅限这些样本</small></div>
 </div>
 <div class="chart-toolbar"><h3>不同价位，有多少产品在卖？</h3><div class="segmented" aria-label="选择价格带统计指标"><button type="button" aria-pressed="true" data-band-metric="parents">产品数量</button><button type="button" aria-pressed="false" data-band-metric="revenue">销售额估算</button></div></div>
 <div class="market-split"><div><div id="band-chart"></div><p class="chart-caption" id="band-caption"></p></div><div class="market-note"><h3 style="font-size:20px;margin-bottom:14px">接近 $298 的价位，<br>已有产品月销上百套。</h3><p>${data.insight}</p><p class="chart-caption">同价位已有持续销售的商品，为首款计划售价提供了市场参照。</p></div></div>
 ${data.history?'<div class="historical-block"><h3>近年筛选样本的产品数量与销售规模扩大</h3><div id="history-chart"></div><p class="chart-caption">'+data.historyNote+'</p></div>':''}`;
 const showBands=metric=>{
  const vals=current.bands.map(b=>b[metric]);const max=Math.max(...vals,1);
  $('#band-chart').innerHTML=current.bands.map((b,i)=>`<div class="bar-row"><span>${b.label}</span><div class="bar-track"><div class="bar-fill" style="width:${vals[i]/max*100}%;${b.label.includes('250')?'background:'+colors.hero:''}"></div></div><b>${metric==='revenue'?'$'+(vals[i]/10000).toFixed(1)+'万':fmt(vals[i])}</b></div>`).join('');
  $('#band-caption').textContent=metric==='revenue'?'按所选商品标价分组，合计同系列各款的估算月销售额。单位为美元，包含不同配置。':'按所选商品标价分组，系列去重计数。';
  document.querySelectorAll('[data-band-metric]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bandMetric===metric)));
 };
 document.querySelectorAll('[data-band-metric]').forEach(b=>b.addEventListener('click',()=>{showBands(b.dataset.bandMetric);updateQuery('metric',b.dataset.bandMetric);}));showBands(new URLSearchParams(location.search).get('metric')==='revenue'?'revenue':'parents');
 if(data.history){
   const series=data.history, max=5000000, W=mobileQuery.matches?360:800,H=260,L=mobileQuery.matches?50:70,R=mobileQuery.matches?40:70,T=35,B=45;
   const xp=i=>L+i*(W-L-R)/Math.max(series.length-1,1),yp=v=>H-B-(H-T-B)*v/max;
   let content=[0,.5,1].map(f=>`<line x1="${L}" x2="${W-R}" y1="${yp(f*max)}" y2="${yp(f*max)}" stroke="${colors.grid}"/>${svgText(L-10,yp(f*max)+5,`${fmt(f*max/1e4)}万`,'text-anchor="end"')}`).join('');
   content+=`<path d="${series.map((s,i)=>`${i?'L':'M'}${xp(i)} ${yp(s.revenue)}`).join(' ')}" fill="none" stroke="${colors.hero}" stroke-width="3" stroke-dasharray="5 4"/>`;
   series.forEach((s,i)=>content+=`<circle cx="${xp(i)}" cy="${yp(s.revenue)}" r="5" fill="${colors.hero}"/>${svgText(xp(i),yp(s.revenue)-17,(s.revenue/1e4).toFixed(1)+'万',`text-anchor="middle" font-size="${mobileQuery.matches?13:17}"`)}${svgText(xp(i),H-21,s.month,'text-anchor="middle"')}${svgText(xp(i),H-4,s.parents+'个商品系列','text-anchor="middle" font-size="10"')}`);
   $('#history-chart').innerHTML=`<svg class="chart-svg" role="img" aria-label="同期关键词样本销售额估算，不代表全市场增速" viewBox="0 0 ${W} ${H}" style="font-family:inherit;font-size:12px;fill:${colors.muted}">${content}</svg>`;
 }
 $('#amazon-method').innerHTML=data.method.map(p=>`<p>${p}</p>`).join('')+`<div class="cohort-note"><strong>还要一起看：两年都在样本中的25个商品系列</strong><span>2025.09 → 2026.09 月销售额估算 <b>$375,413 → $333,033（−11.3%）</b></span><p>新产品增加、数据覆盖变化，都会让每年筛到的样本变大。但这25个两年都有记录的系列，合计销售额并未同步增长。看新增产品时，也要保留这个结果；两者都不能代替整个行业的增长率。</p></div>`;
}
loadMarket();
mobileQuery.addEventListener('change',loadMarket);
let printDetails=[];
addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('details')].map(d=>[d,d.open]);printDetails.forEach(([d])=>d.open=true);});
addEventListener('afterprint',()=>printDetails.forEach(([d,open])=>d.open=open));

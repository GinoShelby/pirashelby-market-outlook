(() => {
 'use strict';
 const el=id=>document.getElementById(id),nf=n=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:0}).format(n),usd=n=>(n<0?'−':'')+'$'+nf(Math.abs(n)),wan=n=>(n<0?'−':'')+'$'+(Math.abs(n)/10000).toFixed(1)+'万';
 const ids=['units','mix','margin','ads'];
 const read=()=>({units:Number(el('biz-units').value),premiumShare:Number(el('biz-mix').value),beforeAd:Number(el('biz-margin').value),adRate:Number(el('biz-ads').value)});
 function render(){
  const input=read(),r=PiraFinance.calculate(input);
  el('biz-units-value').textContent=nf(r.units)+' 套';el('biz-mix-value').textContent=input.premiumShare+'% / '+(100-input.premiumShare)+'%';
  el('biz-margin-value').textContent=input.beforeAd+'%';el('biz-ads-value').textContent=input.adRate+'%';
  el('biz-month-revenue').textContent=wan(r.revenue);el('biz-annual-revenue').textContent=wan(r.annualRevenue);el('biz-annual-profit').textContent=wan(r.annualAfterAd);
  el('biz-month-profit').textContent=`每月 ${usd(r.afterAdProfit)} · 扣广告后剩 ${r.afterAdMargin.toFixed(0)}%`;
  el('biz-blended-price').textContent='$'+r.averagePrice.toFixed(2);
  el('biz-assumptions').textContent=`当前按每月合计 ${nf(r.units)} 套计算：$298款占 ${input.premiumShare}%，$169.99款占 ${100-input.premiumShare}%；广告前可剩收入的 ${input.beforeAd}%，广告花费占总收入 ${input.adRate}%。`;
  const bars=[['销售收入',r.revenue,'revenue'],['广告前可剩',r.beforeAdProfit,'before'],['广告支出',r.adSpend,'ads'],['扣广告后可剩',r.afterAdProfit,'after']];
  el('biz-profit-bridge').innerHTML=bars.map(([label,v,kind])=>`<div class="profit-row ${kind}"><span>${label}</span><div class="profit-track"><i style="width:${r.revenue?Math.abs(v)/r.revenue*100:0}%" class="${v<0?'negative':''}"></i></div><b>${usd(v)}</b></div>`).join('');
  el('biz-profit-warning').textContent=r.afterAdMargin<0?'按当前参数，广告花费已经超过广告前可剩的金额，测算结果为亏损。':r.afterAdMargin===0?'按当前参数，扣完广告费后余额为零，还没有覆盖可能遗漏的其他费用。':'扣广告后余额按当前参数计算，完整财务口径见来源说明。';
  el('biz-sensitivity-body').innerHTML=[150,500,800].map(q=>{const s=PiraFinance.calculate({...input,units:q});return `<tr class="${q===500?'target-row':''}"><th scope="row">${q} 套 <small>${q===500?'以500套演示目标':q===150?'销量较低时':'销量扩大后'}</small></th><td>${wan(s.revenue)}</td><td>${wan(s.annualRevenue)}</td><td>${wan(s.annualAfterAd)}</td></tr>`;}).join('');
 }
 ids.forEach(k=>el('biz-'+k).addEventListener('input',render));
 el('biz-reset').addEventListener('click',()=>{[500,50,60,30].forEach((v,i)=>el('biz-'+ids[i]).value=String(v));render();});
 render();
})();

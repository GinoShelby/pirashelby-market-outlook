(function(root){
 'use strict';
 function calculate({units=500,premiumShare=50,beforeAd=60,adRate=30}={}){
  const bounded=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):fallback;
  const q=bounded(units,0,1500,500),mix=bounded(premiumShare,0,100,50)/100,g=bounded(beforeAd,0,100,60)/100,a=bounded(adRate,0,100,30)/100;
  const premiumPrice=298,secondPrice=169.99,averagePrice=premiumPrice*mix+secondPrice*(1-mix),revenue=q*averagePrice;
  return {units:q,premiumShare:mix*100,averagePrice,revenue,beforeAdProfit:revenue*g,adSpend:revenue*a,afterAdProfit:revenue*(g-a),afterAdMargin:(g-a)*100,annualRevenue:revenue*12,annualAfterAd:revenue*(g-a)*12};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={calculate};
 else root.PiraFinance={calculate};
})(typeof window!=='undefined'?window:this);

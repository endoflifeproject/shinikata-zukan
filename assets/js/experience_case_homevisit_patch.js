(function(){
  function apply(){
    const profession=document.getElementById('professionSelect');
    const workplace=document.getElementById('workplaceSelect');
    if(!workplace)return;

    const renameHomeVisit=()=>{
      const option=Array.from(workplace.options).find(o=>o.value==='home_medicine');
      if(option)option.textContent='在宅医療・訪問診療（患者さんの自宅へ訪問）';
    };

    renameHomeVisit();
    profession?.addEventListener('change',()=>setTimeout(renameHomeVisit,0));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();

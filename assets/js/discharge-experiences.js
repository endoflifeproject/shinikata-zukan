const dischargeExperiences = [
  {
    tags:["70代","脳梗塞","家族","自宅退院"],
    title:"『家に帰りたい』と言う父。でも家族だけでは無理だと思っていました。",
    body:"退院支援の方に相談して、訪問看護や介護サービスを使えることを知りました。",
    meta:"相談した相手：医療ソーシャルワーカー"
  },
  {
    tags:["40代","事故後","本人","リハビリ転院"],
    title:"退院と言われた時、てっきり家に帰るものだと思っていました。",
    body:"まだリハビリが必要で、別の病院へ転院する選択肢があると初めて知りました。",
    meta:"もっと早く知りたかった：転院後の生活イメージ"
  },
  {
    tags:["80代","認知症","家族","施設"],
    title:"『施設』と言われても、種類が多すぎて何が違うのか分かりませんでした。",
    body:"医療対応や費用を一緒に整理してもらって、候補を比べられるようになりました。",
    meta:"役立ったこと：条件を先に整理すること"
  }
];

function renderDischargeExperiences(){
  const root=document.getElementById("discharge-experience-list");
  if(!root)return;
  root.innerHTML=dischargeExperiences.map(item=>`<article class="exp-card"><div class="tags">${item.tags.map(tag=>`<span>${tag}</span>`).join("")}</div><h3>${item.title}</h3><p>${item.body}</p><div class="mini-meta">${item.meta}</div></article>`).join("");
}

document.addEventListener("DOMContentLoaded",renderDischargeExperiences);
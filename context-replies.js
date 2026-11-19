/* TravelTalk 1.6 - private, on-device rule-based context replies.
   No generative AI and no remote profile transmission. */
(()=>{
  const box=document.getElementById('replies');
  if(!box || typeof renderReply!=='function')return;
  const key='traveltalk-profile-v16';
  let profile={name:'',party:'',allergy:'',language:'en'};
  try{profile={...profile,...JSON.parse(localStorage.getItem(key)||'{}')}}catch(e){}
  const card=document.createElement('section');card.className='card';
  card.innerHTML=`<h2>⚙️ 我的旅行信息（仅保存在本机）</h2>
    <div class="muted">填写后，推荐回复会自动带入真实信息。留空时不会替你编造。</div>
    <label class="tiny">预约姓名<input id="ttName" class="input" autocomplete="off" placeholder="例如：Stephanie"></label>
    <label class="tiny">人数<input id="ttParty" class="input" type="number" min="1" max="30" inputmode="numeric" placeholder="例如：2"></label>
    <label class="tiny">饮食禁忌 / 过敏（中文）<input id="ttAllergy" class="input" autocomplete="off" placeholder="例如：花生（回复时只提醒确认）"></label>
    <button id="ttSaveProfile" class="secondary" type="button">保存旅行信息</button>
    <div id="ttProfileStatus" class="tiny" role="status"></div>`;
  box.closest('.card')?.insertAdjacentElement('afterend',card);
  const val=id=>document.getElementById(id);
  val('ttName').value=profile.name;val('ttParty').value=profile.party;val('ttAllergy').value=profile.allergy;
  val('ttSaveProfile').onclick=()=>{
    profile={...profile,name:val('ttName').value.trim().slice(0,70),party:val('ttParty').value.trim().slice(0,2),allergy:val('ttAllergy').value.trim().slice(0,120)};
    try{localStorage.setItem(key,JSON.stringify(profile));val('ttProfileStatus').textContent='已保存在此设备'}catch(e){val('ttProfileStatus').textContent='无法保存，请检查浏览器存储设置'}
    refresh();
  };
  const p=(en,zh,ja)=>[en,zh,ja];
  const common={
    wait:p('One moment, please.','请稍等一下。','少々お待ちください。'),
    repeat:p('Could you say that again, slowly?','请慢一点再说一遍。','もう一度、ゆっくりお願いします。'),
    show:p('Could you show me, please?','能指给我看吗？','見せていただけますか。'),
    yes:p('Yes, please.','好的，麻烦了。','はい、お願いします。'),
    no:p('No, thank you.','不用了，谢谢。','いいえ、結構です。'),
    check:p('I need to check first.','我需要先确认一下。','先に確認させてください。'),
    bill:p('The bill, please.','麻烦结账。','お会計をお願いします。')
  };
  function pick(raw,zh){
    const recent=Array.isArray(items)?items.slice(0,4).map(x=>x.raw+' '+x.zh).join(' '):'';
    const s=(raw+' '+zh).toLowerCase();
    const history=(s+' '+recent).toLowerCase();
    const has=x=>x.test(s);
    const name=profile.name;
    const party=Number(profile.party);
    if(has(/アレルギ|allerg|过敏|食べられ|食べれ|ingredient|成分|原料|食材/)){
      return [common.check,p('Could you tell me the ingredients?','请告诉我这道菜的配料。','この料理の原材料を教えていただけますか。'),p('Please give me a moment to confirm my allergies.','请等我确认过敏信息。','アレルギーについて確認させてください。')];
    }
    if(has(/お名前|名前|name|予約名|booking name|姓名|名字/))return [
      name?p(`The reservation is under ${name}.`,`预约姓名是 ${name}。`,`予約名は${name}です。`):p('I can show you my reservation.','我可以出示预约信息。','予約情報をお見せできます。'),
      common.show,common.repeat];
    if(has(/何名|何人|人数|how many|何人様|几位|几个人|people|persons/))return [
      party>0?p(`A table for ${party}, please.`,`我们一共 ${party} 位。`,` ${party}名です。`):p('Let me confirm the number of people.','我确认一下人数。','人数を確認させてください。'),
      common.wait,common.repeat];
    if(has(/予約|reservation|booking|预订|预约/))return [
      p('Yes, I have a reservation.','有，我预约了。','はい、予約しています。'),
      p('No, I do not have a reservation. Is there a table available?','没有预约，请问现在有座位吗？','予約していません。今、席は空いていますか。'),
      common.show];
    if(has(/お支払|会計|お勘定|支払い|bill|pay|check please|结账|付款|买单|別々|一緒/))return [
      p('Together, please.','一起结账。','一緒にお願いします。'),
      p('Separately, please.','分开结账。','別々でお願いします。'),
      p('Can I pay by card?','可以刷卡吗？','カードで払えますか。')];
    if(has(/飲み物|お飲み物|お水|drink|water|beverage|饮料|喝什么|饮み/))return [
      p('Water, please.','请给我水。','お水をお願いします。'),common.no,common.wait];
    if(has(/注文|メニュー|おすすめ|料理|order|menu|recommend|点餐|推荐|菜单/))return [
      p('Could I see the menu, please?','可以给我看菜单吗？','メニューを見せていただけますか。'),
      p('What do you recommend?','您推荐什么？','おすすめは何ですか。'),common.wait];
    if(has(/何時|時間|いつ|何分|what time|when|几点|什么时候|多久|時まで/))return [common.repeat,common.check,p('Could you write down the time?','能把时间写下来吗？','時間を書いていただけますか。')];
    if(has(/ありがとう|thanks|thank you|谢谢/))return [p('Thank you very much.','非常感谢。','ありがとうございます。'),common.yes,common.no];
    if(has(/いらっしゃいませ|こんにちは|hello|欢迎光临|你好/))return [p('Hello.','您好。','こんにちは。'),p('I have a reservation.','我有预约。','予約しています。'),common.wait];
    if(/予約|reservation|booking|预约/.test(history))return [common.show,common.wait,common.repeat];
    return [common.repeat,common.wait,common.check];
  }
  let lastRaw='',lastZh='';
  updateSuggestions=function(raw,zh=''){
    if(!raw)return;
    lastRaw=raw;lastZh=zh;
    renderReply(pick(raw,zh));
    const title=box.closest('.card')?.querySelector('h2');
    if(title)title.textContent='💬 结合对话 · 可直接播放的回复（请选择符合事实的一句）';
  };
  function refresh(){if(lastRaw)updateSuggestions(lastRaw,lastZh)}
  // Preserve the user's existing one-tap speech buttons.
})();

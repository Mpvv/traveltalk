/* TravelTalk V1.5: iOS foreground session recovery, with user-gesture fallback. */
(()=>{
  if(typeof begin!=='function'||typeof status!=='function')return;
  const start=document.getElementById('start');
  const btn=document.createElement('button');btn.id='recoverListening';btn.className='secondary';btn.textContent='↻ 恢复监听';
  btn.style.cssText='width:100%;margin-top:10px;display:none';start.insertAdjacentElement('afterend',btn);
  let pending=null,watch=null,attempt=0,foregroundGeneration=0,recovering=false,lastResultAt=0;
  const baseBegin=begin;
  function cancelTimers(){clearTimeout(pending);clearTimeout(watch);pending=watch=null}
  function render(){btn.style.display=(want&&!document.hidden)?'block':'none';btn.textContent=recovering?'↻ 正在恢复…':'↻ 恢复监听'}
  function retire(){
    const old=recognition;recognition=null;busy=false;
    if(old){old.onstart=old.onend=old.onresult=old.onerror=null;try{old.abort()}catch(e){}}
  }
  function recover(reason){
    if(!want||playing||document.hidden)return;
    const generation=++foregroundGeneration;cancelTimers();recovering=true;attempt++;
    status('正在恢复监听 · '+reason);render();retire();
    pending=setTimeout(()=>{
      if(generation!==foregroundGeneration||!want||playing||document.hidden)return;
      try{baseBegin()}catch(e){status('恢复失败，请点击「恢复监听」',true)}
      watch=setTimeout(()=>{
        if(generation!==foregroundGeneration||!want||document.hidden)return;
        recovering=false;render();
        if(!busy)status('未能启动，请点击「恢复监听」',true);
        else status('已请求监听；若无法识别，请点击「恢复监听」');
      },4200);
    },250);
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){++foregroundGeneration;cancelTimers();recovering=false;if(want&&!playing){retire();status('已切到后台 · 返回时尝试恢复')}render()}
    else if(want&&!playing)recover('返回应用');
  });
  window.addEventListener('pageshow',e=>{if(e.persisted&&want&&!playing)recover('页面恢复')});
  btn.addEventListener('click',()=>{if(!want){start.click();return}recover('手动重建')});
  start.addEventListener('click',()=>{if(!want){++foregroundGeneration;cancelTimers();recovering=false;retire()}render()});
  const baseStatus=status;
  status=function(t,err=false){baseStatus(t,err);render()};
  // This button intentionally stays accessible while listening: iOS may show
  // an active speech session that no longer produces recognition results.
  render();
})();

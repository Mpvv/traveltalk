/* TravelTalk V1.4 foreground recovery patch for V1.3. Load after original inline script. */
(()=>{
  if(typeof begin!=='function'||typeof status!=='function')return;
  let generation=0, recoveryTimer=null, retryTimer=null, lastResult=0, restartInProgress=false;
  const originalBegin=begin;
  function setRecoveryMessage(message){status(message);}
  function retire(){
    generation++;
    const old=recognition;
    recognition=null;
    busy=false;
    if(old){
      old.onstart=old.onresult=old.onerror=old.onend=null;
      try{old.abort()}catch(e){}
    }
  }
  function recover(reason){
    if(!want||playing||document.hidden)return;
    clearTimeout(recoveryTimer);
    clearTimeout(retryTimer);
    restartInProgress=true;
    setRecoveryMessage('正在恢复监听 · '+reason);
    retire();
    const token=generation;
    recoveryTimer=setTimeout(()=>{
      if(token!==generation||!want||playing||document.hidden)return;
      try{originalBegin()}catch(e){status('自动恢复失败，请点停止再开始',true)}
      restartInProgress=false;
      // If start never fires, allow one more clean restart; no infinite retry loop.
      retryTimer=setTimeout(()=>{
        if(token!==generation||!want||playing||document.hidden)return;
        if(!busy){status('监听未恢复，请点击「停止监听」后再点击开始',true)}
      },3500);
    },350);
  }
  // Existing V1.3 code may keep busy=true after iOS suspends its speech session.
  // On foregrounding, discard that stale session and create a fresh one.
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      clearTimeout(recoveryTimer);
      clearTimeout(retryTimer);
      if(want&&!playing)setRecoveryMessage('已切到后台 · 返回后尝试恢复');
    }else if(want&&!playing){recover('返回应用')}
  });
  window.addEventListener('pageshow',e=>{if(e.persisted&&want&&!playing)recover('页面恢复')});
  window.addEventListener('focus',()=>{
    if(want&&!playing&&!document.hidden&&!busy&&!restartInProgress)recover('窗口激活');
  });
  // Explicit one-tap recovery is available even when iOS denies automatic restart.
  const btn=document.createElement('button');
  btn.id='recoverListening';btn.className='secondary';btn.textContent='↻ 一键恢复监听';
  btn.style.cssText='width:100%;margin-top:10px;display:none';
  document.getElementById('start').insertAdjacentElement('afterend',btn);
  btn.addEventListener('click',()=>{
    if(!want){document.getElementById('start').click();return}
    recover('手动恢复');
  });
  const toggle=document.getElementById('start');
  toggle.addEventListener('click',()=>{
    if(!want){clearTimeout(recoveryTimer);clearTimeout(retryTimer);retire();btn.style.display='none'}
    else{btn.style.display='block'}
  });
  const oldStatus=status;
  status=function(t,err=false){oldStatus(t,err);if(want)btn.style.display='block'};
  // Don't interrupt speech synthesis; when playback ends V1.3 resumes recognition.
})();

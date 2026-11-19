/* TravelTalk V1.5: translation validation and common travel phrases. */
(()=>{
  const dictionary = new Map(Object.entries({
    'こんにちは':'你好。','こんばんは':'晚上好。','おはようございます':'早上好。','ありがとうございます':'非常感谢。','ありがとう':'谢谢。','どうもありがとうございます':'非常感谢。',
    'すみません':'不好意思。','すいません':'不好意思。','ごめんなさい':'对不起。','お願いします':'拜托了。','よろしくお願いします':'请多关照。',
    'はい':'是的。','いいえ':'不是。','大丈夫です':'没关系。','わかりました':'明白了。','わかりません':'我不明白。',
    'お会計お願いします':'麻烦结账。','お水をお願いします':'请给我水。','予約しています':'我有预约。',
    '何名様ですか':'请问几位？','お名前をお願いします':'请问您的姓名？','少々お待ちください':'请稍等。',
    'いらっしゃいませ':'欢迎光临。','こちらへどうぞ':'请往这边走。','失礼します':'打扰了。',
    'いただきます':'我开动了。','ごちそうさまでした':'谢谢款待。','おいしいです':'很好吃。',
    'またお願いします':'下次再麻烦您。','おやすみなさい':'晚安。','さようなら':'再见。'
  }));
  const cache = new Map();
  const normalize = s => String(s||'').normalize('NFKC').trim().replace(/[。！？!?\s]+$/g,'').replace(/\s+/g,'');
  function suspicious(src,out,from,to){
    if(!out || typeof out!=='string')return true;
    const t=out.trim();
    if(!t || /^(?:MYMEMORY WARNING|QUERY LENGTH LIMIT|PLEASE SELECT|INVALID LANGUAGE|ERROR|NULL|UNDEFINED)/i.test(t))return true;
    if(/<[^>]*>|https?:\/\//i.test(t))return true;
    if(/(?:[A-Za-z]{3,}\s+){3,}/.test(t) && to.startsWith('zh'))return true;
    if(to.startsWith('zh') && /[ぁ-ゟァ-ヿ]/.test(t))return true;
    if(from.startsWith('ja') && to.startsWith('zh') && normalize(src).length<=14){
      if(t.length>Math.max(22,normalize(src).length*3.5))return true;
      if(/[A-Za-z]{4,}/.test(t))return true;
    }
    return false;
  }
  async function googleTranslate(text,from,to){
    const src=from.toLowerCase().startsWith('zh')?'zh-CN':from.split('-')[0];
    const dst=to.toLowerCase().startsWith('zh')?'zh-CN':to.split('-')[0];
    const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl='+encodeURIComponent(src)+'&tl='+encodeURIComponent(dst)+'&dt=t&q='+encodeURIComponent(text);
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
    try{const r=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!r.ok)throw Error('翻译服务不可用');const j=await r.json();if(!Array.isArray(j?.[0]))throw Error('翻译返回异常');return j[0].map(x=>Array.isArray(x)?x[0]||'':'').join('').trim()}finally{clearTimeout(timer)}
  }
  async function memoryTranslate(text,from,to){
    const src=from.toLowerCase().startsWith('zh')?'zh-CN':from.split('-')[0];
    const dst=to.toLowerCase().startsWith('zh')?'zh-CN':to.split('-')[0];
    const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(text.slice(0,450))+'&langpair='+encodeURIComponent(src+'|'+dst);
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
    try{const r=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!r.ok)throw Error('备用服务不可用');const j=await r.json();if(Number(j.responseStatus)!==200)throw Error('备用服务限额或错误');return String(j.responseData?.translatedText||'').trim()}finally{clearTimeout(timer)}
  }
  translate=async function(text,from,to){
    const raw=String(text||'').trim();if(!raw)throw Error('没有识别到文字');
    const key=from+'|'+to+'|'+raw;
    if(cache.has(key))return cache.get(key);
    if(from.startsWith('ja')&&to.startsWith('zh')){
      const local=dictionary.get(normalize(raw));if(local){cache.set(key,local);return local}
    }
    const failures=[];
    for(const provider of [googleTranslate,memoryTranslate]){
      try{const result=await provider(raw,from,to);if(suspicious(raw,result,from,to))throw Error('译文异常');
        cache.set(key,result);if(cache.size>150)cache.delete(cache.keys().next().value);return result;
      }catch(e){failures.push(e.message)}
    }
    throw Error('在线译文不可靠，请核对原文或重试');
  };
})();

import {loadConfig,rpc,message} from './contact-api.js';
const form=document.querySelector('#contact-form'),status=document.querySelector('#contact-status'),submit=form.querySelector('button[type=submit]');
let config,requestId=crypto.randomUUID(),lastPayload=null;
loadConfig().then(c=>{config=c;submit.disabled=false;status.textContent='Demonstração conectada ao Vereda. Use somente os dados fictícios indicados.';}).catch(e=>{status.textContent=message(e);});
form.addEventListener('submit',async e=>{e.preventDefault();if(!config||submit.disabled)return;if(!form.reportValidity())return;const f=new FormData(form);const payload={p_request_id:requestId,p_name:f.get('name').trim(),p_channel:'email',p_contact:f.get('contact').trim(),p_area:f.get('area'),p_ack:f.get('ack')==='on',p_website:f.get('website')||''};
 if(lastPayload && JSON.stringify(payload)!==JSON.stringify(lastPayload)){status.textContent='Para evitar duplicidade após uma tentativa sem confirmação, mantenha os mesmos dados ou recarregue a página.';return;}lastPayload=payload;
 submit.disabled=true;status.textContent='Enviando ao Vereda…';
 try{const result=await rpc(config,'vereda_submit_contact',payload);if(!result.received||!result.protocol)throw new Error('INVALID_RESPONSE');status.textContent='Contato de teste recebido no Vereda. Protocolo: '+result.protocol+'. Nenhum e-mail ou mensagem foi enviado.';form.querySelectorAll('input,select,button').forEach(x=>x.disabled=true);status.focus();}
 catch(err){status.textContent=message(err);submit.disabled=false;if(/INVALID_INPUT|DEMO_DATA_ONLY|INTAKE_DISABLED|RATE_LIMIT/.test(err.message))lastPayload=null;}
});

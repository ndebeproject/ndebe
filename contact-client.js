// Used only on the enabled contact page. Configuration contains public values, never API secrets.
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const fields = form.querySelector('fieldset');
  const submit = form.querySelector('button[type=submit]');
  const status = document.getElementById('contact-status');
  const config = window.NDEBE_CONTACT;
  let busy = false;
  let pending = null;
  let widget;
  if (!config?.endpoint || !config?.sitekey) return;

  fields.disabled = false;
  submit.disabled = true;

  window.ndebeContactReady = () => {
    widget = window.turnstile.render('#contact-challenge', {
      sitekey: config.sitekey, action:'ndebe-contact', theme:'auto',
      callback: () => { submit.disabled = busy; },
      'expired-callback': () => { submit.disabled = true; },
      'error-callback': () => {
        submit.disabled = true;
        status.textContent = 'The spam check could not load. Please retry or email messages@ndebe.org.';
      }
    });
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    const token = window.turnstile.getResponse(widget);
    if (!token) { status.textContent = 'Please complete the spam check.'; return; }
    const values = Object.fromEntries(new FormData(form));
    const payload = Object.fromEntries(['name','email','subject','telephone','message','website'].map(key=>[key, values[key] || '']));
    const fingerprint = JSON.stringify(payload);
    if (pending && Date.now()-pending.started > 23*60*60*1000) {
      status.textContent = 'This earlier sending attempt is too old to retry safely. Please check whether we received it before sending again.';
      return;
    }
    if (!pending || pending.fingerprint !== fingerprint) pending = {fingerprint, started:Date.now(), requestId:crypto.randomUUID()};
    busy = true;
    fields.disabled = true;
    submit.disabled = true;
    status.textContent = 'Sending your message…';
    try {
      const response = await fetch(config.endpoint, {
        method:'POST', credentials:'omit', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...payload, requestId:pending.requestId, token}), signal:AbortSignal.timeout(30000)
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        status.textContent = result.code === 'rate_limit'
          ? 'Too many attempts. Please wait a minute before trying again.'
          : 'We could not confirm sending. Your message is still here; complete the spam check and retry without editing it to avoid a duplicate.';
        return;
      }
      pending = null;
      form.reset();
      status.textContent = 'Thank you. Your message has been submitted. We’ll reply using the contact information you provided.';
      status.focus();
    } catch {
      status.textContent = 'We could not confirm sending. Your message is still here. Retry without editing it to avoid sending a duplicate.';
    } finally {
      busy = false;
      fields.disabled = false;
      submit.disabled = true;
      window.turnstile.reset(widget);
      // Keep the draft editable while a fresh challenge enables sending. No browser storage.
    }
  });
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=ndebeContactReady&render=explicit';
  script.async = true;
  script.onerror = () => { status.textContent = 'The spam check could not load. Please email messages@ndebe.org.'; };
  document.head.append(script);
})();

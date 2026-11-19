// Supabase bulut qatlami: dasturning localStorage kalitlarini hisob bo'yicha bulutda saqlaydi.
(function () {
  var KEYS = ['bsb_chsb_archive_v3', 'bsb_chsb_students_db_v3', 'bsb_chsb_protected_v3'];
  var cache = {}, pending = {}, timer = null, sb = null, user = null;
  var P = Storage.prototype, rawGet = P.getItem, rawSet = P.setItem, rawDel = P.removeItem;
  var mine = function (k) { return KEYS.indexOf(k) > -1; };

  P.getItem = function (k) { return mine(k) ? (k in cache ? cache[k] : null) : rawGet.call(this, k); };
  P.setItem = function (k, v) { if (!mine(k)) return rawSet.call(this, k, v); cache[k] = String(v); pending[k] = 1; schedule(); };
  P.removeItem = function (k) { if (!mine(k)) return rawDel.call(this, k); delete cache[k]; pending[k] = 0; schedule(); };

  var badge = document.createElement('div');
  badge.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:9998;font:12px sans-serif;background:#183661;color:#fff;padding:4px 10px;border-radius:12px;opacity:.9';
  function status(t) { badge.textContent = t; }

  function schedule() { status('☁ Saqlanmoqda...'); clearTimeout(timer); timer = setTimeout(flush, 700); }
  async function flush() {
    clearTimeout(timer);
    var keys = Object.keys(pending); if (!keys.length || !user) return;
    pending = {};
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], r;
      if (k in cache) r = await sb.from('user_data').upsert({ user_id: user.id, key: k, value: cache[k], updated_at: new Date().toISOString() });
      else r = await sb.from('user_data').delete().eq('user_id', user.id).eq('key', k);
      if (r.error) { pending[k] = 1; status('⚠ Saqlashda xato'); console.error(r.error); return; }
    }
    status('☁ Saqlandi');
  }
  window.addEventListener('beforeunload', function (e) { if (Object.keys(pending).length) { flush(); e.preventDefault(); e.returnValue = ''; } });

  function loginUI() {
    return new Promise(function (resolve) {
      var o = document.createElement('div');
      o.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-family:sans-serif';
      o.innerHTML = '<div style="background:#fff;padding:28px;border:1px solid #d1d5db;border-radius:10px;width:320px;box-shadow:0 10px 25px rgba(0,0,0,.1)">' +
        '<h2 style="margin:0 0 4px;color:#183661">BSB / CHSB Baholash</h2><p style="margin:0 0 16px;font-size:13px;color:#555">Hisobingizga kiring</p>' +
        '<input id="cl_e" type="email" placeholder="Email" style="width:100%;box-sizing:border-box;padding:8px;margin-bottom:8px;border:1px solid #999;border-radius:6px">' +
        '<input id="cl_p" type="password" placeholder="Parol (kamida 6 belgi)" style="width:100%;box-sizing:border-box;padding:8px;margin-bottom:10px;border:1px solid #999;border-radius:6px">' +
        '<button id="cl_in" style="width:100%;padding:9px;background:#183661;color:#fff;border:0;border-radius:6px;cursor:pointer">Kirish</button>' +
        '<button id="cl_up" style="width:100%;padding:9px;margin-top:6px;background:#facc15;color:#183661;border:0;border-radius:6px;cursor:pointer">Ro\'yxatdan o\'tish</button>' +
        '<p id="cl_m" style="font-size:12px;color:#b91c1c;margin:10px 0 0"></p></div>';
      document.body.appendChild(o);
      var v = function (id) { return document.getElementById(id).value.trim(); }, m = document.getElementById('cl_m');
      async function go(signup) {
        m.textContent = '';
        var f = signup ? sb.auth.signUp : sb.auth.signInWithPassword;
        var r = await f.call(sb.auth, { email: v('cl_e'), password: v('cl_p') });
        if (r.error) { m.textContent = r.error.message; return; }
        if (!r.data.session) { m.style.color = '#166534'; m.textContent = 'Emailingizga tasdiqlash xati yuborildi. Tasdiqlab, qayta kiring.'; return; }
        o.remove(); resolve(r.data.session);
      }
      document.getElementById('cl_in').onclick = function () { go(false); };
      document.getElementById('cl_up').onclick = function () { go(true); };
    });
  }

  window.BSBCloud = {
    logout: async function () {
      if (!confirm('Hisobdan chiqasizmi? Ma\'lumotlar bulutda saqlanib qoladi.')) return;
      await flush(); await sb.auth.signOut(); location.reload();
    }
  };

  window.cloudReady = (async function () {
    sb = window.supabase.createClient(window.BSB_CONFIG.url, window.BSB_CONFIG.key);
    var s = (await sb.auth.getSession()).data.session || await loginUI();
    user = s.user;
    var r = await sb.from('user_data').select('key,value');
    if (r.error) { alert('Ma\'lumotlarni yuklashda xato: ' + r.error.message); }
    (r.data || []).forEach(function (row) { if (mine(row.key)) cache[row.key] = row.value; });
    document.body.appendChild(badge); status('☁ ' + user.email);
  })();
})();

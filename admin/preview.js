// Live preview for the editor: draws each page with the same renderer as the published site (render.js),
// styled with the site's own CSS (preview.css). Page fragments and photos are read from the private
// source repo with the editor's own GitHub sign-in, so no site password is needed here.
(function () {
  var R = window.BVRender, REPO = 'ShivaRajbhandari/babevote-source';
  var h = window.h, createClass = window.createClass;
  var token = function () { try { return (JSON.parse(localStorage.getItem('decap-cms-user') || 'null') || {}).token || ''; } catch (e) { return ''; } };
  var gh = function (path, as) {
    return fetch('https://api.github.com/repos/' + REPO + '/contents/' + path.split('/').map(encodeURIComponent).join('/') + '?ref=main',
      {headers: {Authorization: 'Bearer ' + token(), Accept: 'application/vnd.github.raw+json'}})
      .then(function (r) { if (!r.ok) throw new Error(path + ' ' + r.status); return as === 'blob' ? r.blob() : r.text(); });
  };
  var fragCache = {}, imgCache = {};
  var fragment = function (slug) {
    if (!fragCache[slug]) fragCache[slug] = gh('content/pages/' + slug + '.html').then(function (t) { return t.replace(/^---\n[\s\S]*?\n---\n+/, '').trim(); });
    return fragCache[slug];
  };
  var imageUrl = function (src) {
    if (!imgCache[src]) imgCache[src] = gh('static' + src, 'blob').then(function (b) { return URL.createObjectURL(b); });
    return imgCache[src];
  };
  var js = function (v) { return v && v.toJS ? v.toJS() : v; };

  // photos and thumbnails live in the repo (static/...); swap them in after each render
  function hydrate(el, getAsset) {
    Array.prototype.forEach.call(el.querySelectorAll('img[srcset]'), function (im) { im.removeAttribute('srcset'); im.removeAttribute('sizes'); });
    Array.prototype.forEach.call(el.querySelectorAll('img[src^="/"]'), function (im) {
      var src = im.getAttribute('src'); if (im.dataset.bv === src) return; im.dataset.bv = src;
      var asset = /^\/uploads\//.test(src) && getAsset ? getAsset(src) : null;
      var url = asset && String(asset) !== src ? String(asset) : null;
      if (url && /^(blob:|data:|https?:)/.test(url)) { im.src = url; return; }
      imageUrl(src).then(function (u) { im.src = u; }).catch(function () {});
    });
  }

  // kind -> how to turn the entry being edited into <main> HTML (and which fragments it needs)
  var KINDS = {
    blog: {need: [], html: function (d) { var p = Object.assign({}, d); p.date = p.date || new Date(); return R.post(p, null, null); }},
    pages: {need: [], html: function (d) { return R.custom(d, true); }},
    builtin_pages: {need: [], html: function (d) { return d.body || ''; }},
    people: {need: ['people-top'], html: function (d, f) { return R.people(d, f['people-top']); }},
    press: {need: ['press-top'], html: function (d, f) { return R.press(d, f['press-top']); }},
    history: {need: ['about-top', 'about-bottom'], html: function (d, f) { return R.about(d, f['about-top'], f['about-bottom']); }}
  };

  var make = function (kind) {
    var K = KINDS[kind];
    return createClass({
      getInitialState: function () { return {frags: K.need.length ? null : {}, err: ''}; },
      componentDidMount: function () {
        var self = this;
        Promise.all(K.need.map(fragment)).then(function (r) { var f = {}; K.need.forEach(function (k, i) { f[k] = r[i]; }); self.setState({frags: f}); })
          .catch(function (e) { self.setState({err: 'Could not load the page layout (' + e.message + '). Try signing out and back in.'}); });
      },
      render: function () {
        var note = function (t) { return h('p', {style: {font: '16px system-ui', padding: '24px'}}, t); };
        if (this.state.err) return note(this.state.err);
        if (!this.state.frags) return note('Loading preview…');
        var data = js(this.props.entry.get('data')) || {}, html;
        try { html = K.html(data, this.state.frags); } catch (e) { return note('Preview could not be drawn yet: ' + e.message); }
        var getAsset = this.props.getAsset;
        return h('div', {className: 'bv-preview', dangerouslySetInnerHTML: {__html: html}, ref: function (el) { if (el) hydrate(el, function (p) { try { return getAsset(p); } catch (e) { return null; } }); }});
      }
    });
  };

  CMS.registerPreviewStyle('/babevote/admin/preview.css');
  Object.keys(KINDS).forEach(function (k) { CMS.registerPreviewTemplate(k, make(k)); });
})();

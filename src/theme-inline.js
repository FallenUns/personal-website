(function () {
  var t = null;
  try { t = localStorage.getItem('theme'); } catch (e) {}
  if (t !== 'dark' && t !== 'light') {
    var h = new Date().getHours();
    t = h >= 17 || h < 5 ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = t;
})();

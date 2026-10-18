/* EnadeX — alternância de tema. Sem escolha salva, segue o sistema. */
(function () {
  var KEY = "enx-theme", root = document.documentElement;
  try { var saved = localStorage.getItem(KEY); if (saved) root.dataset.theme = saved; } catch (e) {}
  function isDark() {
    return root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function sync() {
    document.querySelectorAll("[data-enx-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(isDark()));
      b.querySelector("span").textContent = isDark() ? "Tema claro" : "Tema escuro";
    });
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-enx-theme-toggle]");
    if (!b) return;
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem(KEY, root.dataset.theme); } catch (e) {}
    sync();
  });
  document.addEventListener("DOMContentLoaded", sync);
})();

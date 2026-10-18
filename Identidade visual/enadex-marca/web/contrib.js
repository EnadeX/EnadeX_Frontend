/* EnadeX — desenha gráficos de contribuição a partir de data-contrib='[["Variável", valor, "other"?], ...]'.
   Valores já ordenados pelo tamanho do efeito. Sinal sempre visível; menos verdadeiro (U+2212). */
(function () {
  function fmt(v) { return (v < 0 ? "\u2212" : "+") + Math.abs(v).toFixed(2).replace(".", ","); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  document.querySelectorAll("[data-contrib]").forEach(function (el) {
    var rows = JSON.parse(el.getAttribute("data-contrib"));
    var max = Math.max.apply(null, rows.map(function (r) { return Math.abs(r[1]); }));
    el.setAttribute("role", "list");
    el.innerHTML = rows.map(function (r) {
      var v = r[1], cls = r[2] === "other" ? "enx-other" : v < 0 ? "enx-neg" : "enx-pos";
      var w = (Math.abs(v) / max * 78).toFixed(1) + "%";
      var bar = '<span class="enx-contrib-bar" style="width:' + w + '"></span>';
      var val = "<span>" + fmt(v) + "</span>";
      return '<div class="' + cls + '" role="listitem" style="display:contents">' +
        '<span class="enx-contrib-label">' + esc(r[0]) + "</span>" +
        '<span class="enx-contrib-half enx-contrib-neg">' + (v < 0 ? val + bar : "") + "</span>" +
        '<span class="enx-contrib-half">' + (v >= 0 ? bar + val : "") + "</span></div>";
    }).join("");
  });
})();

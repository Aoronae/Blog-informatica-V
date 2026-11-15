// BLOG INFORMÁTICA V — CLIENT SIDE
function getTemarioData() {
  return window.TEMARIO_DATA || (typeof TEMARIO_DATA !== 'undefined' ? TEMARIO_DATA : null);
}

function getProgramasData() {
  return window.PROGRAMAS_DATA || (typeof PROGRAMAS_DATA !== 'undefined' ? PROGRAMAS_DATA : null);
}

function startApp() {
  try { initTabs(); } catch (e) { console.error("Error initTabs:", e); }
  try { initTemario(); } catch (e) { console.error("Error initTemario:", e); }
  try { initProgramas(); } catch (e) { console.error("Error initProgramas:", e); }
  try { initSearch(); } catch (e) { console.error("Error initSearch:", e); }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}

function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  const panes = document.querySelectorAll(".tab-pane");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");
      tabs.forEach(t => t.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
      }
    });
  });
}

function initTemario() {
  const unitsNavList = document.getElementById("units-nav-list");
  const unitsContainer = document.getElementById("units-container");
  if (!unitsContainer) return;

  const temario = getTemarioData();
  if (!temario || !temario.unidades) {
    unitsContainer.innerHTML = "<p>No se encontraron datos del temario.</p>";
    return;
  }

  const unidades = temario.unidades;
  unitsNavList.innerHTML = "";
  unitsContainer.innerHTML = "";

  unidades.forEach((u, idx) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = `unit-nav-btn ${idx === 0 ? "active" : ""}`;
    const num = u.numero || (idx + 1);
    const numClean = String(num).replace("Unidad ", "");
    const tit = u.titulo || "";
    btn.innerHTML = `<span class="unit-badge-small">U${numClean}</span> ${escapeHtml(tit)}`;
    btn.onclick = () => scrollToUnit(`unit-section-${numClean}`, btn);
    li.appendChild(btn);
    unitsNavList.appendChild(li);

    const card = document.createElement("div");
    card.className = "unit-card";
    card.id = `unit-section-${numClean}`;

    let temasHtml = "";
    if (u.temas && Array.isArray(u.temas)) {
      u.temas.forEach(t => {
        const subtema = t.subtema || "";
        const titulo = t.titulo || "";
        const contenido = t.contenido || t.desarrollo || "";
        const searchStr = `${subtema.toLowerCase()} ${titulo.toLowerCase()} ${contenido.toLowerCase()}`;

        let subpuntosHtml = "";
        if (t.subpuntos && Array.isArray(t.subpuntos) && t.subpuntos.length > 0) {
          subpuntosHtml = "<ul>" + t.subpuntos.map(sp => `<li>${escapeHtml(sp)}</li>`).join("") + "</ul>";
        }

        temasHtml += `
          <div class="tema-item" data-tema="${escapeHtml(searchStr)}">
            <h4>${escapeHtml(subtema)}${titulo ? " — " + escapeHtml(titulo) : ""}</h4>
            <p>${escapeHtml(contenido).replace(/\n/g, "<br>")}</p>
            ${subpuntosHtml}
          </div>
        `;
      });
    }

    card.innerHTML = `
      <div class="unit-card-header">
        <span class="unit-num-pill">Unidad ${numClean}</span>
        <h3>${escapeHtml(tit)}</h3>
      </div>
      <div class="temas-list">
        ${temasHtml}
      </div>
    `;

    unitsContainer.appendChild(card);
  });
}

function scrollToUnit(elementId, clickedBtn) {
  const target = document.getElementById(elementId);
  if (target) {
    const yOffset = -140;
    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });

    document.querySelectorAll(".unit-nav-btn").forEach(b => b.classList.remove("active"));
    if (clickedBtn) clickedBtn.classList.add("active");
  }
}

function initProgramas() {
  const gridTodos = document.getElementById("grid-todos");
  const gridClase = document.getElementById("grid-clase");
  const gridVersionB = document.getElementById("grid-version-b");

  const progData = getProgramasData();
  if (!progData) {
    if (gridTodos) gridTodos.innerHTML = "<p>No se encontraron datos de programas.</p>";
    return;
  }

  const projsClase = progData.programas_clase || [];
  const projsB = progData.programas_b || [];
  const projsTodos = progData.todos_los_programas || (projsClase.concat(projsB));

  renderGrid(gridTodos, projsTodos);
  renderGrid(gridClase, projsClase);
  renderGrid(gridVersionB, projsB);

  // Filtros de pestaña "Todos los Ejercicios"
  const filterBtns = document.querySelectorAll(".btn-filter");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.getAttribute("data-filter");
      const cards = gridTodos ? gridTodos.querySelectorAll(".program-card") : [];
      cards.forEach(c => {
        if (f === "all") {
          c.style.display = "flex";
        } else if (f === "clase") {
          c.style.display = c.getAttribute("data-es-b") === "false" ? "flex" : "none";
        } else if (f === "b") {
          c.style.display = c.getAttribute("data-es-b") === "true" ? "flex" : "none";
        }
      });
    });
  });
}

function renderGrid(container, list) {
  if (!container) return;
  container.innerHTML = "";
  if (!list || list.length === 0) {
    container.innerHTML = "<p>No hay programas para mostrar.</p>";
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "program-card";
    const nombre = p.nombre || "Programa";
    const desc = p.descripcion || "";
    card.setAttribute("data-search", `${nombre.toLowerCase()} ${desc.toLowerCase()}`);
    card.setAttribute("data-es-b", p.es_version_b ? "true" : "false");

    const badgeClass = p.es_version_b ? "card-category-badge version-b" : "card-category-badge";
    const badgeText = p.version || (p.es_version_b ? "Versión B (Alumno)" : "Versión Original (Clase)");

    const pdfHref = p.pdf_url || p.pdf_local || "#";
    const exeHref = p.exe_url || p.exe_local;

    const btnFicha = document.createElement("button");
    btnFicha.className = "btn-inscribir-style";
    btnFicha.textContent = "Ficha Técnica y Código";
    btnFicha.onclick = () => openModal(p);

    card.innerHTML = `
      <div class="card-top">
        <div class="card-badge-row">
          <span class="${badgeClass}">${badgeText}</span>
        </div>
        <h3 class="program-title">${escapeHtml(nombre)}</h3>
        <p class="program-desc">${escapeHtml(desc)}</p>
      </div>
      <div>
        <div class="card-meta">
          <span>Proyecto Visual Basic 6.0</span>
          <span>Documentación Oficial</span>
        </div>
        <div class="card-actions-col">
          <div class="card-sub-actions">
            <a href="${pdfHref}" target="_blank" class="btn-sub-pdf" title="Ver Documentación en PDF">PDF</a>
            ${exeHref ? `<a href="${exeHref}" download class="btn-sub-exe" title="Descargar ejecutable .EXE">EXE</a>` : ''}
          </div>
        </div>
      </div>
    `;

    const actionsCol = card.querySelector(".card-actions-col");
    actionsCol.insertBefore(btnFicha, actionsCol.firstChild);

    container.appendChild(card);
  });
}

window.openModal = function (p) {
  document.getElementById("modal-category").innerText = p.version || p.categoria || "";
  document.getElementById("modal-title").innerText = p.nombre || "";
  document.getElementById("modal-desc").innerText = p.descripcion || "";

  const featuresList = document.getElementById("modal-features");
  featuresList.innerHTML = "";
  if (p.puntos_clave && Array.isArray(p.puntos_clave)) {
    p.puntos_clave.forEach(pt => {
      const li = document.createElement("li");
      li.innerText = pt;
      featuresList.appendChild(li);
    });
  }

  document.getElementById("modal-proc1-title").innerText = (p.proceso_1 && p.proceso_1.nombre) ? p.proceso_1.nombre : "Proceso 1";
  document.getElementById("modal-proc1-code").innerText = (p.proceso_1 && p.proceso_1.pseudocodigo) ? p.proceso_1.pseudocodigo : "// Algoritmo implementado";

  document.getElementById("modal-proc2-title").innerText = (p.proceso_2 && p.proceso_2.nombre) ? p.proceso_2.nombre : "Proceso 2";
  document.getElementById("modal-proc2-code").innerText = (p.proceso_2 && p.proceso_2.pseudocodigo) ? p.proceso_2.pseudocodigo : "// Algoritmo implementado";

  const codeContainer = document.getElementById("modal-code-container");
  codeContainer.innerHTML = "";
  if (p.archivos_codigo && p.archivos_codigo.length > 0) {
    p.archivos_codigo.forEach(cfile => {
      const viewer = document.createElement("div");
      viewer.className = "code-viewer";

      const header = document.createElement("div");
      header.className = "code-viewer-header";
      header.innerHTML = `<span class="code-file-tag">${escapeHtml(cfile.archivo)}</span>`;

      const btnCopy = document.createElement("button");
      btnCopy.className = "btn-copy-code";
      btnCopy.textContent = "Copiar Código";
      btnCopy.onclick = () => {
        navigator.clipboard.writeText(cfile.codigo);
        alert("Código copiado al portapapeles");
      };
      header.appendChild(btnCopy);

      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = cfile.codigo;
      pre.appendChild(code);

      viewer.appendChild(header);
      viewer.appendChild(pre);
      codeContainer.appendChild(viewer);
    });
  } else {
    codeContainer.innerHTML = "<p>Código fuente disponible en el archivo del proyecto.</p>";
  }

  const btnPdf = document.getElementById("modal-btn-pdf");
  const btnExe = document.getElementById("modal-btn-exe");

  btnPdf.href = p.pdf_url || p.pdf_local || "#";
  if (p.exe_url || p.exe_local) {
    btnExe.style.display = "inline-flex";
    btnExe.href = p.exe_url || p.exe_local;
  } else {
    btnExe.style.display = "none";
  }

  document.getElementById("modal-backdrop").classList.remove("hidden");
};

function escapeHtml(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.closeModal = function () {
  document.getElementById("modal-backdrop").classList.add("hidden");
};

function initSearch() {
  const temarioInput = document.getElementById("temario-search");
  const temarioClear = document.getElementById("clear-temario-search");
  if (temarioInput && temarioClear) {
    temarioInput.addEventListener("input", () => {
      const q = temarioInput.value.toLowerCase().trim();
      temarioClear.classList.toggle("visible", q.length > 0);
      const items = document.querySelectorAll(".tema-item");
      items.forEach(it => {
        const match = it.getAttribute("data-tema").includes(q);
        it.style.display = match ? "block" : "none";
      });
    });
    temarioClear.addEventListener("click", () => {
      temarioInput.value = "";
      temarioInput.dispatchEvent(new Event("input"));
    });
  }

  setupGridFilter("todos-search", "clear-todos-search", "grid-todos");
  setupGridFilter("clase-search", "clear-clase-search", "grid-clase");
  setupGridFilter("version-b-search", "clear-version-b-search", "grid-version-b");
}

function setupGridFilter(inputId, clearId, gridId) {
  const input = document.getElementById(inputId);
  const clear = document.getElementById(clearId);
  const grid = document.getElementById(gridId);
  if (!input || !grid) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    clear.classList.toggle("visible", q.length > 0);
    const cards = grid.querySelectorAll(".program-card");
    cards.forEach(c => {
      const match = c.getAttribute("data-search").includes(q);
      c.style.display = match ? "flex" : "none";
    });
  });

  clear.addEventListener("click", () => {
    input.value = "";
    input.dispatchEvent(new Event("input"));
  });
}

window.copyDriveUrl = function () {
  const input = document.getElementById("drive-url-input");
  input.select();
  document.execCommand("copy");
  alert("Enlace de Google Drive copiado al portapapeles.");
};

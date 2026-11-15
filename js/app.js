// BLOG INFORMÁTICA V — CLIENT SIDE
document.addEventListener("DOMContentLoaded", function () {
  initTabs();
  initTemario();
  initProgramas();
  initSearch();
});

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

  if (!window.TEMARIO_DATA || !window.TEMARIO_DATA.unidades) {
    unitsContainer.innerHTML = "<p>No se encontraron datos del temario.</p>";
    return;
  }

  const unidades = window.TEMARIO_DATA.unidades;
  unitsNavList.innerHTML = "";
  unitsContainer.innerHTML = "";

  unidades.forEach((u, idx) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = `unit-nav-btn ${idx === 0 ? "active" : ""}`;
    btn.innerHTML = `<span class="unit-badge-small">U${u.numero}</span> ${u.titulo}`;
    btn.onclick = () => scrollToUnit(`unit-section-${u.numero}`, btn);
    li.appendChild(btn);
    unitsNavList.appendChild(li);

    const card = document.createElement("div");
    card.className = "unit-card";
    card.id = `unit-section-${u.numero}`;

    let temasHtml = "";
    u.temas.forEach(t => {
      let subpuntosHtml = "";
      if (t.subpuntos && t.subpuntos.length > 0) {
        subpuntosHtml = "<ul>" + t.subpuntos.map(sp => `<li>${sp}</li>`).join("") + "</ul>";
      }

      temasHtml += `
        <div class="tema-item" data-tema="${t.subtema.toLowerCase()} ${t.titulo.toLowerCase()} ${t.desarrollo.toLowerCase()}">
          <h4>${t.subtema} — ${t.titulo}</h4>
          <p>${t.desarrollo}</p>
          ${subpuntosHtml}
        </div>
      `;
    });

    card.innerHTML = `
      <div class="unit-card-header">
        <span class="unit-num-pill">Unidad ${u.numero}</span>
        <h3>${u.titulo}</h3>
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
  const gridClase = document.getElementById("grid-clase");
  const gridVersionB = document.getElementById("grid-version-b");

  if (!window.PROGRAMAS_DATA) {
    gridClase.innerHTML = "<p>No se encontraron datos de programas.</p>";
    return;
  }

  const projsClase = window.PROGRAMAS_DATA.programas_clase || [];
  const projsB = window.PROGRAMAS_DATA.programas_b || [];

  renderGrid(gridClase, projsClase, false);
  renderGrid(gridVersionB, projsB, true);
}

function renderGrid(container, list, isVersionB) {
  container.innerHTML = "";
  if (list.length === 0) {
    container.innerHTML = "<p>No hay programas para mostrar.</p>";
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "program-card";
    card.setAttribute("data-search", `${p.nombre.toLowerCase()} ${p.descripcion.toLowerCase()}`);

    const badgeClass = isVersionB ? "card-category-badge version-b" : "card-category-badge";
    const badgeText = isVersionB ? "Versión B" : "Realizado en Clase";

    const pdfHref = p.pdf_url || p.pdf_local;
    const exeHref = p.exe_url || p.exe_local;

    card.innerHTML = `
      <div class="card-top">
        <span class="${badgeClass}">${badgeText}</span>
        <h3 class="program-title">${p.nombre}</h3>
        <p class="program-desc">${p.descripcion}</p>
      </div>
      <div>
        <div class="card-meta">
          <span>${p.total_archivos} archivos</span>
          <span>${(p.pdf_size / 1024).toFixed(0)} KB PDF</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary" onclick='openModal(${JSON.stringify(p).replace(/'/g, "&#39;")})' style="flex:1;">
            Ficha Técnica
          </button>
          <a href="${pdfHref}" target="_blank" class="btn btn-pdf" title="Ver Documentación Oficial en PDF">
            PDF
          </a>
          ${exeHref ? `<a href="${exeHref}" download class="btn btn-exe" title="Descargar ejecutable .EXE">EXE</a>` : ''}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

window.openModal = function (p) {
  document.getElementById("modal-category").innerText = p.categoria;
  document.getElementById("modal-title").innerText = p.nombre;
  document.getElementById("modal-desc").innerText = p.descripcion;

  const featuresList = document.getElementById("modal-features");
  featuresList.innerHTML = "";
  if (p.puntos_clave) {
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

  const btnPdf = document.getElementById("modal-btn-pdf");
  const btnExe = document.getElementById("modal-btn-exe");

  btnPdf.href = p.pdf_url || p.pdf_local;
  if (p.exe_url || p.exe_local) {
    btnExe.style.display = "inline-flex";
    btnExe.href = p.exe_url || p.exe_local;
  } else {
    btnExe.style.display = "none";
  }

  document.getElementById("modal-backdrop").classList.remove("hidden");
};

window.closeModal = function () {
  document.getElementById("modal-backdrop").classList.add("hidden");
};

function initSearch() {
  const temarioInput = document.getElementById("temario-search");
  const temarioClear = document.getElementById("clear-temario-search");
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

  setupGridFilter("clase-search", "clear-clase-search", "grid-clase");
  setupGridFilter("version-b-search", "clear-version-b-search", "grid-version-b");
}

function setupGridFilter(inputId, clearId, gridId) {
  const input = document.getElementById(inputId);
  const clear = document.getElementById(clearId);
  const grid = document.getElementById(gridId);

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
  alert("Enlace copiado al portapapeles.");
};

// --- Data de demo (simulada) ---
// Este JSON está simplificado y sirve para alimentar las tarjetas y el chart.
// En producción leerías el Excel y construirías una estructura similar.
const ventasSample = [
  {"Fecha":"2025-01-02","ID_Producto":"P001","Nombre_Producto":"Camiseta básica","Categoría":"Ropa","Cantidad":3,"Precio_Unitario":25000,"Total_Venta":75000},
  {"Fecha":"2025-01-05","ID_Producto":"P002","Nombre_Producto":"Jeans slim fit","Categoría":"Ropa","Cantidad":2,"Precio_Unitario":80000,"Total_Venta":160000},
  {"Fecha":"2025-02-10","ID_Producto":"P003","Nombre_Producto":"Tenis deportivos","Categoría":"Calzado","Cantidad":1,"Precio_Unitario":150000,"Total_Venta":150000},
  {"Fecha":"2025-02-15","ID_Producto":"P004","Nombre_Producto":"Reloj elegante","Categoría":"Accesorios","Cantidad":1,"Precio_Unitario":200000,"Total_Venta":200000},
  {"Fecha":"2025-03-03","ID_Producto":"P005","Nombre_Producto":"Gafas de sol","Categoría":"Accesorios","Cantidad":2,"Precio_Unitario":60000,"Total_Venta":120000},
  // puedes duplicar/mezclar para más puntos
];

// -------------------- Registro y JSON de usuarios --------------------
document.addEventListener('DOMContentLoaded', () => {
  // Si estamos en index.html -> registro
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const shopname = document.getElementById('shopname').value.trim();
      if (!username || !shopname) return alert('Completa ambos campos');

      // Guardamos en localStorage como "usuarios" (diccionario JSON)
      let usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
      usuarios[username] = { tienda: shopname, creado: new Date().toISOString() };
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      localStorage.setItem('usuarioActivo', username);
      // Redirige al dashboard
      window.location.href = 'app.html';
    });

    // Botón demo: crea un usuario demo y redirige
    const demoBtn = document.getElementById('demoBtn');
    demoBtn.addEventListener('click', () => {
      const username = 'demo_user';
      const shopname = 'Demo Store';
      let usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
      usuarios[username] = { tienda: shopname, creado: new Date().toISOString() };
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      localStorage.setItem('usuarioActivo', username);
      window.location.href = 'app.html';
    });
  }

  // Si estamos en app.html -> inicializar dashboard SPA
  if (window.location.pathname.endsWith('app.html') || window.location.pathname.endsWith('/')) {
    initApp();
  }
});

// -------------------- Inicialización app.html --------------------
function initApp(){
  // Nav SPA
  document.querySelectorAll('.nav-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const sec = btn.getAttribute('data-section');
      showSection(sec);
    });
  });

  // Mostrar usuario activo
  const userBadge = document.getElementById('userBadge');
  const usuarioActivo = localStorage.getItem('usuarioActivo');
  if (userBadge && usuarioActivo) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
    const tienda = usuarios[usuarioActivo] ? usuarios[usuarioActivo].tienda : '';
    userBadge.textContent = `${usuarioActivo} · ${tienda}`;
  }

  // File inputs (global + dashboard)
  const fileInput = document.getElementById('fileInput');
  const globalFile = document.getElementById('globalFile');

  const onFile = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    alert(`Archivo "${file.name}" cargado. (Simulación)`);
    // Para demo usamos ventasSample. En futuro puedes parsear CSV/XLSX con bibliotecas (SheetJS).
    processVentasData(ventasSample);
  };

  if (fileInput) {
    fileInput.addEventListener('change', (e) => onFile(e.target.files[0]));
  }
  if (globalFile) {
    globalFile.addEventListener('change', (e) => onFile(e.target.files[0]));
  }

  // Perfil: cargar valores
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const usuarioActivoName = localStorage.getItem('usuarioActivo') || '';
  if (profileName) profileName.value = usuarioActivoName;
  if (profileEmail) profileEmail.value = `${usuarioActivoName}@example.com`;

  document.getElementById('saveProfile')?.addEventListener('click', ()=>{
    alert('Perfil guardado (simulado)');
  });

  // Inicializamos datos vacíos
  updateStatsEmpty();

  // Preparar chart
  prepareChart();
  // mostrar dashboard por defecto
  showSection('dashboard');
}

// -------------------- Navegación entre secciones --------------------
function showSection(sectionId){
  document.querySelectorAll('.section').forEach(s=> s.classList.remove('active-section'));
  const sec = document.getElementById(sectionId);
  if (sec) sec.classList.add('active-section');

  const titleMap = {
    dashboard: 'Dashboard Principal',
    proyecciones: 'Proyecciones de Ventas',
    ajustes: 'Ajustes'
  };
  document.getElementById('mainTitle').textContent = titleMap[sectionId] || 'AnalytiShop';
}

// -------------------- Procesar ventas (simulado) --------------------
function processVentasData(ventas){
  // ventas: array de objetos con Total_Venta y Fecha
  const total = ventas.reduce((s, v) => s + (Number(v.Total_Venta) || 0), 0);
  const perdidas = Math.round(total * 0.07); // demo
  const destacados = new Set(ventas.map(v=>v.ID_Producto)).size;

  document.getElementById('statVentas').textContent = `$${numberWithCommas(total)}`;
  document.getElementById('statPerdidas').textContent = `$${numberWithCommas(perdidas)}`;
  document.getElementById('statDestacados').textContent = destacados;
  document.getElementById('statCrecimiento').textContent = '+15%';

  // Proyecciones: llenar panel con valores demo y actualizar chart
  document.getElementById('projIngresos').textContent = `$${numberWithCommas(Math.round(total * 1.12))}`;
  document.getElementById('projCrec').textContent = '+15%';
  document.getElementById('projClientes').textContent = Math.round(total / 4000);

  // Chart: agrupar ventas por mes
  const byMonth = {};
  ventas.forEach(v=>{
    const d = new Date(v.Fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    byMonth[key] = (byMonth[key] || 0) + Number(v.Total_Venta || 0);
  });
  const labels = Object.keys(byMonth).sort();
  const data = labels.map(l=>byMonth[l]);
  updateChart(labels, data);
  showSection('proyecciones');
}

// -------------------- Helpers --------------------
function numberWithCommas(x){
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function updateStatsEmpty(){
  document.getElementById('statVentas').textContent = '$0';
  document.getElementById('statPerdidas').textContent = '$0';
  document.getElementById('statDestacados').textContent = '0';
  document.getElementById('statCrecimiento').textContent = '+0%';
}

// -------------------- Chart.js: preparación y actualización --------------------
let projChart = null;
function prepareChart(){
  const ctx = document.getElementById('projChart').getContext('2d');
  projChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2025-01','2025-02','2025-03'],
      datasets: [{
        label: 'Ventas',
        data: [0,0,0],
        fill:true,
        tension:0.3,
        backgroundColor: 'rgba(0,214,143,0.08)',
        borderColor: 'rgba(0,214,143,0.9)',
        pointRadius:3
      }]
    },
    options: {
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{
        x:{grid:{display:false}, ticks:{color:'#bfcbd4'}},
        y:{grid:{color:'rgba(255,255,255,0.03)'}, ticks:{color:'#bfcbd4'}}
      }
    }
  });
}

function updateChart(labels, data){
  if (!projChart) return;
  projChart.data.labels = labels;
  projChart.data.datasets[0].data = data;
  projChart.update();
}

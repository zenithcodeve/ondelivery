import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://knnnjyeinpbrurrcctya.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtubm5qeWVpbnBicnVycmNjdHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxODc2NTYsImV4cCI6MjA5ODc2MzY1Nn0.0J9XDcFSqgNTSr4Tg8T6s_qJAAJdeW3kr5vPvWUTYZ4';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const audioAlarm = new Audio('https://www.myinstants.com/media/sounds/alarm-alerta.mp3');
audioAlarm.preload = 'auto';
audioAlarm.volume = 0.8;
let soundEnabled = localStorage.getItem('soundEnabled');
if (soundEnabled === null) soundEnabled = 'true';
soundEnabled = soundEnabled === 'true';
let deferredPrompt = null;
let currentUser = null;
let currentProfile = null;
let motorOn = true;
let ordersChannel = null;
let realtimePollInterval = null;
let earningsResetAt = localStorage.getItem('earningsResetAt');

const elements = {
  authSection: document.getElementById('auth-section'),
  noRoleSection: document.getElementById('no-role-section'),
  statusSection: document.getElementById('status-section'),
  statusTitle: document.getElementById('status-title'),
  statusMessage: document.getElementById('status-message'),
  authForm: document.getElementById('auth-form'),
  toggleAuthMode: document.getElementById('toggle-auth-mode'),
  btnAuthAction: document.getElementById('btn-auth-action'),
  fullNameField: document.getElementById('full-name-field'),
  emailInput: document.getElementById('email'),
  passwordInput: document.getElementById('password'),
  fullNameInput: document.getElementById('full-name'),
  btnLogout: document.getElementById('btn-logout'),
  btnInstall: document.getElementById('btn-install'),
  installHint: document.getElementById('install-hint'),
  aliadoView: document.getElementById('aliado-view'),
  aliadoRoleLabel: document.getElementById('aliado-role-label'),
  aliadoPendingList: document.getElementById('aliado-pending-list'),
  aliadoOnwayList: document.getElementById('aliado-onway-list'),
  aliadoDeliveredList: document.getElementById('aliado-delivered-list'),
  aliadoRequestPanel: document.getElementById('aliado-request-panel'),
  aliadoCostPanel: document.getElementById('aliado-cost-panel'),
  deliveryForm: document.getElementById('delivery-form'),
  priceOptionsContainer: document.getElementById('price-options'),
  motorView: document.getElementById('motorizado-view'),
  motorStatusText: document.getElementById('motor-status-text'),
  btnToggleStatus: document.getElementById('btn-toggle-status'),
  availableOrdersList: document.getElementById('available-orders-list'),
  motorPendingList: document.getElementById('motor-pending-list'),
  motorDeliveredList: document.getElementById('motor-delivered-list'),
  motorCanceledList: document.getElementById('motor-canceled-list'),
  motorHistoryList: document.getElementById('motor-history-list'),
  motorHistoryFilter: document.getElementById('motor-history-filter'),
  motorStartDate: document.getElementById('motor-start-date'),
  motorEndDate: document.getElementById('motor-end-date'),
  btnMotorFilter: document.getElementById('btn-motor-filter'),
  motorEarnings: document.getElementById('motor-earnings'),
  btnResetEarnings: document.getElementById('btn-reset-earnings'),
  adminView: document.getElementById('admin-view'),
  adminTotalOrders: document.getElementById('admin-total-orders'),
  adminActiveOrders: document.getElementById('admin-active-orders'),
  adminDeliveredCount: document.getElementById('admin-delivered-count'),
  adminEarnings: document.getElementById('admin-earnings'),
  adminMotoristaSelect: document.getElementById('admin-motorista-select'),
  adminCommerceName: document.getElementById('admin-commerce-name'),
  btnAssignCommerce: document.getElementById('btn-assign-commerce'),
  adminOrderFilter: document.getElementById('admin-order-filter'),
  btnExportAliado: document.getElementById('btn-export-aliado'),
  btnExportAdmin: document.getElementById('btn-export-admin'),
  aliadoOrderFilter: document.getElementById('aliado-order-filter'),
  aliadoStartDate: document.getElementById('aliado-start-date'),
  aliadoEndDate: document.getElementById('aliado-end-date'),
  btnTestSound: document.getElementById('btn-test-sound'),
  btnSoundToggle: document.getElementById('btn-sound-toggle'),
  btnExportAliado: document.getElementById('btn-export-aliado'),
  btnExportAdmin: document.getElementById('btn-export-admin'),
  adminStartDate: document.getElementById('admin-start-date'),
  adminEndDate: document.getElementById('admin-end-date'),
  adminFilterUser: document.getElementById('admin-filter-user'),
  btnAdminFilter: document.getElementById('btn-admin-filter'),
  adminOrdersList: document.getElementById('admin-orders-list'),
  tabs: document.querySelectorAll('.tab-btn'),
};

const priceValues = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,7,8,9,10,11,12];
let selectedPrice = null;

function setStatus(text, title = 'Estado', success = true) {
  elements.statusTitle.textContent = title;
  elements.statusMessage.textContent = text;
  elements.statusSection.classList.remove('hidden');
  elements.statusSection.style.borderColor = success ? '#d3f4d2' : '#f7c5c5';
  if (!text) elements.statusSection.classList.add('hidden');
}

function hideAllViews() {
  elements.authSection.classList.add('hidden');
  elements.noRoleSection.classList.add('hidden');
  elements.aliadoView.classList.add('hidden');
  elements.motorView.classList.add('hidden');
  elements.adminView.classList.add('hidden');
  elements.statusSection.classList.add('hidden');
}

function showSection(section) {
  hideAllViews();
  section.classList.remove('hidden');
}

function setTabBehavior() {
  elements.tabs.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      const panel = document.getElementById(`${targetId}-panel`);
      const parent = button.closest('section');
      const currentTabs = parent.querySelectorAll('.tab-btn');
      const currentPanels = parent.querySelectorAll('.tab-panel');
      currentTabs.forEach(btn => btn.classList.remove('active'));
      currentPanels.forEach(panelItem => panelItem.classList.add('hidden'));
      button.classList.add('active');
      panel.classList.remove('hidden');
    });
  });
}

function renderPriceOptions() {
  priceValues.forEach(value => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'price-chip';
    chip.textContent = `$${value}`;
    chip.addEventListener('click', () => {
      selectedPrice = value;
      elements.priceOptionsContainer.querySelectorAll('.price-chip').forEach(item => item.classList.remove('active'));
      chip.classList.add('active');
      elements.customPrice.value = '';
    });
    elements.priceOptionsContainer.appendChild(chip);
  });
}

function updateLogoutButton() {
  elements.btnLogout.classList.toggle('hidden', !currentUser);
}

async function checkSession() {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.user) {
    currentUser = data.session.user;
    await loadProfile();
  } else {
    showSection(elements.authSection);
    updateLogoutButton();
  }
}

async function loadProfile() {
  setStatus('', '');
  const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
  if (error) {
    console.error('Perfil error', error);
  }
  if (!data) {
    await supabase.from('profiles').insert({ id: currentUser.id, email: currentUser.email, full_name: '', role: null });
    currentProfile = { id: currentUser.id, email: currentUser.email, role: null };
  } else {
    currentProfile = data;
  }
  updateLogoutButton();
  routeByRole();
}

async function routeByRole() {
  if (!currentUser) {
    showSection(elements.authSection);
    return;
  }
  if (!currentProfile?.role) {
    showSection(elements.noRoleSection);
    return;
  }
  elements.statusSection.classList.add('hidden');
  if (currentProfile.role === 'aliado') {
    elements.aliadoRoleLabel.textContent = currentProfile.business_name ? currentProfile.business_name : currentProfile.email;
    showSection(elements.aliadoView);
    await refreshAliadoView();
    await setupRealtimeSubscriptions();
    return;
  }
  if (currentProfile.role === 'motorizado') {
    showSection(elements.motorView);
    updateMotorStatus();
    await refreshMotorView();
    await setupRealtimeSubscriptions();
    return;
  }
  if (currentProfile.role === 'admin') {
    showSection(elements.adminView);
    await refreshAdminView();
    await setupRealtimeSubscriptions();
    return;
  }
  showSection(elements.noRoleSection);
}

function updateMotorStatus() {
  const hasActive = !!currentProfile?.active_order;
  motorOn = !hasActive;
  elements.motorStatusText.textContent = motorOn ? 'ON' : 'OFF';
  elements.btnToggleStatus.textContent = motorOn ? 'Desactivar' : 'Activar';
}

async function refreshAliadoView() {
  await loadAliadoOrders();
}

async function refreshMotorView() {
  await Promise.all([
    loadAvailableOrders(),
    loadMotorPending(),
    loadMotorDelivered(),
    loadMotorCanceled(),
    loadMotorHistory(),
  ]);
}

async function refreshAdminView() {
  await Promise.all([
    loadAdminMetrics(),
    loadMotoristasForAdmin(),
    loadAdminOrders(),
  ]);
}

async function signInUser(event) {
  event.preventDefault();
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value.trim();
  if (!email || !password) return setStatus('Ingresa correo y contraseña.', 'Error', false);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return setStatus(error.message, 'Error', false);
  currentUser = data.user;
  setStatus('Sesión iniciada correctamente.', 'Éxito');
  await loadProfile();
}

async function signUpUser(event) {
  event.preventDefault();
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value.trim();
  const fullName = elements.fullNameInput.value.trim();
  if (!email || !password || !fullName) return setStatus('Completa todos los campos para registrarte.', 'Error', false);
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return setStatus(error.message, 'Error', false);
  if (data.user) {
    await supabase.from('profiles').insert({ id: data.user.id, email, full_name: fullName, role: null });
    currentUser = data.user;
    setStatus('Registro exitoso. Espera asignación de rol.', 'Éxito');
    showSection(elements.noRoleSection);
  }
}

async function signOutUser() {
  if (ordersChannel) {
    await ordersChannel.unsubscribe();
    ordersChannel = null;
  }
  if (realtimePollInterval) {
    clearInterval(realtimePollInterval);
    realtimePollInterval = null;
  }
  await supabase.auth.signOut();
  currentUser = null;
  currentProfile = null;
  showSection(elements.authSection);
  updateLogoutButton();
  setStatus('Has cerrado sesión.', 'Éxito');
}

function toggleAuthMode(event) {
  event.preventDefault();
  const register = elements.fullNameField.classList.toggle('hidden');
  elements.btnAuthAction.textContent = register ? 'Registrarse' : 'Iniciar sesión';
  elements.toggleAuthMode.textContent = register ? 'Inicia sesión' : 'Regístrate';
}

async function loadAliadoOrders() {
  if (!currentProfile) return;
  const { data, error } = await supabase.from('orders').select('*').eq('commerce_id', currentProfile.id).order('created_at', { ascending: false });
  if (error) return console.error(error);
  const pending = data.filter(order => ['pending','assigned'].includes(order.status));
  const onWay = data.filter(order => order.status === 'on_way');
  const delivered = data.filter(order => order.status === 'delivered');
  elements.aliadoPendingList.innerHTML = pending.length ? pending.map(orderCardHtml).join('') : '<p class="note">No hay pedidos pendientes.</p>';
  elements.aliadoOnwayList.innerHTML = onWay.length ? onWay.map(orderCardHtml).join('') : '<p class="note">No hay pedidos en camino.</p>';
  elements.aliadoDeliveredList.innerHTML = delivered.length ? delivered.map(orderCardHtml).join('') : '<p class="note">No hay pedidos entregados.</p>';
}

function orderCardHtml(order) {
  const assigned = order.assigned_to || 'Sin motorizado aún';
  const stage = order.status === 'pending' ? 'Pendiente' : order.status === 'assigned' ? 'Aceptado' : order.status === 'on_way' ? 'En camino' : order.status === 'delivered' ? 'Entregado' : order.status === 'reopened' ? 'Reabierto' : order.status;
  const urgent = order.urgent ? 'Urgente' : 'Normal';
  const price = order.price ? `$${order.price}` : 'Sin precio';
  const charge = '';
  const mapLink = order.delivery_url ? `<a href="${order.delivery_url}" target="_blank" rel="noopener">Abrir ruta</a>` : '';
  return `<div class="order-card">
    <div class="order-row"><h4>Pedido #${order.id || ''}</h4><span>${stage}</span></div>
    <div class="order-meta">
      <p><strong>Receptor:</strong> ${order.delivery_name}</p>
      <p><strong>Teléfono:</strong> ${order.delivery_phone}</p>
      <p><strong>Dirección:</strong> ${order.delivery_address}</p>
      <p><strong>Motorizado:</strong> ${assigned}</p>
      <p><strong>Precio:</strong> ${price}</p>
      <p><strong>Velocidad:</strong> ${urgent}</p>
      <p><strong>Descripción:</strong> ${order.description}</p>
      ${mapLink}
    </div>
    ${charge}
  </div>`;
}

function orderCardHtmlMotor(order) {
  const urlLink = order.delivery_url ? `<a href="${order.delivery_url}" target="_blank" rel="noopener">Google Maps</a>` : '';
  const phoneLink = order.delivery_phone ? `<a href="tel:${order.delivery_phone}">${order.delivery_phone}</a>` : 'Sin teléfono';
  const buttons = [];
  if (order.status === 'assigned') {
    buttons.push(`<button class="btn primary small" type="button" data-action="to-way" data-id="${order.id}">Pedido en camino</button>`);
    buttons.push(`<button class="btn secondary small" type="button" data-action="delivered" data-id="${order.id}">Pedido entregado</button>`);
    buttons.push(`<button class="btn small" type="button" data-action="cancel" data-id="${order.id}">Cancelar pedido</button>`);
  }
  if (order.status === 'on_way') {
    buttons.push(`<button class="btn primary small" type="button" data-action="delivered" data-id="${order.id}">Pedido entregado</button>`);
  }
  const actionHtml = buttons.length ? `<div class="order-actions">${buttons.join('')}</div>` : '';
  return `<div class="order-card">
    <div class="order-row"><h4>Pedido #${order.id || ''}</h4><span>${order.status === 'assigned' ? 'Aceptado' : order.status === 'on_way' ? 'En camino' : order.status === 'delivered' ? 'Entregado' : order.status === 'canceled' ? 'Cancelado' : order.status}</span></div>
    <div class="order-meta">
      <p><strong>Receptor:</strong> ${order.delivery_name}</p>
      <p><strong>Teléfono:</strong> ${phoneLink}</p>
      <p><strong>Dirección:</strong> ${order.delivery_address}</p>
      <p><strong>URL:</strong> ${urlLink}</p>
      <p><strong>Comercio:</strong> ${order.commerce_name || 'Desconocido'}</p>
      <p><strong>Precio:</strong> $${order.price || 0}</p>
      <p><strong>Descripción:</strong> ${order.description}</p>
    </div>
    ${actionHtml}
  </div>`;
}

async function loadAvailableOrders() {
  if (!currentProfile) return;
  let query = supabase.from('orders').select('*').eq('status', 'pending').is('assigned_to_id', null).order('created_at', { ascending: false });
  if (currentProfile.assigned_commerce_id) {
    query = query.eq('commerce_id', currentProfile.assigned_commerce_id);
  } else if (currentProfile.assigned_commerce) {
    query = query.eq('commerce_name', currentProfile.assigned_commerce);
  }
  const { data, error } = await query;
  if (error) return console.error(error);
  const list = data || [];
  elements.availableOrdersList.innerHTML = list.length ? list.map(order => availableOrderHtml(order)).join('') : '<p class="note">No hay pedidos disponibles.</p>';
}

function availableOrderHtml(order) {
  const price = order.price ? `$${order.price}` : 'Sin precio';
  const urlLink = order.delivery_url ? `<a href="${order.delivery_url}" target="_blank" rel="noopener">Google Maps</a>` : '';
  return `<div class="order-card">
    <div class="order-row"><h4>Pedido #${order.id || ''}</h4><span>Disponible</span></div>
    <div class="order-meta">
      <p><strong>Receptor:</strong> ${order.delivery_name}</p>
      <p><strong>Teléfono:</strong> <a href="tel:${order.delivery_phone}">${order.delivery_phone}</a></p>
      <p><strong>Dirección:</strong> ${order.delivery_address}</p>
      <p><strong>URL:</strong> ${urlLink}</p>
      <p><strong>Precio:</strong> ${price}</p>
    </div>
    <div class="order-actions"><button class="btn primary small" type="button" data-action="accept" data-id="${order.id}">Aceptar pedido</button></div>
  </div>`;
}

async function loadMotorPending() {
  const { data, error } = await supabase.from('orders').select('*').eq('assigned_to_id', currentUser.id).in('status', ['assigned', 'on_way']).order('created_at', { ascending: false });
  if (error) return console.error(error);
  elements.motorPendingList.innerHTML = data.length ? data.map(orderCardHtmlMotor).join('') : '<p class="note">No tienes pedidos pendientes.</p>';
}

async function loadMotorDelivered() {
  const { data, error } = await supabase.from('orders').select('*').eq('assigned_to_id', currentUser.id).eq('status', 'delivered').order('delivered_at', { ascending: false });
  if (error) return console.error(error);
  elements.motorDeliveredList.innerHTML = data.length ? data.map(orderCardHtmlMotor).join('') : '<p class="note">No hay pedidos entregados.</p>';
}

async function loadMotorCanceled() {
  const { data, error } = await supabase.from('orders').select('*').eq('assigned_to_id', currentUser.id).eq('status', 'canceled').order('updated_at', { ascending: false });
  if (error) return console.error(error);
  elements.motorCanceledList.innerHTML = data.length ? data.map(orderCardHtmlMotor).join('') : '<p class="note">No hay pedidos cancelados.</p>';
}

async function loadMotorHistory() {
  const range = getFilterRange(elements.motorHistoryFilter.value, elements.motorStartDate.value, elements.motorEndDate.value);
  let query = supabase.from('orders').select('*').eq('assigned_to_id', currentUser.id).in('status', ['assigned', 'on_way', 'delivered', 'canceled']).order('created_at', { ascending: false });
  if (range) {
    query = query.gte('created_at', range.start).lte('created_at', range.end);
  }
  const { data, error } = await query;
  if (error) return console.error(error);
  elements.motorHistoryList.innerHTML = data.length ? data.map(orderCardHtmlMotor).join('') : '<p class="note">No hay historial para este rango.</p>';
  const earnings = data.reduce((sum, order) => sum + (order.price || 0) * 0.6, 0);
  elements.motorEarnings.textContent = `$${earnings.toFixed(2)}`;
}

async function loadAdminMetrics() {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) return console.error(error);
  const total = data.length;
  const active = data.filter(order => ['pending','assigned','on_way'].includes(order.status)).length;
  const delivered = data.filter(order => order.status === 'delivered').length;
  const earnings = data.reduce((sum, order) => sum + ((order.status === 'delivered' ? order.price : 0) || 0) * 0.6, 0);
  elements.adminTotalOrders.textContent = total;
  elements.adminActiveOrders.textContent = active;
  elements.adminDeliveredCount.textContent = delivered;
  elements.adminEarnings.textContent = `$${earnings.toFixed(2)}`;
}

async function loadMotoristasForAdmin() {
  const { data, error } = await supabase.from('profiles').select('id,full_name,email,assigned_commerce,assigned_commerce_id').eq('role','motorizado');
  if (error) return console.error(error);
  elements.adminMotoristaSelect.innerHTML = data.map(user => {
    const commerceLabel = user.assigned_commerce || (user.assigned_commerce_id ? 'Comercio asignado' : 'Sin comercio');
    return `<option value="${user.id}">${user.full_name || user.email}${commerceLabel ? ' — ' + commerceLabel : ''}</option>`;
  }).join('');
}

async function loadAdminOrders() {
  const range = getFilterRange(elements.adminOrderFilter.value, elements.adminStartDate.value, elements.adminEndDate.value);
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (range) query = query.gte('created_at', range.start).lte('created_at', range.end);
  const filterText = elements.adminFilterUser.value.trim();
  const { data, error } = await query;
  if (error) return console.error(error);
  const filtered = filterText ? data.filter(order => [order.assigned_to, order.commerce_name, order.requested_by_name, order.delivery_name].some(value => value?.toLowerCase().includes(filterText.toLowerCase()))) : data;
  elements.adminOrdersList.innerHTML = filtered.length ? filtered.map(orderCardHtml).join('') : '<p class="note">No hay pedidos para este filtro.</p>';
}

function getOrderDuration(order) {
  if (!order.started_at || !order.delivered_at) return '';
  const start = new Date(order.started_at);
  const end = new Date(order.delivered_at);
  const elapsed = end - start;
  if (elapsed <= 0) return '';
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  let result = '';
  if (hours) result += `${hours}h `;
  if (remainingMinutes || hours) result += `${remainingMinutes}m `;
  result += `${remainingSeconds}s`;
  return result.trim();
}

function buildOrdersXlsTable(orders) {
  const rows = orders.map(order => {
    const duration = getOrderDuration(order);
    return `
      <tr>
        <td>${order.id || ''}</td>
        <td>${order.status || ''}</td>
        <td>${order.commerce_name || ''}</td>
        <td>${order.requested_by_name || ''}</td>
        <td>${order.assigned_to || ''}</td>
        <td>${order.delivery_name || ''}</td>
        <td>${order.delivery_phone || ''}</td>
        <td>${order.delivery_address || ''}</td>
        <td>${order.delivery_url || ''}</td>
        <td>${order.price != null ? order.price : ''}</td>
        <td>${order.urgent ? 'Sí' : 'No'}</td>
        <td>${order.started_at || ''}</td>
        <td>${order.delivered_at || ''}</td>
        <td>${duration}</td>
        <td>${order.created_at || ''}</td>
        <td>${order.updated_at || ''}</td>
        <td>${order.description || ''}</td>
      </tr>`;
  }).join('');

  const total = orders.reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
  return `
    <table>
      <tr>
        <th>ID</th>
        <th>Estado</th>
        <th>Comercio</th>
        <th>Solicitante</th>
        <th>Motorizado</th>
        <th>Receptor</th>
        <th>Teléfono</th>
        <th>Dirección</th>
        <th>URL</th>
        <th>Precio USD</th>
        <th>Urgente</th>
        <th>Inicio</th>
        <th>Entrega</th>
        <th>Duración</th>
        <th>Creado</th>
        <th>Actualizado</th>
        <th>Descripción</th>
      </tr>
      ${rows}
      <tr>
        <td colspan="9"><strong>Total USD</strong></td>
        <td><strong>${total.toFixed(2)}</strong></td>
        <td colspan="7"></td>
      </tr>
    </table>`;
}

function downloadXls(filename, tableHtml) {
  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function exportAliadoOrders() {
  if (!currentProfile) return;
  const range = getFilterRange(elements.aliadoOrderFilter?.value || 'all', elements.aliadoStartDate?.value, elements.aliadoEndDate?.value);
  let query = supabase.from('orders').select('*').eq('commerce_id', currentProfile.id).order('created_at', { ascending: false });
  if (range) query = query.gte('created_at', range.start).lte('created_at', range.end);
  const { data, error } = await query;
  if (error) return setStatus('No se pudo exportar los pedidos del aliado.', 'Error', false);
  const table = buildOrdersXlsTable(data || []);
  const filename = range ? `pedidos-aliado-${currentProfile.id}-${elements.aliadoOrderFilter.value}.xls` : `pedidos-aliado-${currentProfile.id}.xls`;
  downloadXls(filename, table);
}

async function exportAdminOrders() {
  const range = getFilterRange(elements.adminOrderFilter.value, elements.adminStartDate.value, elements.adminEndDate.value);
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (range) query = query.gte('created_at', range.start).lte('created_at', range.end);
  const filterText = elements.adminFilterUser.value.trim();
  const { data, error } = await query;
  if (error) return setStatus('No se pudo exportar los pedidos de admin.', 'Error', false);
  const orders = filterText ? data.filter(order => [order.assigned_to, order.commerce_name, order.requested_by_name, order.delivery_name].some(value => value?.toLowerCase().includes(filterText.toLowerCase()))) : data;
  const table = buildOrdersXlsTable(orders || []);
  downloadXls('pedidos-admin.xls', table);
}

function getFilterRange(value, startDate, endDate) {
  const now = new Date();
  if (value === 'day') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
    return { start, end };
  }
  if (value === 'week') {
    const first = new Date(now);
    first.setDate(now.getDate() - now.getDay());
    const last = new Date(first);
    last.setDate(first.getDate() + 6);
    return { start: new Date(first.getFullYear(), first.getMonth(), first.getDate()).toISOString(), end: new Date(last.getFullYear(), last.getMonth(), last.getDate(), 23, 59, 59).toISOString() };
  }
  if (value === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    return { start, end };
  }
  if (value === 'range' && startDate && endDate) {
    return { start: new Date(startDate).toISOString(), end: new Date(endDate).setHours(23,59,59,999) && new Date(new Date(endDate).getFullYear(), new Date(endDate).getMonth(), new Date(endDate).getDate(), 23, 59, 59).toISOString() };
  }
  return null;
}

function setFilterInputsVisibility(select, startInput, endInput) {
  const isRange = select.value === 'range';
  startInput.classList.toggle('hidden', !isRange);
  endInput.classList.toggle('hidden', !isRange);
}

async function handleOrderAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === 'accept') return acceptOrder(id);
  if (action === 'to-way') return updateOrderStatus(id, 'on_way');
  if (action === 'delivered') return updateOrderStatus(id, 'delivered');
  if (action === 'cancel') return updateOrderStatus(id, 'canceled');
}

async function acceptOrder(orderId) {
  const { data, error } = await supabase.from('orders').update({ status: 'assigned', assigned_to_id: currentUser.id, assigned_to: currentProfile.full_name || currentUser.email, assigned_at: new Date().toISOString() }).eq('id', orderId).eq('status', 'pending').is('assigned_to_id', null);
  if (error) return setStatus('No fue posible aceptar el pedido.', 'Error', false);
  setStatus('Pedido aceptado correctamente.', 'Éxito');
  await refreshMotorView();
  await updateMotorStatusFromOrders();
}

async function updateOrderStatus(orderId, nextStatus) {
  const updateData = { status: nextStatus, updated_at: new Date().toISOString() };
  if (nextStatus === 'on_way') updateData.started_at = new Date().toISOString();
  if (nextStatus === 'delivered') updateData.delivered_at = new Date().toISOString();
  const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
  if (error) return setStatus('Error al actualizar el pedido.', 'Error', false);
  setStatus('Pedido actualizado con éxito.', 'Éxito');
  if (currentProfile.role === 'motorizado') {
    await refreshMotorView();
    await updateMotorStatusFromOrders();
  }
  if (currentProfile.role === 'aliado') await refreshAliadoView();
  if (currentProfile.role === 'admin') await refreshAdminView();
}

async function updateMotorStatusFromOrders() {
  const { data, error } = await supabase.from('orders').select('id').eq('assigned_to_id', currentUser.id).in('status', ['assigned','on_way']);
  if (error) return;
  currentProfile.active_order = data?.length ? true : false;
  updateMotorStatus();
}

async function createOrder(event) {
  event.preventDefault();
  const deliveryName = document.getElementById('recipient-name').value.trim();
  const deliveryPhone = document.getElementById('recipient-phone').value.trim();
  const deliveryAddress = document.getElementById('delivery-address').value.trim();
  const deliveryUrl = document.getElementById('delivery-url').value.trim();
  const description = document.getElementById('delivery-description').value.trim();
  const customPriceValue = parseFloat(document.getElementById('custom-price').value);
  const speed = document.querySelector('input[name="delivery-speed"]:checked').value;
  const price = selectedPrice || (customPriceValue > 0 ? customPriceValue : 0);
  if (!deliveryName || !deliveryPhone || !deliveryAddress || !deliveryUrl || !description || !price) {
    return setStatus('Completa todos los datos del formulario.', 'Error', false);
  }
  const commerceName = currentProfile.business_name || currentProfile.email;
  const { error } = await supabase.from('orders').insert({
    commerce_id: currentProfile.id,
    commerce_name: commerceName,
    requested_by: currentUser.id,
    requested_by_name: currentProfile.full_name || currentUser.email,
    delivery_name: deliveryName,
    delivery_phone: deliveryPhone,
    delivery_address: deliveryAddress,
    delivery_url: deliveryUrl,
    description,
    price,
    urgent: speed === 'urgent',
    normal: speed === 'normal',
    status: 'pending',
    created_at: new Date().toISOString()
  });
  if (error) return setStatus('Error al crear la solicitud de delivery.', 'Error', false);
  setStatus('Solicitud enviada. Los motorizados recibirán la notificación.', 'Éxito');
  elements.deliveryForm.reset();
  selectedPrice = null;
  elements.priceOptionsContainer.querySelectorAll('.price-chip').forEach(chip => chip.classList.remove('active'));
  await loadAliadoOrders();
}

async function assignCommerce() {
  const motoristaId = elements.adminMotoristaSelect.value;
  const commerceName = elements.adminCommerceName.value.trim();
  if (!motoristaId || !commerceName) return setStatus('Selecciona el motorizado y nombre del comercio.', 'Error', false);

  const { data: commerceProfiles, error: commerceError } = await supabase.from('profiles').select('id,business_name,email').or(`business_name.eq.${commerceName},email.eq.${commerceName}`).eq('role','aliado').limit(1);
  if (commerceError) return setStatus('Error al buscar el comercio.', 'Error', false);

  const updateData = { assigned_commerce: commerceName };
  if (commerceProfiles?.length) {
    updateData.assigned_commerce_id = commerceProfiles[0].id;
  } else {
    updateData.assigned_commerce_id = null;
  }

  const { error } = await supabase.from('profiles').update(updateData).eq('id', motoristaId);
  if (error) return setStatus('No fue posible asignar el comercio.', 'Error', false);
  setStatus(`Motorizado asignado a ${commerceName}.`, 'Éxito');
  await loadMotoristasForAdmin();
}

async function notifyNewOrder() {
  try {
    if (Notification.permission === 'granted') {
      new Notification('On Delivery', { body: 'Ha llegado un nuevo pedido disponible.', icon: 'icon-192.png' });
    }
    if (soundEnabled) {
      try {
        await audioAlarm.play();
      } catch (err) {
        console.debug('Audio play failed:', err);
      }
    }
  } catch (error) {
    console.warn('No se pudo reproducir el sonido.', error);
  }
}

function updateSoundButton() {
  if (!elements.btnSoundToggle) return;
  elements.btnSoundToggle.textContent = soundEnabled ? '🔔 Sonido' : '🔕 Sonido';
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled ? 'true' : 'false');
  updateSoundButton();
  setStatus(soundEnabled ? 'Sonido activado.' : 'Sonido desactivado.', 'Preferencia');
}

function startRealtimePoll() {
  if (realtimePollInterval) clearInterval(realtimePollInterval);
  realtimePollInterval = setInterval(async () => {
    if (!currentProfile) return;
    if (currentProfile.role === 'motorizado') {
      await loadAvailableOrders();
      await refreshMotorView();
    }
    if (currentProfile.role === 'aliado') {
      await loadAliadoOrders();
    }
    if (currentProfile.role === 'admin') {
      await loadAdminMetrics();
      await loadAdminOrders();
    }
  }, 8000);
}

function stopRealtimePoll() {
  if (realtimePollInterval) {
    clearInterval(realtimePollInterval);
    realtimePollInterval = null;
  }
}

async function setupRealtimeSubscriptions() {
  if (!currentUser || !currentProfile) return;
  if (ordersChannel) {
    await ordersChannel.unsubscribe();
    ordersChannel = null;
  }
  ordersChannel = supabase.channel('orders-channel');
  ordersChannel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
    console.debug('Realtime INSERT payload received', payload);
    if (!currentProfile) return;
    if (currentProfile.role === 'motorizado') {
      const order = payload.new;
      const isAssignedCommerce = currentProfile.assigned_commerce_id ? order.commerce_id === currentProfile.assigned_commerce_id : !currentProfile.assigned_commerce || order.commerce_name === currentProfile.assigned_commerce;
      if (order.status === 'pending' && isAssignedCommerce) {
        console.debug('New available order for motorizado, reloading list', order.id);
        loadAvailableOrders();
        notifyNewOrder();
      }
    }
    if (currentProfile.role === 'aliado' && payload.new.commerce_id === currentProfile.id) {
      console.debug('New order for aliado, reloading aliado view', payload.new.id);
      loadAliadoOrders();
    }
    if (currentProfile.role === 'admin') {
      console.debug('New order for admin, refreshing metrics');
      loadAdminMetrics();
      loadAdminOrders();
    }
  }).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
    console.debug('Realtime UPDATE payload received', payload);
    if (!currentProfile) return;
    if (currentProfile.role === 'motorizado') {
      loadAvailableOrders();
      refreshMotorView();
    }
    if (currentProfile.role === 'aliado' && payload.new.commerce_id === currentProfile.id) {
      loadAliadoOrders();
    }
    if (currentProfile.role === 'admin') {
      loadAdminMetrics();
      loadAdminOrders();
    }
  }).on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
    // generic logger to help diagnose missing events
    console.debug('Realtime any-event payload', payload);
  });
  await ordersChannel.subscribe();
  console.debug('Subscribed to orders-channel');
  startRealtimePoll();
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

async function installApp() {
  if (!deferredPrompt) {
    setStatus('No se puede iniciar la instalación automática ahora. Usa el menú del navegador para instalar o actualizar esta página.', 'Atención', false);
    elements.installHint.classList.remove('hidden');
    return;
  }
  deferredPrompt.prompt();
  const choiceResult = await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (choiceResult.outcome === 'accepted') {
    setStatus('App instalada en el escritorio.', 'Éxito');
    elements.btnInstall.classList.add('hidden');
    elements.installHint.classList.add('hidden');
  } else {
    setStatus('Instalación cancelada.', 'Atención', false);
    elements.installHint.classList.remove('hidden');
  }
}

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registrado');
    } catch (error) {
      console.error('No se pudo registrar Service Worker', error);
    }
  }
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  elements.btnInstall.classList.remove('hidden');
  elements.installHint.classList.remove('hidden');
});

window.addEventListener('appinstalled', () => {
  elements.btnInstall.classList.add('hidden');
  elements.installHint.classList.add('hidden');
});

elements.authForm.addEventListener('submit', event => {
  if (elements.fullNameField.classList.contains('hidden')) return signInUser(event);
  return signUpUser(event);
});
elements.toggleAuthMode.addEventListener('click', toggleAuthMode);
elements.btnLogout.addEventListener('click', signOutUser);
elements.btnInstall.addEventListener('click', installApp);
elements.deliveryForm.addEventListener('submit', createOrder);
[elements.aliadoPendingList, elements.aliadoOnwayList, elements.aliadoDeliveredList, elements.availableOrdersList, elements.motorPendingList, elements.motorDeliveredList, elements.motorCanceledList, elements.motorHistoryList, elements.adminOrdersList].forEach(container => {
  container.addEventListener('click', handleOrderAction);
});
elements.btnToggleStatus.addEventListener('click', () => {
  motorOn = !motorOn;
  elements.motorStatusText.textContent = motorOn ? 'ON' : 'OFF';
});
elements.motorHistoryFilter.addEventListener('change', () => setFilterInputsVisibility(elements.motorHistoryFilter, elements.motorStartDate, elements.motorEndDate));
elements.adminOrderFilter.addEventListener('change', () => setFilterInputsVisibility(elements.adminOrderFilter, elements.adminStartDate, elements.adminEndDate));
if (elements.aliadoOrderFilter) {
  elements.aliadoOrderFilter.addEventListener('change', () => setFilterInputsVisibility(elements.aliadoOrderFilter, elements.aliadoStartDate, elements.aliadoEndDate));
}
elements.btnMotorFilter.addEventListener('click', loadMotorHistory);
elements.btnResetEarnings.addEventListener('click', () => {
  earningsResetAt = new Date().toISOString();
  localStorage.setItem('earningsResetAt', earningsResetAt);
  setStatus('Ganancia reiniciada para el turno.', 'Éxito');
  loadMotorHistory();
});
elements.btnAdminFilter.addEventListener('click', loadAdminOrders);
elements.btnAssignCommerce.addEventListener('click', assignCommerce);
elements.btnExportAliado.addEventListener('click', exportAliadoOrders);
elements.btnExportAdmin.addEventListener('click', exportAdminOrders);

if (elements.btnTestSound) {
  elements.btnTestSound.addEventListener('click', async () => {
    try {
      await audioAlarm.play();
    } catch (err) {
      console.debug('Test audio play failed:', err);
      setStatus('Haz interactuado: el navegador puede bloquear reproducción automática hasta que haya interacción.', 'Atención', false);
    }
  });
}
if (elements.btnSoundToggle) {
  elements.btnSoundToggle.addEventListener('click', toggleSound);
}
updateSoundButton();

setTabBehavior();
renderPriceOptions();
registerServiceWorker();
checkSession();
requestNotificationPermission();

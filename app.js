const SUPABASE_URL = window.ONDELIVERY_SUPABASE_CONFIG?.url || '';
const SUPABASE_ANON_KEY = window.ONDELIVERY_SUPABASE_CONFIG?.anonKey || '';
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let deferredInstallPrompt = null;
let installPromptTriggered = false;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

window.addEventListener('appinstalled', () => {
  showToast('La app se instaló correctamente');
});

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      showToast('Instalación aceptada');
    }
    deferredInstallPrompt = null;
    return;
  }
  showToast('La instalación automática no está disponible. Usa el botón del navegador.');
}

function playNotificationSound() {
  const audio = document.getElementById('notificationSound');
  if (!audio) return;
  audio.src = 'https://www.myinstants.com/media/sounds/alarma-alerta.mp3';
  audio.play().catch(() => {});
}

async function loadFromSupabase() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (!error && data) {
    window.__ONDELIVERY_DATA__ = data;
  }
}

async function saveOrderToSupabase(order) {
  const payload = {
    commerce_id: order.commerceId,
    commerce_name: order.commerceName,
    recipient_name: order.recipientName,
    recipient_phone: order.recipientPhone,
    address: order.address,
    address_url: order.addressUrl,
    price: order.price,
    urgency: order.urgency,
    description: order.description,
    status: order.status,
    created_at: order.createdAt,
    assigned_moto_ids: order.assignedMotoIds || []
  };
  const { data, error } = await supabase.from('orders').insert(payload).select().single();
  return { data, error };
}

async function updateOrderInSupabase(order) {
  const payload = {
    status: order.status,
    accepted_by: order.acceptedBy || null,
    accepted_at: order.acceptedAt || null,
    assigned_moto_ids: order.assignedMotoIds || []
  };
  return supabase.from('orders').update(payload).eq('id', order.id);
}

async function loadUsersFromSupabase() {
  const { data, error } = await supabase.from('users').select('*');
  if (!error && data) {
    window.__ONDELIVERY_USERS__ = data;
  }
}

async function saveUserToSupabase(user) {
  return supabase.from('users').upsert({ id: user.id, name: user.name, email: user.email, role: user.role, commerce_name: user.commerceName || null, available: user.available }).select().single();
}

async function syncSupabaseData() {
  await loadUsersFromSupabase();
  await loadFromSupabase();
}

window.__ONDELIVERY__ = {
  installApp,
  playNotificationSound,
  saveOrderToSupabase,
  updateOrderInSupabase,
  loadFromSupabase,
  saveUserToSupabase,
  syncSupabaseData,
  supabase
};

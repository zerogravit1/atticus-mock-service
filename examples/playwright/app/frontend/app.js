let session = null;

async function api(path, options = {}) {
  return fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  }).then(r => r.json());
}

// --- Login ---
document.getElementById('login-btn').onclick = async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  session = await api('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  if (session.error) {
    alert(session.error);
    return;
  }

  document.getElementById('login').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  loadRecords();
};

// --- Load Records ---
async function loadRecords() {
  const list = document.getElementById('list');
  list.innerHTML = '';

  const records = await api('/records');

  records.forEach(rec => {
    const div = document.createElement('div');
    div.className = "record";
    div.innerHTML = `
      <strong>${rec.text}</strong> <em>(${rec.createdBy})</em>
      <button data-id="${rec.id}" class="edit">Edit</button>
      <button data-id="${rec.id}" class="delete">Delete</button>
    `;
    list.appendChild(div);
  });

  wireEvents();
}

// --- Add Record ---
document.getElementById('add-btn').onclick = async () => {
  const text = document.getElementById('new-record-text').value;

  await api('/records', {
    method: 'POST',
    body: JSON.stringify({ text, createdBy: session.username })
  });

  loadRecords();
};

function wireEvents() {
  document.querySelectorAll('.edit').forEach(btn => {
    btn.onclick = async () => {
      const newText = prompt('New text:');
      if (!newText) return;

      await api('/records/' + btn.dataset.id, {
        method: 'PUT',
        body: JSON.stringify({ text: newText })
      });

      loadRecords();
    };
  });

  document.querySelectorAll('.delete').forEach(btn => {
    btn.onclick = async () => {
      await api('/records/' + btn.dataset.id, {
        method: 'DELETE'
      });

      loadRecords();
    };
  });
}

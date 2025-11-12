document.addEventListener("DOMContentLoaded", async () => {
  const SUPABASE_URL = "https://avvwtenmextqyxgejujj.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnd0ZW5tZXh0cXl4Z2VqdWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mzc1MzMsImV4cCI6MjA3MTExMzUzM30.PT3I_pSoCit_d8n7L5cqNZg8Vujxx5RmFsX9v6it7ok";

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const formTarefa = document.getElementById("formTarefa");
  const modalTarefa = new bootstrap.Modal(
    document.getElementById("modalTarefa")
  );
  const listaTarefas = document.getElementById("listaTarefas");
  const user = JSON.parse(localStorage.getItem("user_data"));
  const userId = user?.id;
  let editItemId = null;

  if (!userId) {
    window.location.href = "/index.html";
    return;
  }

  const reload = () => location.reload();
  const showError = (msg, e) => console.error(msg, e?.message || e);
  const alertError = (msg, e) => alert(`${msg}: ${e.message}`);

  const supa = {
    insert: (data) => supabase.from("tasks").insert(data).select().single(),
    update: (data, id) => supabase.from("tasks").update(data).eq("id", id),
    softDelete: (id) =>
      supabase.from("tasks").update({ is_active: false }).eq("id", id),
    fetch: () =>
      supabase
        .from("tasks")
        .select("*")
        .eq("is_active", true)
        .eq("id_user", userId)
        .order("created_at", { ascending: false }),
    getById: (id) => supabase.from("tasks").select("*").eq("id", id).single(),
  };

  const addHtmlItem = (t) => {
    const concluidoBtn =
      t.status === "pendente"
        ? `<a href="#" class="btn btn-sm btn-primary" title="Marcar como Concluído" onclick="markConclused(${t.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
          </a>`
        : "";

    listaTarefas.innerHTML += `
      <div class="card shadow-sm hover:bg-gray-50 transition mb-3">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="card-title mb-1 text-lg font-bold">${t.title}</h5>
            <div class="d-flex flex-row gap-4">
              <p class="card-text mb-0 text-sm text-muted">${t.created_at}</p>
              <span class="badge text-bg-primary">${t.status}</span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <a href="#" class="btn btn-light border" data-bs-toggle="modal" data-bs-target="#modalEditarTarefa" title="Editar" onclick="editTask(${t.id})">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
            </a>
            <a href="#" class="btn btn-danger" title="Excluir" onclick="deleteTask(${t.id})">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </a>
            ${concluidoBtn}
          </div>
        </div>
      </div>`;
  };

  async function listarTarefas() {
    const { data, error } = await supa.fetch();
    if (error) return showError("Erro ao listar tarefas", error);

    if (!data?.length) {
      listaTarefas.innerHTML =
        "<p class='text-muted'>Nenhuma tarefa encontrada.</p>";
      return;
    }

    const total = {
      geral: data.length,
      pendente: data.filter((t) => t.status === "pendente").length,
      concluido: data.filter((t) => t.status === "concluida").length,
    };

    document.getElementById("totalTarefasDisplay").textContent = total.geral;
    document.getElementById("totalPendenteDisplay").textContent =
      total.pendente;
    document.getElementById("totalConcluidoDisplay").textContent =
      total.concluido;

    listaTarefas.innerHTML = "";
    data.forEach(addHtmlItem);
  }

  async function adicionarOuEditarTarefa(e) {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const status = document.getElementById("status").value;

    if (!titulo || !status) return alert("Preencha os campos obrigatórios.");

    const novaTarefa = {
      title: titulo,
      description: descricao,
      status,
      id_user: userId,
    };

    const { data, error } = await supa.insert(novaTarefa);
    if (error) return alertError("Erro ao adicionar tarefa", error);

    addHtmlItem(data);
    modalTarefa.hide();
    formTarefa.reset();
    reload();
  }

  window.editTask = async (id) => {
    const { data, error } = await supa.getById(id);
    if (error) return showError("Erro ao carregar tarefa", error);

    document.getElementById("tituloEdit").value = data.title;
    document.getElementById("descricaoEdit").value = data.description;
    document.getElementById("statusEdit").value = data.status;
    editItemId = data.id;
  };

  window.saveEditTask = async () => {
    const titulo = document.getElementById("tituloEdit").value.trim();
    const descricao = document.getElementById("descricaoEdit").value.trim();
    const status = document.getElementById("statusEdit").value.trim();
    if (!titulo || !status || !editItemId) return;

    const editData = {
      title: titulo,
      description: descricao,
      status,
      id_user: userId,
    };
    const { error } = await supa.update(editData, editItemId);
    if (error) return alertError("Erro ao editar tarefa", error);
    reload();
  };

  window.markConclused = async (id) => {
    const { error } = await supa.update({ status: "concluida" }, id);
    if (error) return showError("Erro ao marcar como concluída", error);
    reload();
  };

  window.deleteTask = async (id) => {
    const { error } = await supa.softDelete(id);
    if (error) return showError("Erro ao excluir tarefa", error);
    reload();
  };

  function setupUserProfile() {
    const container = document.getElementById("user-profile");
    if (!container) return;
    const name = user.user_metadata?.name || "Usuário";
    const initial = name.charAt(0).toUpperCase();
    container.innerHTML = `
      <a href="#" id="logout-button" class="d-flex align-items-center text-white text-decoration-none">
        <img src="https://placehold.co/32x32/1e40af/ffffff?text=${initial}" class="rounded-circle me-2" />
        <strong>${name}</strong>
      </a>`;
    container.querySelector("#logout-button").onclick = (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "/index.html";
    };
  }

  formTarefa.addEventListener("submit", adicionarOuEditarTarefa);
  document
    .getElementById("btnSalvarTarefa")
    ?.addEventListener("click", adicionarOuEditarTarefa);

  setupUserProfile();
  listarTarefas();
});

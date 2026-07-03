/**
 * TODO App JavaScript - 実習用スターター
 * 第8回: セキュリティの基礎 & 総仕上げ
 */

const API_URL = "/todos";

// ============================================================
// TODO操作（CRUD）
// ============================================================

/**
 * TODO一覧を取得して表示する
 * 【実習5】try-catch でエラーハンドリングを追加
 */
async function loadTodos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      const error = await response.json();
      showError(error.detail || "TODOの取得に失敗しました");
      return;
    }
    const todos = await response.json();
    renderTodos(todos);
  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

/**
 * 新しいTODOを追加する
 * 【実習4】クライアント側バリデーションを追加
 * 【実習5】try-catch でエラーハンドリングを追加
 */
async function addTodo() {
  const input = document.getElementById("todo-input");
  const title = input.value.trim();

  // 【実習4】入力チェック（バリデーション）
  if (title === "") {
    showError("TODOのタイトルを入力してください");
    return;
  }
  if (title.length > 100) {
    showError("タイトルは100文字以内で入力してください");
    return;
  }

  // 【実習5】通信のエラーハンドリング
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title }),
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.detail || "TODOの追加に失敗しました");
      return;
    }

    input.value = "";
    await loadTodos();
  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

/**
 * TODOの完了状態を切り替える
 * 【実習5】try-catch でエラーハンドリングを追加
 */
async function toggleTodo(id, currentDone) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !currentDone }),
    });

    if (!response.ok) {
      showError("TODOの更新に失敗しました");
      return;
    }

    await loadTodos();
  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

/**
 * TODOを削除する
 * 【実習5】try-catch でエラーハンドリングを追加
 */
async function deleteTodo(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      showError("TODOの削除に失敗しました");
      return;
    }

    await loadTodos();
  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

// ============================================================
// 描画
// ============================================================

/**
 * TODOリストを描画する
 * 【実習2】createElement + textContent に書き換えてXSS脆弱性を修正
 */
function renderTodos(todos) {
  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");

    const label = document.createElement("label");
    label.className = "todo-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggleTodo(todo.id, todo.done));

    const titleSpan = document.createElement("span");
    titleSpan.className = "todo-title";
    titleSpan.textContent = todo.title; 

    label.appendChild(checkbox);
    label.appendChild(titleSpan);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(label);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

// ============================================================
// メッセージ表示
// ============================================================

/**
 * 【実習5】エラーメッセージを表示する関数
 */
function showError(message) {    
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 5000);
}

// ============================================================
// イベントリスナー
// ============================================================

document.getElementById("todo-form").addEventListener("submit", function (e) {
  e.preventDefault();
  addTodo();
});

// ページ読み込み時にTODO一覧を取得
loadTodos();
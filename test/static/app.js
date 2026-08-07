const API_URL = "/meals";

// 画面読み込み時に本日の日付を自動セットして一覧を取得
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("meal-date");
  if (dateInput) {
    dateInput.value = today;
  }
  loadMeals();
});

/**
 * 食事記録一覧を取得して表示
 */
async function loadMeals() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const error = await response.json();
      showError(error.detail || "食事記録の取得に失敗しました");
      return;
    }

    const meals = await response.json();
    renderMeals(meals);
  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

/**
 * 食事記録を追加
 */
async function addMeal() {
  const dateInput = document.getElementById("meal-date");
  const typeSelect = document.getElementById("meal-type");
  const menuInput = document.getElementById("meal-menu");
  const calInput = document.getElementById("meal-calories");

  const date = dateInput.value;
  const meal_type = typeSelect.value;
  const menu = menuInput.value.trim();
  const calories = calInput.value ? parseInt(calInput.value, 10) : 0;

  if (!date) {
    showError("日付を選択してください");
    return;
  }
  if (menu === "") {
    showError("メニュー名を入力してください");
    return;
  }
  if (menu.length > 100) {
    showError("メニュー名は100文字以内で入力してください");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: date,
        meal_type: meal_type,
        menu: menu,
        calories: calories,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.detail || "食事記録の追加に失敗しました");
      return;
    }

    menuInput.value = "";
    calInput.value = "";
    await loadMeals();
  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

/**
 * 食事記録を削除
 */
async function deleteMeal(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.detail || "記録の削除に失敗しました");
      return;
    }

    await loadMeals();
  } catch (error) {
    showError("通信エラーが発生しました");
  }
}

/**
 * 食事リストの描画（textContentによるXSS対策）
 */
function renderMeals(meals) {
  const list = document.getElementById("meal-list");
  list.innerHTML = "";

  meals.forEach((meal) => {
    const li = document.createElement("li");
    li.className = "meal-item";

    const infoDiv = document.createElement("div");
    infoDiv.className = "meal-info";

    // 日付と区分のヘッダー部
    const headerDiv = document.createElement("div");
    headerDiv.className = "meal-header";

    const dateSpan = document.createElement("span");
    dateSpan.className = "meal-date";
    dateSpan.textContent = meal.date;

    const badgeSpan = document.createElement("span");
    badgeSpan.className = `meal-badge badge-${meal.meal_type}`;
    badgeSpan.textContent = meal.meal_type;

    headerDiv.appendChild(dateSpan);
    headerDiv.appendChild(badgeSpan);

    // メニュー名とカロリーのボディ部
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "meal-body";

    const titleSpan = document.createElement("span");
    titleSpan.className = "meal-title";
    titleSpan.textContent = meal.menu;

    bodyDiv.appendChild(titleSpan);

    if (meal.calories > 0) {
      const calSpan = document.createElement("span");
      calSpan.className = "meal-calories";
      calSpan.textContent = `${meal.calories} kcal`;
      bodyDiv.appendChild(calSpan);
    }

    infoDiv.appendChild(headerDiv);
    infoDiv.appendChild(bodyDiv);

    // 削除ボタン
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => deleteMeal(meal.id));

    li.appendChild(infoDiv);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 5000);
}

document.getElementById("meal-form").addEventListener("submit", function (e) {
  e.preventDefault();
  addMeal();
});

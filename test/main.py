import sqlite3
import uvicorn

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(title="Meal Tracker App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = "meals.db"


def init_db():
    """データベースとテーブルの初期化"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            meal_type TEXT NOT NULL,
            menu TEXT NOT NULL,
            calories INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()


class MealCreate(BaseModel):
    date: str = Field(min_length=1, max_length=10)
    meal_type: str = Field(min_length=1, max_length=20)
    menu: str = Field(min_length=1, max_length=100)
    calories: int = Field(default=0, ge=0, le=10000)


@app.get("/meals")
def get_meals():
    """食事記録一覧を日付の新しい順で取得"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, date, meal_type, menu, calories FROM meals ORDER BY date DESC, id DESC"
    )
    meals = cursor.fetchall()
    conn.close()

    return [
        {
            "id": meal[0],
            "date": meal[1],
            "meal_type": meal[2],
            "menu": meal[3],
            "calories": meal[4],
        }
        for meal in meals
    ]


@app.post("/meals", status_code=201)
def create_meal(meal: MealCreate):
    """新しい食事記録を追加"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO meals (date, meal_type, menu, calories) VALUES (?, ?, ?, ?)",
        (meal.date, meal.meal_type, meal.menu, meal.calories),
    )
    conn.commit()
    meal_id = cursor.lastrowid
    conn.close()

    return {
        "id": meal_id,
        "date": meal.date,
        "meal_type": meal.meal_type,
        "menu": meal.menu,
        "calories": meal.calories,
    }


@app.delete("/meals/{meal_id}")
def delete_meal(meal_id: int):
    """食事記録を削除"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM meals WHERE id = ?", (meal_id,))
    existing = cursor.fetchone()

    if existing is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Meal record not found")

    cursor.execute("DELETE FROM meals WHERE id = ?", (meal_id,))
    conn.commit()
    conn.close()

    return {"message": "Meal deleted", "id": meal_id}


app.mount("/", StaticFiles(directory="static", html=True), name="static")

init_db()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

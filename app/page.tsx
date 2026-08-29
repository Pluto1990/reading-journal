"use client";

import { FormEvent, useEffect, useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  status: string;
  rating: number;
  year: string | null;
  cover: string | null;
  note: string | null;
  createdAt?: string;
};

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("想閱讀");
  const [rating, setRating] = useState(0);
  const [year, setYear] = useState("");
  const [cover, setCover] = useState("");
  const [note, setNote] = useState("");

  // =========================
  // GET
  // =========================

  const getBooks = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/books");

      if (!response.ok) {
        throw new Error("取得書籍失敗");
      }

      const data = await response.json();

      setBooks(data);
    } catch (error) {
      console.error("取得書籍失敗：", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBooks();
  }, []);

  // =========================
  // Reset Form
  // =========================

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setStatus("想閱讀");
    setRating(0);
    setYear("");
    setCover("");
    setNote("");
  };

  // =========================
  // Open Add Modal
  // =========================

  const openAddModal = () => {
    resetForm();
    setEditingBook(null);
    setShowForm(true);
  };

  // =========================
  // Open Edit Modal
  // =========================

  const openEditModal = (book: Book) => {
    setEditingBook(book);

    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
    setRating(book.rating);
    setYear(book.year || "");
    setCover(book.cover || "");
    setNote(book.note || "");

    setShowForm(true);
  };

  // =========================
  // Close Modal
  // =========================

  const closeModal = () => {
    if (submitting) return;

    setShowForm(false);
    setEditingBook(null);
    resetForm();
  };

  // =========================
  // POST / PUT
  // =========================

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);

    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : "/api/books";

      const method = editingBook ? "PUT" : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title,
          author,
          status,
          rating,
          year,
          cover,
          note,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.message || (editingBook ? "更新書籍失敗" : "新增書籍失敗"),
        );
      }

      await getBooks();

      setShowForm(false);
      setEditingBook(null);
      resetForm();
    } catch (error) {
      console.error("儲存書籍失敗：", error);

      alert(error instanceof Error ? error.message : "操作失敗");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async () => {
    if (!editingBook) return;

    const confirmed = window.confirm(`確定要刪除《${editingBook.title}》嗎？`);

    if (!confirmed) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/books/${editingBook.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || "刪除書籍失敗");
      }

      await getBooks();

      setShowForm(false);
      setEditingBook(null);
      resetForm();
    } catch (error) {
      console.error("刪除書籍失敗：", error);

      alert(error instanceof Error ? error.message : "刪除書籍失敗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="journal">
      {/* Header */}

      <header className="journalHeader">
        <div className="journalTitle">
          <span className="jpTitle">MY READING JOURNAL</span>

          <h1>好呀已讀</h1>

          <p>記錄每一本讀過的書，以及留下來的想法。</p>
        </div>

        <button className="addButton" onClick={openAddModal}>
          <span className="addIcon">＋</span>
          <span>新增書籍</span>
        </button>
      </header>

      {/* Intro */}

      <div className="journalIntro">
        <span>2026</span>

        <p>共 {String(books.length).padStart(2, "0")} 本</p>
      </div>

      {/* List */}

      {loading ? (
        <div className="loading">
          <span className="loadingLine" />
          <p>載入閱讀紀錄中...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="emptyState">
          <span>NO BOOKS YET</span>

          <h2>還沒有閱讀紀錄</h2>

          <p>從第一本書開始建立你的閱讀手札。</p>

          <button onClick={openAddModal}>＋ 新增第一本書</button>
        </div>
      ) : (
        <section className="bookList">
          {books.map((book, index) => (
            <article className="bookItem" key={book.id}>
              <div className="bookNumber">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="bookCover">
                {book.cover ? (
                  <img src={book.cover} alt={`${book.title}封面`} />
                ) : (
                  <div className="noCover">
                    <span>BOOK</span>
                  </div>
                )}
              </div>

              <div className="bookMain">
                <span className="bookStatus">{book.status}</span>

                <h2>{book.title}</h2>

                <p className="author">{book.author}</p>

                {book.note && <p className="bookNote">{book.note}</p>}
              </div>

              <div className="bookMeta">
                {book.year && <span className="bookYear">{book.year}</span>}

                {book.rating > 0 && (
                  <span className="rating">
                    {"★".repeat(book.rating)}
                    {"☆".repeat(5 - book.rating)}
                  </span>
                )}
              </div>

              <button
                className="bookArrow"
                aria-label={`編輯${book.title}`}
                onClick={() => openEditModal(book)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M7 17L17 7M9 7h8v8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </article>
          ))}
        </section>
      )}

      {/* Modal */}

      {showForm && (
        <div className="modalBackdrop" onClick={closeModal}>
          <div
            className="bookModal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modalHeader">
              <div>
                <span className="modalEnglish">
                  {editingBook ? "EDIT BOOK" : "NEW BOOK"}
                </span>

                <h2>{editingBook ? "編輯書籍" : "新增書籍"}</h2>

                <p className="modalDescription">
                  {editingBook
                    ? "更新這本書的閱讀紀錄"
                    : "記錄一本新的閱讀書籍"}
                </p>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={closeModal}
                aria-label="關閉視窗"
              >
                ×
              </button>
            </div>

            <form className="bookForm" onSubmit={handleSubmit}>
              <div className="formRow">
                <label>
                  <span>
                    書名
                    <b>*</b>
                  </span>

                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="輸入書名"
                    required
                  />
                </label>

                <label>
                  <span>
                    作者
                    <b>*</b>
                  </span>

                  <input
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    placeholder="輸入作者"
                    required
                  />
                </label>
              </div>

              <div className="formRow">
                <label>
                  <span>閱讀狀態</span>

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="想閱讀">想閱讀</option>

                    <option value="閱讀中">閱讀中</option>

                    <option value="已讀完">已讀完</option>
                  </select>
                </label>

                <label>
                  <span>評分</span>

                  <select
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                  >
                    <option value="0">尚未評分</option>

                    <option value="1">★</option>

                    <option value="2">★★</option>

                    <option value="3">★★★</option>

                    <option value="4">★★★★</option>

                    <option value="5">★★★★★</option>
                  </select>
                </label>
              </div>

              <div className="formRow">
                <label>
                  <span>出版年份</span>

                  <input
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    placeholder="例如：2002"
                  />
                </label>

                <label>
                  <span>封面圖片網址</span>

                  <input
                    value={cover}
                    onChange={(event) => setCover(event.target.value)}
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label>
                <span>閱讀心得</span>

                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="寫下一些讀完後的想法..."
                  maxLength={500}
                  rows={5}
                />

                <small className="characterCount">{note.length} / 500</small>
              </label>

              <div className={`formActions ${editingBook ? "editing" : ""}`}>
                {editingBook && (
                  <button
                    type="button"
                    className="deleteButton"
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    刪除書籍
                  </button>
                )}

                <div className="formActionRight">
                  <button
                    type="button"
                    className="cancelButton"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    取消
                  </button>

                  <button
                    type="submit"
                    className="submitButton"
                    disabled={submitting}
                  >
                    {submitting
                      ? "儲存中..."
                      : editingBook
                        ? "儲存變更"
                        : "儲存書籍"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

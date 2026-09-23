const tracks = [
  {
    id: 1,
    title: "Midnight Echo",
    artist: "Moonlight Avenue",
    genre: "Indie pop",
    rating: 9.4,
    duration: "3:42"
  },
  {
    id: 2,
    title: "Glass Horizon",
    artist: "Velvet Noise",
    genre: "Dream pop",
    rating: 9.1,
    duration: "4:08"
  },
  {
    id: 3,
    title: "Neon Skyline",
    artist: "Static Rooms",
    genre: "Synthwave",
    rating: 9.7,
    duration: "3:56"
  },
  {
    id: 4,
    title: "Velvet Rain",
    artist: "Night Bloom",
    genre: "Alternative",
    rating: 8.9,
    duration: "4:21"
  },
  {
    id: 5,
    title: "Silver Memory",
    artist: "Quiet Signal",
    genre: "Ambient",
    rating: 9.0,
    duration: "5:04"
  }
];

const DIARY_STORAGE_KEY = "music-diary-entries";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return map[char] || char;
  });
}

function filterTracks(query) {
  const normalised = query.trim().toLowerCase();

  if (!normalised) return tracks;

  return tracks.filter((track) =>
    track.title.toLowerCase().includes(normalised) ||
    track.artist.toLowerCase().includes(normalised) ||
    track.genre.toLowerCase().includes(normalised)
  );
}

function renderTrackCards(items) {
  const container = document.getElementById("track-list");

  if (!container) return;

  if (!items.length) {
    container.innerHTML = '<p class="empty-message">Ничего не найдено. Попробуйте другой запрос.</p>';
    return;
  }

  container.innerHTML = items.map((track, index) => `
    <article class="track-card">
      <div class="track-cover cover-${(index % 4) + 1}"></div>
      <div class="track-body">
        <span class="tag">${escapeHtml(track.genre)}</span>
        <h3>${escapeHtml(track.title)}</h3>
        <p>${escapeHtml(track.artist)}</p>
        <div class="meta">
          <span>★ ${escapeHtml(track.rating)}</span>
          <span>${escapeHtml(track.duration)}</span>
        </div>
      </div>
    </article>
  `).join("");
}

function renderSearchResults(items) {
  const container = document.getElementById("search-results");

  if (!container) return;

  if (!items.length) {
    container.innerHTML = '<p class="empty-message">Ничего не найдено.</p>';
    return;
  }

  container.innerHTML = items.map((track) => `
    <article class="result-item">
      <h3>${escapeHtml(track.title)}</h3>
      <p>${escapeHtml(track.artist)} · ${escapeHtml(track.genre)}</p>
    </article>
  `).join("");
}

function getDiaryEntries() {
  try {
    return JSON.parse(localStorage.getItem(DIARY_STORAGE_KEY) || "[]");
  } catch (error) {
    console.warn("Не удалось прочитать записи дневника:", error);
    return [];
  }
}

function saveDiaryEntries(entries) {
  try {
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Не удалось сохранить записи дневника:", error);
  }
}

function renderDiaryEntries() {
  const container = document.getElementById("saved-entries");

  if (!container) return;

  const entries = getDiaryEntries();

  if (!entries.length) {
    container.innerHTML = '<p class="empty-message">Пока нет сохранённых записей.</p>';
    return;
  }

  container.innerHTML = entries.map((entry) => `
    <article class="saved-entry">
      <div class="saved-entry-header">
        <strong>${escapeHtml(entry.title)}</strong>
        <span>${escapeHtml(entry.emotion)}</span>
      </div>
      <div class="saved-entry-meta">
        ${escapeHtml(entry.artist)} · ${escapeHtml(entry.date)} · ★ ${escapeHtml(entry.rating)}
      </div>
      <p>${escapeHtml(entry.notes)}</p>
    </article>
  `).join("");
}

function validateDiaryForm(form) {
  const trackName = form.querySelector("#track-name");
  const artistName = form.querySelector("#artist-name");
  const rating = form.querySelector("#rating");
  const notes = form.querySelector("#notes");
  const emotion = form.querySelector("#emotion");

  if (!trackName || !trackName.value.trim()) {
    alert("Введите название трека.");
    trackName?.focus();
    return false;
  }

  if (!artistName || !artistName.value.trim()) {
    alert("Введите имя исполнителя.");
    artistName?.focus();
    return false;
  }

  if (!rating || !rating.value) {
    alert("Укажите оценку.");
    rating?.focus();
    return false;
  }

  const value = Number(rating.value);

  if (Number.isNaN(value) || value < 1 || value > 10) {
    alert("Оценка должна быть в диапазоне от 1 до 10.");
    rating.focus();
    return false;
  }

  if (!emotion || !emotion.value) {
    alert("Выберите эмоциональный тег.");
    emotion?.focus();
    return false;
  }

  if (!notes || !notes.value.trim() || notes.value.trim().length < 10) {
    alert("Впечатления должны содержать минимум 10 символов.");
    notes?.focus();
    return false;
  }

  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  const queryInput = document.getElementById("search-query");
  const diaryForm = document.getElementById("diary-form");

  if (input) {
    input.addEventListener("input", (event) => {
      const filtered = filterTracks(event.target.value);
      renderTrackCards(filtered);
    });

    renderTrackCards(tracks);
  }

  if (queryInput) {
    queryInput.addEventListener("input", (event) => {
      const filtered = filterTracks(event.target.value);
      renderSearchResults(filtered);
    });

    renderSearchResults(tracks);
  }

  renderDiaryEntries();

  if (diaryForm) {
    diaryForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateDiaryForm(diaryForm)) return;

      const trackName = diaryForm.querySelector("#track-name");
      const artistName = diaryForm.querySelector("#artist-name");
      const dateHeard = diaryForm.querySelector("#date-heard");
      const rating = diaryForm.querySelector("#rating");
      const emotion = diaryForm.querySelector("#emotion");
      const notes = diaryForm.querySelector("#notes");

      const entry = {
        id: Date.now(),
        title: trackName.value.trim(),
        artist: artistName.value.trim(),
        date: dateHeard && dateHeard.value ? dateHeard.value : new Date().toISOString().split("T")[0],
        rating: Number(rating.value),
        emotion: emotion.value,
        notes: notes.value.trim()
      };

      const entries = getDiaryEntries();
      entries.unshift(entry);
      saveDiaryEntries(entries);
      renderDiaryEntries();

      alert("Запись успешно сохранена!");
      diaryForm.reset();
    });
  }
});
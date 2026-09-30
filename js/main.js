const tracks = [
  {
    id: 1,
    title: "Midnight Echo",
    artist: "Moonlight Avenue",
    genre: "Indie pop",
    rating: 9.4,
    duration: "3:42",
    album: "After the Blue Hour",
    releaseDate: "2024-03-15",
    description: "Мягкий инди-поп о тихих улицах, ночных огнях и мыслях, которые приходят после полуночи."
  },
  {
    id: 2,
    title: "Glass Horizon",
    artist: "Velvet Noise",
    genre: "Dream pop",
    rating: 9.1,
    duration: "4:08",
    album: "Glass Gardens",
    releaseDate: "2023-11-02",
    description: "Воздушные синтезаторы и многослойный вокал создают ощущение сна на границе яви."
  },
  {
    id: 3,
    title: "Neon Skyline",
    artist: "Static Rooms",
    genre: "Synthwave",
    rating: 9.7,
    duration: "3:56",
    album: "City After Dark",
    releaseDate: "2025-01-24",
    description: "Неоновый синтвейв о движении по ночному городу и поиске своего маршрута."
  },
  {
    id: 4,
    title: "Velvet Rain",
    artist: "Night Bloom",
    genre: "Alternative",
    rating: 8.9,
    duration: "4:21",
    album: "Soft Weather",
    releaseDate: "2022-08-19",
    description: "Альтернативная баллада с выразительной гитарой и спокойным, почти кинематографичным настроением."
  },
  {
    id: 5,
    title: "Silver Memory",
    artist: "Quiet Signal",
    genre: "Ambient",
    rating: 9.0,
    duration: "5:04",
    album: "Small Frequencies",
    releaseDate: "2024-06-07",
    description: "Неспешная эмбиент-композиция, построенная на тёплых текстурах и длинных паузах."
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

function getTrackPageUrl(track) {
  const pagesDirectory = window.location.pathname.includes("/pages/");
  const prefix = pagesDirectory ? "" : "pages/";
  return `${prefix}track.html?id=${encodeURIComponent(track.id)}`;
}

function renderTrackCards(items, container = document.getElementById("track-list")) {
  if (!container) return;

  if (!items.length) {
    container.innerHTML = '<p class="empty-message">Ничего не найдено. Попробуйте другой запрос.</p>';
    return;
  }

  container.innerHTML = items.map((track, index) => `
    <a class="track-card" href="${getTrackPageUrl(track)}" aria-label="Открыть трек ${escapeHtml(track.title)}">
      <div class="track-cover cover-${track.id || (index % 5) + 1}"></div>
      <div class="track-body">
        <span class="tag">${escapeHtml(track.genre)}</span>
        <h3>${escapeHtml(track.title)}</h3>
        <p>${escapeHtml(track.artist)}</p>
        <div class="meta">
          <span>★ ${escapeHtml(track.rating)}</span>
          <span>${escapeHtml(track.duration)}</span>
        </div>
      </div>
    </a>
  `).join("");
}

function renderGlobalSearchResults(items) {
  const container = document.getElementById("global-search-results");

  if (!container) return;

  if (!items.length) {
    container.innerHTML = '<p class="empty-message">Ничего не найдено.</p>';
    return;
  }

  container.innerHTML = items.map((track) => `
    <a class="result-item" href="pages/track.html?id=${encodeURIComponent(track.id)}">
      <h3>${escapeHtml(track.title)}</h3>
      <p>${escapeHtml(track.artist)} · ${escapeHtml(track.genre)}</p>
    </a>
  `).join("");
}

function renderTrackDetails() {
  const detailContainer = document.getElementById("track-details");

  if (!detailContainer) return;

  const trackId = new URLSearchParams(window.location.search).get("id");
  const track = tracks.find((item) => String(item.id) === trackId);

  if (!track) {
    detailContainer.innerHTML = '<p class="empty-message">Трек не найден. Вернитесь в коллекцию и выберите другой.</p>';
    return;
  }

  document.title = `${track.title} | Music Diary`;
  document.getElementById("track-page-title").textContent = track.title;
  document.getElementById("track-page-artist").textContent = track.artist;
  document.getElementById("track-artwork").className = `track-artwork cover-${track.id}`;
  document.getElementById("track-artwork").setAttribute("aria-label", `Обложка трека ${track.title}`);
  detailContainer.innerHTML = `
    <div class="track-detail-heading">
      <span class="tag">${escapeHtml(track.genre)}</span>
      <h2>${escapeHtml(track.title)}</h2>
      <p class="track-detail-artist">${escapeHtml(track.artist)}</p>
    </div>
    <p class="track-description">${escapeHtml(track.description)}</p>
    <dl class="track-facts">
      <div><dt>Альбом</dt><dd>${escapeHtml(track.album)}</dd></div>
      <div><dt>Дата выхода</dt><dd>${formatDate(track.releaseDate)}</dd></div>
      <div><dt>Жанр</dt><dd>${escapeHtml(track.genre)}</dd></div>
      <div><dt>Длительность</dt><dd>${escapeHtml(track.duration)}</dd></div>
      <div><dt>Оценка</dt><dd>★ ${escapeHtml(track.rating)} / 10</dd></div>
    </dl>
  `;
}

function getDiaryEntries() {
  try {
    const entries = JSON.parse(localStorage.getItem(DIARY_STORAGE_KEY) || "[]");
    return Array.isArray(entries) ? entries : [];
  } catch (error) {
    console.warn("Не удалось прочитать записи дневника:", error);
    return [];
  }
}

function saveDiaryEntries(entries) {
  try {
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.warn("Не удалось сохранить записи дневника:", error);
    return false;
  }
}

function formatDate(date) {
  if (!date) return "Дата не указана";

  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? escapeHtml(date)
    : parsedDate.toLocaleDateString("ru-RU");
}

function renderDiaryEntries() {
  const container = document.getElementById("saved-entries");
  const count = document.getElementById("saved-entry-count");
  const entries = getDiaryEntries();

  if (count) count.textContent = String(entries.length);
  if (!container) return;

  if (!entries.length) {
    container.innerHTML = '<p class="empty-message">Пока нет сохранённых записей.</p>';
    return;
  }

  container.innerHTML = entries.map((entry) => `
    <article class="saved-entry">
      <div class="saved-entry-header">
        <strong>${escapeHtml(entry.title)}</strong>
        <span>${escapeHtml(entry.emotion || "Без тега")}</span>
      </div>
      <div class="saved-entry-meta">
        ${escapeHtml(entry.artist)} · ${formatDate(entry.date)} · ★ ${escapeHtml(entry.rating)}
      </div>
      <p>${escapeHtml(entry.notes)}</p>
      ${entry.memory ? `<p class="entry-memory-link">Воспоминание: ${escapeHtml(entry.memory.place)}</p>` : ""}
      <div class="entry-actions">
        <button class="secondary-button" type="button" data-entry-action="edit" data-entry-id="${escapeHtml(entry.id)}">Редактировать</button>
        <button class="delete-button" type="button" data-entry-action="delete" data-entry-id="${escapeHtml(entry.id)}">Удалить</button>
      </div>
    </article>
  `).join("");
}

function renderMemories() {
  const container = document.getElementById("memory-list");

  if (!container) return;

  const memories = getDiaryEntries().filter((entry) => entry.memory);

  if (!memories.length) {
    container.innerHTML = '<p class="empty-message">Пока нет воспоминаний. Добавьте блок воспоминания при создании записи в дневнике.</p>';
    return;
  }

  container.innerHTML = memories.map((entry) => {
    const memory = entry.memory;
    const photo = typeof memory.photo === "string" && /^data:image\/(png|jpeg|webp|gif);base64,/i.test(memory.photo)
      ? `<img class="memory-photo" src="${escapeHtml(memory.photo)}" alt="Фотография: ${escapeHtml(memory.place)}" />`
      : "";

    return `
      <article class="memory-card">
        ${photo}
        <div class="memory-body">
          <span class="memory-date">${formatDate(entry.date)}</span>
          <h3>${escapeHtml(memory.place)}</h3>
          <p class="memory-track">Трек: ${escapeHtml(entry.title)} · ${escapeHtml(entry.artist)}</p>
          <p>${escapeHtml(memory.description)}</p>
        </div>
      </article>
    `;
  }).join("");
}

function validateDiaryForm(form) {
  const trackName = form.querySelector("#track-name");
  const artistName = form.querySelector("#artist-name");
  const rating = form.querySelector("#rating");
  const notes = form.querySelector("#notes");
  const emotion = form.querySelector("#emotion");
  const memoryPlace = form.querySelector("#memory-place");
  const memoryDescription = form.querySelector("#memory-description");
  const memoryPhoto = form.querySelector("#memory-photo");

  if (!trackName.value.trim()) {
    alert("Введите название трека.");
    trackName.focus();
    return false;
  }

  if (!artistName.value.trim()) {
    alert("Введите имя исполнителя.");
    artistName.focus();
    return false;
  }

  const value = Number(rating.value);
  if (!rating.value || Number.isNaN(value) || value < 1 || value > 10) {
    alert("Укажите оценку от 1 до 10.");
    rating.focus();
    return false;
  }

  if (!emotion.value) {
    alert("Выберите эмоциональный тег.");
    emotion.focus();
    return false;
  }

  if (notes.value.trim().length < 10) {
    alert("Впечатления должны содержать минимум 10 символов.");
    notes.focus();
    return false;
  }

  const hasMemoryDetails = memoryPlace.value.trim() || memoryDescription.value.trim() || memoryPhoto.files.length;
  if (hasMemoryDetails && (!memoryPlace.value.trim() || !memoryDescription.value.trim())) {
    alert("Для воспоминания заполните место или событие и его описание. Фотография необязательна.");
    (memoryPlace.value.trim() ? memoryDescription : memoryPlace).focus();
    return false;
  }

  if (memoryPhoto.files[0] && memoryPhoto.files[0].size > 8 * 1024 * 1024) {
    alert("Размер фотографии не должен превышать 8 МБ.");
    memoryPhoto.focus();
    return false;
  }

  return true;
}

function optimizePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не удалось прочитать фотографию."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Не удалось обработать фотографию."));
      image.onload = () => {
        const maxDimension = 1200;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.76));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function resetDiaryEditing(form, submitButton, cancelButton) {
  form.reset();
  form.dataset.editingId = "";
  submitButton.textContent = "Сохранить запись";
  cancelButton.hidden = true;
}

function startDiaryEditing(entry, form, submitButton, cancelButton) {
  form.querySelector("#track-name").value = entry.title || "";
  form.querySelector("#artist-name").value = entry.artist || "";
  form.querySelector("#date-heard").value = entry.date || "";
  form.querySelector("#rating").value = entry.rating || "";
  form.querySelector("#emotion").value = entry.emotion || "";
  form.querySelector("#notes").value = entry.notes || "";
  form.querySelector("#memory-place").value = entry.memory?.place || "";
  form.querySelector("#memory-description").value = entry.memory?.description || "";
  form.querySelector("#memory-photo").value = "";
  form.dataset.editingId = String(entry.id);
  submitButton.textContent = "Сохранить изменения";
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  const collectionSearch = document.getElementById("search-input");
  const globalSearch = document.getElementById("global-search");
  const diaryForm = document.getElementById("diary-form");
  const savedEntries = document.getElementById("saved-entries");
  const savedEntriesToggle = document.getElementById("toggle-saved-entries");
  const savedEntriesPanel = document.getElementById("saved-entries-panel");
  const submitButton = diaryForm?.querySelector('button[type="submit"]');
  const cancelButton = document.getElementById("cancel-edit");

  renderTrackDetails();

  if (collectionSearch) {
    collectionSearch.addEventListener("input", (event) => {
      renderTrackCards(filterTracks(event.target.value));
    });
    renderTrackCards(tracks);
  }

  if (globalSearch) {
    globalSearch.addEventListener("input", (event) => {
      const query = event.target.value.trim();
      const results = document.getElementById("global-search-results");
      if (!query) {
        results.innerHTML = "";
        return;
      }
      renderGlobalSearchResults(filterTracks(query));
    });
  }

  const popularTracks = document.getElementById("popular-tracks");
  if (popularTracks) renderTrackCards(tracks.slice(0, 5), popularTracks);

  renderDiaryEntries();
  renderMemories();

  if (savedEntriesToggle && savedEntriesPanel) {
    savedEntriesToggle.addEventListener("click", () => {
      const expanded = savedEntriesToggle.getAttribute("aria-expanded") === "true";
      savedEntriesToggle.setAttribute("aria-expanded", String(!expanded));
      savedEntriesPanel.hidden = expanded;
    });
  }

  if (savedEntries && diaryForm && submitButton && cancelButton) {
    savedEntries.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-entry-action]");
      if (!button) return;

      const entryId = button.dataset.entryId;
      const entries = getDiaryEntries();
      const entry = entries.find((item) => String(item.id) === entryId);
      if (!entry) return;

      if (button.dataset.entryAction === "edit") {
        startDiaryEditing(entry, diaryForm, submitButton, cancelButton);
        return;
      }

      if (button.dataset.entryAction === "delete" && confirm(`Удалить запись «${entry.title}»?`)) {
        const updatedEntries = entries.filter((item) => String(item.id) !== entryId);
        if (saveDiaryEntries(updatedEntries)) {
          renderDiaryEntries();
          renderMemories();
        } else {
          alert("Не удалось удалить запись из хранилища браузера.");
        }
      }
    });
  }

  if (diaryForm) {
    cancelButton.addEventListener("click", () => resetDiaryEditing(diaryForm, submitButton, cancelButton));

    diaryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validateDiaryForm(diaryForm)) return;

      const photoFile = diaryForm.querySelector("#memory-photo").files[0];
      const oldEntries = getDiaryEntries();
      const editingId = diaryForm.dataset.editingId;
      const previousEntry = oldEntries.find((entry) => String(entry.id) === editingId);
      const memoryPlace = diaryForm.querySelector("#memory-place").value.trim();
      const memoryDescription = diaryForm.querySelector("#memory-description").value.trim();
      let photo = previousEntry?.memory?.photo || "";

      try {
        if (photoFile) photo = await optimizePhoto(photoFile);
      } catch (error) {
        alert(error.message);
        return;
      }

      const hasMemory = Boolean(memoryPlace && memoryDescription);
      const entry = {
        id: previousEntry ? previousEntry.id : Date.now(),
        title: diaryForm.querySelector("#track-name").value.trim(),
        artist: diaryForm.querySelector("#artist-name").value.trim(),
        date: diaryForm.querySelector("#date-heard").value || new Date().toISOString().slice(0, 10),
        rating: Number(diaryForm.querySelector("#rating").value),
        emotion: diaryForm.querySelector("#emotion").value,
        notes: diaryForm.querySelector("#notes").value.trim(),
        ...(hasMemory ? { memory: { place: memoryPlace, description: memoryDescription, photo } } : {})
      };

      const updatedEntries = previousEntry
        ? oldEntries.map((item) => String(item.id) === editingId ? entry : item)
        : [entry, ...oldEntries];

      if (!saveDiaryEntries(updatedEntries)) {
        alert("Не удалось сохранить запись. Возможно, в браузере закончилось место для хранения.");
        return;
      }

      renderDiaryEntries();
      renderMemories();
      resetDiaryEditing(diaryForm, submitButton, cancelButton);
      alert(previousEntry ? "Изменения сохранены." : "Запись успешно сохранена!");
    });
  }
});
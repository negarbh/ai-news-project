const newsContainer = document.getElementById("news-container");
let allArticles = [];
let visibleCount = 6;
let likesData = {};

// ================== render news ==================
function renderNews(articles) {
  newsContainer.innerHTML = "";

  articles.slice(0, visibleCount).forEach(article => {
    const likes = likesData[article.title] || 0;

    const card = document.createElement("div");
    card.className = "news-card";

    card.innerHTML = `
      <img src="${article.urlToImage || 'https://via.placeholder.com/300x180'}">

      <div class="news-card-content">
        <h3>${article.title}</h3>
        <p>${article.description || ""}</p>

        <div style="display:flex; gap:10px; margin:10px 0;">
          <button class="like-btn" data-title="${article.title}">
            👍 <span>${likes}</span>
          </button>

          <button class="fav-btn"
            data-title="${article.title}"
            data-url="${article.url}"
            data-image="${article.urlToImage || ''}"
            data-description="${article.description || ''}">
            ⭐ علاقه‌مندی
          </button>
        </div>

        <a href="${article.url}" target="_blank">بیشتر بخوانید</a>
      </div>
    `;

    newsContainer.appendChild(card);
  });

  document.getElementById("load-more").style.display =
    visibleCount >= articles.length ? "none" : "block";
}

// ================== fetch news ==================
function fetchNews(query = "هوش مصنوعی") {
  fetch(`/api/news?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === "ok") {
        allArticles = data.articles;
        visibleCount = 6;
        loadLikes();
      } else {
        newsContainer.innerHTML = "<p>خطا در دریافت اخبار</p>";
      }
    })
    .catch(() => {
      newsContainer.innerHTML = "<p>خطا در دریافت اخبار</p>";
    });
}

// ================== likes ==================
function loadLikes() {
  fetch("/likes")
    .then(res => res.json())
    .then(data => {
      likesData = {};
      data.forEach(item => likesData[item.title] = item.count);
      renderNews(allArticles);
    });
}

// ================== load more ==================
function loadMore() {
  visibleCount += 6;
  renderNews(allArticles);
}

// ================== filter ==================
function filterByTopic(topic) {
  fetchNews(topic);
}

// ================== search ==================
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

searchButton.addEventListener("click", () => {
  if (searchInput.value.trim()) {
    fetchNews(searchInput.value.trim());
  }
});

searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    fetchNews(searchInput.value.trim());
  }
});

// ================== comments ==================
const commentForm = document.getElementById("comment-form");
const commentsContainer = document.getElementById("comments-container");

function loadComments() {
  fetch("/comments")
    .then(res => res.json())
    .then(comments => {
      commentsContainer.innerHTML = "";
      comments.forEach(c => {
        const div = document.createElement("div");
        div.className = "comment-card";
        div.innerHTML = `
          <h4>${c.name}</h4>
          <p>${c.text}</p>
          <div class="comment-date">${c.date}</div>
        `;
        commentsContainer.appendChild(div);
      });
    });
}

commentForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("comment-name").value.trim();
  const text = document.getElementById("comment-text").value.trim();

  if (!name || !text) {
    alert("نام و نظر را وارد کنید");
    return;
  }

  fetch("/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, text })
  })
    .then(res => res.json())
    .then(() => {
      commentForm.reset();
      loadComments();
    });
});

// ================== click events (like + favorite) ==================
document.addEventListener("click", e => {
  // 👍 like
  if (e.target.closest(".like-btn")) {
    const btn = e.target.closest(".like-btn");
    const title = btn.dataset.title;

    fetch("/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    }).then(() => loadLikes());
  }

  // ⭐ favorite
  if (e.target.closest(".fav-btn")) {
    const btn = e.target.closest(".fav-btn");

    fetch("/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: btn.dataset.title,
        url: btn.dataset.url,
        image: btn.dataset.image,
        description: btn.dataset.description
      })
    })
      .then(res => res.json())
      .then(() => alert("⭐ به علاقه‌مندی‌ها اضافه شد"));
  }
});

// ================== menu ==================
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

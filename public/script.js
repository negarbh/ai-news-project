const apiKey = "f62ecc7d91f543f59e791d8a38922016";
const newsContainer = document.getElementById("news-container");
let allArticles = [];
let visibleCount = 6;
let likesData = {};

function renderNews(articles) {
  newsContainer.innerHTML = "";
  articles.slice(0, visibleCount).forEach(article => {
    const title = article.title;
    const likes = likesData[title] || 0;
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <img src="${article.urlToImage || 'https://via.placeholder.com/300x180?text=No+Image'}" />
      <div class="news-card-content">
        <h3>${article.title}</h3>
        <p>${article.description || ''}</p>
        <div class="like-section">
          <button class="like-btn" data-title="${title}">👍 <span>${likes}</span></button>
        </div>
        <a href="${article.url}" target="_blank">بیشتر بخوانید</a>
      </div>
    `;
    newsContainer.appendChild(card);
  });

  const loadMoreBtn = document.getElementById("load-more");
  loadMoreBtn.style.display = (visibleCount >= articles.length) ? "none" : "block";
}

function fetchNews(query = "هوش مصنوعی") {
  const url = (`/api/news?q=${encodeURIComponent(query)}`)
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.status === "ok") {
        allArticles = data.articles;
        visibleCount = 6;
        loadLikes();
      } else {
        newsContainer.innerHTML = `<p>خطا: ${data.message}</p>`;
      }
    })
    .catch(err => {
      newsContainer.innerHTML = `<p>خطا در دریافت اخبار</p>`;
      console.error(err);
    });
}

// 📊 دریافت لایک‌ها از سرور
function loadLikes() {
  fetch("/likes")
    .then(res => res.json())
    .then(data => {
      likesData = {};
      data.forEach(item => likesData[item.title] = item.count);
      renderNews(allArticles);
    });
}

function loadMore() {
  visibleCount += 6;
  renderNews(allArticles);
}

function filterByTopic(topic) {
  fetchNews(topic);
}

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchNews(query);
});

searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) fetchNews(query);
  }
});

// 🎯 --- فرم ارسال نظر ---
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
  if (!name || !text) return alert("لطفاً نام و متن نظر را وارد کنید.");

  fetch("/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, text })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "نظر شما ثبت شد ✅");
      commentForm.reset();
      loadComments();
    });
});

// 🎯 --- دکمه لایک ---
document.addEventListener("click", e => {
  if (e.target.classList.contains("like-btn")) {
    const title = e.target.getAttribute("data-title");
    fetch("/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    }).then(() => loadLikes());
  }
});

window.onload = () => {
  fetchNews();
  loadComments();
};

window.loadMore = loadMore;
window.filterByTopic = filterByTopic;

const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => sidebar.classList.toggle("active"));

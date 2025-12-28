const newsContainer = document.getElementById("news-container");
const loadMoreBtn = document.getElementById("load-more");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");

let allArticles = [];
let visibleCount = 6;
let likesData = {};

function renderNews() {
  newsContainer.innerHTML = "";

  allArticles.slice(0, visibleCount).forEach(article => {
    const likes = likesData[article.title] || 0;

    const div = document.createElement("div");
    div.className = "news-card";
    div.innerHTML = `
      <h3>${article.title}</h3>
      <p>${article.description || ""}</p>
      <button class="like-btn" data-title="${article.title}">👍 ${likes}</button>
      <a href="${article.url}" target="_blank">بیشتر بخوانید</a>
    `;
    newsContainer.appendChild(div);
  });

  loadMoreBtn.style.display =
    visibleCount >= allArticles.length ? "none" : "block";
}

function fetchNews(query = "هوش مصنوعی") {
  fetch(`/api/news?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      console.log("DATA FROM SERVER:", data);

      if (!data || !data.articles) {
        newsContainer.innerHTML = "<p>هیچ خبری دریافت نشد</p>";
        return;
      }

      allArticles = data.articles;
      visibleCount = 6;
      renderNews(allArticles);
    })
    .catch(err => {
      console.error("FETCH ERROR:", err);
      newsContainer.innerHTML = "<p>خطا در دریافت اخبار</p>";
    });
}

function loadLikes() {
  fetch("/likes")
    .then(res => res.json())
    .then(data => {
      likesData = {};
      data.forEach(l => likesData[l.title] = l.count);
      renderNews();
    });
}

loadMoreBtn.onclick = () => {
  visibleCount += 6;
  renderNews();
};

searchBtn.onclick = () => {
  if (searchInput.value) fetchNews(searchInput.value);
};

function filterByTopic(topic) {
  fetchNews(topic);
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("like-btn")) {
    fetch("/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: e.target.dataset.title })
    }).then(loadLikes);
  }
});

// comments
const form = document.getElementById("comment-form");
const commentsDiv = document.getElementById("comments");

function loadComments() {
  fetch("/comments")
    .then(res => res.json())
    .then(data => {
      commentsDiv.innerHTML = "";
      data.forEach(c => {
        commentsDiv.innerHTML += `<p><b>${c.name}:</b> ${c.text}</p>`;
      });
    });
}

form.onsubmit = e => {
  e.preventDefault();
  fetch("/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      text: text.value
    })
  }).then(() => {
    form.reset();
    loadComments();
  });
};

fetchNews();
loadComments();

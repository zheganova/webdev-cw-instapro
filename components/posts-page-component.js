import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { escapeHtml } from "../escapeHtml.js";

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);

  if (secondsAgo < 5) {
    return "только что";
  }
  if (secondsAgo < 60) {
    return `${secondsAgo} сек. назад`;
  }

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} мин. назад`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} ч. назад`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) {
    return `${daysAgo} дн. назад`;
  }

  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return `${monthsAgo} мес. назад`;
  }

  const yearsAgo = Math.floor(monthsAgo / 12);

  let yearWord;
  if (yearsAgo % 10 === 1 && yearsAgo % 100 !== 11) {
    yearWord = "год";
  } else if (
    [2, 3, 4].includes(yearsAgo % 10) &&
    ![12, 13, 14].includes(yearsAgo % 100)
  ) {
    yearWord = "года";
  } else {
    yearWord = "лет";
  }

  return `${yearsAgo} ${yearWord} назад`;
}

export function renderPostsPageComponent({ appEl }) {
  // @TODO: реализовать рендер постов из api
  const postsHtml = posts
    .map((post) => {
      return `
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
              <img src="${post.user.imageUrl}" class="post-header__user-image">
              <p class="post-header__user-name">${post.user.name}</p>
          </div>
          <div class="post-image-container">
            <img src="${post.imageUrl}" class="post-image">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img src="./assets/images/like-${
                post.isLiked ? "active" : "not-active"
              }.svg">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${post.likes.length}</strong>
            </p>
          </div>
          <p class="post-text">
            <span class="user-name">${post.user.name}</span>
            ${escapeHtml(post.description)}
          </p>
          <p class="post-date">
            ${formatTimeAgo(post.createdAt)}
          </p>
        </li>
      `;
    })
    .join("");

  console.log("Актуальный список постов:", posts);

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}

import { USER_POSTS_PAGE, AUTH_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { goToPage } from "../index.js";
import { escapeHtml } from "../escapeHtml.js";
import {
  getPosts,
  getUserPosts,
  likePost,
  dislikePost,
  deletePost,
} from "../api.js";
import { renderLoadingPageComponent } from "./loading-page-component.js";

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

export function renderPostsPageComponent({
  appEl,
  userId = null,
  token,
  user,
}) {
  // @TODO: реализовать рендер постов из api

  let currentPosts = [];

  // Функция для получения постов (всех или пользователя)
  const fetchAndRenderPosts = () => {
    // Выбираем, какую функцию API использовать
    const apiCall = userId
      ? () => getUserPosts({ userId, token })
      : () => getPosts({ token });

    renderLoadingPageComponent({ appEl, user: null, goToPage: goToPage });

    apiCall()
      .then((newPosts) => {
        currentPosts = newPosts; // Обновляем локальные посты
        renderPageContent(); // Рендерим основное содержимое страницы
      })
      .catch((error) => {
        console.error("Ошибка загрузки постов:", error);
        alert("Не удалось загрузить посты. Попробуйте снова.");
        currentPosts = []; // Очищаем посты при ошибке
        renderPageContent(); // Рендерим страницу даже с ошибкой (но без постов)
      });
  };

  const renderPageContent = () => {
    const postsHtml = currentPosts
      .map((post) => {
        const isLikedByUser = post.likes.some(
          (like) => user && like.userId === user.id
        );

        const likedByNames = post.likes
          .map((like) => escapeHtml(like.name))
          .join(", ");

        console.log("user.id:", user.id);
        console.log("post.user.id:", post.user.id);

        const canDelete = user && user._id === post.user.id && userId === user._id;

        return `
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
              <img src="${post.user.imageUrl}" class="post-header__user-image">
              <div class="post-header__info">
                <p class="post-header__user-name">${escapeHtml(
                  post.user.name
                )}</p>
                ${
                  canDelete
                    ? `<button class="delete-button" data-post-id="${post.id}">Удалить</button>`
                    : ""
                }
              </div>
          </div>
          <div class="post-image-container">
            <img src="${post.imageUrl}" class="post-image">
          </div>
          <div class="post-likes">
            <button data-post-id="${
              post.id
            }" data-is-liked="${isLikedByUser}" class="like-button">
              <img src="./assets/images/like-${
                isLikedByUser ? "active" : "not-active"
              }.svg">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${post.likes.length}</strong>
              ${
                post.likes.length > 0
                  ? `
                  <span class="likes-tooltip">
                    ${likedByNames}
                  </span>
                `
                  : ""
              }
            </p>
          </div>
          <p class="post-text">
            <span class="user-name">${escapeHtml(post.user.name)}</span>
            ${escapeHtml(post.description)}
          </p>
          <p class="post-date">
            ${formatTimeAgo(post.createdAt)}
          </p>
        </li>
      `;
      })
      .join("");

    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        ${
          userId && currentPosts.length > 0
            ? `<div class="posts-user-header">
            <img src="${
              currentPosts[0].user.imageUrl
            }" class="posts-user-header__user-image"> <p class="posts-user-header__user-name">${escapeHtml(
                currentPosts[0].user.name
              )}</p>
          </div>`
            : ""
        }
        <ul class="posts">
          ${currentPosts.length > 0 ? postsHtml : "<p>Постов пока нет.</p>"}
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

    // Добавляем обработчики для кнопок лайков
    for (let likeButton of document.querySelectorAll(".like-button")) {
      likeButton.addEventListener("click", (event) => {
        // Проверяем, авторизован ли пользователь перед лайком
        if (!user) {
          alert("Чтобы поставить лайк, нужно авторизоваться.");
          goToPage(AUTH_PAGE); // Перенаправляем на страницу авторизации
          return;
        }

        const postId = likeButton.dataset.postId;
        const isLiked = likeButton.dataset.isLiked === "true";

        // Выбираем правильный API-запрос (лайк или дизлайк)
        const action = isLiked ? dislikePost : likePost;

        action({ postId, token })
          .then((updatedPost) => {
            // Находим пост в текущем массиве currentPosts и обновляем его
            const index = currentPosts.findIndex(
              (p) => p.id === updatedPost.id
            );
            if (index !== -1) {
              currentPosts[index] = updatedPost; // Заменяем старый пост на обновленный
              renderPageContent(); // Перерисовываем страницу, чтобы обновить лайки и счетчик
            }
          })
          .catch((error) => {
            console.error("Ошибка при работе с лайками:", error);
            if (
              error.message === "Нет авторизации для лайка" ||
              error.message === "Нет авторизации для дизлайка"
            ) {
              alert("Для лайка/дизлайка необходима авторизация.");
              goToPage(AUTH_PAGE);
            } else {
              alert("Не удалось обновить лайк. Попробуйте снова.");
            }
          });
      });
    }

    for (let deleteButton of document.querySelectorAll(".delete-button")) {
      deleteButton.addEventListener("click", (event) => {
        const postId = deleteButton.dataset.postId;

        if (!confirm("Вы уверены, что хотите удалить этот пост?")) {
          return; // Если пользователь отменил, ничего не делаем
        }

        deleteButton.disabled = true;
        deleteButton.textContent = "...";

        deletePost({ postId, token }) // Вызываем функцию удаления
          .then(() => {
            // Если удаление успешно, обновляем список постов
            currentPosts = currentPosts.filter((post) => post.id !== postId);
            renderPageContent();
          })
          .catch((error) => {
            console.error("Ошибка удаления поста:", error);
            alert("Не удалось удалить пост: " + error.message);
          })
          .finally(() => {});
      });
    }
  };

  fetchAndRenderPosts();
}

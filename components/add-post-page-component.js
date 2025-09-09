import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const render = () => {
    // @TODO: Реализовать страницу добавления поста
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <h3 class="form-title">Добавление поста</h3>
      <div class="form">
        <div class="upload-image-container"></div>
        <textarea class="input description-input" placeholder="Введите описание поста"></textarea>
        <button class="button" id="add-button">Добавить</button>
      </div>
    </div>
  `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    renderUploadImageComponent({
      element: document.querySelector(".upload-image-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    const descriptionInputEl = document.querySelector(".description-input");
    const addButtonEl = document.getElementById("add-button");

    addButtonEl.addEventListener("click", () => {
      if (descriptionInputEl.value.trim() === "" || imageUrl === "") {
        alert("Пожалуйста, заполните все поля!");
        return;
      }

      onAddPostClick({
        description: descriptionInputEl.value.trim(),
        imageUrl,
      });
    });
  };

  render();
}

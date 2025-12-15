import type { CookiePopupConfig } from "./cookiePopupConfig";
import type { CookiePolicyData } from "./cookiePolicyGenerator";
import { generateCookiePolicy } from "./cookiePolicyGenerator";

interface CodeGenerationData {
  popupConfig: CookiePopupConfig;
  policyData: CookiePolicyData;
  skipPolicyStep: boolean;
}

function getPositionStyles(position: CookiePopupConfig["position"]): string {
  switch (position) {
    case "bottom-left":
      return "left: 16px; bottom: 16px;";
    case "bottom-right":
      return "right: 16px; bottom: 16px;";
    default: // bottom-center
      return "left: 50%; bottom: 16px; transform: translateX(-50%);";
  }
}

function getSizeStyles(size: CookiePopupConfig["size"]): {
  width: string;
  padding: string;
  fontSize: string;
  buttonPadding: string;
} {
  switch (size) {
    case "small":
      return {
        width: "320px",
        padding: "12px",
        fontSize: "14px",
        buttonPadding: "6px 12px",
      };
    case "large":
      return {
        width: "480px",
        padding: "24px",
        fontSize: "16px",
        buttonPadding: "12px 24px",
      };
    default: // medium
      return {
        width: "400px",
        padding: "16px",
        fontSize: "14px",
        buttonPadding: "8px 16px",
      };
  }
}

function getStyleClasses(style: CookiePopupConfig["style"]): string {
  switch (style) {
    case "minimal":
      return "border: 1px solid #e5e7eb;";
    case "soft-shadow":
      return "box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);";
    default: // rounded
      return "border-radius: 8px; border: 1px solid #e5e7eb;";
  }
}

function getAnimationStyles(animation: CookiePopupConfig["animation"]): {
  initial: string;
  show: string;
} {
  switch (animation) {
    case "fade":
      return {
        initial: "opacity: 0;",
        show: "opacity: 1; transition: opacity 0.3s ease-in-out;",
      };
    case "slide-up":
      return {
        initial: "opacity: 0; transform: translateY(20px);",
        show:
          "opacity: 1; transform: translateY(0); transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;",
      };
    default: // none
      return {
        initial: "",
        show: "",
      };
  }
}

function getDelayValue(delay: CookiePopupConfig["delay"]): number {
  switch (delay) {
    case "2s":
      return 2000;
    case "5s":
      return 5000;
    default:
      return 0;
  }
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

export function generateCookiePopupCode(
  data: CodeGenerationData
): string {
  const { popupConfig, policyData, skipPolicyStep } = data;
  const policyText = skipPolicyStep ? "" : generateCookiePolicy(policyData);
  const hasPolicy = !skipPolicyStep && policyText.length > 0;

  const positionStyles = getPositionStyles(popupConfig.position);
  const sizeStyles = getSizeStyles(popupConfig.size);
  const styleClasses = getStyleClasses(popupConfig.style);
  const animationStyles = getAnimationStyles(popupConfig.animation);
  const delay = getDelayValue(popupConfig.delay);
  const buttonTextColor = getContrastColor(popupConfig.buttonColor);

  // Исправляем transform для bottom-center
  let finalPositionStyles = positionStyles;
  if (popupConfig.position === "bottom-center" && animationStyles.initial.includes("transform")) {
    finalPositionStyles = positionStyles.replace(
      "transform: translateX(-50%);",
      "transform: translateX(-50%) translateY(20px);"
    );
  }

  // Формируем CSS стили
  const cssStyles = [
    `.cookie-popup-container {`,
    `  position: fixed;`,
    `  z-index: 10000;`,
    `  ${finalPositionStyles}`,
    `  max-width: ${sizeStyles.width};`,
    `  width: calc(100% - 32px);`,
    `  background: #ffffff;`,
    `  ${styleClasses}`,
    `  ${animationStyles.initial}`,
    `}`,
    `.cookie-popup-container.show {`,
    `  ${animationStyles.show}`,
    `}`,
    `.cookie-popup-content {`,
    `  display: flex;`,
    `  flex-direction: column;`,
    `  gap: 12px;`,
    `  padding: ${sizeStyles.padding};`,
    `}`,
    `.cookie-popup-text {`,
    `  font-size: ${sizeStyles.fontSize};`,
    `  line-height: 1.5;`,
    `  color: #1f2937;`,
    `  margin: 0;`,
    `}`,
    `.cookie-popup-button {`,
    `  padding: ${sizeStyles.buttonPadding};`,
    `  background-color: var(--button-color);`,
    `  color: var(--button-text-color);`,
    `  border: none;`,
    `  border-radius: 6px;`,
    `  font-size: ${sizeStyles.fontSize};`,
    `  font-weight: 500;`,
    `  cursor: pointer;`,
    `  transition: opacity 0.2s;`,
    `}`,
    `.cookie-popup-button:hover {`,
    `  opacity: 0.9;`,
    `}`,
    `.cookie-popup-policy-link {`,
    `  color: var(--button-color);`,
    `  text-decoration: underline;`,
    `  cursor: pointer;`,
    `  font-size: ${sizeStyles.fontSize};`,
    `}`,
    `.cookie-popup-policy-modal {`,
    `  position: fixed;`,
    `  top: 0;`,
    `  left: 0;`,
    `  right: 0;`,
    `  bottom: 0;`,
    `  background: rgba(0, 0, 0, 0.5);`,
    `  z-index: 10001;`,
    `  display: none;`,
    `  align-items: center;`,
    `  justify-content: center;`,
    `  padding: 20px;`,
    `}`,
    `.cookie-popup-policy-modal.show {`,
    `  display: flex;`,
    `}`,
    `.cookie-popup-policy-content {`,
    `  background: #ffffff;`,
    `  border-radius: 8px;`,
    `  max-width: 800px;`,
    `  max-height: 80vh;`,
    `  overflow-y: auto;`,
    `  padding: 24px;`,
    `  position: relative;`,
    `}`,
    `.cookie-popup-policy-close {`,
    `  position: absolute;`,
    `  top: 16px;`,
    `  right: 16px;`,
    `  background: none;`,
    `  border: none;`,
    `  font-size: 24px;`,
    `  cursor: pointer;`,
    `  color: #6b7280;`,
    `  width: 32px;`,
    `  height: 32px;`,
    `  display: flex;`,
    `  align-items: center;`,
    `  justify-content: center;`,
    `}`,
    `.cookie-popup-policy-close:hover {`,
    `  color: #1f2937;`,
    `}`,
    `.cookie-policy-text {`,
    `  white-space: pre-wrap;`,
    `  font-size: 14px;`,
    `  line-height: 1.6;`,
    `  color: #1f2937;`,
    `}`,
    `@media (max-width: 640px) {`,
    `  .cookie-popup-container {`,
    `    width: calc(100% - 16px);`,
    `    max-width: none;`,
    `    left: 8px !important;`,
    `    right: 8px !important;`,
    `    transform: none !important;`,
    `  }`,
    `  .cookie-popup-policy-content {`,
    `    max-width: 100%;`,
    `    margin: 0;`,
    `  }`,
    `}`,
  ].join("\n");

  // Экранируем CSS для вставки в JavaScript строку
  const escapedCss = cssStyles
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\${/g, "\\${")
    .replace(/\n/g, "\\n")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');

  return `(function() {
  'use strict';

  // Конфигурация попапа
  const CONFIG = {
    notificationText: ${JSON.stringify(popupConfig.notificationText)},
    buttonText: ${JSON.stringify(popupConfig.buttonText)},
    buttonColor: ${JSON.stringify(popupConfig.buttonColor)},
    buttonTextColor: ${JSON.stringify(buttonTextColor)},
    position: ${JSON.stringify(popupConfig.position)},
    size: ${JSON.stringify(popupConfig.size)},
    style: ${JSON.stringify(popupConfig.style)},
    animation: ${JSON.stringify(popupConfig.animation)},
    delay: ${delay},
    hasPolicy: ${hasPolicy},
    policyText: ${hasPolicy ? JSON.stringify(policyText) : "''"}
  };

  // Стили попапа
  const POPUP_STYLES = "${escapedCss}";

  // Утилиты для работы с cookie и localStorage
  function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Fallback to cookie if localStorage is not available
      setCookie(key, value, 365);
    }
  }

  function getLocalStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return getCookie(key);
    }
  }

  // Проверка, было ли уже дано согласие
  function hasConsent() {
    return getLocalStorage('cookie-consent') === 'accepted' || getCookie('cookie-consent') === 'accepted';
  }

  // Сохранение согласия
  function saveConsent() {
    setLocalStorage('cookie-consent', 'accepted');
    setCookie('cookie-consent', 'accepted', 365);
  }

  // Создание попапа
  function createPopup() {
    // Проверяем, не было ли уже согласия
    if (hasConsent()) {
      return;
    }

    // Добавляем стили
    if (!document.getElementById('cookie-popup-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'cookie-popup-styles';
      // Заменяем CSS переменные на реальные значения
      let finalStyles = POPUP_STYLES.replace(/var\\(--button-color\\)/g, CONFIG.buttonColor);
      finalStyles = finalStyles.replace(/var\\(--button-text-color\\)/g, CONFIG.buttonTextColor);
      styleSheet.textContent = finalStyles;
      document.head.appendChild(styleSheet);
    }

    // Создаем контейнер попапа
    const popup = document.createElement('div');
    popup.className = 'cookie-popup-container';
    popup.id = 'cookie-popup';

    const text = CONFIG.hasPolicy && CONFIG.policyText
      ? CONFIG.notificationText + ' <a href="#" class="cookie-popup-policy-link" id="cookie-policy-link">Подробнее</a>'
      : CONFIG.notificationText;

    popup.innerHTML = '<div class="cookie-popup-content"><p class="cookie-popup-text">' + text + '</p><button class="cookie-popup-button" id="cookie-accept-btn">' + CONFIG.buttonText + '</button></div>';

    document.body.appendChild(popup);

    // Обработчик кнопки принятия
    const acceptBtn = document.getElementById('cookie-accept-btn');
    acceptBtn.addEventListener('click', function() {
      saveConsent();
      hidePopup();
    });

    // Обработчик ссылки на политику
    if (CONFIG.hasPolicy) {
      const policyLink = document.getElementById('cookie-policy-link');
      if (policyLink) {
        policyLink.addEventListener('click', function(e) {
          e.preventDefault();
          showPolicyModal();
        });
      }
    }

    // Показываем попап с задержкой
    if (CONFIG.delay > 0) {
      setTimeout(function() {
        showPopup();
      }, CONFIG.delay);
    } else {
      showPopup();
    }
  }

  // Показ попапа
  function showPopup() {
    const popup = document.getElementById('cookie-popup');
    if (popup) {
      popup.classList.add('show');
    }
  }

  // Скрытие попапа
  function hidePopup() {
    const popup = document.getElementById('cookie-popup');
    if (popup) {
      popup.style.transition = 'opacity 0.3s ease-out';
      popup.style.opacity = '0';
      setTimeout(function() {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 300);
    }
  }

  // Показ модального окна с политикой
  function showPolicyModal() {
    let modal = document.getElementById('cookie-policy-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cookie-policy-modal';
      modal.className = 'cookie-popup-policy-modal';
      modal.innerHTML = '<div class="cookie-popup-policy-content"><button class="cookie-popup-policy-close" id="cookie-policy-close">×</button><div class="cookie-policy-text">' + CONFIG.policyText + '</div></div>';
      document.body.appendChild(modal);

      const closeBtn = document.getElementById('cookie-policy-close');
      closeBtn.addEventListener('click', hidePolicyModal);

      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          hidePolicyModal();
        }
      });
    }
    modal.classList.add('show');
  }

  // Скрытие модального окна с политикой
  function hidePolicyModal() {
    const modal = document.getElementById('cookie-policy-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // Инициализация при загрузке DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPopup);
  } else {
    createPopup();
  }
})();
`;
}

export { generateCookiePopupCode };

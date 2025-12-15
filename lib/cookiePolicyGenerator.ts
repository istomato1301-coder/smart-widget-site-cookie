export interface CookiePolicyData {
  websiteUrl: string;
  companyName: string;
  contactEmail: string;
  analytics: {
    yandexMetrica: boolean;
    googleAnalytics: boolean;
  };
  skipPolicy: boolean;
}

export function generateCookiePolicy(data: CookiePolicyData): string {
  if (data.skipPolicy) {
    return "";
  }

  const { websiteUrl, companyName, contactEmail, analytics } = data;

  // Формируем список сервисов аналитики
  const analyticsServices: string[] = [];
  if (analytics.yandexMetrica) {
    analyticsServices.push("Яндекс.Метрика");
  }
  if (analytics.googleAnalytics) {
    analyticsServices.push("Google Analytics");
  }

  const analyticsList =
    analyticsServices.length > 0
      ? analyticsServices.join(", ")
      : "не используются";

  return `ПОЛИТИКА ИСПОЛЬЗОВАНИЯ ФАЙЛОВ COOKIE
1.Общие положения
Настоящая политика обработки файлов cookie (далее — Политика) применяется к сайту ${websiteUrl || "[адрес сайта]"}, администрируемому ${companyName || "[название компании]"} (далее — Оператор). Просматривая сайт, Вы соглашаетесь с использованием файлов cookie в соответствии с настоящим уведомлением. Если Вы не согласны с тем, чтобы мы использовали данный тип файлов, Вы должны соответствующим образом установить настройки Вашего браузера или не использовать Сайт.

2.Что такое файлы cookie
Файлы cookie — это небольшие текстовые файлы, которые сохраняются в браузере вашего компьютера или мобильного устройства при посещении веб-сайтов.

3.Какие файлы cookie мы используем
Мы используем файлы cookie для обеспечения работы сайта, аналитики и улучшения пользовательского опыта.

3.1. Технические (обязательные) файлы cookie
Эти файлы необходимы для корректной работы сайта и не идентифицируют пользователя.

3.2. Аналитические файлы cookie
Мы используем следующие сервисы аналитики: ${analyticsList}.

4.Управление cookie
Пользователь может отключить cookie в настройках браузера.

5.Изменения политики
Оператор вправе изменять настоящую Политику.

6.Контакты
По вопросам можно связаться по адресу: ${contactEmail || "[email]"}.`;
}


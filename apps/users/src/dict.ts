export const dict = {
	creating_sub: {
		en: 'Creating subscription...',
		ru: 'Создаём подписку...',
	},
	deleting_sub: {
		en: 'Deleting subscription...',
		ru: 'Удаляем подписку...',
	},
	created_sub: {
		en: 'Your subscription has been successfully created',
		ru: 'Подписка была успешно создана',
	},
	deleted_sub: {
		en: 'Your subscription has been successfully deleted',
		ru: 'Подписка была успешно удалена',
	},
	delete_sub_error: {
		en: (url: string) => `Error occurred while deleting. Please send direct message to ${url}`,
		ru: (url: string) => `Ошибка удаления. Напишите в личные сообщения ${url}`,
	},
	costs: {
		en: 'costs',
		ru: 'стоит',
	},
	payment_intro: {
		en: (price: number, currency: string) => `1 month is free, then 1 month costs ${price} ${currency}`,
		ru: (price: number, currency: string) => `1 месяц бесплатно, после 1 месяц стоит \n${price} ${currency}`,
	},
	free_month: {
		en: '1 month is free',
		ru: '1 месяц бесплатно',
	},
	payment_through: {
		en: 'Payment through',
		ru: 'Оплата через',
	},
	then: {
		en: 'then',
		ru: 'потом',
	},
	intro: {
		ru: `Для работы с подпиской нужен один из xray\\-клиентов:
⚫️ **happ** — предпочтительнее всего
[Play Market](https://play.google.com/store/apps/details?id=com.happproxy) 
[App Store](https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973) 
[Windows](https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe)
[macOS](https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973)
[Сайт](https://www.happ.su/main/)				 
⚫️ **v2RayTun** 
[Play Market](https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=en) 
[App Store](https://apps.apple.com/us/app/v2raytun/id6476628951)
[Windows](https://storage.v2raytun.com/v2RayTun_Setup.exe)
[macOS](https://apps.apple.com/en/app/v2raytun/id6476628951)
[Сайт](https://v2raytun.com/)		
⚫️  или любой другой клиент, поддерживающий subscription\\-ссылки
Алгоритм подключения примерно одинаков во всех приложениях:
1\\. Нажмите на subscription\\-ссылку, она автоматически скопируется в буфер обмена\\. 
2\\. Откройте выбранный клиент и:
 a\\) в **happ** нажмите "Из буфера"
 b\\) в **v2RayTun** нажмите "\\+" → "Импорт из буфера обмена"
3\\. Выберите любой сервер из появившегося списка с заголовком Tesseract VPN\\.
4\\. Нажмите на кнопку для включения VPN\\.
`,
		en: `To use the subscription, you need an Xray client:
⚫️ **happ** — preferred
[Play Market](https://play.google.com/store/apps/details?id=com.happproxy) 
[App Store](https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973) 
[Windows](https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe)
[macOS](https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973)
[Official Site](https://www.happ.su/main/)		
⚫️ **v2RayTun** 
[Play Market](https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=en) 
[App Store](https://apps.apple.com/us/app/v2raytun/id6476628951)
[Windows](https://storage.v2raytun.com/v2RayTun_Setup.exe)
[macOS](https://apps.apple.com/en/app/v2raytun/id6476628951)
[Official Site](https://v2raytun.com/)		
⚫️ or any other client that supports subscription links
The setup process is similar in all apps:
1\\. Tap the subscription link — it will be copied to the clipboard automatically\\. 
2\\. Open your Xray client and: 
 a\\) in **happ**, tap "From clipboard"
 b\\) in **v2RayTun**, tap "\\+" → "Import from clipboard"
3\\. Select any server from the list with the Tesseract header\\.
4\\. Turn the VPN on\\.         
        `,
	},
	start: {
		ru: '/me — для просмотра информации, которая хранится о вас',
		en: '/me — to view the information stored about you',
	},
	no_sub: {
		ru: 'У вас пока нет ключей',
		en: "You don't have subscriptions yet.",
	},
	create_sub: {
		ru: 'Создать ключ',
		en: 'Create subscription',
	},
	delete_sub: {
		ru: 'Удалить ключ',
		en: 'Delete subscription',
	},
	your_link: {
		ru: 'Ваша ссылка. Кликните, чтобы скопировать в буфер обмена',
		en: 'Your link. Tap/click the link to copy it to your clipboard',
	},
	no_payments: {
		ru: (url: string) => `Не обнаружено платежей. Напишите в личные сообщения ${url}`,
		en: (url: string) => `No payments found. Please send a direct message to ${url}`,
	},
	welcome: {
		ru: 'Добро пожаловать в бот тессеракт клуба.',
		en: 'Welcome to the tesseract club bot!',
	},
	hello: {
		ru: 'Здравствуйте',
		en: 'Hello',
	},
	registration: {
		ru: (url: string) => `Нажмите для регистрации в системе`,
		en: (url: string) => `Click on the button to sign up`,
	},
	payments_history: {
		ru: '💸 История платежей',
		en: '💸 Payments history',
	},
	last_payment: {
		ru: '💸 Последний платёж',
		en: '💸 Last payment',
	},
	sign_up: {
		ru: 'Зарегистрироваться',
		en: 'Sign Up',
	},
	keys: {
		ru: '🔑 Мои OpenVPN/Wireguard/IKEv2 ключи',
		en: '🔑 My OpenVPN/Wireguard/IKEv2 keys',
	},
	subscription: {
		ru: '🔗 Ссылка-ключ',
		en: '🔗 Subscription link',
	},
	guide: {
		ru: '📖 Гайд',
		en: '📖 Guide',
	},
	prices: {
		ru: '💵 Цены',
		en: '💵 Prices',
	},
	pay: {
		ru: '💳 Оплатить',
		en: '💳 Pay',
	},
	main_menu: {
		ru: 'Главное меню',
		en: 'Main menu',
	},
	createSubError: {
		ru: 'Ошибка во время создания subscription ссылки',
		en: 'Error while creating the subscription link',
	},
	price: {
		ru: 'Стоимость',
		en: 'Price',
	},
	payments_not_found: {
		ru: 'Не найдено платежей для данного пользователя',
		en: 'Payments not found for user',
	},
	no_keys: {
		ru: 'Не найдено существующих ключей',
		en: 'No keys found for user',
	},
	get_file: {
		ru: 'Загрузить ключ',
		en: 'Download key',
	},
	payment_request: {
		ru: 'Ваша заявка на платёж учтена. Ожидайте подтверждения от администратора.',
		en: 'Your payment request has been accepted. Please wait for confirmation from the administrator.',
	},
	paid: {
		ru: 'Оплачено',
		en: 'Paid',
	},
	click_to_confirm_payment: {
		ru: 'После оплаты нажмите на кнопку "Оплачено"',
		en: 'After payment, click the "Paid" button',
	},
	enter_username: {
		ru: 'Введите username для нового пользователя',
		en: 'Enter username for the new user',
	},
	confirm_payment: {
		ru: 'Подтвердить платёж',
		en: 'Confirm payment',
	},
	wait_for_admin: {
		ru: 'Ожидайте подтверждения администратора',
		en: 'Wait for the administrator to approve your sign up request',
	},
	request_approved: {
		en: 'Your sign up request has been approved by the administrator',
		ru: 'Вы были зарегистрированы в системе',
	},
	payment_processed: {
		en: 'Your payment has been successfully processed',
		ru: 'Ваш платёж был успешно обработан',
	},
	installation_guide: {
		ru: (link: string) => {
			return `Ваша подписка и инструкция по ссылке ${link}`;
		},
		en: (link: string) => `Your subscription and guide here ${link}`,
	},
};

export const getPeopleCountMessage = (minCount: number, lang: string) => {
	if (minCount === 1) {
		return lang === 'en' ? '1 person' : '1 человек';
	}
	return lang === 'en'
		? `${minCount} people`
		: minCount > 1 && minCount < 5
			? `${minCount} человека`
			: `${minCount} человек`;
};

export const getMonthsCountMessage = (count: number, lang: string) => {
	if (count === 1) {
		return lang === 'en' ? '1 month' : '1 месяц';
	}
	return lang === 'en' ? `${count} months` : `${count} месяцев`;
};

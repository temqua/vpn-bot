export const dict = {
	creatingSub: {
		en: 'Creating subscription...',
		ru: 'Создаём подписку...',
	},
	deletingSub: {
		en: 'Deleting subscription...',
		ru: 'Удаляем подписку...',
	},
	deletedSub: {
		en: "You've been successfully deleted subscription",
		ru: 'Подписка была успешно удалена',
	},
	deleteSubError: {
		en: 'Error occurred while deleting. Please send direct message to https://t.me/tesseract_vpn',
		ru: 'Ошибка удаления. Напишите в личные сообщения https://t.me/tesseract_vpn',
	},
	intro: {
		ru: `Для работы с подпиской нужен один из xray\\-клиентов: 
⚫️ **v2RayTun** 
[Play Market](https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=en) 
[App Store](https://apps.apple.com/us/app/v2raytun/id6476628951)
⚫️ **happ** 
[Play Market](https://play.google.com/store/apps/details?id=com.happproxy) 
[App Store](https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973) 
[Official Site](https://www.happ.su/main/)		
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

⚫️ **v2RayTun** 
[Play Market](https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=en) [App Store](https://apps.apple.com/us/app/v2raytun/id6476628951)
[Official Site](https://v2raytun.com/)		
⚫️ **happ** 
[Play Market](https://play.google.com/store/apps/details?id=com.happproxy) [App Store](https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973) 
[Official Site](https://www.happ.su/main/)		
⚫️ or any other client that supports subscription links
The setup process is similar in all apps:
1\\. Tap the subscription link — it will be copied to the clipboard automatically\\. 
2\\. Open your Xray client and: 
 a\\) in **happ**, tap "From clipboard"
 b\\) in **v2RayTun**, tap "\\+" → "Import from clipboard"
3\\. The Tesseract VPN profile will appear in the app\\.
3\\. Select any server from the list\\.
4\\. Turn the VPN on\\.         
        `,
	},
	start: {
		ru: '/me — для просмотра информации, которая хранится о вас',
		en: '/me — to view the information stored about you',
	},
	noSub: {
		ru: 'У вас пока нет подписок. Вы можете создать новую',
		en: "You don't have subscriptions yet. You can create new one.",
	},
	createSub: {
		ru: 'Создать подписку',
		en: 'Create subscription',
	},
	deleteSub: {
		ru: 'Удалить подписку',
		en: 'Delete subscription',
	},
	manageSub: {
		ru: 'Управление подпиской',
		en: 'Subscription management',
	},
	yourLink: {
		ru: 'Ваша ссылка. Кликните, чтобы скопировать в буфер обмена',
		en: 'Your link. Tap/click the link to copy it to your clipboard',
	},
	noPayments: {
		ru: 'Не обнаружено платежей. Напишите в личные сообщения https://t.me/tesseract_vpn',
		en: 'No payments found. Please send direct message https://t.me/tesseract_vpn',
	},
	welcome: {
		ru: 'Добро пожаловать в бот тессеракт впн.',
		en: 'Welcome to tesseract vpn bot!',
	},
	hello: {
		ru: 'Здравствуйте',
		en: 'Hello',
	},
	registration: {
		ru: 'Напишите в личные сообщения https://t.me/tesseract_vpn для регистрации в системе',
		en: 'Please send a direct message to https://t.me/tesseract_vpn to register in the system.',
	},
	paymentsHistory: {
		ru: '💸 История платежей',
		en: '💸 Payments history',
	},
	keys: {
		ru: '🔑 Мои VPN-ключи и Subscription ссылка',
		en: '🔑 My VPN-keys and Subscription links',
	},
	guide: {
		ru: '📖 Гайд',
		en: '📖 Guide',
	},
	prices: {
		ru: '💵 Цены',
		en: '💵 Prices',
	},
	mainMenu: {
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
	paymentsNotFound: {
		ru: 'Не найдено платежей для данного пользователя',
		en: 'Payments not found for user',
	},
};

export const getPeopleCountMessage = (count: number, lang: string) => {
	if (count === 1) {
		return lang === 'en' ? '1 person' : '1 человек';
	}
	return lang === 'en' ? `${count} people` : count > 1 && count < 5 ? `${count} человека` : `${count} человек`;
};

export const getMonthsCountMessage = (count: number, lang: string) => {
	if (count === 1) {
		return lang === 'en' ? '1 month' : '1 месяц';
	}
	return lang === 'en' ? `${count} months` : `${count} месяцев`;
};

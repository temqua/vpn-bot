import { paymentCancelReasonMap } from './yookassa.cancellation.definitions';
import { IConfirmation } from './yookassa.confirmation.definitions';

export enum WebhookEventEnum {
  /** Платёж ожидает подтверждения */
  'payment.waiting_for_capture' = 'payment.waiting_for_capture',
  /** Платёж успешно завершён */
  'payment.succeeded' = 'payment.succeeded',
  /** Платёж отменён */
  'payment.canceled' = 'payment.canceled',
  /** Возврат успешно завершён */
  'refund.succeeded' = 'refund.succeeded',
  /** Выплата успешно завершена */
  'payout.succeeded' = 'payout.succeeded',
  /** Выплата отменена */
  'payout.canceled' = 'payout.canceled',
  /** Сделка закрыта */
  'deal.closed' = 'deal.closed',
  /** Способ оплаты активен (привязка на нулевую сумму завершена) */
  'payment_method.active' = 'payment_method.active',
}

export enum CurrencyEnum {
  /** Российский рубль */
  RUB = 'RUB',
  /** Евро */
  EUR = 'EUR',
  /** Доллар США */
  USD = 'USD',
  /** Казахстанский тенге */
  KZT = 'KZT',
  /** Белорусский рубль */
  BYN = 'BYN',
  /** Украинская гривна */
  UAH = 'UAH',
  /** Узбекский сум */
  UZS = 'UZS',
}

export interface Metadata {
  [key: string]: string | null;
}

/** Сумма платежа. Комиссия партнёра ЮKassa сверх этой суммы не входит. */
export interface IAmount {
  /** Сумма в валюте. Дробное число, точка как разделитель, без разделителя тысяч. Пример: `1000.00`. */
  value: string; // "2.00"
  /** Код валюты ISO-4217. Пример: `RUB`. Должен совпадать с валютой субаккаунта (`recipient.gateway_id`) или аккаунта. */
  currency: CurrencyEnum; // "RUB"
}

export type PaymentStatus =
  | 'waiting_for_capture'
  | 'succeeded'
  | 'canceled'
  | 'pending';

export type AuthorizationDetails = {
  /**
   * RRN — ID транзакции у эмитента. Пример: `603668680243`
   */
  rrn?: string; //"603668680243",
  /** Код авторизации эмитента. Пример: `062467` */
  auth_code?: string; // "000000",
  /** Результат 3-D Secure */
  three_d_secure: {
    /** Показ формы 3-D Secure: `true` — показана, `false` — без аутентификации */
    applied: boolean;
  };
};

export interface IYooKassaWebHook {
  type: 'notification';
  event: WebhookEventEnum;
  object: IPayment;
}

export enum PaymentMethodsEnum {
  /** Банковская карта или карта МИР */
  bank_card = 'bank_card',

  /** ЮMoney */
  yoo_money = 'yoo_money',

  /**
   * QIWI Кошелек
   * @deprecated ЦБ РФ лишил QIWI Банк лицензию 21.02.2024 — способ оплаты не работает.
   */
  qiwi = 'qiwi',

  /** SberPay */
  sberbank = 'sberbank',

  /**
   * Альфа-Клик
   * @deprecated Сервис устарел — используйте другие способы оплаты.
   */
  alfabank = 'alfabank',

  /** Тинькофф (T-Pay) */
  tinkoff_bank = 'tinkoff_bank',

  /** СберБанк Бизнес Онлайн */
  b2b_sberbank = 'b2b_sberbank',

  /** СБП (Система быстрых платежей) */
  sbp = 'sbp',

  /** Баланс телефона */
  mobile_balance = 'mobile_balance',

  /** Наличные */
  cash = 'cash',

  /** Заплатить по частям */
  installments = 'installments',

  /** «Покупки в кредит» от Сбербанка */
  sber_loan = 'sber_loan',

  /** Плати частями (BNPL от СберБанка) */
  sber_bnpl = 'sber_bnpl',

  /** Alfa Pay */
  alfa_pay = 'alfa_pay',

  /** Apple Pay — обычно через payment_token */
  apple_pay = 'apple_pay',

  /** Google Pay — обычно через payment_token */
  google_pay = 'google_pay',

  /**
   * WebMoney
   * @deprecated WebMoney прекратил работу в РФ в 2022 году.
   */
  webmoney = 'webmoney',

  /**
   * WeChat Pay
   * @deprecated Способ оплаты для пользователей из Китая.
   */
  wechat = 'wechat',
}

export interface IPaymentMethod {
  type: PaymentMethodsEnum; // "bank_card"
  id: string; // "22d6d597-000f-5000-9000-145f6df21d6f",
  saved: boolean;
  title: string; // "Bank card *4444"
}

/**
 * **Объект платежа**
 *
 * Актуальная информация о платеже. Формируется при создании,
 * приходит в любом ответе по платежам. Неописанные поля игнорируйте.
 */
export interface IPayment {
  /** ID платежа в ЮKassa */
  readonly id: string; // guid
  /** Статус: `pending`, `waiting_for_capture`, `succeeded`, `canceled` */
  readonly status: PaymentStatus;
  /** Сумма платежа. Комиссия партнёра сверх суммы не входит */
  amount: IAmount;
  /**
   * Сумма к зачислению магазину (`amount` минус комиссия ЮKassa).
   * При OAuth запросите у магазина право на данные о комиссиях.
   */
  readonly income_amount?: IAmount;
  /**
   * Описание транзакции (до 128 символов) в ЛК и при оплате.
   * Пример: «Оплата заказа № 72 для user@yoomoney.ru».
   */
  description?: string;
  /** Получатель платежа */
  recipient?: IRecipient;
  /** [Способ оплаты](https://yookassa.ru/developers/payment-acceptance/getting-started/payment-methods#all) */
  readonly payment_method?: IPaymentMethod;
  /**
   * Время подтверждения ([UTC](https://ru.wikipedia.org/wiki/%D0%92%D1%81%D0%B5%D0%BC%D0%B8%D1%80%D0%BD%D0%BE%D0%B5_%D0%BA%D0%BE%D0%BE%D1%80%D0%B4%D0%B8%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%B2%D1%80%D0%B5%D0%BC%D1%8F), [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)).
   * Пример: `2017-11-03T11:52:31.827Z`
   */
  readonly captured_at?: string;
  /**
   * Время создания ([UTC](https://ru.wikipedia.org/wiki/%D0%92%D1%81%D0%B5%D0%BC%D0%B8%D1%80%D0%BD%D0%BE%D0%B5_%D0%BA%D0%BE%D0%BE%D1%80%D0%B4%D0%B8%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%B2%D1%80%D0%B5%D0%BC%D1%8F), [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)).
   * Пример: `2017-11-03T11:52:31.827Z`
   */
  readonly created_at: string; // "2018-07-10T14:27:54.691Z",
  /**
   * Срок бесплатной отмены или подтверждения. После — автоотмена `waiting_for_capture`.
   * ([UTC](https://ru.wikipedia.org/wiki/%D0%92%D1%81%D0%B5%D0%BC%D0%B8%D1%80%D0%BD%D0%BE%D0%B5_%D0%BA%D0%BE%D0%BE%D1%80%D0%B4%D0%B8%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%B2%D1%80%D0%B5%D0%BC%D1%8F), [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)).
   * Пример: `2017-11-03T11:52:31.827Z`
   */
  readonly expires_at?: string; // "2018-07-17T14:28:32.484Z",
  /**
   * Сценарий подтверждения при ожидании действий пользователя.
   * @see [Подтверждение](https://yookassa.ru/developers/payment-acceptance/getting-started/payment-process#user-confirmation)
   */
  confirmation?: IConfirmation;
  /** Тестовая операция */
  readonly test: boolean;
  /** Сумма успешных возвратов */
  readonly refunded_amount?: IAmount;
  /** Признак оплаты заказа */
  readonly paid: boolean;
  /** Возможность возврата по API */
  readonly refundable: boolean;
  /**
   * Произвольные данные в парах «ключ–значение». ЮKassa возвращает их в ответе.
   * До 16 ключей; имя — до 32 символов; значение — до 512; UTF-8.
   */
  metadata?: Metadata;
  /**
   * Комментарий к `canceled`.
   * @see [Неуспешные платежи](https://yookassa.ru/developers/payment-acceptance/after-the-payment/declined-payments)
   */
  readonly cancellation_details?: PaymentCancellationDetails;
  /** Авторизация при оплате картой, Mir Pay, SberPay, T-Pay */
  readonly authorization_details?: AuthorizationDetails;
  /**
   * Распределение денег. Есть при [Сплитовании](https://yookassa.ru/developers/solutions-for-platforms/split-payments/basics).
   */
  transfers?: TransferPayment[];
  /**
   * Сделка платежа. Есть при [Безопасной сделке](https://yookassa.ru/developers/solutions-for-platforms/safe-deal/basics).
   */
  deal?: DealType;
  /**
   * ID покупателя в вашей системе (email, телефон). До 200 символов.
   * Для сохранения карты в [виджете](https://yookassa.ru/developers/payment-acceptance/integration-scenarios/widget/basics).
   */
  merchant_customer_id?: string;
  /**
   * Статус регистрации чека:
   * - `pending` — в обработке;
   * - `succeeded` — зарегистрирован;
   * - `canceled` — не зарегистрирован.
   */
  readonly receipt_registration?: 'pending' | 'succeeded' | 'canceled';
  /** Счёт, в рамках которого проведён платёж */
  readonly invoice_details?: {
    /** ID счёта */
    id?: string;
  };
}

export type CancelReason = keyof typeof paymentCancelReasonMap;

export interface PaymentCancellationDetails {
  /**
   * Инициатор отмены: `yoo_money`, `payment_network`, `merchant`.
   *
   * @see [Инициаторы отмены](https://yookassa.ru/developers/payment-acceptance/after-the-payment/declined-payments#cancellation-details-party)
   */
  party: 'merchant' | 'yoo_money' | 'payment_network';
  /**
   * Причина отмены.
   *
   * @see [Причины](https://yookassa.ru/developers/payment-acceptance/after-the-payment/declined-payments#cancellation-details-reason)
   */
  reason: CancelReason;
}

/** Получатель платежа */
export interface IRecipient {
  /** ID магазина в ЮKassa */
  account_id: string;
  /** ID субаккаунта для разделения потоков платежей */
  gateway_id: string;
}

export type TransferPayment = Pick<
  IPayment,
  'amount' | 'description' | 'metadata'
> & {
  /** ID магазина-получателя. См. [Продавцы](https://yookassa.ru/my/marketplace/sellers) в ЛК (shopId) */
  account_id: string;
  /** Статус распределения: `pending`, `waiting_for_capture`, `succeeded`, `canceled` */
  status: PaymentStatus;
  /** Комиссия платформы, удерживаемая с магазина */
  platform_fee_amount: IAmount;
};

export type DealType = {
  /** ID сделки */
  id: string;
  /** Распределение денег */
  settlements: {
    /** Тип операции: `payout` — выплата продавцу */
    type: 'payout';
    /** Вознаграждение продавца */
    amount: IAmount;
  }[];
};

export enum LocaleEnum {
  /** Russian */
  ru_RU = 'ru_RU',
  /** English */
  en_US = 'en_US',
}

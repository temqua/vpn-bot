export type SendMessageBody = {
  business_connection_id?: string;
  chat_id: number | string;
  message_thread_id?: number;
  direct_messages_topic_id?: number;
  text: string;
  parse_mode?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  allow_paid_broadcast?: boolean;
  message_effect_id?: string;
  link_preview_options?: object;
  entities?: object[];
  ephemeral_message_parameters?: object;
  suggested_post_parameters?: object;
  reply_parameters?: object;
  reply_markup?: object;
};

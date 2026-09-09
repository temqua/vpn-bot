export interface IRWAuthResponse {
  response: {
    accessToken: string;
  };
}

export interface IRWServerErrorResponse {
  timestamp: string;
  path: string;
  message: string;
  errorCode: string;
}

export interface IRWClientErrorResponse {
  message: string;
  statusCode: number;
  errors: IRWClientError[];
}

export interface IRWClientError {
  validation: string;
  code: string;
  message: string;
  path: string[];
}

export enum IRWUserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum IRWNewUserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  LIMITED = 'LIMITED',
  EXPIRED = 'EXPIRED',
}

export interface IRWInternalSquad {
  uuid: string;
  name: string;
}

export enum IRWTrafficLimitStrategy {
  NO_RESET = 'NO_RESET',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  MONTH_ROLLING = 'MONTH_ROLLING',
}

export interface IRWNewUserDTO {
  username: string;
  expireAt: string;
}

export interface IRWUpdateUserDTO {
  uuid?: string;
  username?: string;
  status?: IRWUserStatus;
  trafficLimitBytes?: number;
  trafficLimitStrategy?: IRWTrafficLimitStrategy;
  expireAt?: string;
  description?: string | null;
  telegramId?: number | null;
  email?: null;
  tag?: string | null;
  hwidDeviceLimit?: null;
  activeInternalSquads?: string[];
}

export interface IRWUser {
  uuid: string;
  id: number;
  shortUuid: string;
  username: string;
  status: IRWNewUserStatus;
  trafficLimitBytes: number;
  trafficLimitStrategy: IRWTrafficLimitStrategy;
  expireAt: string;
  telegramId: number | null;
  email: null;
  description: string | null;
  tag: string | null;
  hwidDeviceLimit: null;
  externalSquadUuid: null;
  trojanPassword: string;
  vlessUuid: string;
  ssPassword: string;
  lastTriggeredThreshold: number;
  subRevokedAt: null;
  subLastUserAgent: null;
  subLastOpenedAt: null;
  lastTrafficResetAt: null;
  createdAt: string;
  updatedAt: string;
  subscriptionUrl: string;
  activeInternalSquads: IRWInternalSquad[];
  userTraffic: {
    usedTrafficBytes: number;
    lifetimeUsedTrafficBytes: number;
    onlineAt: null;
    lastConnectedNodeUuid: null;
    firstConnectedAt: null;
  };
}

export interface IRWCreateUserResponse {
  response: IRWUser;
}

export interface IRWDeleteUserResponse {
  response: {
    isDeleted: boolean;
  };
}

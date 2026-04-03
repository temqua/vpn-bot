import { addDays, addMonths } from 'date-fns';

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import env from '../../env';
import { isJSONErrorResponse } from '../../utils';
import {
  IRWAuthResponse,
  IRWClientErrorResponse,
  IRWCreateUserResponse,
  IRWDeleteUserResponse,
  IRWNewUserDTO,
  IRWServerErrorResponse,
  IRWUpdateUserDTO,
} from './rw.types';
import client from '../../client';

@Injectable()
export class RemnawaveService {
  private apiRoot = env.RW_API_ROOT;
  private logger = new Logger('RemnawaveService');
  async auth(): Promise<string> {
    const body = JSON.stringify({
      username: env.RW_USERNAME,
      password: env.RW_PW,
    });
    const response = await fetch(`${this.apiRoot}/api/auth/login`, {
      method: 'POST',
      body,
    });
    if (!response.ok && isJSONErrorResponse(response)) {
      const responseBody = <IRWServerErrorResponse | IRWClientErrorResponse>(
        await response.json()
      );
      throw new Error(responseBody.message);
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const responseBody = (await response.json()) as IRWAuthResponse;
    return responseBody?.response.accessToken;
  }

  async createUser(
    username: string,
    expiresAt: Date | null | undefined,
    isNew = false,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthAfter = addMonths(today, 1);
    const expire =
      isNew || !expiresAt
        ? monthAfter.toISOString()
        : addDays(expiresAt, 1).toISOString();
    const newUser: IRWNewUserDTO = {
      username,
      expireAt: expire,
    };
    const response = await client.post(`${this.apiRoot}/api/users`, {
      headers: {
        Authorization: `Bearer ${env.RW_TOKEN}`,
      },
      body: JSON.stringify(newUser),
    });
    if (!response.ok && isJSONErrorResponse(response)) {
      const responseBody = <IRWServerErrorResponse | IRWClientErrorResponse>(
        await response.json()
      );
      this.logger.error(responseBody.message);
      throw new InternalServerErrorException(
        `Error while requesting remnawave: ${responseBody.message}`,
      );
    }
    if (!response.ok) {
      this.logger.error(`${response.status} ${response.statusText}`);
      throw new InternalServerErrorException(
        `Error while requesting remnawave: ${response.status} ${response.statusText}`,
      );
    }
    const result = (await response.json()) as IRWCreateUserResponse;

    return result;
  }

  async updateUser(params: IRWUpdateUserDTO) {
    const response = await client.patch(`${this.apiRoot}/api/users`, {
      headers: {
        Authorization: `Bearer ${env.RW_TOKEN}`,
      },
      body: JSON.stringify(params),
    });
    if (!response.ok && isJSONErrorResponse(response)) {
      const responseBody = <IRWServerErrorResponse | IRWClientErrorResponse>(
        await response.json()
      );
      this.logger.error(responseBody.message);
      throw new InternalServerErrorException(
        `Error while requesting remnawave: ${responseBody.message}`,
      );
    }
    if (!response.ok) {
      this.logger.error(`${response.status} ${response.statusText}`);
      throw new InternalServerErrorException(
        `Error while requesting remnawave: ${response.status} ${response.statusText}`,
      );
    }
    const result = (await response.json()) as IRWCreateUserResponse;

    return result;
  }

  async deleteUser(uuid: string) {
    const response = await client.delete(`${this.apiRoot}/api/users/${uuid}`, {
      headers: {
        Authorization: `Bearer ${env.RW_TOKEN}`,
      },
    });
    if (!response.ok && isJSONErrorResponse(response)) {
      const responseBody = <IRWServerErrorResponse | IRWClientErrorResponse>(
        await response.json()
      );
      throw new InternalServerErrorException(
        `Error while requesting remnawave: ${responseBody.message}`,
      );
    }
    const result = (await response.json()) as IRWDeleteUserResponse;
    return result?.response.isDeleted;
  }
}

import client from '../../client';
import env from '../../env';
import { isJSONErrorResponse } from '../../utils';
import { IRWClientErrorResponse, IRWCreateUserResponse, IRWServerErrorResponse, IRWUpdateUserDTO } from './rw.types';

export class RemnawaveService {
	private apiRoot = env.RW_API_ROOT;

	async updateUser(params: IRWUpdateUserDTO) {
		const response = await client.patch(`${this.apiRoot}/api/users`, {
			headers: {
				Authorization: `Bearer ${env.RW_TOKEN}`,
			},
			body: JSON.stringify(params),
		});
		if (!response.ok && isJSONErrorResponse(response)) {
			const responseBody = <IRWServerErrorResponse | IRWClientErrorResponse>await response.json();
			throw new Error(`Error while requesting remnawave: ${responseBody.message}`);
		}
		if (!response.ok) {
			throw new Error(`Error while requesting remnawave: ${response.status} ${response.statusText}`);
		}
		const result = (await response.json()) as IRWCreateUserResponse;

		return result;
	}
}

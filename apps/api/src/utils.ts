export const isJSONErrorResponse = (response: Response) => {
  return (
    response.body && response.headers.get('content-type')?.includes('json')
  );
};

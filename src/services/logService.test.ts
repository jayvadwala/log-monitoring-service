import { retrieveLogsReverse } from './logService';
import * as fs from 'fs/promises';
import * as fileValidator from '../helpers/fileValidator';
import { Stats } from 'fs';

jest.mock('fs/promises');
jest.mock('../helpers/fileValidator');

describe('retrieveLogsReverse', () => {
  const mockFileContent = `
2024-12-19 04:42:36 ERROR: User logged in successfully.
2024-12-19 04:42:36 EVENT: User session expired.
2024-12-19 04:42:36 INFO: Connection timeout while reaching the server.
2024-12-19 04:42:36 ERROR: File not found on server.
2024-12-19 04:42:36 EVENT: Scheduled task executed successfully.
`;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(fs, 'open').mockResolvedValue({
      read: jest.fn(),
      close: jest.fn(),
    } as unknown as fs.FileHandle);

    jest.spyOn(fileValidator, 'validateLogFile').mockResolvedValue({
      size: mockFileContent.length,
    } as Stats);
  });

  it('should filter logs by keyword', async () => {
    jest.spyOn(fs, 'open').mockImplementation(() =>
      Promise.resolve({
        read: jest.fn((buffer) => {
          buffer.write(mockFileContent);
          return { bytesRead: mockFileContent.length };
        }),
        close: jest.fn(),
      } as unknown as fs.FileHandle)
    );

    const logs = await retrieveLogsReverse({
      fileName: 'test.log',
      keyword: 'ERROR',
      limit: 2,
    });

    expect(logs).toEqual([
      '2024-12-19 04:42:36 ERROR: File not found on server.',
      '2024-12-19 04:42:36 ERROR: User logged in successfully.',
    ]);
  });

  it('should return an error for an empty keyword', async () => {
    await expect(
      retrieveLogsReverse({
        fileName: 'test.log',
        keyword: '  ',
        limit: 5,
      })
    ).rejects.toThrow('Keyword must not be empty or contain only whitespace.');
  });

  it('should handle file not found error', async () => {
    jest.spyOn(fileValidator, 'validateLogFile').mockRejectedValue(new Error('File not found'));

    await expect(
      retrieveLogsReverse({
        fileName: 'nonexistent.log',
        keyword: '123',
        limit: 5,
      })
    ).rejects.toThrow('File not found');
  });

  it('should gracefully handle read errors', async () => {
    jest.spyOn(fs, 'open').mockImplementation(() =>
      Promise.resolve({
        read: jest.fn(() => {
          throw new Error('Read error');
        }),
        close: jest.fn(),
      } as unknown as fs.FileHandle)
    );

    await expect(
      retrieveLogsReverse({
        fileName: 'test.log',
        keyword: "ERROR",
        limit: 5,
      })
    ).rejects.toThrow('Failed to read a chunk of the log file.');
  });
});

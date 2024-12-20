import * as fs from 'fs/promises';
import { validateLogFile } from '../helpers/fileValidator';

export interface LogQuery {
  fileName: string;
  keyword?: string;
  limit?: number;
}

const BASE_LOG_PATH = process.env.LOG_PATH || '/var/log';

export async function retrieveLogsReverse(
  { fileName, keyword = '', limit = 10 }: LogQuery
): Promise<string[]> {
  const MAX_CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB

  try {
    // Validate and sanitize the keyword
    if (keyword !== undefined && typeof keyword === 'string') {
      keyword = keyword.trim();
      if (keyword === '') {
        throw new Error('Keyword must not be empty or contain only whitespace.');
      }
    }

    const filePath = `${BASE_LOG_PATH}/${fileName}`;
    const fileStats = await validateLogFile(filePath);
    const fileSize = fileStats.size;

    const chunkSize = Math.min(MAX_CHUNK_SIZE, fileSize);

    const fileDescriptor = await fs.open(filePath, 'r');

    try {
      const buffer: string[] = []; // Circular buffer to store the last `limit` matching lines
      let position = fileSize;
      let leftover = '';

      while (position > 0 && buffer.length < limit) {
        // Calculate the size of the chunk to read
        const sizeToRead = Math.min(chunkSize, position);
        position -= sizeToRead;

        const chunkBuffer = Buffer.alloc(sizeToRead);

        try {
          await fileDescriptor.read(chunkBuffer, 0, sizeToRead, position);
        } catch (readError) {
          throw new Error('Failed to read a chunk of the log file.');
        }

        const chunkString = chunkBuffer.toString('utf8');
        const lines = (chunkString + leftover).split('\n');

        // Save the last incomplete line as leftover
        leftover = lines.shift() || '';

        // Process lines in reverse order
        for (let i = lines.length - 1; i >= 0 && buffer.length < limit; i--) {
          const line = lines[i].trim();
          if (line && (!keyword || line.includes(keyword))) {
            buffer.push(line);
          }
        }
      }

      // Add the final leftover line if applicable
      if (leftover && (!keyword || leftover.includes(keyword)) && buffer.length < limit) {
        buffer.push(leftover.trim());
      }

      return buffer; // Return lines in newest-first order
    } finally {
      // Ensure the file descriptor is always closed
      await fileDescriptor.close();
    }
  } catch (error) {
      throw error;
  }
}

import * as fs from 'fs/promises';
import { Stats } from 'fs';

export async function validateLogFile(filePath: string): Promise<Stats> {
  try {
    // Ensure the file exists
    const stats = await fs.stat(filePath);

    // Ensure it's a file
    if (!stats.isFile()) {
      throw new Error('The requested log file is not a valid file.');
    }

    return stats;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`File not found or inaccessible: ${filePath}`);
    } else {
      throw new Error('An unknown error occurred while validating the log file.');
    }
  }
}
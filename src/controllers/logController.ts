import { Request, Response } from 'express';
import { retrieveLogsReverse } from '../services/logService';

export async function getLogLines(req: Request, res: Response) {
  try {
    const { fileName, keyword, limit } = req.query;

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    const logLines = await retrieveLogsReverse({
      fileName: fileName as string,
      keyword: keyword as string,
      limit: parseInt(limit as string, 10) || 10,
    });

    res.json({ logLines });
  } catch (error) {
    if (error instanceof Error) {
        // Safely access error.message
        res.status(500).json({ error: error.message });
      } else {
        // Handle unexpected types of errors
        res.status(500).json({ error: 'An unknown error occurred' });
      }
  }
}

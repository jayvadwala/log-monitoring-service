# Log Monitoring Service

This service provides a way to retrieve logs from a file in reverse order, with support for filtering by a keyword and limiting the number of results. The service is designed to handle large log files efficiently and return the most recent matching log lines.

---

## Features

- Retrieves logs in reverse chronological order.
- Filters logs based on a keyword (if provided).
- Limits the number of logs returned to avoid excessive output.
- Handles large log files efficiently using chunk-based reading.
- Graceful error handling for file-related issues.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jayvadwala/log-monitoring-service.git
   cd log-monitoring-service

2. Install dependencies:
    ```bash
    npm install

## Running the Service

1. Start the service:
    ```bash
    npm run start

2. API Endpoint:
    GET /logs
    Query Parameters:
        - fileName: string (required) - The name of the log file to read.
        - keyword: string (required) - A keyword to filter log lines.
        - limit: number (optional, default: 10) - The maximum number of log lines to return.

3. Example:
    ```bash
    curl "http://localhost:3001/logs?fileName=generated_large_log.log&keyword=error&limit=100"

## Running the test

1. Run tests:
    ```bash
    npm run test


## Reasoning Behind Design Choices
```bash
Chunk-Based File Reading: 

Why? Reading a log file entirely into memory is inefficient for large files (>1GB). By processing in chunks, memory usage is minimized.

Implementation: The file is read in reverse order, chunk by chunk, to retrieve the most recent logs first. This ensures the service can start returning results without processing the entire file.

Reverse Chronological Retrieval
Why? In most use cases, users are interested in the latest logs. By reading the file from the end, the service avoids unnecessary processing of older logs.

Keyword Filtering
Why? To reduce the amount of data returned and make the logs more relevant, the service supports filtering by a keyword.

Validation: Keywords are trimmed to ensure no empty or whitespace-only keywords are processed.

Error Handling
Why? Robust error handling ensures that:

Users receive meaningful error messages (e.g., invalid file path, empty keyword).
The service gracefully recovers from issues like failed reads or missing files.
```

## Further Improvements
``` bash
Multi-Server Architecture
Use Case: Support a primary server that queries logs from multiple secondary servers.

Architecture Design:

Primary server acts as an aggregator.
Secondary servers process logs locally and return results to the primary server.
Communication Protocol:

Use REST or gRPC for communication between the primary and secondary servers.
The primary server issues parallel requests to all secondary servers, aggregates their results, and returns a combined response to the user.

Advantages:

Scalability: Each secondary server handles a portion of the workload.
Performance: Parallel processing across servers reduces latency.
Implementation Example:

Primary Server:
/logs endpoint forwards requests to all secondary servers.
Aggregates responses and returns sorted results.
Secondary Servers:
Implement the current log retrieval logic.
Pagination Support
Why? For large results, returning all data at once may be inefficient. Pagination allows users to navigate results incrementally.
Implementation: Add page and pageSize query parameters to the API.
Improved File Handling
Enhancement: Use streaming libraries (e.g., fs.createReadStream) for even better performance when processing very large files.
```




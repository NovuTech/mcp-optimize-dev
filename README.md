# MCP Token Optimizer (TypeScript MVP)

MCP server trung gian giúp giảm context dư thừa trước khi gửi lên LLM.

## Tính năng MVP

- Fast Context Finder (scan + index + retrieval + symbol-aware rerank)
- Token Compressor:
  - `safe`: bỏ comments, dòng trống dư, chuẩn hóa whitespace
  - `focused`: chỉ giữ vùng code quanh match
- Trả thống kê `tokens_before`, `tokens_after`, `latency_ms`

## Yêu cầu

- Node.js 20+
- npm

## Cài đặt

```bash
npm install
```

## Chạy MCP Server

### Dev mode

```bash
npm run dev
```

### Build + start

```bash
npm run build
npm start
```

Server chạy qua **stdio transport** (phù hợp MCP client).

## MCP Tool

Tool name: `optimize_context`

### Input

```json
{
  "prompt": "fix auth bug in middleware",
  "project_path": "./project",
  "mode": "safe",
  "top_k": 8
}
```

### Field mô tả

- `prompt` (string, bắt buộc): câu truy vấn kỹ thuật
- `project_path` (string, optional): path project cần scan; mặc định là thư mục chạy server
- `mode` (`safe` | `focused`, optional): mặc định `safe`
- `top_k` (number, optional): số candidate tối đa (1..30)

### Output

```json
{
  "files_used": ["src/middleware/auth.ts", "src/services/authService.ts"],
  "tokens_before": 12000,
  "tokens_after": 1400,
  "optimized_context": "...",
  "latency_ms": 68
}
```

## Scripts

- `npm run dev`: chạy server bằng `tsx`
- `npm run build`: compile TypeScript sang `dist`
- `npm run typecheck`: kiểm tra type
- `npm test`: chạy unit tests
- `npm run bench`: chạy benchmark engine local

## Benchmark nhanh

```bash
npm run bench
```

Lệnh này tạo project mẫu tạm thời, chạy `optimize_context` nội bộ và in JSON kết quả.

## Cấu trúc source chính

- `src/server/mcpServer.ts`: MCP server entrypoint
- `src/server/tools/optimizeContextTool.ts`: tool registration + input schema
- `src/engine/optimizeEngine.ts`: pipeline orchestration
- `src/finder/*`: scanner, indexer, retriever, reranker
- `src/compressor/*`: safe/focused compressor
- `src/context/contextBuilder.ts`: build `optimized_context`
- `src/engine/tokenEstimator.ts`: token estimator

## Test

```bash
npm test
npm run typecheck
```

## Lưu ý phạm vi MVP

Không bao gồm:

- Prompt rewrite nâng cao
- Code graph toàn dự án
- Multi-model routing

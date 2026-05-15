# URL 短網址系統 - 系統設計文件

## 1. 系統概述

設計一個類似 bit.ly 的短網址服務，讓使用者輸入長網址後得到一個短代碼，訪問短網址時自動跳轉到原始網址。

---

## 2. 系統架構

採用微服務架構，主要分為以下元件：

```
使用者 → CDN → API Gateway → 短網址服務
                                ↓
                            資料庫 (MySQL)
                                ↓
                            快取層 (Redis)
```

---

## 3. 元件說明

### API Gateway
負責路由請求、認證、限流。使用 Nginx 作為反向代理。

### 短網址服務
核心業務邏輯，包含：
- 產生短代碼（使用 Base62 編碼）
- 儲存原始網址與短代碼的對應關係
- 處理跳轉請求

### 資料庫
使用 MySQL 儲存網址對應關係：

```sql
CREATE TABLE urls (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

### 快取層
使用 Redis 快取熱門短網址，減少資料庫查詢。

---

## 4. 資料流

**建立短網址流程：**
1. 使用者送出長網址
2. API Gateway 驗證請求
3. 服務生成唯一短代碼
4. 存入 MySQL
5. 回傳短網址

**跳轉流程：**
1. 使用者訪問短網址
2. 先查 Redis 快取
3. 快取未命中則查 MySQL
4. 301 永久跳轉到原始網址

---

## 5. 技術選型

| 元件 | 技術 | 原因 |
|------|------|------|
| 後端語言 | Go | 高效能、低延遲 |
| 資料庫 | MySQL | 關聯資料、成熟穩定 |
| 快取 | Redis | 低延遲讀取 |
| CDN | Cloudflare | 全球加速 |

---

## 6. API 設計

### 建立短網址
```
POST /api/v1/shorten
Content-Type: application/json

Request:
{ "url": "https://example.com/very/long/url" }

Response:
{ "short_url": "https://sho.rt/abc123" }
```

### 查詢統計
```
GET /api/v1/stats/{short_code}

Response:
{ "clicks": 1234, "created_at": "2024-01-01" }
```

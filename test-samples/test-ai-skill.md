# AI Skill 文件：search_product

## 名稱
search_product

## 描述
在電商資料庫中搜尋商品，根據使用者的自然語言查詢回傳符合條件的商品列表。

## 使用時機（觸發條件）

當使用者想要尋找特定商品時使用此 skill，例如：
- 「我想找藍色的運動鞋」
- 「幫我搜尋價格在 500 元以下的耳機」
- 「有沒有 Nike 的商品？」

不適用：使用者已知道商品 ID 並要直接查看詳細頁（此時用 get_product_detail）

## 輸入參數

```json
{
  "query": "使用者的搜尋語句",
  "category": "商品分類（選填）",
  "max_price": "最高價格（選填）",
  "min_price": "最低價格（選填）",
  "limit": "回傳數量，預設 10"
}
```

## 輸出格式

回傳符合條件的商品陣列：

```json
{
  "products": [
    {
      "id": "商品ID",
      "name": "商品名稱",
      "price": 999,
      "category": "分類",
      "image_url": "圖片連結"
    }
  ],
  "total": 42
}
```

## 使用範例

**範例一：搜尋特定商品**

輸入：
```json
{ "query": "藍色運動鞋" }
```

輸出：
```json
{
  "products": [
    { "id": "P001", "name": "Nike Air Max 藍色", "price": 3200, "category": "鞋類" }
  ],
  "total": 1
}
```

**範例二：帶價格篩選**

輸入：
```json
{ "query": "耳機", "max_price": 500 }
```

輸出：
```json
{
  "products": [
    { "id": "P045", "name": "基本款有線耳機", "price": 299, "category": "3C" }
  ],
  "total": 1
}
```

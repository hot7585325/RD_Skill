<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Azure Foundry 遊樂場新增資料來源的兩種方法差異詳解

你的理解完全正確！Azure 確實提供**兩種主要方法**來實現 RAG 功能，它們在複雜度、控制程度和使用場景上有明顯差異。

***

## 方法一：遊樂場自動化上傳資料（簡化版）

**操作方式：**

- 在 Azure AI Foundry 遊樂場的聊天介面中，直接點選「新增資料來源」
- 上傳本地檔案、指定 Blob Storage 容器、或提供公開網址
- 系統會**自動處理**以下所有步驟：
    - 文件解析與文字擷取
    - **自動分塊（chunking）**：預設使用 1024 tokens 作為分塊大小[^1]
    - **自動向量化（embedding）**：呼叫指定的 embedding 模型（如 text-embedding-3-large）生成向量[^2][^1]
    - **自動建立索引**：在 Azure AI Search 中建立索引結構
    - **自動建立 indexer 和 datasource**：如果設定定期更新，系統會自動建立這些資源[^1]

**特點：**

- **零程式碼**：完全透過 UI 操作
- **快速部署**：幾分鐘內即可完成
- **自動化程度高**：背後使用 Azure AI Search 的「integrated vectorization」技術[^1]
- **適合場景**：快速原型驗證、簡單應用、小規模數據

***

## 方法二：手動建立索引管線（進階版）

**操作方式：**

- 自行上傳文件到 Blob Storage
- **手動撰寫程式碼**來：
    - 讀取文件內容
    - **自訂分塊邏輯**：可控制分塊大小、重疊範圍、分塊策略[^3]
    - **呼叫 embedding API**：控制向量化參數
    - **設計索引結構**：自訂欄位、屬性、向量配置[^4]
    - **建立 indexer 和 skillset**：配置自動化索引流程[^5][^6]
    - **設定欄位映射（field mapping）**：精確控制哪些欄位用於搜尋、標題、引用等[^1]

**特點：**

- **完全控制**：可自訂每個步驟的細節
- **複雜度高**：需要編寫 Python/C\# 程式碼
- **彈性最大**：可整合自訂邏輯、特殊處理、多資料來源
- **適合場景**：生產環境、大規模應用、需要特殊處理的資料

***

## 兩種方法的具體差異比較

### 1. **Token 使用量差異**

| 比較項目 | 遊樂場自動化 | 手動建立索引 |
| :-- | :-- | :-- |
| Chunking token 消耗 | 固定（預設 1024 tokens/chunk）[^1] | 可自訂（256/512/1536 等）[^1] |
| Embedding API 呼叫 | 自動呼叫，無法優化 | 可批次處理、快取重複內容 |
| 查詢時 token 消耗 | 標準（取決於檢索文件數量） | 可優化檢索策略減少 token |
| **總體成本** | **較高**（無法優化） | **可控**（可針對性優化）[^1][^7] |

**重點：**兩種方法在**推論（inference）階段的 token 消耗基本相同**，因為都會經過「intent generation → retrieval → response generation」三階段。但手動方法可透過更精細的 chunking 和檢索策略來降低整體成本。[^1]

***

### 2. **回答精確度差異**

| 比較項目 | 遊樂場自動化 | 手動建立索引 |
| :-- | :-- | :-- |
| 分塊品質 | 通用策略，可能不適合特定資料 | 可針對資料特性優化（如表格、程式碼）[^1][^3] |
| 欄位映射 | 自動判斷，可能不精確 | 可精確指定哪些欄位用於內容、標題、引用[^1] |
| 搜尋策略 | 預設 hybrid + semantic search[^1] | 可選擇 keyword/vector/hybrid 並調整權重[^1] |
| 元數據利用 | 有限 | 可加入自訂 metadata 進行過濾[^8] |
| **整體精確度** | **中等**（適合一般場景） | **高**（可針對性優化）[^1][^8] |

**實例：**

- 如果你的文件有複雜表格或特殊格式，遊樂場可能無法正確處理，需使用手動方法搭配資料準備腳本[^1]
- 如果需要「文件層級存取控制」，只有手動建立的 Azure AI Search 索引支援[^1]

***

### 3. **功能與彈性差異**

| 功能 | 遊樂場自動化 | 手動建立索引 |
| :-- | :-- | :-- |
| 自訂分塊大小 | ✅ 可調整（256/512/1024/1536）[^1] | ✅ 完全自訂 |
| 自訂分塊策略 | ❌ 固定邏輯 | ✅ 可實作重疊、語意分塊等[^3] |
| 排程自動更新 | ✅ 支援（僅限 Blob Storage）[^1] | ✅ 完全控制更新頻率[^6] |
| 多資料來源整合 | ❌ 有限 | ✅ 可整合任意來源 |
| 自訂搜尋過濾器 | ❌ | ✅ 支援複雜 filter 查詢[^1] |
| 文件層級權限控制 | ❌ | ✅ 支援（透過 Azure AD）[^1] |
| 整合 Prompt Flow | ✅ 自動整合[^2] | ✅ 需手動配置 |


***

### 4. **適用場景建議**

**選擇遊樂場自動化，如果你：**

- 需要快速驗證 RAG 概念
- 資料結構簡單（純文字、標準 PDF）
- 不需要特殊客製化
- 團隊缺乏開發資源
- 資料量小到中等（< 10GB）

**選擇手動建立索引，如果你：**

- 需要生產級別的精確度和效能
- 資料有特殊格式（複雜表格、程式碼、多語言混合）
- 需要整合多個資料來源
- 需要精細的成本控制
- 需要文件層級的權限管理
- 資料量大（> 10GB）且需要優化檢索效能[^8][^5]

***

## Unity RESTful 串接的影響

**重要提醒：**無論你選擇哪種方法建立 RAG，**Unity 端的 RESTful 呼叫方式完全相同**。[^9][^10]

- 兩種方法最終都會在 Azure AI Foundry 產生一個可用的模型端點
- Unity 只需呼叫該端點，系統會自動執行 RAG 檢索
- 差異在於**後端 RAG 的品質和成本效益**，對 Unity 呼叫方式無影響

***

## 總結建議

1. **先從遊樂場開始**：快速建立原型，驗證 Unity 串接流程是否可行[^2][^1]
2. **評估效果**：測試回答品質、token 消耗、延遲等指標
3. **必要時升級**：如果遇到精確度問題、成本過高、或需要特殊功能，再轉向手動建立索引[^5][^1]
4. **混合策略**：可先用遊樂場建立索引，再透過 Azure AI Search Portal 調整參數（如 chunk size、strictness）[^1]

兩種方法各有優勢，關鍵是根據你的具體需求、團隊能力和專案階段來選擇。[^8][^2][^5][^1]
<span style="display:none">[^11][^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^23][^24][^25][^26][^27][^28][^29][^30][^31][^32][^33][^34][^35][^36][^37]</span>

<div align="center">⁂</div>

[^1]: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/use-your-data

[^2]: https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/index-add

[^3]: https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-chunk-documents

[^4]: https://learn.microsoft.com/en-us/azure/search/search-what-is-an-index

[^5]: https://learn.microsoft.com/en-us/azure/search/tutorial-rag-build-solution-pipeline

[^6]: https://learn.microsoft.com/en-us/azure/search/search-indexer-overview

[^7]: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/

[^8]: https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview

[^9]: https://dotblogs.azurewebsites.net/anyun/2025/04/26/164900

[^10]: https://studyhost.blogspot.com/2025/01/azure-deepseek-r1-model.html

[^11]: https://www.reddit.com/r/LLMDevs/comments/1ax6fk9/outofthebox_azure_ai_or_building_my_own_rag/

[^12]: https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-foundry/how-to/index-add.md

[^13]: https://www.linkedin.com/posts/lukas-lundin_openai-gpts-or-custom-rag-with-azure-openai-activity-7128653153595514880-_Mmx

[^14]: https://www.youtube.com/watch?v=q2_UZZAn6I0

[^15]: https://www.youtube.com/watch?v=2qoHkHRR958

[^16]: https://www.reddit.com/r/AZURE/comments/1mws1az/error_in_azure_ai_foundry_ui_in_azure_openai/

[^17]: https://learn.microsoft.com/en-us/answers/questions/5560036/feasibility-of-using-multiple-azure-ai-search-inde

[^18]: https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/context-aware-rag-system-with-azure-ai-search-to-cut-token-costs-and-boost-accur/4456810

[^19]: https://learn.microsoft.com/en-us/azure/ai-foundry/agents/how-to/tools/azure-ai-search

[^20]: https://itnext.io/a-practical-guide-to-retrieval-augmented-generation-rag-with-azure-openai-service-1de8b9f8c471

[^21]: https://learn.microsoft.com/zh-tw/azure/ai-foundry/openai/use-your-data-quickstart

[^22]: https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/ai-foundry/includes/chat-with-data.md

[^23]: https://www.linkedin.com/pulse/azure-openai-studio-chat-playground-gpt-35-turbo-gpt-4-cekikj-6nzzf

[^24]: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/use-your-data-quickstart

[^25]: https://www.youtube.com/watch?v=h6D6YKs9gzw

[^26]: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/faq

[^27]: https://openai.com/api/pricing/

[^28]: https://learn.microsoft.com/en-us/answers/questions/2125584/auto-indexing-issue-in-azure-ai-foundry-playground

[^29]: https://stackoverflow.com/questions/77865596/fetch-data-from-azure-blob-storage-to-azure-ai-search-rag

[^30]: https://farzzy.hashnode.dev/contextual-retrieval-for-multimodal-rag-with-azure-ai-search-azure-openai-and-arize-phoenix-with-llamaindex

[^31]: https://azure.microsoft.com/zh-tw/pricing/details/cognitive-services/openai-service/

[^32]: https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/secure-data-playground

[^33]: https://docling-project.github.io/docling/examples/rag_azuresearch/

[^34]: https://langfuse.com/changelog/2025-07-28-playground-side-by-side

[^35]: https://stackoverflow.com/questions/77547748/how-to-add-field-mapping-in-azure-ai-search-indexer-for-nested-json-array

[^36]: https://learn.microsoft.com/en-us/azure/search/cognitive-search-skill-azure-openai-embedding

[^37]: https://docs.azure.cn/en-us/search/tutorial-rag-build-solution-minimize-storage


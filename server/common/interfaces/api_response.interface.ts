// 錯誤統一響應
export interface ApiErrorResponse {
  /** 錯誤詳情 */
  error: {
    /** 錯誤程式碼 */
    code: string;
    /** 錯誤訊息 */
    message: string;
    /** 錯誤詳情 */
    details?: string;
    /** 欄位驗證錯誤 */
    fieldErrors?: Record<string, string[]>;
    /** 呼叫棧（僅開發環境） */
    stack?: string;
    /** 錯誤原因 */
    cause?: string;
    /** 錯誤發生時間 */
    timestamp?: number;
  };
}


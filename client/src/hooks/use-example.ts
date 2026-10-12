// import { useState, useEffect } from 'react';
// import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
// import { logger } from '@lark-apaas/client-toolkit/logger';

// interface RecordData {
//   title?: string,
//   type?: string,
//   creator?: string,
//   speakDate?: string,
// record: any;
// loading: boolean;
// error?: string;
// }

// export function useRecordData() {
//   const [data, setData] = useState<RecordData>({
//     record: {},
//     loading: true,
//     error: null,
//   });

//   useEffect(() => {
//     fetchRecordData();
//   }, []);

//   const fetchRecordData = async () => {
//     try {
//       setData(prev => ({ ...prev, loading: true, error: null }));

//       // 使用axios例項獲取資料
//       const response = await axiosForBackend.get('/api/hello');

//       // 提取響應資料中的 data 欄位
//       const record = response.data.data;

//       setData({
//         record,
//         loading: false,
//         error: null,
//       });
//     } catch (error) {
//       logger.error('獲取資料失敗', error);
//       setData(prev => ({
//         ...prev,
//         loading: false,
//         error: '獲取資料失敗，請稍後重試',
//       }));
//     }
//   };

//   return { ...data, refetch: fetchRecordData };
// }
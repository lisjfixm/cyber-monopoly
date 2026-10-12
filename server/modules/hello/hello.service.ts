// /* 模板程式碼 僅作示例 */
// import { Injectable, Inject, Logger } from '@nestjs/common';
// import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
// import { record } from '@server/database/schema';
// import { eq, and, count, desc, sql, gte, lte, or } from 'drizzle-orm';

// @Injectable()
// export class HelloService {
//   private readonly logger = new Logger(HelloService.name);

//   constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

//   async test(userId: string, limit: number = 5) {
//     try {
//       const results = await this.db
//         .select()
//         .from(record)
//         .where(eq(record.userProfile, userId))
//         .orderBy(desc(record.speakDate))
//         .limit(limit);
  
//       return results;
//     } catch (error) {
//       this.logger.error('獲取最近記錄失敗', error);
//       throw error;
//     }
//   }
// }
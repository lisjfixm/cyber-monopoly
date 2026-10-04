import { Controller, Get, Render, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller()
export class ViewController {

  // 健康檢查：用於負載均衡 / 容器探活，永遠回 200，不依賴資料庫
  @Get('health')
  health() {
    return { status: 'ok', uptime: process.uptime(), timestamp: Date.now() };
  }

  @Get(['/', '*'])
  @Render('index')
  async render(@Req() req: Request): Promise<{ __platform__: string }>  {
    // you can add custom render params here
    // standalone 模式下平台中間件未注入 __platform_data__，用 any 相容
    const platformData = (req as any).__platform_data__ ?? {};
    return {
      // don't delete this line, it's used by client to get platform info
      __platform__: JSON.stringify(platformData),
    };
  }
}

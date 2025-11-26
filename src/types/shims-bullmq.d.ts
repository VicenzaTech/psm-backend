declare module '@nestjs/bullmq' {
  // Minimal type definitions for @nestjs/bullmq items used in the project
  export interface BullModuleOptions {
    connection?: any;
  }

  export interface BullModuleType {
    forRootAsync(options: { inject?: any[]; useFactory: (...args: any[]) => any }): any;
    registerQueue(queue: any): any;
  }

  export const BullModule: BullModuleType;
  export function InjectQueue(queueName: string): any;
  export class WorkerHost {}
  export function Processor(name: string): any;
}

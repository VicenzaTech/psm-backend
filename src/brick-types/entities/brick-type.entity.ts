import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('brick_types')
export class BrickType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  code: string; // Ví dụ: "300x600mm Porcelain"

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50 })
  size: string; // "300x600mm"

  @Column({ length: 50 })
  type: string; // "Porcelain", "Granite", "Semi", "Ceramic"

  @Column({ type: 'int' })
  cycle_time_minutes: number; // Chu kỳ khoán (phút)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  output_per_cycle_m2: number; // Sản lượng ra lò (m²)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finished_product_per_cycle_m2: number; // Sản lượng chính phẩm

  @Column({ type: 'jsonb', nullable: true })
  quality_standards: {
    A1_percent: number;
    A2_percent: number;
    cut_lot_percent: number;
    waste_L1_percent: number;
    waste_L2_percent: number;
    scrap_percent: number;
  };

  @Column({ length: 50 })
  workshop: string; // "PX1", "PX2"

  @Column({ length: 50 })
  production_line: string; // "Dây chuyền 1", "Dây chuyền 2", etc.

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

//   @OneToMany(() => ProductionPlan, plan => plan.product_line)
//   production_plans: ProductionPlan[];
}

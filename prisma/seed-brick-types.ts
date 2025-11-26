// ts-node scripts/seed-brick-types.ts
import { PrismaClient, LoaiMai } from '@prisma/client'
const prisma = new PrismaClient()

const brickTypes = [
  {
    code: '300x600_PORCELAIN',
    name: '300x600mm Porcelain mài bóng',
    size_x: 300,
    size_y: 600,
    type: 'porcelain',
    loaiMai: LoaiMai.mai_nong,
    thoiGianChoMaiNguoiHours: null,
    workshopId: '1',
    productionLineId: '1',
    chuKyKhoan: 45,
    sanLuongRaLoPerDay: 11000,
    sanLuongChinhPhamPerDay: 10500,
    soNgayTruKhoan: 1.5,
    sanLuongKhoan30Ngay: 300000,
    sanLuongKhoan31Ngay: 310000,
    congKhoanGiamChuKy: 100,
    giamKhoanTangChuKy: 150,
  },
  // Thêm các mẫu gạch khác nếu cần
]

async function main() {
  console.log('Start seeding...')
  
  for (const brickType of brickTypes) {
    await prisma.brickType.upsert({
      where: { code: brickType.code },
      update: {},
      create: brickType,
    })
    console.log(`Created brick type: ${brickType.name}`)
  }
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
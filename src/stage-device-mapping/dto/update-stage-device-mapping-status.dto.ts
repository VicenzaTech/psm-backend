import { IsEnum, IsNotEmpty } from 'class-validator';
import { StageStatus } from '../stage.enum';

export class UpdateStageDevieMappingStatus {
  @IsEnum(StageStatus, {
    message:
      'Trạng thái phải thuộc các giá trị [RUNNING | WAITING | ERROR |  STOPPED]',
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  stageStatus: StageStatus;
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentListDto } from './dto/list-dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';
import type { IYooKassaWebHook } from './yookassa.definitions';
import { IsPublic } from '../../decorators/is-public';

@Controller('admin/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  private logger = new Logger('PaymentsController');

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.create(createPaymentDto);
  }

  @Get()
  async findAll(@Query() dto?: PaymentListDto) {
    return await this.paymentsService.findAll(dto);
  }

  @Get('/sum')
  async sum() {
    return await this.paymentsService.sum();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.paymentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return await this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.paymentsService.remove(id);
  }

  @Post('/export')
  async export() {
    return await this.paymentsService.export();
  }

  @IsPublic()
  @Post('/webhook')
  async hook(@Body() dto: IYooKassaWebHook) {
    return await this.paymentsService.handleHook(dto);
  }

  @IsPublic()
  @Post('/webhook-test')
  hookTest(@Body() dto: IYooKassaWebHook) {
    this.logger.log(dto);
    return JSON.stringify(dto);
  }
}

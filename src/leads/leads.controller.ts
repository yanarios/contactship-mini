import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsAiService } from './leads.ai.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

/**
 * Controller handling Lead management endpoints.
 * Includes CRUD operations and asynchronous AI processing triggers.
 */
@Controller()
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadsAiService: LeadsAiService,
    @InjectQueue('leads-queue') private leadsQueue: any,
  ) {}

  @Post('create-lead')
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get('leads')
  findAll() {
    return this.leadsService.findAll();
  }

  @Get('leads/:id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  /**
   * Triggers an asynchronous background job to generate an AI summary.
   * This endpoint is non-blocking: it returns an immediate confirmation while
   * the Worker processes the request in the queue.
   */
  @Post('leads/:id/summarize')
  async summarize(@Param('id') id: string) {
    // Validate lead existence before queuing
    await this.leadsService.findOne(id);

    // Dispatch job to the queue
    await this.leadsQueue.add('summarize-lead', {
      leadId: id,
    });

    return {
      message: 'Solicitud recibida. La IA está generando el resumen en segundo plano.',
      leadId: id,
      status: 'processing',
    };
  }
}
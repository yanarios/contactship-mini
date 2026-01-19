import { Process, Processor } from '@nestjs/bull';
import { LeadsService } from './leads.service';
import { LeadsAiService } from './leads.ai.service';

/**
 * Consumer class for the 'leads-queue'.
 * Handles background jobs related to Lead processing to avoid blocking the main API thread.
 */
@Processor('leads-queue')
export class LeadsProcessor {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadsAiService: LeadsAiService,
  ) {}

  /**
   * Process job: 'summarize-lead'.
   * Fetches the lead, generates an AI summary, and updates the database record.
   */
  @Process('summarize-lead')
  async handleSummarize(job: any) {
    const { leadId } = job.data;
    console.log(`[LeadsProcessor] Starting AI summary generation for Lead ID: ${leadId}`);

    try {
      const lead = await this.leadsService.findOne(leadId);
      const aiResult = await this.leadsAiService.generateSummary(lead.name, lead.email);

      await this.leadsService.update(leadId, {
        summary: aiResult.summary,
        next_action: aiResult.next_action,
      });

      console.log(`[LeadsProcessor] Successfully updated Lead ID: ${leadId} with AI summary.`);
    } catch (error) {
      console.error(`[LeadsProcessor] Failed to process Lead ID: ${leadId}`, error);
    }
  }
}
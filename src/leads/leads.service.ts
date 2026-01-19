import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Lead } from './lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';

/**
 * Service responsible for the CRUD logic of Leads.
 * Implements Caching Strategy (Redis) and External Synchronization (Cron Jobs).
 */

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,

    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  
  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const newLead = this.leadRepository.create(createLeadDto);
    return this.leadRepository.save(newLead);
  }

  
  async findAll(): Promise<Lead[]> {
    return this.leadRepository.find();
  }

  
  async findOne(id: string): Promise<Lead> {
    
    const cachedLead = await this.cacheManager.get(`lead_${id}`);
    
    if (cachedLead) {
      console.log(`Recuperado desde REDIS (Rápido) ⚡: ${id}`);
      return cachedLead; 
    }

    
    const lead = await this.leadRepository.findOneBy({ id });

    if (!lead) {
      throw new NotFoundException(`Lead con ID ${id} no encontrado`);
    }

    
    await this.cacheManager.set(`lead_${id}`, lead);
    console.log(`Recuperado desde Base de Datos y guardado en Caché 🐢: ${id}`);

    return lead;
  }

  
  async update(id: string, leadData: Partial<Lead>): Promise<Lead> {
    await this.leadRepository.update(id, leadData);
    
    // Invalidate cache to maintain consistency
    await this.cacheManager.del(`lead_${id}`);
    
    
    const updatedLead = await this.leadRepository.findOneBy({ id });
    return updatedLead as Lead;
  }


  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    console.log('🤖 Iniciando sincronización automática de leads...');

    try {
      
      const response = await axios.get('https://randomuser.me/api/?results=10');
      const externalUsers = response.data.results;

      let nuevos = 0;

      
      for (const user of externalUsers) {
        const email = user.email;

        
        const existe = await this.leadRepository.findOneBy({ email });

        if (!existe) {
          
          const newLead = this.leadRepository.create({
            name: `${user.name.first} ${user.name.last}`,
            email: user.email,
            phone: user.phone,
            
            summary: 'Lead importado automáticamente desde RandomUser API',
            next_action: 'Contactar para validar datos',
          });

          await this.leadRepository.save(newLead);
          nuevos++;
        }
      }

      console.log(`[Cron] Sincronización terminada. Se agregaron ${nuevos} leads nuevos.`);
      
      

    } catch (error) {
      console.error('[Cron] Error en la sincronización:', error.message);
    }
  }

} 
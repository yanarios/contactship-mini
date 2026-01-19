import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * Represents a Lead (potential client) entity in the database.
 * Stores personal information and AI-generated insights.
 */
@Entity()
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  /** AI-generated summary based on the lead's data. */
  @Column({ type: 'text', nullable: true })
  summary: string;

  /** Suggested follow-up action determined by AI analysis. */
  @Column({ nullable: true })
  next_action: string;

  @CreateDateColumn()
  createdAt: Date;
}
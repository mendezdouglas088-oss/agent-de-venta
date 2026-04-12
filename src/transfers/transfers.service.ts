import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transfer, TransferStatus } from 'src/database/entities/transfer.entity';
import { PlanType } from 'src/database/entities/plan.entity';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer)
    private readonly repo: Repository<Transfer>,
  ) {}

  /**
   * Parsea el texto del comprobante bancario cubano y crea la transferencia en BD.
   */
  async createFromReceipt(
    userId: string,
    planType: PlanType,
    rawReceipt: string,
  ): Promise<Transfer> {
    const parsed = this.parseReceipt(rawReceipt);

    const transfer = this.repo.create({
      userId,
      planType,
      rawReceipt,
      transferDate: parsed.date,
      beneficiary: parsed.beneficiary,
      orderer: parsed.orderer,
      amount: parsed.amount,
      transactionNumber: parsed.transactionNumber,
      status: TransferStatus.PENDING,
    });

    return this.repo.save(transfer);
  }

  /**
   * Parsea el comprobante de Transfermóvil cubano.
   * Formato esperado:
   * "Banco Metropolitano: La Transferencia fue completada.
   *  Fecha: 9/4/2026 Beneficiario: 9205XXXXXXXX4821
   *  Ordenante: 9224XXXXXXXX9437 Monto: 520.00 CUP
   *  Nro. Transaccion: MM604ANK6O987 Saldo restante: CR 1271.40 CUP"
   */
  parseReceipt(text: string): {
    date?: string;
    beneficiary?: string;
    orderer?: string;
    amount?: string;
    transactionNumber?: string;
  } {
    const extract = (pattern: RegExp) => text.match(pattern)?.[1]?.trim();
    return {
      date: extract(/Fecha:\s*([^\n\r]+?)(?:\s+Beneficiario|$)/i),
      beneficiary: extract(/Beneficiario:\s*([^\n\r]+?)(?:\s+Ordenante|$)/i),
      orderer: extract(/Ordenante:\s*([^\n\r]+?)(?:\s+Monto|$)/i),
      amount: extract(/Monto:\s*([^\n\r]+?)(?:\s+Nro|$)/i),
      transactionNumber: extract(/Nro\.\s*Transac[a-z]+:\s*([^\n\r]+?)(?:\s+Saldo|$)/i),
    };
  }

  /** Verifica si el texto parece un comprobante de transferencia */
  isReceiptText(text: string): boolean {
    const keywords = ['Transferencia', 'Beneficiario', 'Ordenante', 'Monto', 'Transaccion'];
    const matches = keywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));
    return matches.length >= 3;
  }

  async findAll(showApproved = false): Promise<Transfer[]> {
    const where = showApproved
      ? [{ status: TransferStatus.APPROVED }, { status: TransferStatus.REJECTED }]
      : [{ status: TransferStatus.PENDING }];

    return this.repo.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Transfer | null> {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  async countPending(): Promise<number> {
    return this.repo.count({ where: { status: TransferStatus.PENDING } });
  }

  async approve(id: string): Promise<Transfer> {
    const t = await this.findById(id);
    if (!t) throw new Error('Transferencia no encontrada');
    t.status = TransferStatus.APPROVED;
    return this.repo.save(t);
  }

  async reject(id: string): Promise<Transfer> {
    const t = await this.findById(id);
    if (!t) throw new Error('Transferencia no encontrada');
    t.status = TransferStatus.REJECTED;
    return this.repo.save(t);
  }
}

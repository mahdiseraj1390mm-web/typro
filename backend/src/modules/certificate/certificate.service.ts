import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface IssueCertificateDto {
  userId: string;
  fullName: string;
  nationalCode?: string;
  wpm: number;
  accuracy: number;
  language: 'fa' | 'en';
  testDurationSeconds: number;
}

export interface IssuedCertificate {
  id: string;
  serialNumber: string;
  userId: string;
  fullName: string;
  nationalCodeMasked?: string;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze';
  tierFa: string;
  wpm: number;
  accuracy: number;
  language: 'fa' | 'en';
  verificationHash: string;
  issueDate: string;
  expirationDate: string;
  isValid: boolean;
  qrVerificationUrl: string;
}

@Injectable()
export class CertificateService {
  private certificates: IssuedCertificate[] = [];

  constructor() {
    this.loadCertificates();
  }

  private getCertFilePath(): string {
    const candidates = [
      path.join(process.cwd(), 'data', 'certificates.json'),
      path.join(process.cwd(), 'backend', 'data', 'certificates.json'),
      path.resolve(__dirname, '..', '..', '..', 'data', 'certificates.json'),
      path.resolve(__dirname, '..', '..', 'data', 'certificates.json'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return candidates[0];
  }

  private loadCertificates() {
    try {
      const p = this.getCertFilePath();
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.certificates = list;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load certificates:', e);
    }
  }

  private saveCertificates() {
    const targets = [
      path.join(process.cwd(), 'data', 'certificates.json'),
      path.join(process.cwd(), 'backend', 'data', 'certificates.json'),
    ];
    const json = JSON.stringify(this.certificates, null, 2);
    for (const t of targets) {
      try {
        const dir = path.dirname(t);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(t, json, 'utf8');
      } catch {}
    }
  }

  issueCertificate(dto: IssueCertificateDto): IssuedCertificate {
    // Section 106: Threshold validation
    if (dto.testDurationSeconds < 60) {
      throw new BadRequestException('مدت زمان آزمون رسمی مدرک باید حداقل ۶۰ ثانیه باشد.');
    }
    if (dto.accuracy < 97) {
      throw new BadRequestException('برای دریافت گواهی تایپرو حداقل دقت مجاز ۹۷٪ است.');
    }
    if (dto.wpm < 30) {
      throw new BadRequestException('حداقل سرعت مجاز برای صدور گواهی سطح پایه ۳۰ کلمه در دقیقه است.');
    }

    let tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
    let tierFa = 'مدرک برنز (سرعت ۳۰ تا ۴۹ کلمه)';

    if (dto.wpm >= 90) {
      tier = 'Diamond';
      tierFa = 'مدرک فوق‌حرفه‌ای الماس (سرعت ۹۰+ کلمه)';
    } else if (dto.wpm >= 70) {
      tier = 'Gold';
      tierFa = 'مدرک طلایی (سرعت ۷۰ تا ۸۹ کلمه)';
    } else if (dto.wpm >= 50) {
      tier = 'Silver';
      tierFa = 'مدرک نقره‌ای (سرعت ۵۰ تا ۶۹ کلمه)';
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const year = new Date().getFullYear();
    const serialNumber = `TYPRO-CERT-${year}-${randomSuffix}`;

    // Compute Cryptographic SHA-256 verification hash
    const rawPayload = `${serialNumber}:${dto.userId}:${dto.fullName}:${dto.wpm}:${dto.accuracy}:${Date.now()}`;
    const verificationHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const issueDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const maskedId = dto.nationalCode
      ? dto.nationalCode.slice(0, 3) + '***' + dto.nationalCode.slice(-4)
      : undefined;

    const cert: IssuedCertificate = {
      id: `cert-${Date.now()}`,
      serialNumber,
      userId: dto.userId,
      fullName: dto.fullName,
      nationalCodeMasked: maskedId,
      tier,
      tierFa,
      wpm: dto.wpm,
      accuracy: dto.accuracy,
      language: dto.language,
      verificationHash,
      issueDate,
      expirationDate: expiryDate,
      isValid: true,
      qrVerificationUrl: `https://typro.ir/verify/${serialNumber}`,
    };

    this.certificates.unshift(cert);
    this.saveCertificates();
    return cert;
  }

  verifyCertificate(serialOrId: string): IssuedCertificate {
    const cert = this.certificates.find(
      (c) => c.serialNumber.toLowerCase() === serialOrId.toLowerCase() || c.id === serialOrId
    );
    if (!cert) {
      throw new NotFoundException(`گواهینامه‌ای با شماره شناسایی ${serialOrId} در سامانه یافت نشد.`);
    }
    return cert;
  }

  getUserCertificates(userId: string): IssuedCertificate[] {
    return this.certificates.filter((c) => c.userId === userId);
  }

  getAllCertificates(): IssuedCertificate[] {
    return this.certificates;
  }
}

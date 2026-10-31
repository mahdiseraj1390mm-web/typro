import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CertificateService, IssueCertificateDto } from './certificate.service';

@Controller('api/certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('generate')
  generateCertificate(@Body() body: IssueCertificateDto) {
    return this.certificateService.issueCertificate(body);
  }

  @Get('verify/:serialOrId')
  verifyCertificate(@Param('serialOrId') serialOrId: string) {
    return this.certificateService.verifyCertificate(serialOrId);
  }

  @Get('user/:userId')
  getUserCertificates(@Param('userId') userId: string) {
    return this.certificateService.getUserCertificates(userId);
  }
}
